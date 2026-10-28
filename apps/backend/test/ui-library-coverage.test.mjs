import assert from 'node:assert/strict';
import test from 'node:test';
import { uiLibraryCoverage } from '../lib/dashboard-backend/ui-library-coverage.mjs';
import { buildReadinessProjection } from '../lib/dashboard-backend/readiness.mjs';
const now = '2026-10-28T00:00:00Z';
function snapshot() { return { schemaVersion: 'ui-library-source-coverage.v1', observedAt: now, records: { demo: { status: 'source-estimate', shared: 3, eligible: 4, percent: 99, revision: 'a'.repeat(40), dirty: true, surfaces: [{ kind: 'web', shared: 3, eligible: 4, files: [{ path: 'page.tsx' }], tokenFiles: 1 }], gap: 'Source estimate only.' } } }; }
test('source adoption is recomputed from counts, scoped and separate from readiness scores', () => {
  const data = snapshot(), result = uiLibraryCoverage(data, 'demo', Date.parse(now));
  assert.equal(result.percent, 75); assert.equal(result.surfaces[0].percent, 75); assert.equal(result.stale, false);
  assert.equal(uiLibraryCoverage(data, 'other'), null);
  const args = { generatedAt: now, projects: [{ id: 'demo', name: 'Demo', lifecycle: { status: 'active' } }] };
  const before = buildReadinessProjection(args), after = buildReadinessProjection({ ...args, uiCoverage: data });
  assert.deepEqual(after.projects[0].scores, before.projects[0].scores); assert.deepEqual(after.projects[0].state, before.projects[0].state);
  assert.equal(after.projects[0].uiLibrary.percent, 75);
});
test('zero remains real, missing scans remain unknown and stale evidence stays labelled', () => {
  const data = snapshot(), row = data.records.demo; row.shared = row.surfaces[0].shared = 0;
  assert.equal(uiLibraryCoverage(data, 'demo', Date.parse(now)).percent, 0);
  assert.equal(uiLibraryCoverage(data, 'demo', Date.parse(now) + 8 * 86400000).stale, true);
  assert.equal(uiLibraryCoverage(null, 'demo'), null);
  row.shared = row.eligible = 0; row.surfaces = []; row.status = 'unavailable';
  assert.equal(uiLibraryCoverage(data, 'demo', Date.parse(now)).percent, null);
});
test('contradictory and future-dated evidence cannot establish an adoption percentage', () => {
  const data = snapshot(); data.records.demo.shared = 5;
  assert.equal(uiLibraryCoverage(data, 'demo', Date.parse(now)), null);
  const mismatch = snapshot(); mismatch.records.demo.surfaces[0].shared = 2;
  assert.equal(uiLibraryCoverage(mismatch, 'demo', Date.parse(now)), null);
  assert.equal(uiLibraryCoverage(snapshot(), 'demo', Date.parse(now) - 120000), null);
});
