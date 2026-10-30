import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { psiArtifactContexts } from '../lib/dashboard-backend/psi-artifact-context.mjs';
import { buildDashboardProjection, latestPerformanceBatch } from '../lib/dashboard-projection.mjs';
import { readinessObservations } from '../lib/dashboard-backend/readiness.mjs';

const start = Date.parse('2026-10-30T06:00:00Z');
const tag = 'console-portfolio-12345678-1234-1234-1234-123456789abc';
function provenance(overrides = {}) {
  return { schemaVersion: 1, lighthouseVersion: '13.3.0', browserUserAgent: 'Mozilla/5.0 HeadlessChrome/142.0.0.0 Safari/537.36',
    nodeVersion: 'v24.20.0', chromeFlags: ['--headless=new', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
    benchmarkIndex: 2100, throttlingMethod: 'simulate', formFactor: 'desktop',
    screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false },
    throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 },
    runWarnings: [], runtimeErrorCode: null, observed: { fcpMs: 600, lcpMs: 800, siMs: 700 }, ...overrides };
}

function fixture(t, { insightTable = true } = {}) {
  const home = mkdtempSync(join(tmpdir(), 'site-health-psi-context-'));
  t.after(() => rmSync(home, { recursive: true, force: true }));
  const root = join(home, '.psi-swarm');
  const artifacts = join(root, 'artifacts');
  mkdirSync(artifacts, { recursive: true });
  const database = join(root, 'history.db');
  const sql = statement => execFileSync('sqlite3', [database, statement]);
  sql(`CREATE TABLE runs(id INTEGER PRIMARY KEY,url TEXT,preset TEXT,started_at REAL,finished_at REAL,performance_score REAL,lcp REAL,error TEXT,tag TEXT);
    ${insightTable ? 'CREATE TABLE run_insights(run_id INTEGER PRIMARY KEY,artifact_path TEXT);' : ''}`);
  const runs = Array.from({ length: 5 }, (_, index) => ({ id: index + 1, url: 'https://alpha.example/', preset: 'desktop',
    startedAt: start + index * 1000, finishedAt: start + index * 1000 + 900,
    score: 95 + index, lcp: 1000 + index * 100, tag }));
  const bundle = { url: runs[0].url, preset: 'desktop', tag, runs: 5, exportedAt: start + 6000,
    metrics: runs.map(run => ({ performance_score: run.score, lcp: run.lcp })),
    runMetadata: runs.map((run, metricsIndex) => ({ startedAt: run.startedAt, finishedAt: run.finishedAt, metricsIndex, provenance: provenance() })) };
  const path = join(artifacts, 'capture', 'desktop.json');
  mkdirSync(join(artifacts, 'capture'));
  const write = (value = bundle) => writeFileSync(path, JSON.stringify(value));
  write();
  sql(`INSERT INTO runs VALUES ${runs.map(run => `(${run.id},'${run.url}','${run.preset}',${run.startedAt},${run.finishedAt},${run.score},${run.lcp},NULL,'${tag}')`).join(',')};`);
  const pointer = (value = path, id = 5) => sql(`INSERT OR REPLACE INTO run_insights VALUES(${id},'${value.replaceAll("'", "''")}');`);
  if (insightTable) pointer();
  return { home, root, artifacts, database, sql, runs, bundle, path, write, pointer };
}

test('actual bundle contract enriches the selected cohort, distinguishes observed from simulated, and exposes no path', t => {
  const f = fixture(t);
  const [detail] = psiArtifactContexts(f.home, [f.runs]);
  assert.match(detail, /Capture metadata 5\/5/);
  assert.match(detail, /Warnings: 0 captured across 5\/5 samples/);
  assert.match(detail, /LH 13\.3\.0; Chrome UA 142\.0\.0\.0; Node v24\.20\.0/);
  assert.match(detail, /Requested Chrome flags --headless=new/);
  assert.match(detail, /method simulate \(scored timings simulated\)/);
  assert.match(detail, /Observed LCP: 800 ms median \(5\/5 samples\); separate from scored timing/);
  assert.doesNotMatch(detail, /Mixed|\/Users\/|capture\/desktop|artifact_path/);
});

test('old artifacts, absent pointers, and older databases without the insight table remain unknown', t => {
  const f = fixture(t);
  delete f.bundle.runMetadata;
  f.write();
  assert.match(psiArtifactContexts(f.home, [f.runs])[0], /warning coverage unknown/);
  f.sql('DELETE FROM run_insights;');
  assert.match(psiArtifactContexts(f.home, [f.runs])[0], /Capture metadata unknown/);
  const old = fixture(t, { insightTable: false });
  assert.match(psiArtifactContexts(old.home, [old.runs])[0], /Capture metadata unknown/);
});

test('missing warnings and observed values are unknown; partial capture keeps its own denominator', t => {
  const f = fixture(t);
  f.bundle.runMetadata[0].provenance = provenance({ runWarnings: undefined, observed: {} });
  f.bundle.runMetadata[1].provenance = provenance({ runWarnings: ['Warnings at /Users/private-person/local/file.txt'], lighthouseVersion: '14.0.0' });
  delete f.bundle.runMetadata[2].provenance;
  f.write();
  const [detail] = psiArtifactContexts(f.home, [f.runs]);
  assert.match(detail, /Capture metadata 4\/5 \(partial; remainder unknown\)/);
  assert.match(detail, /Warnings: 1 captured across 3\/5 samples; remaining warning coverage unknown/);
  assert.match(detail, /Mixed measurement configurations/);
  assert.match(detail, /Observed LCP: 800 ms median \(3\/5 samples\)/);
  assert.match(detail, /\[local path\]/);
  assert.doesNotMatch(detail, /private-person|file\.txt/);
});

test('valid metadata without any captured warning arrays reports unknown rather than zero warnings', t => {
  const f = fixture(t);
  f.bundle.runMetadata.forEach(item => { delete item.provenance.runWarnings; });
  f.write();
  const [detail] = psiArtifactContexts(f.home, [f.runs]);
  assert.match(detail, /Capture metadata 5\/5/);
  assert.match(detail, /Warning coverage unknown \(0\/5 captured\)/);
  assert.doesNotMatch(detail, /Warnings: 0|0 warnings/);
  assert.match(detail, /Observed LCP: 800 ms median \(5\/5 samples\)/);
});

test('warning summaries redact URL credentials/query/fragment and whole credential-bearing messages', t => {
  const f = fixture(t);
  const messages = [
    'Request https://synthetic-user:synthetic-pass@example.com/page?session=synthetic-query#synthetic-fragment failed',
    'Request //synthetic-relative-user:synthetic-relative-pass@example.com/page?code=synthetic-code failed',
    'Authorization: Basic synthetic-basic-credential',
    'Retry with Bearer synthetic-bearer-credential',
    'Authorization="Bearer synthetic-quoted-credential"',
  ];
  f.bundle.runMetadata.forEach((item, index) => { item.provenance.runWarnings = [messages[index]]; });
  f.bundle.runMetadata[0].provenance.extraHeaders = { Authorization: 'synthetic-unknown-field' };
  f.bundle.metrics[0].unknownField = 'synthetic-unknown-field';
  f.write();
  const [detail] = psiArtifactContexts(f.home, [f.runs]);
  assert.match(detail, /Warnings: 5 captured across 5\/5 samples/);
  assert.match(detail, /https:\/\/example\.com\/page\?\[query redacted\]#\[fragment redacted\]/);
  assert.match(detail, /\[credential-bearing warning redacted\]/);
  assert.doesNotMatch(detail, /synthetic-|Authorization|Bearer|extraHeaders|unknownField/);
});

test('zero/false remain captured values and failed attempts never displace successful metric indices', t => {
  const f = fixture(t);
  f.bundle.runMetadata.forEach(item => {
    item.provenance = provenance({ observed: { fcpMs: 0, lcpMs: 0, siMs: 0 }, benchmarkIndex: 0,
      throttling: { rttMs: 0, cpuSlowdownMultiplier: 1 } });
  });
  f.bundle.runMetadata.splice(1, 0, { startedAt: start - 2000, finishedAt: start - 1000, metricsIndex: null,
    provenance: provenance({ runtimeErrorCode: 'NO_FCP', runWarnings: ['failed attempt warning'] }) });
  f.write();
  const [detail] = psiArtifactContexts(f.home, [f.runs]);
  assert.match(detail, /Capture metadata 5\/5/);
  assert.match(detail, /Observed LCP: 0 ms median \(5\/5 samples\)/);
  assert.match(detail, /mobile=false/);
  assert.match(detail, /rttMs=0/);
  assert.match(detail, /Host benchmark: 0–0/);
  assert.doesNotMatch(detail, /failed attempt warning|NO_FCP/);
});

test('URL, tag, preset, exact timestamps, metric index and metric parity all bind metadata identity', t => {
  const mutations = [
    bundle => { bundle.url = 'https://other.example/'; },
    bundle => { bundle.tag = 'other'; },
    bundle => { bundle.preset = 'mobile-mid'; },
    bundle => { bundle.runMetadata.forEach(item => { item.startedAt += 1; }); },
    bundle => { bundle.runMetadata.forEach(item => { item.finishedAt += 1; }); },
    bundle => { bundle.runMetadata.forEach(item => { item.metricsIndex = null; }); },
    bundle => { bundle.runMetadata.forEach(item => { item.metricsIndex = 99; }); },
    bundle => { bundle.runMetadata.forEach(item => { item.metricsIndex = 0; }); },
    bundle => { bundle.metrics.forEach(item => { item.lcp += 1; }); },
    bundle => { bundle.metrics.forEach(item => { item.performance_score -= 1; }); },
    bundle => { bundle.runMetadata.push(...structuredClone(bundle.runMetadata)); },
    bundle => { bundle.runMetadata.forEach(item => { item.provenance.schemaVersion = 2; }); },
  ];
  for (const mutate of mutations) {
    const f = fixture(t);
    mutate(f.bundle);
    f.write();
    assert.match(psiArtifactContexts(f.home, [f.runs])[0], /Capture metadata unknown/);
  }
});

test('artifact reads reject outside paths, symlink escapes, directories, malformed and oversized JSON', t => {
  const f = fixture(t);
  const outside = join(f.home, 'outside.json');
  writeFileSync(outside, JSON.stringify(f.bundle));
  f.pointer(outside);
  assert.match(psiArtifactContexts(f.home, [f.runs])[0], /Capture metadata unknown/);
  const link = join(f.artifacts, 'escape.json');
  symlinkSync(outside, link);
  f.pointer(link);
  assert.match(psiArtifactContexts(f.home, [f.runs])[0], /Capture metadata unknown/);
  f.pointer(f.artifacts);
  assert.match(psiArtifactContexts(f.home, [f.runs])[0], /Capture metadata unknown/);
  f.pointer();
  writeFileSync(f.path, '{broken JSON');
  assert.match(psiArtifactContexts(f.home, [f.runs])[0], /Capture metadata unknown/);
  writeFileSync(f.path, ' '.repeat(2 * 1024 * 1024 + 1));
  assert.match(psiArtifactContexts(f.home, [f.runs])[0], /Capture metadata unknown/);
});

test('cache invalidates on file replacement; selected-run and file counts are bounded', t => {
  const f = fixture(t);
  assert.match(psiArtifactContexts(f.home, [f.runs])[0], /Warnings: 0 captured/);
  f.bundle.runMetadata.forEach(item => { item.provenance.runWarnings = ['new warning']; });
  f.write();
  assert.match(psiArtifactContexts(f.home, [f.runs])[0], /Warnings: 5 captured/);
  // An unselected insight pointer must not influence this cohort or be read.
  f.pointer('/Users/not-an-artifact/private.json', 99);
  assert.match(psiArtifactContexts(f.home, [f.runs])[0], /Capture metadata 5\/5/);
  const earlier = { ...f.runs[0], id: 6, startedAt: start - 1000, finishedAt: start - 100 };
  assert.match(psiArtifactContexts(f.home, [[earlier, ...f.runs]])[0], /Capture metadata 5\/6 \(partial; remainder unknown\)/);
  // More than one bundle pointer in one selected preset is ambiguous, not a directory search.
  f.pointer('/Users/not-an-artifact/second.json', 4);
  assert.match(psiArtifactContexts(f.home, [f.runs])[0], /Capture metadata unknown/);
});

test('projection retains a complete cohort and its metadata after a partial retry; public batch shape is unchanged', t => {
  const f = fixture(t);
  const repositoryRoot = join(f.home, 'fleet/site-health');
  const config = join(repositoryRoot, 'apps/backend/config');
  mkdirSync(config, { recursive: true });
  writeFileSync(join(config, 'projects.json'), JSON.stringify({ projects: [
    { id: 'alpha', domains: ['alpha.example'], lifecycle: { status: 'active' }, public: { listing: 'maintained' } },
  ] }));
  f.sql(`INSERT INTO runs VALUES(6,'https://alpha.example/','desktop',${start + 10000},${start + 10900},12,9000,NULL,'partial');`);
  const now = '2026-10-30T07:00:00Z';
  const rows = buildDashboardProjection({ repositoryRoot, workspaceRoot: join(f.home, 'fleet'), home: f.home, now }).outcomes.performance;
  const row = rows[0];
  assert.equal(row.samples, 5);
  assert.equal(row.psi.value, 97);
  assert.equal(row.lcp.value, 1200);
  assert.equal(row.status, 'retained');
  assert.equal(row.pendingBatch.sampleCount, 1);
  assert.match(row.provenanceDetail, /Capture metadata 5\/5/);
  assert.match(row.provenanceDetail, /Observed LCP: 800 ms/);
  assert.doesNotMatch(JSON.stringify(row), /artifact_path|startedAt|finishedAt|\/artifacts\//);
  const evidence = readinessObservations([{ id: 'alpha' }], { outcomes: { performance: rows } });
  const desktop = evidence.filter(item => item.source === 'performance');
  assert.equal(desktop.length, 2);
  assert.ok(desktop.every(item => item.context.detail.includes('1/5 samples') && item.context.detail.includes('Capture metadata 5/5')));
  assert.deepEqual(latestPerformanceBatch(f.runs.map(run => ({ ...run, observedAt: new Date(run.startedAt).toISOString() })), now),
    { observedAt: new Date(start + 4000).toISOString(), score: 97, lcp: 1200, sampleCount: 5 });
});
