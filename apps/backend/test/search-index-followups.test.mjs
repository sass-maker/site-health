import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtempSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { registerIndexFollowup, collectIndexFollowups, indexFollowupSummary } from '../lib/search-index-followups.mjs';
import { createMetricRunController } from '../lib/dashboard-backend/metric-runs.mjs';
const baselineAt = '2026-11-08T09:00:00.000Z';
const catalog = { projects: [{ id: 'app', name: 'App', lifecycle: { status: 'active', portfolioStatus: 'active' }, domains: ['example.com'], systems: { site: { url: 'https://example.com/' } } }] };
const urls = ['https://example.com/a', 'https://example.com/b'];
const input = { id: 'publication-app', projectId: 'app', sourceRevision: 'a'.repeat(40), urls };
const original = () => ({ schema: 'site-health.search-index-coverage.v1', dailyBudget: {}, records: [{ projectId: 'app', surfaceUrl: 'https://example.com/', property: 'sc-domain:example.com',
  inventory: { urls, complete: true, observedAt: baselineAt }, googleReport: { retained: true },
  inspections: Object.fromEntries(urls.map((url, i) => [url, { inspectedUrl: url, state: i ? 'not-indexed' : 'indexed', observedAt: baselineAt }])) }] });
const registered = () => registerIndexFollowup(original(), input, { catalog, now: baselineAt });
const options = (previous, now, inspect, extra = {}) => ({ previous, catalog, clock: () => now, inspect, ...extra });
test('registration preserves immutable baselines, existing reports/budgets and idempotent identity', () => {
  const before = original(); const snapshot = structuredClone(before);
  const result = registerIndexFollowup(before, input, { catalog, now: baselineAt });
  assert.deepEqual(before, snapshot); assert.deepEqual(result.records, before.records); assert.deepEqual(result.dailyBudget, before.dailyBudget);
  assert.deepEqual(result.followups[0].rounds.map(row => row.dueAt), ['2026-11-11T09:00:00.000Z', '2026-11-15T09:00:00.000Z']);
  assert.deepEqual(registerIndexFollowup(result, input, { catalog, now: baselineAt }), result);
  assert.throws(() => registerIndexFollowup(result, { ...input, urls: [urls[0]] }, { catalog, now: baselineAt }), /another baseline/);
});
test('registration rejects external, missing, stale and duplicate baseline URLs', () => {
  for (const invalid of [['https://other.test/a'], ['https://example.com/missing'], [urls[0], urls[0]]]) {
    assert.throws(() => registerIndexFollowup(original(), { ...input, urls: invalid }, { catalog, now: baselineAt }));
  }
  assert.throws(() => registerIndexFollowup(original(), input, { catalog, now: '2026-11-20T09:00:00Z' }), /recent retained/);
});
test('future rounds perform no calls, change no observations and consume no quota', async () => {
  const before = registered();
  const result = await collectIndexFollowups(options(before, baselineAt, () => { throw new Error('Not due'); }));
  assert.equal(result.requests, 0); assert.deepEqual(result.artifact, before);
});
test('day-three observation retains history, detects a regression and does not repeat completed calls', async () => {
  const before = registered(); const reserved = []; const calls = [];
  const result = await collectIndexFollowups(options(before, '2026-11-11T09:00:00Z', async request => {
    calls.push(request.inspectionUrl);
    assert.equal(reserved.at(-1).dailyBudget['2026-11-11'].total, calls.length);
    return { state: 'not-indexed', coverageState: 'Discovered - currently not indexed' };
  }, { onProgress: artifact => reserved.push(structuredClone(artifact)) }));
  assert.deepEqual(calls, urls); assert.equal(result.requests, 2);
  assert.deepEqual(result.artifact.followups[0].baseline, before.followups[0].baseline);
  assert.deepEqual(result.artifact.records[0].googleReport, before.records[0].googleReport);
  assert.equal(indexFollowupSummary(result.artifact.followups[0]).rounds[0].regressions, 1);
  const repeat = await collectIndexFollowups(options(result.artifact, '2026-11-11T10:00:00Z', () => { throw new Error('Already recorded'); }));
  assert.equal(repeat.requests, 0); assert.deepEqual(repeat.artifact, result.artifact);
});
test('partial work resumes only missing URLs; failed requests preserve prior good observations', async () => {
  const first = await collectIndexFollowups(options(registered(), '2026-11-11T09:00:00Z', async () => ({ state: 'indexed' }), { maxInspections: 1 }));
  assert.equal(first.artifact.followups[0].rounds[0].status, 'retrying');
  const calls = [];
  const second = await collectIndexFollowups(options(first.artifact, '2026-11-12T09:00:00Z', async request => { calls.push(request.inspectionUrl); return { state: 'not-indexed' }; }));
  assert.deepEqual(calls, [urls[1]]); assert.equal(second.artifact.followups[0].rounds[0].status, 'complete');
  const failed = await collectIndexFollowups(options(registered(), '2026-11-11T09:00:00Z', async () => ({ state: 'unavailable', failureReason: 'HTTP 403' })));
  assert.equal(failed.requests, 1); assert.equal(failed.artifact.records[0].inspections[urls[0]].state, 'indexed');
  assert.equal(failed.artifact.records[0].inspections[urls[0]].lastFailure.state, 'unavailable');
  assert.equal(failed.artifact.followups[0].rounds[0].status, 'retrying');
});
test('a quota-limited property consumes neither calls nor an empty attempt', async () => {
  const previous = registered(); previous.dailyBudget['2026-11-11'] = { total: 1800, properties: { 'sc-domain:example.com': 1800 } };
  const result = await collectIndexFollowups(options(previous, '2026-11-11T09:00:00Z', () => { throw new Error('Quota full'); }));
  assert.equal(result.requests, 0); assert.deepEqual(result.artifact.dailyBudget, previous.dailyBudget);
  assert.equal(result.artifact.followups[0].rounds[0].attempts.length, 0);
});
test('missed windows cannot manufacture historical observations; day seven stays independent', async () => {
  const result = await collectIndexFollowups(options(registered(), '2026-11-15T09:00:00Z', async () => ({ state: 'indexed' })));
  const [first, second] = result.artifact.followups[0].rounds;
  assert.equal(first.status, 'missed'); assert.deepEqual(first.observations, {});
  assert.equal(second.status, 'complete'); assert.equal(result.requests, 2);
});
test('inactive or moved scopes are retained as gaps without provider calls', async () => {
  const result = await collectIndexFollowups(options(registered(), '2026-11-11T09:00:00Z', () => { throw new Error('Private scope'); }, { catalog: { projects: [] } }));
  assert.equal(result.requests, 0); assert.equal(result.artifact.followups[0].rounds[0].status, 'scope-changed');
});
test('interruption preserves its reservation and result and stops queued calls', async () => {
  const controller = new AbortController();
  const result = await collectIndexFollowups(options(registered(), '2026-11-11T09:00:00Z', async () => {
    controller.abort(); return { state: 'indexed' };
  }, { signal: controller.signal }));
  assert.equal(result.requests, 1);
  assert.equal(result.artifact.dailyBudget['2026-11-11'].total, 1);
  assert.equal(result.artifact.followups[0].rounds[0].status, 'retrying');
  assert.equal(Object.keys(result.artifact.followups[0].rounds[0].observations).length, 1);
});
test('CLI due mode needs no authorization before any registered observation is due', () => {
  const directory = mkdtempSync(join(tmpdir(), 'index-followups-'));
  const checkpoint = join(directory, 'coverage.json'); const source = join(directory, 'catalog.json');
  const artifact = registered(); for (const round of artifact.followups[0].rounds) { round.dueAt = '2099-01-01T00:00:00Z'; round.expiresAt = '2099-01-03T00:00:00Z'; }
  writeFileSync(checkpoint, JSON.stringify(artifact)); writeFileSync(source, JSON.stringify(catalog));
  const result = spawnSync(process.execPath, ['apps/backend/scripts/search-index-followups.mjs', '--due', '--catalog', source, '--output', checkpoint], { encoding: 'utf8', env: { ...process.env, PATH: '/nonexistent' } });
  assert.equal(result.status, 0, result.stderr); assert.equal(JSON.parse(result.stdout).requests, 0);
  assert.deepEqual(JSON.parse(readFileSync(checkpoint)), artifact);
});
test('existing metric controller owns follow-up execution, overlap prevention and shutdown', () => {
  const child = new EventEmitter(); child.stdout = new EventEmitter(); child.stderr = new EventEmitter();
  const signals = []; child.kill = signal => signals.push(signal);
  const spawned = []; const receipts = [];
  const controller = createMetricRunController({ projects: [], onRunChange: run => receipts.push(run),
    spawnProcess: (command, args, options) => { spawned.push({command,args,options}); return child; } });
  const run = controller.start({ family: 'indexing', scope: 'portfolio' });
  assert.equal(run.state, 'running'); assert.equal(spawned.length, 1);
  assert.ok(spawned[0].args[0].endsWith('/search-index-followups.mjs'));
  assert.equal(spawned[0].args[1], '--due'); assert.equal(spawned[0].options.shell, false);
  assert.equal(controller.start({ family: 'indexing', scope: 'portfolio' }).duplicate, true);
  controller.abandonActiveRuns();
  assert.deepEqual(signals, ['SIGINT']); assert.equal(controller.get(run.runId).state, 'failed');
  child.emit('close', 0); assert.equal(controller.get(run.runId).state, 'failed');
  assert.equal(receipts.at(-1).code, 'REFRESH_INTERRUPTED');
});
