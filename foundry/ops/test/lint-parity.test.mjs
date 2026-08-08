import assert from 'node:assert/strict';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { buildParityReport } from '../scripts/lint-parity.mjs';

const testPath = fileURLToPath(import.meta.url);
const fixtureRoot = path.join(path.dirname(testPath), 'fixtures/lint-parity');

const projects = [
  { id: 'aligned', repo: 'aligned', tier: 'active' },
  { id: 'divergent', repo: 'divergent', tier: 'secondary' },
  { id: 'excluded', repo: 'aligned', tier: 'out-of-fleet' },
  { id: 'missing', repo: 'missing', tier: 'focus' },
  { id: 'past', lifecycle: 'past', repo: 'aligned', tier: 'active' },
  { id: 'unavailable', repo: 'not-present', tier: 'active' },
  { id: 'unmanaged', repo: 'unmanaged', tier: 'active' },
];

test('classifies all parity states and excludes inactive projects from active totals', async () => {
  const report = await buildParityReport({
    deliberateDivergences: { divergent: 'approved fixture divergence' },
    projects,
    workspaceRoot: fixtureRoot,
  });
  const statuses = Object.fromEntries(report.projects.map((project) => [project.id, project.status]));

  assert.deepEqual(statuses, {
    aligned: 'aligned',
    divergent: 'deliberate-divergence',
    excluded: 'excluded',
    missing: 'missing-configuration',
    past: 'excluded',
    unavailable: 'unavailable',
    unmanaged: 'unmanaged',
  });
  assert.equal(report.summary.activeTotal, 5);
  assert.equal(report.summary.excludedTotal, 2);
});

test('machine report is deterministic for unchanged inputs', async () => {
  const input = {
    deliberateDivergences: { divergent: 'approved fixture divergence' },
    projects,
    workspaceRoot: fixtureRoot,
  };
  const first = await buildParityReport(input);
  const second = await buildParityReport(input);

  assert.equal(JSON.stringify(first), JSON.stringify(second));
});
