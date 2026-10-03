import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { buildDashboardProjection } from '../lib/dashboard-projection.mjs';

test('domain projection reads the cataloged archive and ignores a stale direct checkout', () => {
  const root = mkdtempSync(join(tmpdir(), 'site-health-domain-path-'));
  const repositoryRoot = join(root, 'fleet/site-health');
  const configRoot = join(repositoryRoot, 'apps/backend/config');
  try {
    mkdirSync(configRoot, { recursive: true });
    writeFileSync(join(configRoot, 'projects.json'), JSON.stringify({ projects: [
      { id: 'alpha', domains: ['alpha.example'], lifecycle: { status: 'active' }, public: { listing: 'maintained' } },
      { id: 'drank', repositories: { localPath: '../archive/drank' }, lifecycle: { status: 'inactive' }, domains: [] },
    ] }));
    for (const [path, rating] of [['archive/drank', 17], ['fleet/drank', 99]]) {
      mkdirSync(join(root, path, 'data'), { recursive: true });
      writeFileSync(join(root, path, 'data/fleet-dr.json'), JSON.stringify({
        domains: { 'alpha.example': { history: [{ ts: Date.parse('2026-10-02T00:00:00Z'), dr: rating }] } },
      }));
    }
    const input = { repositoryRoot, workspaceRoot: join(root, 'fleet'), home: root, now: '2026-10-02T12:00:00Z' };
    assert.equal(buildDashboardProjection(input).outcomes.domains[0].signal.value, 17);
    for (const rating of [null, '', '  ', false]) {
      writeFileSync(join(root, 'archive/drank/data/fleet-dr.json'), JSON.stringify({
        domains: { 'alpha.example': { history: [
          { ts: Date.parse('2026-10-02T00:00:00Z'), dr: rating },
          { ts: null, dr: 99 },
        ] } },
      }));
      const row = buildDashboardProjection(input).outcomes.domains[0];
      assert.equal(row.status, 'not-measured');
      assert.equal(row.signal, null);
    }
    // Removing the real source must expose absence, not fall back to the stale copy.
    rmSync(join(root, 'archive/drank/data/fleet-dr.json'));
    const row = buildDashboardProjection(input).outcomes.domains[0];
    assert.equal(row.status, 'not-measured');
    assert.equal(row.signal, null);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
