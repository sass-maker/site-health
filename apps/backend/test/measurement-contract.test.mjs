import assert from 'node:assert/strict';
import test from 'node:test';
import { qualifyObservation } from '../lib/dashboard-backend/measurement-contract.mjs';
import { buildReadinessProjection, readinessObservations } from '../lib/dashboard-backend/readiness.mjs';
import { collectUsageEvidence, importUsageExport } from '../lib/dashboard-backend/usage-evidence.mjs';
import { metricScore } from '../lib/dashboard-backend/readiness-model.mjs';
import { latestPerformanceBatch } from '../lib/dashboard-projection.mjs';
import { summarizeIndexCoverage } from '../lib/search-index-coverage.mjs';

const now = '2026-10-30T10:00:00Z';
const projects = [{ id: 'one', name: 'One', lifecycle: { status: 'active' } }];
const reading = { id: 'monthly-browser-proxy', projectId: 'one', source: 'app-health.browser-report', label: 'Usage', unit: 'browsers', value: 0, observedAt: now, qualification: 'proxy' };

test('daily freshness expires at the actual source date, never at projection generation', () => {
  const current = qualifyObservation(reading, now);
  assert.equal(current.measurement.state, 'current');
  assert.equal(current.value, 0);
  assert.equal(current.qualification, 'proxy');
  const old = qualifyObservation({ ...reading, observedAt: '2026-10-29T09:59:59Z' }, now);
  assert.equal(old.measurement.state, 'stale');
  assert.equal(old.value, 0); // Retained history, explicitly excluded from current scoring.
  assert.equal(old.qualification, 'unknown');
  const projected = buildReadinessProjection({ projects, observations: [old], generatedAt: now }).projects[0];
  assert.equal(projected.measurementCoverage.stale, 1);
  assert.equal(projected.measurementCoverage.current, 0);
});

test('bad values and dates cannot qualify; missing and retained evidence are distinct', () => {
  for (const patch of [{ value: NaN }, { value: -1 }, { unit: '%', value: 101 }, { observedAt: null }, { observedAt: '2026-11-01T00:00:00Z' }]) {
    const row = qualifyObservation({ ...reading, ...patch }, now);
    assert.equal(row.measurement.state, 'invalid');
    assert.equal(row.qualification, 'unknown');
  }
  assert.equal(qualifyObservation({ ...reading, value: null }, now).measurement.state, 'missing');
  assert.equal(qualifyObservation({ ...reading, status: 'retained' }, now).measurement.state, 'retained');
});

test('adapters retain lab sample size, SEO warning denominator, AI scope and indexing cohorts', () => {
  const signal = value => ({ value, observedAt: now });
  const rows = readinessObservations(projects, { outcomes: {
    performance: [{ projectId: 'one', domain: 'one.test', samples: 2, preset: 'desktop', psi: signal(90), mobile: { samples: 3, psi: signal(70) } }],
    seoAudit: [{ projectId: 'one', url: 'https://one.test/', observedAt: now, pass: signal(8), fail: signal(0), warn: signal(2), checks: 10 }],
    aiAwareness: [{ projectId: 'one', mention: signal(50), coverage: { completed: 2, configured: 4, failed: 2 }, attempts: [{ providerId: 'test-provider', model: 'test-model' }] }],
    indexCoverage: [{ projectId: 'one', indexCoverage: { surfaceUrl: 'https://one.test/', googleReport: { reportDate: '2026-10-29', indexedCount: 3, totalKnownCount: 4 }, total: 10, indexed: 1, checked: 2, inventoryComplete: true, indexedPercentage: null } }],
  } });
  const byId = Object.fromEntries(rows.map(row => [row.id, row]));
  assert.equal(byId['performance:psi:0'].context.samples, 2);
  assert.equal(byId['mobile:psi'].context.samples, 3);
  assert.equal(byId['seoAudit:warn:0'].value, 2);
  assert.equal(byId['seoAudit:checks:0'].value, 10);
  assert.equal(byId['aiAwareness:mention:0'].context.completed, 2);
  assert.match(byId['aiAwareness:mention:0'].context.models, /test-provider/);
  assert.equal(byId['indexCoverage:google:0'].value, 75);
  assert.equal(byId['indexCoverage:google:0'].context.denominator, 4);
  assert.equal(byId['indexCoverage:inventory:0'].value, null);
  assert.equal(byId['indexCoverage:inventory:0'].context.denominator, 10);
});

test('malformed events and unsupported proxy units never silently become measured zero', () => {
  const imported = eventRows => importUsageExport({ kind: 'portfolio-usage', schemaVersion: 1, usage: { updatedAt: now, records: { one: { checkedAt: now, proxy: { count: 4, unit: 'people' }, events: eventRows } } } }, projects).records.one;
  for (const events of [[{ count: null }], [{ count: 3 }, { count: 'bad' }], [{ count: -1 }]]) {
    assert.equal(imported(events).actionEvents, null);
    assert.equal(imported(events).count, null);
    assert.equal(imported(events).unit, null);
  }
  assert.equal(imported([]).actionEvents, 0);
});

test('collector retains sampling and valid browser zero while rejecting partial event totals', async () => {
  const snapshot = await collectUsageEvidence({ projects, credential: 'test-fixture', now: () => now, fetcher: async url => ({ ok: true, json: async () => url.endsWith('/v1/apps')
    ? { apps: [{ app: { id: 'one' }, environments: [{ id: 'production', name: 'production' }] }] }
    : { from: Date.parse(now) - 30 * 86_400_000, to: Date.parse(now), sampled: true, source: 'analytics-engine', sessions: 0, audience: { visitors: 0 }, events: [{ count: 4 }, { count: null }] } }) });
  assert.equal(snapshot.records.one.status, 'available');
  assert.equal(snapshot.records.one.count, 0);
  assert.equal(snapshot.records.one.actionEvents, null);
  assert.equal(snapshot.records.one.sampled, true);
});

test('qualified benchmarks expire after the weekly review and future values cannot score', () => {
  const benchmark = { applicability: 'applicable', qualification: 'qualified', value: 3, observedAt: now, baseline: 0, target: 10, direction: 'higher', thresholds: [1, 2, 3, 4, 5], definition: 'Qualified actors', unit: 'actors', window: 'UTC day', source: 'qualified source', evidenceRefs: [{ ref: 'test:proof', observedAt: now }] };
  assert.equal(metricScore(benchmark, now), 6);
  assert.equal(metricScore(benchmark, '2026-11-07T10:00:00Z'), null);
  assert.equal(metricScore({ ...benchmark, observedAt: '2026-11-01T00:00:00Z' }, now), null);
});

test('future lab captures and future inventory checks cannot define current performance or coverage', () => {
  assert.equal(latestPerformanceBatch([{ score: 99, lcp: 100, observedAt: '2027-01-01T00:00:00Z' }], now), null);
  const coverage = summarizeIndexCoverage({ inventory: { urls: ['a'], complete: true, observedAt: '2027-01-01T00:00:00Z' }, inspections: { a: { state: 'indexed', observedAt: '2027-01-01T00:00:00Z' } } }, { now });
  assert.equal(coverage.indexedPercentage, null);
  assert.equal(coverage.state, 'stale');
});
