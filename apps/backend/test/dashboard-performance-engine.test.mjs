import assert from 'node:assert/strict';
import test from 'node:test';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { buildDashboardProjection, latestPerformanceBatch } from '../lib/dashboard-projection.mjs';
import { readinessObservations } from '../lib/dashboard-backend/readiness.mjs';

const tag = 'console-manual-12345678-1234-1234-1234-123456789abc';
const start = Date.parse('2026-11-01T10:00:00Z');
const run = (index, lighthouseVersion, score = 98, lcp = 1200) => ({
  observedAt: new Date(start + index * 1000).toISOString(),
  preset: 'desktop', tag, lighthouseVersion, score, lcp,
});

test('a new engine cannot complete its cohort with older-engine samples under the same tag', () => {
  const old = Array.from({ length: 5 }, (_, i) => run(i, '13.4.1'));
  const reading = latestPerformanceBatch([...old, run(5, '13.6.0', 10, 9000)]);
  assert.equal(reading.sampleCount, 5);
  assert.equal(reading.score, 98);
  assert.equal(reading.lighthouseVersion, '13.4.1');
  assert.equal(reading.pendingBatch.sampleCount, 1);
  assert.equal(reading.pendingBatch.score, 10);
  assert.equal(reading.pendingBatch.lighthouseVersion, '13.6.0');
});

test('unknown historical engines stay separate from a partial known-engine reading', () => {
  const old = Array.from({ length: 5 }, (_, i) => run(i, null));
  const reading = latestPerformanceBatch([...old, run(5, '13.6.0'), run(6, '13.6.0')]);
  assert.equal(reading.sampleCount, 5);
  assert.equal(reading.lighthouseVersion ?? null, null);
  assert.equal(reading.pendingBatch.sampleCount, 2);
  assert.equal(reading.pendingBatch.lighthouseVersion, '13.6.0');
});

test('a complete new-engine reading replaces the old cohort without changing either history', () => {
  const history = [
    ...Array.from({ length: 5 }, (_, i) => run(i, '13.4.1', 80, 3000)),
    ...Array.from({ length: 5 }, (_, i) => run(i + 5, '13.6.0')),
  ];
  const before = structuredClone(history);
  const reading = latestPerformanceBatch(history);
  assert.equal(reading.sampleCount, 5);
  assert.equal(reading.score, 98);
  assert.equal(reading.lcp, 1200);
  assert.equal(reading.lighthouseVersion, '13.6.0');
  assert.equal(reading.pendingBatch, undefined);
  assert.deepEqual(history, before);
});

test('stored engine provenance reaches the visible projection without mixing versions or hiding history', () => {
  const root = mkdtempSync(join(tmpdir(), 'site-health-engine-cohorts-'));
  const repositoryRoot = join(root, 'fleet/site-health');
  try {
    const configRoot = join(repositoryRoot, 'apps/backend/config');
    mkdirSync(configRoot, { recursive: true });
    writeFileSync(join(configRoot, 'projects.json'), JSON.stringify({ projects: [{
      id: 'alpha', domains: ['alpha.example'], lifecycle: { status: 'active' },
      public: { listing: 'maintained' },
    }] }));
    mkdirSync(join(root, '.psi-swarm'));
    const values = [
      ...Array.from({ length: 5 }, (_, i) => `('https://alpha.example/', 'desktop', ${start + i * 1000}, 98, 1200, NULL, '${tag}', '13.4.1')`),
      `('https://alpha.example/', 'desktop', ${start + 5000}, 10, 9000, NULL, '${tag}', '13.6.0')`,
      ...Array.from({ length: 5 }, (_, i) => `('https://alpha.example/', 'mobile-mid', ${start + (i + 6) * 1000}, 97, 1500, NULL, '${tag}', '13.6.0')`),
    ];
    execFileSync('sqlite3', [join(root, '.psi-swarm/history.db'), `
      CREATE TABLE runs (url TEXT, preset TEXT, started_at REAL, performance_score REAL, lcp REAL, error TEXT, tag TEXT, lighthouse_version TEXT);
      INSERT INTO runs VALUES ${values.join(',')};
    `]);
    const [row] = buildDashboardProjection({
      repositoryRoot, workspaceRoot: join(root, 'fleet'), home: root,
      now: '2026-11-01T11:00:00Z',
    }).outcomes.performance;
    assert.equal(row.samples, 5);
    assert.equal(row.psi.value, 98);
    assert.equal(row.lighthouseVersion, '13.4.1');
    assert.equal(row.status, 'retained');
    assert.equal(row.pendingBatch.sampleCount, 1);
    assert.equal(row.pendingBatch.lighthouseVersion, '13.6.0');
    assert.equal(row.mobile.samples, 5);
    assert.equal(row.mobile.lighthouseVersion, '13.6.0');
    assert.deepEqual(row.psi.series.map(point => point.value), [98, 98, 98, 98, 98, 10]);
    assert.deepEqual(row.psi.series.map(point => point.lighthouseVersion), [
      '13.4.1', '13.4.1', '13.4.1', '13.4.1', '13.4.1', '13.6.0',
    ]);
    const observations = readinessObservations([{ id: 'alpha', lifecycle: { status: 'active' } }], {
      outcomes: { performance: [row] },
    });
    const desktop = observations.find(observation => observation.source === 'performance');
    assert.match(desktop.context.detail, /1\/5 samples using Lighthouse 13\.6\.0/);
    assert.match(desktop.context.detail, /Last complete reading retained/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
