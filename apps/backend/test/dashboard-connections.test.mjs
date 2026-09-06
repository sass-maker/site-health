import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';

import { buildDashboardProjection } from '../lib/dashboard-projection.mjs';

test('Dashboard projection contains only project and measurement-outcome data', () => {
  const repositoryRoot = resolve(import.meta.dirname, '../../..');
  const result = buildDashboardProjection({
    repositoryRoot,
    workspaceRoot: resolve(repositoryRoot, '..'),
    home: mkdtempSync(`${tmpdir()}/dashboard-connections-`),
    now: '2026-08-21T00:00:00.000Z',
  });

  assert.equal(result.schemaVersion, 'dashboard.projection.v1');
  assert.deepEqual(Object.keys(result).sort(), ['generatedAt', 'outcomes', 'schemaVersion']);
  // An allowlist, not a snapshot: the projection may only carry measurement outcomes, so a new
  // family has to be added here deliberately and anything else still fails the boundary.
  assert.deepEqual(
    Object.keys(result.outcomes).sort(),
    ['aiAwareness', 'aiCoverage', 'domains', 'geoAwareness', 'performance', 'search', 'seoAudit'],
  );
  assert.equal('skills' in result, false);
  assert.equal('workflows' in result, false);
  assert.equal('marketing' in result, false);
  assert.deepEqual(
    result.outcomes.domains.map((row) => row.domain),
    [
      'codevetter.com',
      'heypace.app',
      'highsignal.app',
      'posttrainllm.com',
      'sassmaker.com',
      'significanthobbies.com',
    ],
  );
});
