import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { DashboardStore, verifyBackup } from '../lib/dashboard-backend/store.mjs';
import { emptyReadinessState, validateReadinessState, effortSummary, requirementCompletion, resultSummary, metricScore, GATES } from '../lib/dashboard-backend/readiness-model.mjs';
import { buildReadinessProjection, readinessObservations, saveReadiness } from '../lib/dashboard-backend/readiness.mjs';
import { startDashboardService } from '../lib/dashboard-backend/service.mjs';
import { normalizeBackupEvent, normalizeEvent } from '../lib/dashboard-backend/contracts.mjs';

const now = '2026-10-27T10:00:00.000Z';
const projects = [{ id: 'sample', name: 'Sample', lifecycle: { status: 'active' } }, { id: 'retired', name: 'Retired', lifecycle: { status: 'retired' } }];
const proof = [{ ref: 'repo:sample@abc123/runtime-report', observedAt: now }];
function store(path) { return new DashboardStore({ databasePath: path ?? join(mkdtempSync(join(tmpdir(), 'readiness-test-')), 'ledger.sqlite'), projects }); }
const update = (state = emptyReadinessState(), expectedRevision = 0, idempotencyKey = 'readiness-test-1') => ({ expectedRevision, idempotencyKey, state });

test('backup compatibility retains structurally valid older states above the new owner-write limit', () => {
  const state = emptyReadinessState();
  for (const gate of Object.values(GATES).flat().slice(0, 8)) state.requirements[gate.id] = { status: 'verified', note: 'n'.repeat(1000), evidenceRefs: [{ ref: 'r'.repeat(450), observedAt: now }] };
  const event = { type: 'readiness.state-updated', projectId: 'sample', actor: { type: 'owner', id: 'owner' }, idempotencyKey: 'legacy-large', payload: { expectedRevision: 0, state } };
  assert.ok(Buffer.byteLength(JSON.stringify(state)) > 12 * 1024);
  assert.throws(() => normalizeEvent(event, { now }), /12 KB/);
  assert.deepEqual(normalizeBackupEvent(event, { now }).payload.state, state);
});
function benchmark(patch = {}) { return { applicability: 'applicable', reason: '', definition: 'Meaningful daily actors, excluding QA', baseline: 0, target: 10, unit: 'actors', window: '2026-10-26 UTC', source: 'first-party qualified aggregate', direction: 'higher', thresholds: [1, 2, 3, 4, 5], value: 3, qualification: 'qualified', observedAt: now, evidenceRefs: proof, ...patch }; }

test('durable owner state is idempotent, revision protected across connections and backup-replayable', () => {
  const original = store(); const second = store(original.databasePath);
  try {
    const state = emptyReadinessState(); state.nextLevers.product = 'Verify the core workflow';
    state.requirements['product-core'] = { status: 'in-progress', note: 'Core workflow implemented; recovery qualification remains', completion: 75, confidence: 'medium', evidenceRefs: proof };
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
    assert.throws(() => saveReadiness(ledger, 'sample', update(oversized), now), e => e.code === 'INVALID_READINESS_STATE' && /12 KB/.test(e.message));
    assert.equal(ledger.listEvents().length, 0);
  } finally { ledger.close(); }
});

function estimatedProduct(completions = [100, 100, 75, 100, 75]) {
  const state = emptyReadinessState(); state.applicability.product.state = 'applicable';
  for (const [index, gate] of GATES.product.entries()) state.requirements[gate.id] = {
    status: [0, 1, 3].includes(index) ? 'verified' : 'in-progress',
    note: 'Implemented work documented; remaining checks identified', evidenceRefs: proof,
    completion: completions[index], confidence: index === 2 ? 'medium' : 'high',
  };
  return state;
}

test('implementation earns effort across all gates without bypassing ordered verification', () => {
  const state = estimatedProduct(); validateReadinessState(state);
  const summary = effortSummary(state, 'product');
  assert.equal(summary.score, 9); // Previously 4: later verified work and partial implementation disappeared.
  assert.equal(summary.level, 2); assert.equal(summary.verified, 3);
  assert.equal(summary.assessed, 5); assert.equal(summary.applicable, 5); assert.equal(summary.confidence, 'medium');
  state.requirements['product-design'].confidence = 'low';
  assert.equal(effortSummary(state, 'product').score, 9); assert.equal(effortSummary(state, 'product').confidence, 'low');
  state.requirements['product-design'].status = 'awaiting-evidence';
  assert.equal(effortSummary(state, 'product').score, 9); assert.equal(effortSummary(state, 'product').level, 2);
});

test('unknown estimates never become zero or disappear from the denominator; zero is real', () => {
  const state = estimatedProduct(); delete state.requirements['product-design'].completion;
  assert.equal(effortSummary(state, 'product').score, null); assert.equal(effortSummary(state, 'product').assessed, 4);
  assert.equal(effortSummary(state, 'product').confidence, 'unknown');
  assert.equal(effortSummary(state, 'product').minimumScore, 7.5);
  assert.equal(effortSummary(state, 'product').maximumScore, 9.5);
  state.requirements['product-design'].completion = 0;
  assert.equal(effortSummary(state, 'product').score, 7.5);
  state.requirements['product-design'].evidenceRefs = [];
  assert.equal(requirementCompletion(state.requirements['product-design']), null);
  assert.equal(effortSummary(state, 'product').score, null);
});

test('legacy verified proof survives while scoped exemptions reweight completion', () => {
  const state = estimatedProduct();
  for (const entry of Object.values(state.requirements)) if (entry.status === 'verified') { delete entry.completion; delete entry.confidence; }
  assert.equal(effortSummary(state, 'product').score, 9);
  state.requirements['product-design'] = { status: 'exempt', note: 'No rendered surface in the agreed product scope', evidenceRefs: proof };
  validateReadinessState(state);
  assert.equal(effortSummary(state, 'product').score, 9.4); assert.equal(effortSummary(state, 'product').applicable, 4);
  assert.equal(effortSummary(state, 'product').level, 4);
  for (const gate of GATES.product) state.requirements[gate.id] = { status: 'exempt', note: 'Explicit bounded scope', evidenceRefs: proof };
  assert.equal(effortSummary(state, 'product').score, null);
  state.applicability.growth = { state: 'exempt', reason: 'Private internal tool with no acquisition surface' };
  assert.equal(effortSummary(state, 'growth').score, null); assert.equal(effortSummary(state, 'growth').status, 'exempt');
  assert.equal(effortSummary(emptyReadinessState(), 'product').score, null);
});

test('completion contract rejects unsupported estimates and contradictory states', () => {
  for (const completion of [-1, 101, 50.5, '75', false]) {
    const state = estimatedProduct(); state.requirements['product-design'].completion = completion;
    assert.throws(() => validateReadinessState(state), /integer/);
  }
  for (const patch of [{ note: '' }, { evidenceRefs: [] }, { confidence: undefined }]) {
    const state = estimatedProduct(); Object.assign(state.requirements['product-design'], patch);
    assert.throws(() => validateReadinessState(state), /needs a reason/);
  }
  for (const [status, completion, message] of [['verified', 75, /100%/], ['not-started', 25, /0%/], ['exempt', 0, /no completion/]]) {
    const state = estimatedProduct(); Object.assign(state.requirements['product-design'], { status, completion });
    assert.throws(() => validateReadinessState(state), message);
  }
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
    performance: [{ projectId: 'sample', psi: signal(95), lcp: signal(1200), mobile: { psi: signal(70), lcp: signal(3000) } }],
    search: [{ projectId: 'sample', impressions: signal(200), clicks: signal(0), averagePosition: signal(8), period: { start: '2026-10-01', end: '2026-10-26' } }],
    seoAudit: [{ projectId: 'sample', pass: signal(45), fail: signal(0) }],
    geoAwareness: [{ projectId: 'sample', topThree: signal(25), pageOne: signal(75), queries: 4 }],
    aiAwareness: [{ projectId: 'sample', mention: signal(20), recommendation: signal(10), citation: signal(0), coverage: { configured: 10, completed: 10 } }],
  } };
  const clarity = { sample: { state: 'fresh', snapshot: { observedAt: now, metrics: { sessions: 9, uniqueBrowsers: 4 } } } };
  const rows = readinessObservations(projects, projection, clarity).filter(row => row.projectId === 'sample');
  const readings = Object.fromEntries(rows.map(row => [row.id, row.value]));
  assert.deepEqual(readings, { 'domains:signal:0': 12, 'performance:psi:0': 95, 'performance:lcp:0': 1200, 'search:impressions:0': 200, 'search:clicks:0': 0, 'search:averagePosition:0': 8, 'seoAudit:pass:0': 45, 'seoAudit:fail:0': 0, 'geoAwareness:topThree:0': 25, 'geoAwareness:pageOne:0': 75, 'aiAwareness:mention:0': 20, 'aiAwareness:recommendation:0': 10, 'aiAwareness:citation:0': 0, 'mobile:psi': 70, 'mobile:lcp': 3000, 'clarity:sessions': 9, 'clarity:uniqueBrowsers': 4 });
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
    const state = estimatedProduct();
    assert.equal((await put(update(state), { authorization: 'Bearer test-owner' })).status, 200);
    assert.equal((await put(update(emptyReadinessState(), 0, 'stale-http'), { authorization: 'Bearer test-owner' })).status, 409);
    const response = await fetch(`${base}/v1/readiness`); assert.equal(response.status, 200);
    const data = await response.json(); assert.equal(data.projects.length, 1); assert.equal(data.projects[0].revision, 1); assert.equal(data.projects[0].evidence.at(-1).value, 2);
    assert.deepEqual(data.projects[0].state, state);
    assert.equal(data.projects[0].scores.product.effort.score, 9);
    assert.equal(data.projects[0].scores.product.effort.level, 2);
  } finally { await new Promise(resolve => server.close(resolve)); ledger.close(); }
});
