import assert from 'node:assert/strict';
import test from 'node:test';

import {
  CLARITY_FLEET_CLASSES,
  FLEET_COLLECTION_SCHEMA,
  classifyClarityProject,
  clarityFleetExitFailure,
  clarityFleetSummary,
  formatClarityFleetMarkdown,
} from '../lib/dashboard-backend/clarity-fleet.mjs';
import { runClarityCollector } from '../scripts/clarity-collect.mjs';

const NOW = '2026-09-06T09:00:00.000Z';
const FRESH_AT = '2026-09-06T08:00:00.000Z';
const STALE_AT = '2026-09-01T08:00:00.000Z';

function memoryStore(seed = []) {
  const metadata = new Map(seed);
  return {
    metadata,
    getMetadata(key) {
      return metadata.has(key) ? { value: metadata.get(key) } : null;
    },
    setMetadata(key, value) {
      metadata.set(key, value);
    },
  };
}

function snapshot(projectId, observedAt, sessions) {
  return {
    schemaVersion: 'site-health.clarity-snapshot.v1',
    projectId,
    state: 'verified',
    observedAt,
    period: { days: 1 },
    metrics: { sessions, botSessions: 1, uniqueBrowsers: sessions, pagesPerSession: 1.5 },
    provenance: 'provider',
  };
}

function current(id) {
  return { id, publicListing: 'maintained', lifecycle: 'maintained' };
}

function wired(projectId, extra = {}) {
  return [projectId, { projectId, wired: true, hostname: `${projectId}.example`, ...extra }];
}

// One fixture per reported class, exercised through the real collector.
function classFixture() {
  const projects = [
    current('measured-live'),
    current('cached-fresh'),
    current('cached-stale'),
    current('unavailable-token'),
    current('failed-provider'),
    current('unwired-private'),
    { id: 'inactive-past', publicListing: 'past', lifecycle: 'past', portfolioStatus: 'archived' },
  ];
  const registry = new Map([
    wired('measured-live'),
    wired('cached-fresh'),
    wired('cached-stale'),
    wired('unavailable-token'),
    wired('failed-provider'),
    ['unwired-private', {
      projectId: 'unwired-private',
      wired: false,
      hostname: null,
      reason: 'Private inbox surface is deliberately untracked.',
    }],
    wired('inactive-past'),
    // Receipt entry with no catalog project: drift, never a silent exclusion.
    wired('drifted-receipt'),
  ]);
  const store = memoryStore([
    ['clarity-snapshot:cached-fresh', snapshot('cached-fresh', FRESH_AT, 12)],
    ['clarity-snapshot:cached-stale', snapshot('cached-stale', STALE_AT, 4)],
  ]);
  return { projects, registry, store };
}

test('classifier folds every collector state into exactly one reported class', () => {
  const cases = [
    ['measured', {}, 'measured'],
    ['fresh', {}, 'cached'],
    ['stale', {}, 'cached'],
    ['refreshing', { hasSnapshot: true }, 'cached'],
    ['refreshing', { hasSnapshot: false }, 'unavailable'],
    ['not-measured', {}, 'unavailable'],
    ['unavailable', {}, 'unavailable'],
    ['unwired', {}, 'unwired'],
    ['inactive', {}, 'inactive'],
    ['failed', {}, 'failed'],
    ['not-cataloged', {}, 'failed'],
    ['some-future-state', {}, 'failed'],
  ];
  for (const [state, options, expected] of cases) {
    assert.equal(
      classifyClarityProject(state, options),
      expected,
      `${state} should classify as ${expected}`,
    );
  }
  assert.equal(
    cases.every(([, , expected]) => CLARITY_FLEET_CLASSES.includes(expected)),
    true,
  );
});

test('cached health classifies every identity without a token or a provider call', async () => {
  const { projects, registry, store } = classFixture();
  let tokens = 0;
  let requests = 0;
  const summary = await runClarityCollector({
    command: 'status-all',
    projects,
    registry,
    store,
    tokenResolver() {
      tokens += 1;
    },
    snapshotFetcher() {
      requests += 1;
    },
    now: () => NOW,
  });

  assert.equal(tokens, 0);
  assert.equal(requests, 0);
  assert.equal(summary.schemaVersion, FLEET_COLLECTION_SCHEMA);
  assert.equal(summary.mode, 'cached-health');
  assert.equal(summary.observedAt, NOW);
  assert.equal(summary.projects, 8);
  assert.deepEqual(summary.classificationCounts, {
    measured: 0,
    cached: 2,
    unavailable: 3,
    unwired: 1,
    inactive: 1,
    failed: 1,
  });
  assert.equal(
    Object.values(summary.classificationCounts).reduce((total, count) => total + count, 0),
    summary.projects,
  );
  const byId = new Map(summary.results.map((result) => [result.projectId, result]));
  assert.equal(byId.get('cached-fresh').state, 'fresh');
  assert.equal(byId.get('cached-stale').classification, 'cached');
  assert.equal(byId.get('drifted-receipt').classification, 'failed');
  assert.equal(
    byId.get('unwired-private').eligibility.reason,
    'Private inbox surface is deliberately untracked.',
  );
});

test('provider refresh dry run continues past failures and accounts for every identity', async () => {
  const { projects, registry, store } = classFixture();
  const requested = [];
  const tokensSeen = [];
  const summary = await runClarityCollector({
    command: 'fetch-all',
    days: 1,
    projects,
    registry,
    store,
    tokenResolver(projectId) {
      return projectId === 'unavailable-token' ? null : `private-${projectId}`;
    },
    async snapshotFetcher({ token, projectId }) {
      tokensSeen.push(token);
      requested.push(projectId);
      if (projectId === 'failed-provider') {
        throw Object.assign(new Error(`leaked ${token}`), { code: 'CLARITY_UNAUTHORIZED' });
      }
      return snapshot(projectId, NOW, 7);
    },
    now: () => NOW,
  });

  // Eligible current projects only; exclusions never reach the adapter.
  assert.deepEqual(requested.sort(), [
    'cached-fresh',
    'cached-stale',
    'failed-provider',
    'measured-live',
  ]);
  assert.equal(summary.mode, 'provider-refresh');
  assert.deepEqual(summary.classificationCounts, {
    measured: 3,
    cached: 0,
    unavailable: 1,
    unwired: 1,
    inactive: 1,
    failed: 2,
  });
  assert.equal(tokensSeen.every((token) => token.startsWith('private-')), true);
  const serialized = JSON.stringify(summary);
  assert.equal(serialized.includes('private-'), false);
  assert.equal(serialized.includes('leaked'), false);
  assert.equal(clarityFleetExitFailure(summary), true);
});

test('summary results always carry a known classification and bounded fields', () => {
  const summary = clarityFleetSummary([
    { projectId: 'a', state: 'measured', metrics: { sessions: 3 } },
    { projectId: 'b', state: 'stale', snapshot: snapshot('b', STALE_AT, 1) },
    { projectId: 'c', state: 'unwired', eligibility: { reason: 'Native-only product.' } },
  ], { command: 'status-all', observedAt: NOW });

  assert.equal(summary.results.every(
    (result) => CLARITY_FLEET_CLASSES.includes(result.classification),
  ), true);
  assert.deepEqual(summary.counts, { measured: 1, stale: 1, unwired: 1 });
  assert.deepEqual(summary.capabilityCounts, {
    desired: 0,
    conditional: 0,
    blocked: 0,
    notApplicable: 0,
    providerVerified: 0,
    providerAccounted: 0,
  });
  assert.equal(clarityFleetExitFailure(summary), false);
});

test('markdown table reports one bounded row per identity and no provider payload', () => {
  const summary = clarityFleetSummary([
    {
      projectId: 'measured-live',
      state: 'measured',
      observedAt: NOW,
      metrics: { sessions: 9, botSessions: 2, uniqueBrowsers: 7, pagesPerSession: 1.4 },
    },
    {
      projectId: 'unwired-private',
      state: 'unwired',
      eligibility: { reason: 'Private inbox surface is deliberately untracked.' },
    },
    {
      projectId: 'failed-provider',
      state: 'failed',
      failure: { code: 'CLARITY_UNAUTHORIZED', message: 'Clarity rejected the configured Data Export token.' },
    },
  ], { command: 'fetch-all', observedAt: NOW });

  const markdown = formatClarityFleetMarkdown(summary);
  const rows = markdown.split('\n').filter((line) => line.startsWith('| ') && !line.startsWith('| ---'));
  assert.equal(rows.length, 4); // header + three identities
  assert.match(markdown, /Mode: `provider-refresh`/);
  assert.equal(
    markdown.includes(
      'Projects: 3 — measured 1 · cached 0 · unavailable 0 · unwired 1 · inactive 0 · failed 1',
    ),
    true,
  );
  assert.match(markdown, /\| failed-provider \| failed \| failed \|.*Clarity rejected the configured Data Export token\./);
  assert.match(markdown, /\| measured-live \| measured \| measured \| 9 \| 7 \| 2 \| 1\.4 \|/);
  assert.match(markdown, /\| unwired-private \| unwired \| unwired \| — \| — \| — \| — \| — \|/);
});

test('markdown truncates a long exclusion reason instead of streaming free text', () => {
  const summary = clarityFleetSummary([
    {
      projectId: 'verbose',
      state: 'unwired',
      eligibility: { reason: `${'reason '.repeat(40)}` },
    },
  ], { command: 'status-all' });
  const markdown = formatClarityFleetMarkdown(summary);
  const row = markdown.split('\n').find((line) => line.startsWith('| verbose'));
  assert.equal(row.includes('…'), true);
  assert.equal(row.length < 200, true);
});
