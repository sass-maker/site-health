import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { buildDashboardProjection, latestPerformanceBatch } from '../lib/dashboard-projection.mjs';
import { buildReadinessProjection, readinessObservations } from '../lib/dashboard-backend/readiness.mjs';

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
        ('https://alpha.example/', 'desktop', 1791158400000, 99, 100, NULL),
        ('https://alpha.example/', 'mobile-mid', 1790899260000, 44, 5000, NULL),
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
    // The later valid-looking capture is after injected now and must not win
    // either the headline batch or the historical sparkline.
    assert.equal(alpha.samples, 1);
    assert.equal(alpha.psi.value, 92);
    assert.equal(alpha.lcp.value, 1800);
    assert.equal(alpha.lcp.series.length, 1);
    assert.equal(alpha.preset, 'desktop');
    assert.equal(alpha.mobile.psi.value, 44);
    assert.equal(alpha.mobile.lcp.value, 5000);
    assert.equal(alpha.mobile.status, 'retained');
    const projects = [{ id: 'alpha', lifecycle: { status: 'active' } }];
    const observations = readinessObservations(projects, { outcomes: { performance: rows } });
    const evidence = buildReadinessProjection({ projects, observations, generatedAt: '2026-10-02T12:00:00Z' }).projects[0].evidence;
    const partial = evidence.filter(row => ['performance', 'psi-swarm.mobile'].includes(row.source) && row.value !== null);
    assert.equal(partial.length, 4);
    assert.ok(partial.every(row => row.measurement.state === 'retained'));
    assert.ok(partial.every(row => row.context.detail.includes('no complete cohort')));
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

test('before and after batches stay separate even within the same ten-minute window', () => {
  const rows = [
    { observedAt: '2026-10-30T06:00:00Z', preset: 'mobile-mid', score: 70, lcp: 4000, tag: 'before' },
    { observedAt: '2026-10-30T06:01:00Z', preset: 'mobile-mid', score: 96, lcp: 1200, tag: 'after' },
    { observedAt: '2026-10-30T06:02:00Z', preset: 'mobile-mid', score: 98, lcp: 1400, tag: 'after' },
  ];
  const result = latestPerformanceBatch(rows, '2026-10-30T07:00:00Z');
  assert.equal(result.score, 97);
  assert.equal(result.sampleCount, 2);
  assert.equal(result.pendingBatch.sampleCount, 2);
});

test('shared-domain product sections and hidden external products keep their own readings', () => {
  const root = mkdtempSync(join(tmpdir(), 'site-health-performance-sections-'));
  const repositoryRoot = join(root, 'fleet/site-health');
  try {
    const configRoot = join(repositoryRoot, 'apps/backend/config');
    mkdirSync(configRoot, { recursive: true });
    writeFileSync(join(configRoot, 'projects.json'), JSON.stringify({ projects: [
      { id: 'browser', audience: 'public', domains: ['old-browser.example'], lifecycle: { status: 'active' }, public: { listing: 'hidden' } },
      { id: 'storage', audience: 'public', domains: ['old-storage.example'], lifecycle: { status: 'active' }, public: { listing: 'maintained' } },
    ], publicDirectory: { projects: { browser: { publicDestinationUrl: 'https://family.example/browser/' }, storage: { publicDestinationUrl: 'https://family.example/storage/' } } } }));
    mkdirSync(join(root, '.psi-swarm'));
    execFileSync('sqlite3', [join(root, '.psi-swarm/history.db'), `
      CREATE TABLE runs (url TEXT, preset TEXT, started_at REAL, performance_score REAL, lcp REAL, error TEXT, tag TEXT);
      INSERT INTO runs VALUES
       ('https://family.example/browser/', 'desktop', 1790899200000, 97, 1000, NULL, 'browser'),
       ('https://family.example/storage/', 'desktop', 1790899200000, 75, 4000, NULL, 'storage');
    `]);
    const rows = buildDashboardProjection({ repositoryRoot, workspaceRoot: join(root, 'fleet'), home: root, now: '2026-10-02T12:00:00Z' }).outcomes.performance;
    assert.equal(rows.find(row => row.projectId === 'browser').psi.value, 97);
    assert.equal(rows.find(row => row.projectId === 'browser').url, 'https://family.example/browser/');
    assert.equal(rows.find(row => row.projectId === 'storage').psi.value, 75);
  } finally { rmSync(root, { recursive: true, force: true }); }
});

test('an incomplete newer tag retains the last complete cohort with an explicit pending reading', () => {
  const complete = Array.from({ length: 5 }, (_, i) => ({ observedAt: `2026-10-30T06:0${i}:00Z`, preset: 'desktop', score: 96 + i, lcp: 1000, tag: 'complete' }));
  const partial = { observedAt: '2026-10-30T06:05:00Z', preset: 'desktop', score: 70, lcp: 5000, tag: 'partial' };
  const reading = latestPerformanceBatch([...complete, partial], '2026-10-30T07:00:00Z');
  assert.equal(reading.score, 98);
  assert.equal(reading.sampleCount, 5);
  assert.equal(reading.observedAt, '2026-10-30T06:04:00Z');
  assert.equal(reading.pendingBatch.score, 70);
  assert.equal(reading.pendingBatch.sampleCount, 1);
});

test('a unique five-sample cohort stays complete beyond the legacy ten-minute window', () => {
  const rows = Array.from({ length: 5 }, (_, i) => ({ observedAt: new Date(Date.parse('2026-10-30T06:00:00Z') + i * 180000).toISOString(), preset: 'desktop', score: 97, lcp: 1000, tag: 'console-portfolio-12345678-1234-1234-1234-123456789abc' }));
  const reading = latestPerformanceBatch(rows, '2026-10-30T07:00:00Z');
  assert.equal(reading.sampleCount, 5);
  assert.equal(reading.pendingBatch, undefined);
});


test('history larger than the subprocess default buffer preserves complete tagged desktop and mobile cohorts', (t) => {
  const root = mkdtempSync(join(tmpdir(), 'site-health-performance-large-history-'));
  const repositoryRoot = join(root, 'fleet/site-health');
  const configRoot = join(repositoryRoot, 'apps/backend/config');
  const database = join(root, '.psi-swarm/history.db');
  const start = Date.parse('2026-10-30T06:00:00Z');
  const completeTag = 'console-portfolio-12345678-1234-1234-1234-123456789abc';
  const pendingTag = 'console-portfolio-abcdefab-1234-1234-1234-123456789abc';
  try {
    mkdirSync(configRoot, { recursive: true });
    writeFileSync(join(configRoot, 'projects.json'), JSON.stringify({ projects: [
      { id: 'alpha', domains: ['alpha.example'], lifecycle: { status: 'active' }, public: { listing: 'maintained' } },
    ] }));
    mkdirSync(join(root, '.psi-swarm'));
    const current = Array.from({ length: 5 }, (_, i) => [
      `('https://alpha.example/', 'desktop', ${start + 60000 + i * 1000}, ${95 + i}, ${1000 + i * 100}, NULL, '${completeTag}')`,
      `('https://alpha.example/', 'mobile-mid', ${start + 60100 + i * 1000}, ${96 + i}, ${1400 + i * 100}, NULL, '${completeTag}')`,
      `('https://alpha.example/', 'desktop', ${start + i * 1000}, ${60 + i}, 5000, NULL, 'before')`,
      `('https://alpha.example/', 'mobile-mid', ${start + 100 + i * 1000}, ${60 + i}, 5000, NULL, 'before')`,
    ]).flat().join(',');
    execFileSync('sqlite3', [database, `
      CREATE TABLE runs (url TEXT, preset TEXT, started_at REAL, performance_score REAL, lcp REAL, error TEXT, tag TEXT);
      WITH RECURSIVE history(i) AS (VALUES(0) UNION ALL SELECT i + 1 FROM history WHERE i < 5999)
      INSERT INTO runs SELECT
        'https://archive.example/product-history-with-a-long-public-url/record-' || printf('%06d', i),
        'desktop', ${start - 86400000} - i * 1000, 90, 1800, NULL, 'archived-measurement-batch'
      FROM history;
      INSERT INTO runs VALUES ${current},
        ('https://alpha.example/', 'desktop', ${start + 120000}, 12, 9000, NULL, '${pendingTag}'),
        ('https://alpha.example/', 'mobile-mid', ${start + 120100}, 13, 9000, NULL, '${pendingTag}'),
        ('https://alpha.example/', 'desktop', ${start + 180000}, 100, 1, 'interrupted', 'failed');
    `]);
    const raw = execFileSync('sqlite3', ['-json', database,
      'SELECT url, preset, started_at, performance_score, lcp, tag FROM runs WHERE error IS NULL ORDER BY started_at DESC'],
    { maxBuffer: 8 * 1024 * 1024 });
    assert.ok(raw.byteLength > 1024 * 1024, 'fixture must exceed Node’s default subprocess stdout buffer');
    t.diagnostic(`SQLite history payload: ${raw.byteLength} bytes`);
    const rows = buildDashboardProjection({ repositoryRoot, workspaceRoot: join(root, 'fleet'), home: root, now: '2026-10-30T07:00:00Z' }).outcomes.performance;
    const alpha = rows.find(row => row.projectId === 'alpha');
    assert.equal(alpha.samples, 5);
    assert.equal(alpha.psi.value, 97);
    assert.equal(alpha.lcp.value, 1200);
    assert.equal(alpha.status, 'retained');
    assert.equal(alpha.pendingBatch.sampleCount, 1);
    assert.equal(alpha.pendingBatch.score, 12);
    assert.equal(alpha.mobile.samples, 5);
    assert.equal(alpha.mobile.psi.value, 98);
    assert.equal(alpha.mobile.lcp.value, 1600);
    assert.equal(alpha.mobile.status, 'retained');
    assert.equal(alpha.mobile.pendingBatch.sampleCount, 1);
    assert.equal(alpha.mobile.pendingBatch.score, 13);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
