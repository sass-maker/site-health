import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { appendVisibilityOutcomeBundle } from '../lib/visibility-outcome-store.mjs';

import { buildDashboardProjection } from '../lib/dashboard-projection.mjs';

const NOW = '2026-09-05T12:00:00.000Z';

// A public-metric surface, which is what the rest of the dashboard already enumerates.
function project(id, overrides = {}) {
  return {
    id,
    name: id.toUpperCase(),
    status: 'live',
    lifecycle: { status: 'active', shareable: true, resumeCondition: null },
    tier: 'focus',
    domains: [`${id}.example`],
    public: { listing: 'maintained' },
    ...overrides,
  };
}

function fixture({ projects = [], geoConfig = { products: [] }, ledger = [], seoAudit = {}, searchLedger = [] } = {}) {
  const repositoryRoot = mkdtempSync(join(tmpdir(), 'site-health-projection-'));
  const configRoot = join(repositoryRoot, 'apps/backend/config');
  const dataRoot = join(repositoryRoot, 'apps/backend/data');
  mkdirSync(configRoot, { recursive: true });
  mkdirSync(join(dataRoot, 'geo-observatory'), { recursive: true });
  mkdirSync(join(dataRoot, 'seo-audit'), { recursive: true });
  writeFileSync(join(configRoot, 'projects.json'), JSON.stringify({ projects }));
  writeFileSync(join(configRoot, 'geo-observatory.json'), JSON.stringify(geoConfig));
  writeFileSync(
    join(dataRoot, 'geo-observatory/ledger.jsonl'),
    ledger.map((row) => JSON.stringify(row)).join('\n'),
  );
  writeFileSync(join(dataRoot, 'seo-audit/latest.json'), JSON.stringify(seoAudit));
  if (searchLedger.length) appendVisibilityOutcomeBundle({
    schema: 'fleet.visibility-outcome-bundle.v1', observations: searchLedger,
  }, { path: join(repositoryRoot, '.fleet/visibility-outcomes/ledger.jsonl') });
  return buildDashboardProjection({
    repositoryRoot,
    workspaceRoot: repositoryRoot,
    home: repositoryRoot,
    now: NOW,
  }).outcomes;
}

function geoRow(rows, projectId) {
  return rows.find((row) => row.projectId === projectId);
}

test('a GEO product is classed from its most recent run, and class C is a measured zero', () => {
  const { geoAwareness } = fixture({
    projects: [project('alpha')],
    geoConfig: {
      products: [{
        id: 'alpha',
        queries: [{ qid: 'alpha-brand', kind: 'brand' }, { qid: 'alpha-category', kind: 'category' }],
      }],
    },
    ledger: [
      { date: '2026-08-16', product: 'alpha', qid: 'alpha-brand', query: 'Alpha', class: 'A' },
      { date: '2026-08-16', product: 'alpha', qid: 'alpha-category', query: 'alpha tools', class: 'C' },
      { date: '2026-09-05', product: 'alpha', qid: 'alpha-brand', query: 'Alpha', class: 'B' },
      { date: '2026-09-05', product: 'alpha', qid: 'alpha-category', query: 'alpha tools', class: 'C' },
    ],
  });
  const row = geoRow(geoAwareness, 'alpha');
  assert.equal(row.status, 'page-one');
  assert.deepEqual(row.classes, { A: 0, B: 1, C: 1 });
  assert.equal(row.queries, 2);
  assert.equal(row.runCount, 2);
  assert.equal(row.observedAt, '2026-09-05T12:00:00.000Z');
  // Zero top-three placements is a reading, not an absence: the signal exists and carries 0.
  assert.equal(row.topThree.value, 0);
  assert.equal(row.pageOne.value, 50);
  assert.equal(row.topThree.history, 'comparable');
  assert.deepEqual(row.topThree.series.map((point) => point.value), [50, 0]);
});

test('a class change against the previous run is recorded per query', () => {
  const { geoAwareness } = fixture({
    projects: [project('alpha')],
    geoConfig: { products: [{ id: 'alpha', queries: [{ qid: 'alpha-brand', kind: 'brand' }] }] },
    ledger: [
      { date: '2026-08-16', product: 'alpha', qid: 'alpha-brand', query: 'Alpha', class: 'A' },
      { date: '2026-09-05', product: 'alpha', qid: 'alpha-brand', query: 'Alpha', class: 'C' },
    ],
  });
  const [observation] = geoRow(geoAwareness, 'alpha').observations;
  assert.equal(observation.class, 'C');
  assert.equal(observation.previousClass, 'A');
  assert.equal(observation.kind, 'brand');
});

test('a configured product with no observation is not-measured, and an unconfigured one is not-configured', () => {
  const { geoAwareness } = fixture({
    projects: [project('alpha'), project('beta')],
    geoConfig: { products: [{ id: 'alpha', queries: [{ qid: 'alpha-brand', kind: 'brand' }] }] },
    ledger: [],
  });
  const alpha = geoRow(geoAwareness, 'alpha');
  const beta = geoRow(geoAwareness, 'beta');
  assert.equal(alpha.status, 'not-measured');
  assert.equal(beta.status, 'not-configured');
  // Neither absence may present as a number the reader could mistake for a measurement.
  for (const row of [alpha, beta]) {
    assert.equal(row.classes, null);
    assert.equal(row.topThree, null);
    assert.equal(row.pageOne, null);
    assert.equal(row.observedAt, null);
  }
  assert.equal(alpha.queries, 1);
  assert.equal(beta.queries, 0);
});

test('a product with a GEO panel but no public listing is still enumerated', () => {
  // SAR-15 configured panels beyond the public-metric scope. Dropping them would hide a stream
  // that was actually collected.
  const { geoAwareness } = fixture({
    projects: [project('hidden', { public: { listing: 'hidden' } })],
    geoConfig: { products: [{ id: 'hidden', queries: [{ qid: 'hidden-brand', kind: 'brand' }] }] },
    ledger: [{ date: '2026-09-05', product: 'hidden', qid: 'hidden-brand', query: 'Hidden', class: 'A' }],
  });
  const row = geoRow(geoAwareness, 'hidden');
  assert.equal(row.status, 'top-three');
  assert.equal(row.topThree.value, 100);
});

test('a malformed ledger line is skipped without dropping the rest of the run', () => {
  const repositoryRoot = mkdtempSync(join(tmpdir(), 'site-health-ledger-'));
  const configRoot = join(repositoryRoot, 'apps/backend/config');
  const dataRoot = join(repositoryRoot, 'apps/backend/data');
  mkdirSync(configRoot, { recursive: true });
  mkdirSync(join(dataRoot, 'geo-observatory'), { recursive: true });
  mkdirSync(join(dataRoot, 'seo-audit'), { recursive: true });
  writeFileSync(join(configRoot, 'projects.json'), JSON.stringify({ projects: [project('alpha')] }));
  writeFileSync(
    join(configRoot, 'geo-observatory.json'),
    JSON.stringify({ products: [{ id: 'alpha', queries: [{ qid: 'alpha-brand', kind: 'brand' }] }] }),
  );
  writeFileSync(join(dataRoot, 'seo-audit/latest.json'), '{}');
  writeFileSync(
    join(dataRoot, 'geo-observatory/ledger.jsonl'),
    [
      '{ not json',
      JSON.stringify({ date: '2026-09-05', product: 'alpha', qid: 'alpha-brand', query: 'Alpha', class: 'A' }),
      JSON.stringify({ date: '2026-09-05', product: 'alpha', qid: 'alpha-other', query: 'x', class: 'Z' }),
      '',
    ].join('\n'),
  );
  const { geoAwareness } = buildDashboardProjection({
    repositoryRoot,
    workspaceRoot: repositoryRoot,
    home: repositoryRoot,
    now: NOW,
  }).outcomes;
  const row = geoRow(geoAwareness, 'alpha');
  assert.equal(row.queries, 1);
  assert.equal(row.status, 'top-three');
});

test('seo-audit statuses separate a clean pass, a warning, a failure and an unreachable surface', () => {
  const { seoAudit } = fixture({
    projects: [project('alpha'), project('beta'), project('gamma'), project('delta')],
    seoAudit: {
      alpha: { url: 'https://alpha.example/', pass: 15, fail: 0, warn: 0, reachable: true, failedChecks: [], warningChecks: [], auditedAt: '2026-09-05T07:21:52.307Z' },
      beta: { url: 'https://beta.example/', pass: 14, fail: 0, warn: 1, reachable: true, failedChecks: [], warningChecks: ['json-ld'], auditedAt: '2026-09-05T07:21:52.307Z' },
      gamma: { url: 'https://gamma.example/', pass: 8, fail: 4, warn: 3, reachable: true, failedChecks: ['og:image', 'h1'], warningChecks: ['h2'], auditedAt: '2026-09-05T07:21:52.307Z' },
      delta: { url: 'https://delta.example/', pass: 0, fail: 0, warn: 0, reachable: false, failedChecks: [], warningChecks: [], auditedAt: '2026-09-05T07:21:52.307Z' },
    },
  });
  const byId = new Map(seoAudit.map((row) => [row.projectId, row]));
  assert.equal(byId.get('alpha').status, 'clean');
  assert.equal(byId.get('beta').status, 'warnings');
  assert.equal(byId.get('gamma').status, 'failing');
  assert.equal(byId.get('delta').status, 'unreachable');
  // A clean surface reports zero failures as a measured zero, not as a missing reading.
  assert.equal(byId.get('alpha').fail.value, 0);
  assert.equal(byId.get('alpha').checks, 15);
  assert.deepEqual(byId.get('gamma').failedChecks, ['og:image', 'h1']);
});

test('a surface the audit never reached reports null counts rather than zeroes', () => {
  const { seoAudit } = fixture({
    projects: [project('alpha'), project('beta')],
    seoAudit: {
      alpha: { url: 'https://alpha.example/', pass: 15, fail: 0, warn: 0, reachable: true, failedChecks: [], warningChecks: [], auditedAt: '2026-09-05T07:21:52.307Z' },
    },
  });
  const beta = seoAudit.find((row) => row.projectId === 'beta');
  assert.equal(beta.status, 'not-audited');
  assert.equal(beta.pass, null);
  assert.equal(beta.fail, null);
  assert.equal(beta.warn, null);
  assert.equal(beta.checks, null);
  assert.equal(beta.reachable, null);
  assert.equal(beta.observedAt, null);
  // The distinction the whole page depends on: an unaudited surface and a clean one are not
  // both "0 failures".
  const alpha = seoAudit.find((row) => row.projectId === 'alpha');
  assert.equal(alpha.fail.value, 0);
  assert.notEqual(beta.status, alpha.status);
});

test('an audited surface outside the public-metric scope is still enumerated', () => {
  const { seoAudit } = fixture({
    projects: [project('hidden', { public: { listing: 'hidden' } })],
    seoAudit: {
      hidden: { url: 'https://hidden.example/', pass: 15, fail: 0, warn: 0, reachable: true, failedChecks: [], warningChecks: [], auditedAt: '2026-09-05T07:21:52.307Z' },
    },
  });
  assert.equal(seoAudit.find((row) => row.projectId === 'hidden').status, 'clean');
});


test('Google Search preserves keyword-page evidence, index status and the owner product cohort', () => {
  const terms = [{ query: 'relevant keyword', landingPage: 'https://alpha.example/guide', impressions: 40, clicks: 0, ctr: 0, position: 42 }];
  const sample = { requestedRowLimit: 5000, returnedRows: 30, retainedRows: 1, rowLimitReached: false, strategy: 'clicks-and-impressions' };
  const { search } = fixture({
    projects: [project('alpha', { portfolio: { futureForm: 'active-product' } }), project('paused', { portfolio: { futureForm: 'paused-experiment' } })],
    searchLedger: [{
      id: 'search-alpha-fixture', projectId: 'alpha', family: 'search', provider: 'google-search-console',
      scope: 'sc-domain:alpha.example', observedAt: NOW,
      period: { start: '2026-08-01T00:00:00Z', end: '2026-08-28T23:59:59Z' },
      metrics: [{ label: 'Search impressions', value: 100 }], searchTerms: terms, searchTermSample: sample,
      indexInspection: { inspectedUrl: 'https://alpha.example/', state: 'not-indexed', coverageState: 'Crawled - currently not indexed' },
    }],
  });
  const alpha = search.find((row) => row.projectId === 'alpha');
  const paused = search.find((row) => row.projectId === 'paused');
  assert.deepEqual(alpha.searchTerms, terms);
  assert.deepEqual(alpha.searchTermSample, sample);
  assert.equal(alpha.futureForm, 'active-product');
  assert.equal(alpha.indexInspection.state, 'not-indexed');
  assert.equal(paused.futureForm, 'paused-experiment');
  assert.deepEqual(paused.searchTerms, []);
  assert.equal(paused.searchTermSample, null);
});
