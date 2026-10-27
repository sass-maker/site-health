import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { defaultDomainRatingHistoryPath, DOMAIN_RATING_SCHEMA } from '../lib/domain-rating-collector.mjs';
import { buildDashboardProjection } from '../lib/dashboard-projection.mjs';

function writeLegacy(root, domains) {
  const path = join(root, 'archive/drank/data/fleet-dr.json');
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, JSON.stringify({ domains }));
}

function writeNative(home, domains, extra = {}) {
  const path = defaultDomainRatingHistoryPath({ home });
  mkdirSync(join(path, '..'), { recursive: true });
  writeFileSync(path, JSON.stringify({
    schemaVersion: DOMAIN_RATING_SCHEMA,
    provider: 'ahrefs',
    metric: 'domain-rating',
    version: 'dr3',
    updatedAt: '2026-10-27T12:00:00.000Z',
    domains,
    ...extra,
  }));
}

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'site-health-domain-path-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const repositoryRoot = join(root, 'fleet/site-health');
  const configRoot = join(repositoryRoot, 'apps/backend/config');
  mkdirSync(configRoot, { recursive: true });
  writeFileSync(join(configRoot, 'projects.json'), JSON.stringify({ projects: [
    { id: 'alpha', domains: ['www.blog.alpha.example'], lifecycle: { status: 'active' }, public: { listing: 'maintained' } },
    { id: 'beta', domains: ['shop.beta.example'], lifecycle: { status: 'active' }, public: { listing: 'maintained' } },
    { id: 'drank', repositories: { localPath: '../archive/drank' }, lifecycle: { status: 'inactive' }, domains: [] },
  ] }));
  return {
    root,
    repositoryRoot,
    input: { repositoryRoot, workspaceRoot: join(root, 'fleet'), home: root, now: '2026-10-27T12:00:00Z' },
  };
}

test('uses native Ahrefs history by root and falls back to legacy only for roots without native history', (t) => {
  const { root, input } = fixture(t);
  writeLegacy(root, {
    'alpha.example': { history: [{ ts: Date.parse('2026-10-20T00:00:00Z'), dr: 17 }] },
    'beta.example': { history: [{ ts: Date.parse('2026-10-21T00:00:00Z'), dr: 31 }] },
  });
  writeNative(root, {
    'alpha.example': { history: [
      { ts: Date.parse('2026-10-22T00:00:00Z'), dr: 11 },
      { ts: Date.parse('2026-10-27T00:00:00Z'), dr: 0 },
    ] },
  });

  const rows = buildDashboardProjection(input).outcomes.domains;
  const alpha = rows.find((row) => row.domain === 'alpha.example');
  const beta = rows.find((row) => row.domain === 'beta.example');
  assert.equal(alpha.signal.value, 0);
  assert.equal(alpha.provider, 'Ahrefs');
  assert.equal(alpha.provenance, 'provider');
  assert.deepEqual(alpha.signal.series.map((point) => point.value), [11, 0]);
  assert.equal(beta.signal.value, 31);
  assert.equal(beta.provider, 'Drank archive');
  assert.equal(beta.provenance, 'legacy');
  assert.equal(beta.signal.series.length, 1);
});

test('missing HOME retains legacy domain evidence and the other projections', (t) => {
  const { root, input } = fixture(t);
  writeLegacy(root, {
    'alpha.example': { history: [{ ts: Date.parse('2026-10-20T00:00:00Z'), dr: 17 }] },
  });
  const projection = buildDashboardProjection({ ...input, home: '' });
  assert.equal(projection.outcomes.domains.find((row) => row.domain === 'alpha.example').signal.value, 17);
  assert.ok(Array.isArray(projection.outcomes.search));
  assert.ok(Array.isArray(projection.outcomes.performance));
});

test('empty or invalid native history falls back per domain without blending', (t) => {
  const { root, input } = fixture(t);
  writeLegacy(root, {
    'alpha.example': { history: [{ ts: Date.parse('2026-10-20T00:00:00Z'), dr: 17 }] },
    'beta.example': { history: [{ ts: Date.parse('2026-10-21T00:00:00Z'), dr: 31 }] },
  });
  writeNative(root, {
    'alpha.example': { history: [] },
    'beta.example': { history: [
      { ts: Date.parse('2026-10-22T00:00:00Z'), dr: null },
      { ts: null, dr: 99 },
    ] },
  });
  const rows = buildDashboardProjection(input).outcomes.domains;
  for (const [domain, rating] of [['alpha.example', 17], ['beta.example', 31]]) {
    const row = rows.find((item) => item.domain === domain);
    assert.equal(row.signal.value, rating);
    assert.equal(row.provider, 'Drank archive');
    assert.equal(row.provenance, 'legacy');
  }
});

test('malformed native JSON falls back to read-only archive data without changing it', (t) => {
  const { root, input } = fixture(t);
  writeLegacy(root, {
    'alpha.example': { history: [{ ts: Date.parse('2026-10-20T00:00:00Z'), dr: 17 }] },
  });
  const nativePath = defaultDomainRatingHistoryPath({ home: root });
  mkdirSync(join(nativePath, '..'), { recursive: true });
  writeFileSync(nativePath, '{bad json');
  const alpha = buildDashboardProjection(input).outcomes.domains.find((row) => row.domain === 'alpha.example');
  assert.equal(alpha.signal.value, 17);
  assert.equal(alpha.provider, 'Drank archive');
});

test('invalid legacy observations remain unmeasured and an absent archive does not use a stale checkout', (t) => {
  const { root, input } = fixture(t);
  writeLegacy(root, {
    'alpha.example': { history: [
      { ts: Date.parse('2026-10-20T00:00:00Z'), dr: null },
      { ts: null, dr: 99 },
    ] },
  });
  for (const rating of [null, '', '  ', false]) {
    writeLegacy(root, {
      'alpha.example': { history: [
        { ts: Date.parse('2026-10-20T00:00:00Z'), dr: rating },
        { ts: null, dr: 99 },
      ] },
    });
    const alpha = buildDashboardProjection(input).outcomes.domains.find((row) => row.domain === 'alpha.example');
    assert.equal(alpha.status, 'not-measured');
    assert.equal(alpha.signal, null);
  }
  rmSync(join(root, 'archive/drank/data/fleet-dr.json'));
  const alpha = buildDashboardProjection(input).outcomes.domains.find((row) => row.domain === 'alpha.example');
  assert.equal(alpha.status, 'not-measured');
  assert.equal(alpha.signal, null);
});
