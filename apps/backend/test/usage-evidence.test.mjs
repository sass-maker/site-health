import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { appHealthCredential, collectUsageEvidence, importUsageExport, readUsageEvidence, summarizeUsageSnapshot, usageFailureSnapshot, usageObservations, writeUsageEvidence } from '../lib/dashboard-backend/usage-evidence.mjs';
const projects = [{ id: 'one', name: 'One', lifecycle: { status: 'active' }, status: 'active' }];

test('import filters archived/foreign records, preserves zero, never promotes events to qualified use', () => {
  const snapshot = importUsageExport({ kind: 'portfolio-usage', schemaVersion: 1, usage: { updatedAt: '2026-10-27T00:00:00Z', records: {
    one: { checkedAt: '2026-10-27T00:00:00Z', proxy: { count: 0, unit: 'browsers' }, events: [{ count: 3 }] }, foreign: { proxy: { count: 99 } },
  } } }, projects);
  assert.deepEqual(Object.keys(snapshot.records), ['one']);
  const rows = usageObservations(projects, snapshot);
  assert.equal(rows[0].value, 0); assert.equal(rows[0].qualification, 'proxy');
  assert.equal(rows[1].value, 3); assert.equal(rows[1].qualification, 'proxy');
  assert.equal(usageObservations(projects, null)[0].value, null);
});

test('collector rejects ambiguous mapping and redirects; only fixed-origin GET aggregate reads are made', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    const body = url.endsWith('/v1/apps') ? { apps: [{ app: { id: 'app', name: 'One' }, environments: [{ id: 'prod', name: 'production' }] }] }
      : { from: 1, to: 2, sampled: false, source: 'analytics-engine', sessions: 3, audience: { visitors: 0 }, events: [{ count: 2 }] };
    return { ok: true, json: async () => body };
  };
  const snapshot = await collectUsageEvidence({ projects, credential: 'fixture', fetcher });
  assert.equal(snapshot.records.one.status, 'available');
  assert.equal(snapshot.records.one.count, 0);
  assert.equal(calls.length, 2);
  for (const call of calls) {
    assert.equal(new URL(call.url).origin, 'https://health.sassmaker.com');
    assert.equal(call.options.method, 'GET'); assert.equal(call.options.redirect, 'error');
  }
  assert.ok(!JSON.stringify(snapshot).includes('fixture'));
  const ambiguous = await collectUsageEvidence({ projects, credential: 'fixture', fetcher: async () => ({ ok: true, json: async () => ({ apps: [
    { app: { name: 'One' }, environments: [{ name: 'production' }] }, { app: { name: 'One' }, environments: [{ name: 'production' }] },
  ] }) }) });
  assert.equal(ambiguous.records.one.count, null);
  assert.equal(ambiguous.records.one.status, 'unmapped');
  assert.equal(ambiguous.records.one.observedAt, null);
  const failed = await collectUsageEvidence({ projects, credential: 'fixture', fetcher: async (url) => url.endsWith('/v1/apps')
    ? { ok: true, json: async () => ({ apps: [{ app: { id: 'one', name: 'One' }, environments: [{ id: 'prod', name: 'production' }] }] }) }
    : { ok: false, status: 503, json: async () => ({}) } });
  assert.equal(failed.records.one.status, 'failed');
  assert.equal(failed.records.one.count, null);
});

test('failed refresh retains the original good value and observation date', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'usage-retain-')), 'usage.json');
  writeUsageEvidence({ observedAt: '2026-10-26T00:00:00Z', records: { one: { count: 7, observedAt: '2026-10-26T00:00:00Z', unit: 'browsers' } } }, path);
  writeUsageEvidence({ observedAt: '2026-10-27T00:00:00Z', records: { one: { status: 'failed', count: null, observedAt: null, gap: 'HTTP failure' } } }, path);
  const snapshot = readUsageEvidence(path);
  assert.equal(snapshot.records.one.status, 'retained');
  assert.equal(snapshot.records.one.count, 7);
  assert.equal(snapshot.records.one.observedAt, '2026-10-26T00:00:00Z');
  assert.match(snapshot.records.one.gap, /Refresh failed; retained last-known 7 browsers observed 2026-10-26T00:00:00Z/);
  const observations = usageObservations(projects, snapshot);
  assert.ok(observations.every((observation) => observation.status === 'retained' && observation.value === null && observation.qualification === 'unknown'));
  assert.ok(observations.every((observation) => observation.observedAt === '2026-10-26T00:00:00Z'));
});

test('null-count imported usage preserves a prior good observation', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'usage-import-retain-')), 'usage.json');
  writeUsageEvidence({ observedAt: '2026-10-26T00:00:00Z', records: { one: { count: 7, observedAt: '2026-10-26T00:00:00Z', unit: 'browsers' } } }, path);
  const imported = importUsageExport({ kind: 'portfolio-usage', schemaVersion: 1, usage: { updatedAt: '2026-10-27T00:00:00Z', records: {
    one: { checkedAt: '2026-10-27T00:00:00Z', proxy: { count: null }, limitations: 'No browser proxy available.' },
  } } }, projects);
  writeUsageEvidence(imported, path);
  const row = readUsageEvidence(path).records.one;
  assert.equal(row.status, 'retained');
  assert.equal(row.count, 7);
  assert.equal(row.observedAt, '2026-10-26T00:00:00Z');
  assert.match(row.gap, /Incoming row had no numeric count; retained last-known 7 browsers observed 2026-10-26T00:00:00Z/);
});

test('lane-wide usage failure remains unknown without falsely retaining a prior value', () => {
  const snapshot = usageFailureSnapshot(projects, () => '2026-10-27T00:00:00Z');
  assert.equal(snapshot.records.one.status, 'failed');
  assert.equal(usageObservations(projects, snapshot)[0].value, null);
  assert.doesNotMatch(snapshot.records.one.gap, /retained/);
});

test('usage receipt summary preserves partial coverage counts', () => {
  assert.equal(summarizeUsageSnapshot({ records: {
    available: { status: 'available', count: 2 }, unmapped: { status: 'unmapped', count: null }, failed: { status: 'failed', count: null },
  } }).summary, 'App Health usage refresh: 1 available, 1 unmapped, 1 failed.');
});

test('credential resolution is asynchronous and never enters aggregate evidence', async () => {
  let resolve;
  const pending = appHealthCredential({ env: {}, readSecret: () => new Promise(done => { resolve = done; }) });
  assert.ok(pending instanceof Promise);
  resolve({ stdout: 'fixture\n' }); assert.equal(await pending, 'fixture');
});


test('approved scoped Keychain token is read without command-line secrets', async () => {
  const calls = [];
  const token = await appHealthCredential({ env: { APP_HEALTH_OWNER_TOKEN: 'broad-fixture' }, readSecret: async (...args) => {
    calls.push(args); return { stdout: 'scoped-fixture\n' };
  } });
  assert.equal(token, 'scoped-fixture');
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], '/usr/bin/security');
  assert.deepEqual(calls[0][1], ['find-generic-password', '-s', 'com.sassmaker.site-health.app-health-read', '-a', 'owner', '-w']);
  assert.ok(!JSON.stringify(calls).includes('scoped-fixture'));
  const unavailable = await appHealthCredential({ env: { APP_HEALTH_OWNER_TOKEN: 'owner-fixture' }, readSecret: async () => { throw new Error('missing'); } });
  assert.equal(unavailable, null);
});


test('missing or empty scoped Keychain item stays unavailable without broad credential fallback', async () => {
  for (const missing of [true, false]) {
    const executables = [];
    const token = await appHealthCredential({ env: { SITE_HEALTH_OWNER_REPOSITORY: '/tmp/site-health', APP_HEALTH_OWNER_TOKEN: 'owner-fixture' }, readSecret: async (executable) => {
      executables.push(executable);
      if (executable === '/usr/bin/security') { if (missing) throw new Error('missing'); return { stdout: '' }; }
      return { stdout: 'unexpected-fixture\n' };
    } });
    assert.equal(token, null);
    assert.deepEqual(executables, ['/usr/bin/security']);
  }
});

test('explicit read token takes precedence over Keychain', async () => {
  const token = await appHealthCredential({ env: { APP_HEALTH_READ_TOKEN: 'read-fixture' }, readSecret: async () => { throw new Error('not needed'); } });
  assert.equal(token, 'read-fixture');
});
