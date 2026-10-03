import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { buildDashboardProjection } from '../lib/dashboard-projection.mjs';

test('SQLite null metrics stay absent before performance aggregation and history', () => {
  const root = mkdtempSync(join(tmpdir(), 'site-health-performance-source-'));
  const repositoryRoot = join(root, 'fleet/site-health');
  const configRoot = join(repositoryRoot, 'apps/backend/config');
  try {
    mkdirSync(configRoot, { recursive: true });
    writeFileSync(join(configRoot, 'projects.json'), JSON.stringify({ projects:
      ['alpha', 'beta'].map((id) => ({
        id, domains: [`${id}.example`], lifecycle: { status: 'active' },
        public: { listing: 'maintained' },
      })),
    }));
    mkdirSync(join(root, '.psi-swarm'));
    execFileSync('sqlite3', [join(root, '.psi-swarm/history.db'), `
      CREATE TABLE runs (url TEXT, preset TEXT, started_at REAL, performance_score REAL, lcp REAL, error TEXT);
      INSERT INTO runs VALUES
        ('https://alpha.example/', 'desktop', 1790899200000, 92, 1800, NULL),
        ('https://alpha.example/', 'desktop', 1790899260000, 95, NULL, NULL),
        ('https://alpha.example/', 'desktop', 1790899320000, NULL, 900, NULL),
        ('https://beta.example/', 'desktop', 1790899200000, 95, NULL, NULL),
        ('https://beta.example/', 'desktop', NULL, 95, 900, NULL),
        ('https://beta.example/', 'desktop', 1e99, 95, 900, NULL);
    `]);
    const rows = buildDashboardProjection({
      repositoryRoot, workspaceRoot: join(root, 'fleet'), home: root,
      now: '2026-10-02T12:00:00Z',
    }).outcomes.performance;
    const alpha = rows.find((row) => row.projectId === 'alpha');
    assert.equal(alpha.samples, 1);
    assert.equal(alpha.psi.value, 92);
    assert.equal(alpha.lcp.value, 1800);
    assert.equal(alpha.lcp.series.length, 1);
    const beta = rows.find((row) => row.projectId === 'beta');
    assert.equal(beta.status, 'not-measured');
    assert.equal(beta.samples, 0);
    assert.equal(beta.observedAt, null);
    assert.equal(beta.psi, null);
    assert.equal(beta.lcp, null);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
