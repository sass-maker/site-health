import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { DashboardStore, verifyBackup } from '../lib/dashboard-backend/store.mjs';
import { emptyReadinessState, validateReadinessState, effortSummary, resultSummary, metricScore, GATES } from '../lib/dashboard-backend/readiness-model.mjs';
import { buildReadinessProjection, readinessObservations, saveReadiness } from '../lib/dashboard-backend/readiness.mjs';
import { startDashboardService } from '../lib/dashboard-backend/service.mjs';

const now = '2026-10-27T10:00:00.000Z';
const projects = [{ id: 'sample', name: 'Sample', lifecycle: { status: 'active' } }, { id: 'retired', name: 'Retired', lifecycle: { status: 'retired' } }];
const proof = [{ ref: 'repo:sample@abc123/runtime-report', observedAt: now }];
function store(path) { return new DashboardStore({ databasePath: path ?? join(mkdtempSync(join(tmpdir(), 'readiness-test-')), 'ledger.sqlite'), projects }); }
const update = (state = emptyReadinessState(), expectedRevision = 0, idempotencyKey = 'readiness-test-1') => ({ expectedRevision, idempotencyKey, state });
function benchmark(patch = {}) { return { applicability: 'applicable', reason: '', definition: 'Meaningful daily actors, excluding QA', baseline: 0, target: 10, unit: 'actors', window: '2026-10-26 UTC', source: 'first-party qualified aggregate', direction: 'higher', thresholds: [1, 2, 3, 4, 5], value: 3, qualification: 'qualified', observedAt: now, evidenceRefs: proof, ...patch }; }

test('durable owner state is idempotent, revision protected across connections and backup-replayable', () => {
  const original = store(); const second = store(original.databasePath);
  try {
    const state = emptyReadinessState(); state.nextLevers.product = 'Verify the core workflow';
    assert.equal(saveReadiness(original, 'sample', update(state), now).revision, 1);
    assert.equal(saveReadiness(second, 'sample', update(state), now).duplicate, true);
    assert.throws(() => saveReadiness(second, 'sample', update(emptyReadinessState(), 0, 'stale'), now), e => e.statusCode === 409);
    assert.throws(() => saveReadiness(second, 'sample', update(emptyReadinessState()), now), e => e.code === 'IDEMPOTENCY_CONFLICT');
    state.nextLevers.growth = 'Verify indexing';
    saveReadiness(second, 'sample', update(state, 1, 'second'), now);
    const backup = original.createBackup({ now }); assert.equal(verifyBackup(backup).eventCount, 2);
    const restored = store();
    try { assert.deepEqual(restored.restoreBackup(backup).readiness, original.rebuildProjections({ now }).readiness); }
    finally { restored.close(); }
    const tampered = structuredClone(backup); tampered.events[0].payload.state.nextLevers.product = 'changed';
    assert.throws(() => verifyBackup(tampered), /digest mismatch/);
  } finally { second.close(); original.close(); }
});

test('current membership and bounded typed state reject invalid or private data', () => {
  const ledger = store();
  try {
    assert.throws(() => saveReadiness(ledger, 'retired', update(), now), e => e.statusCode === 404);
    const invalid = emptyReadinessState(); invalid.requirements['product-core'] = { status: 'verified', note: '', evidenceRefs: [] };
    assert.throws(() => saveReadiness(ledger, 'sample', update(invalid), now), /dated proof/);
    invalid.requirements['product-core'].evidenceRefs = [{ ref: 'https://example.com/report?token=secret', observedAt: now }];
    assert.throws(() => validateReadinessState(invalid), /credentials/);
    const unknown = emptyReadinessState(); unknown.secret = 'hidden'; assert.throws(() => validateReadinessState(unknown), /not supported/);
    const oversized = emptyReadinessState();
    for (const gate of Object.values(GATES).flat()) oversized.requirements[gate.id] = { status: 'verified', note: 'n'.repeat(1000), evidenceRefs: [{ ref: 'r'.repeat(500), observedAt: now }] };
    oversized.nextLevers = { product: 'a'.repeat(1000), growth: 'a'.repeat(1000) };
    assert.throws(() => saveReadiness(ledger, 'sample', update(oversized), now), e => e.code === 'EVENT_TOO_LARGE');
    assert.equal(ledger.listEvents().length, 0);
  } finally { ledger.close(); }
});

test('ordered effort gates distinguish no assessment, work, proof and explicit exemptions', () => {
  const state = emptyReadinessState(); assert.equal(effortSummary(state, 'product').score, null);
  state.applicability.product.state = 'applicable'; assert.equal(effortSummary(state, 'product').score, null);
  state.requirements['product-design'] = { status: 'verified', note: '', evidenceRefs: proof };
  assert.equal(effortSummary(state, 'product').score, 0);
  state.requirements['product-core'] = { status: 'verified', note: '', evidenceRefs: proof };
  assert.equal(effortSummary(state, 'product').score, 2);
  state.applicability.growth = { state: 'exempt', reason: 'Private internal tool with no acquisition surface' };
  assert.equal(effortSummary(state, 'growth').score, null);
  assert.equal(effortSummary(state, 'growth').status, 'exempt');
});

test('results require complete definitions and qualified proof; zero remains a measured value', () => {
  assert.equal(metricScore(benchmark()), 6);
  assert.equal(metricScore(benchmark({ value: 0 })), 0);
  for (const patch of [{ qualification: 'proxy' }, { value: null }, { evidenceRefs: [] }, { thresholds: [] }, { source: '' }, { window: '' }, { baseline: null }, { target: null }]) assert.equal(metricScore(benchmark(patch)), null);
  assert.equal(metricScore(benchmark({ direction: 'lower', thresholds: [5, 4, 3, 2, 1], value: 2 })), 8);
  const state = emptyReadinessState(); state.applicability.product.state = 'applicable'; state.benchmarks.dau = benchmark();
  assert.equal(resultSummary(state, 'product').score, null);
  for (const id of ['high-intent', 'revenue', 'churn']) state.benchmarks[id] = benchmark({ applicability: 'exempt', reason: 'Outside this product outcome contract' });
  assert.equal(resultSummary(state, 'product').score, 6);
  state.benchmarks.dau.thresholds = [1, 3, 2, 4, 5]; assert.throws(() => validateReadinessState(state), /strictly improve/);
});

test('read model includes current products, zero observations and explicit missing coverage', () => {
  const evidence = readinessObservations(projects, { outcomes: { search: [{ projectId: 'sample', observedAt: now, clicks: { value: 0, observedAt: now } }] } });
  const projection = buildReadinessProjection({ projects, observations: evidence, generatedAt: now });
  assert.deepEqual(projection.projects.map(p => p.id), ['sample']);
  const clicks = projection.projects[0].evidence.find(e => e.id === 'search:clicks:0');
  assert.equal(clicks.value, 0); assert.equal(clicks.qualification, 'proxy');
  assert.equal(projection.projects[0].evidence.find(e => e.id === 'performance:psi').value, null);
  assert.equal(projection.projects[0].scores.product.effort.score, null);
  assert.ok(projection.projects[0].coverageGaps.length);
});

test('source adapters retain real projection signal shapes, domain membership and Clarity metrics', () => {
  const signal = value => ({ value, observedAt: now, label: 'Observed', series: [] });
  const projection = { outcomes: {
    domains: [{ domain: 'sample.example', projects: [{ projectId: 'sample', name: 'Sample' }], signal: signal(12) }],
    performance: [{ projectId: 'sample', psi: signal(95), lcp: signal(1200) }],
    search: [{ projectId: 'sample', impressions: signal(200), clicks: signal(0), averagePosition: signal(8), period: { start: '2026-10-01', end: '2026-10-26' } }],
    seoAudit: [{ projectId: 'sample', pass: signal(45), fail: signal(0) }],
    geoAwareness: [{ projectId: 'sample', topThree: signal(25), pageOne: signal(75), queries: 4 }],
    aiAwareness: [{ projectId: 'sample', mention: signal(20), recommendation: signal(10), citation: signal(0), coverage: { configured: 10, completed: 10 } }],
  } };
  const clarity = { sample: { state: 'fresh', snapshot: { observedAt: now, metrics: { sessions: 9, uniqueBrowsers: 4 } } } };
  const rows = readinessObservations(projects, projection, clarity).filter(row => row.projectId === 'sample');
  const readings = Object.fromEntries(rows.map(row => [row.id, row.value]));
  assert.deepEqual(readings, { 'domains:signal:0': 12, 'performance:psi:0': 95, 'performance:lcp:0': 1200, 'search:impressions:0': 200, 'search:clicks:0': 0, 'search:averagePosition:0': 8, 'seoAudit:pass:0': 45, 'seoAudit:fail:0': 0, 'geoAwareness:topThree:0': 25, 'geoAwareness:pageOne:0': 75, 'aiAwareness:mention:0': 20, 'aiAwareness:recommendation:0': 10, 'aiAwareness:citation:0': 0, 'clarity:sessions': 9, 'clarity:uniqueBrowsers': 4 });
  assert.ok(rows.every(row => row.observedAt === now && row.qualification === 'proxy'));
});

test('HTTP saves enforce owner auth, browser origin, stale revisions and replayed reads', async () => {
  const ledger = store();
  const server = await startDashboardService({ store: ledger, port: 0, ownerToken: 'test-owner', visibilityPortfolio: { eligible: [] }, projectionProvider: () => ({ outcomes: {} }), clarityRegistryProvider: () => new Map(), readinessObservationProvider: () => [{ projectId: 'sample', id: 'qualified-activity', label: 'Core actions', value: 2, unit: 'actions', source: 'first-party', observedAt: now, qualification: 'qualified' }] });
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const put = (body, headers = {}) => fetch(`${base}/v1/readiness/sample`, { method: 'PUT', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
    assert.equal((await put(update())).status, 401);
    assert.equal((await put(update(), { authorization: 'Bearer test-owner', origin: 'https://evil.example' })).status, 403);
    assert.equal((await put(update(), { authorization: 'Bearer test-owner' })).status, 200);
    assert.equal((await put(update(emptyReadinessState(), 0, 'stale-http'), { authorization: 'Bearer test-owner' })).status, 409);
    const response = await fetch(`${base}/v1/readiness`); assert.equal(response.status, 200);
    const data = await response.json(); assert.equal(data.projects.length, 1); assert.equal(data.projects[0].revision, 1); assert.equal(data.projects[0].evidence.at(-1).value, 2);
  } finally { await new Promise(resolve => server.close(resolve)); ledger.close(); }
});
