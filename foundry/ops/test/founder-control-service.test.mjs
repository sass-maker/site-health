import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  buildMarketingProjection,
  startFounderControlService,
} from '../lib/founder-control/service.mjs';
import { FounderControlStore } from '../lib/founder-control/store.mjs';

test('projects only explicit marketing receipts into the owner coverage view', () => {
  const projection = buildMarketingProjection({
    generatedAt: '2026-07-31T10:00:00.000Z',
    recommendations: [],
    aiVisibility: { projects: [] },
    activity: [
      {
        id: 'publish-1',
        projectId: 'pace',
        missionId: 'mission-1',
        summary: 'Marketing publication receipt',
        occurredAt: '2026-07-31T09:00:00.000Z',
        evidence: [{
          provider: 'postiz',
          state: 'published',
          summary: 'Pace launch note',
          url: 'https://example.com/post/1',
        }],
      },
      {
        id: 'ordinary-event',
        projectId: 'pace',
        summary: 'Project evidence updated',
        occurredAt: '2026-07-31T09:30:00.000Z',
        evidence: [],
      },
    ],
  }, {
    eligible: [],
    scheduleIntent: { enabled: false },
  });

  assert.deepEqual(projection.outcomes, [{
    id: 'publish-1',
    projectId: 'pace',
    missionId: 'mission-1',
    stage: 'publication',
    status: 'published',
    provider: 'postiz',
    title: 'Pace launch note',
    observedAt: '2026-07-31T09:00:00.000Z',
    url: 'https://example.com/post/1',
  }]);
});

test('serves owner views and rejects unauthenticated mutations', async (context) => {
  const store = new FounderControlStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'founder-service-')), 'service.sqlite'),
    projects: [{ id: 'codevetter', name: 'CodeVetter', attention: 'focus' }],
  });
  const server = await startFounderControlService({ store, port: 0, ownerToken: 'test-owner-token' });
  context.after(
    () =>
      new Promise((resolve) => {
        server.close(() => {
          store.close();
          resolve();
        });
      }),
  );
  const base = `http://127.0.0.1:${server.address().port}`;

  assert.equal((await fetch(`${base}/health`)).status, 200);
  const denied = await fetch(`${base}/v1/missions/draft`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ title: 'Denied' }),
  });
  assert.equal(denied.status, 401);
  assert.equal(store.listEvents().length, 0);

  const created = await fetch(`${base}/v1/missions/draft`, {
    method: 'POST',
    headers: {
      authorization: 'Bearer test-owner-token',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ title: 'Verify CodeVetter', projectId: 'codevetter' }),
  });
  assert.equal(created.status, 201);
  const mission = await created.json();
  assert.equal(mission.state, 'draft');
  const missionPath = encodeURIComponent(mission.id);
  const accepted = await fetch(`${base}/v1/missions/${missionPath}/accept`, {
    method: 'POST',
    headers: {
      authorization: 'Bearer test-owner-token',
      'content-type': 'application/json',
    },
    body: '{}',
  });
  assert.equal((await accepted.json()).state, 'accepted');
  const started = await fetch(`${base}/v1/missions/${missionPath}/start`, {
    method: 'POST',
    headers: {
      authorization: 'Bearer test-owner-token',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      actor: { type: 'agent', id: 'codex', label: 'Codex' },
      idempotencyKey: 'service-test/start',
    }),
  });
  const activeMission = await started.json();
  assert.equal(activeMission.state, 'active');
  assert.equal(activeMission.actor.id, 'codex');
  assert.equal((await fetch(`${base}/v1/home`)).status, 200);
});

test('fails closed when no mutation authentication boundary is configured', async (context) => {
  const store = new FounderControlStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'founder-service-')), 'closed.sqlite'),
  });
  const server = await startFounderControlService({ store, port: 0 });
  context.after(
    () =>
      new Promise((resolve) => {
        server.close(() => {
          store.close();
          resolve();
        });
      }),
  );
  const response = await fetch(`http://127.0.0.1:${server.address().port}/v1/projections/rebuild`, {
    method: 'POST',
  });
  assert.equal(response.status, 401);
});

test('serves the read-only connection projection without mutation credentials', async (context) => {
  const store = new FounderControlStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'founder-service-')), 'connections.sqlite'),
  });
  const expected = {
    schemaVersion: 'fleet.connections.v1',
    generatedAt: '2026-07-30T10:00:00.000Z',
    summary: { connected: 1, total: 1 },
    buckets: [],
    connections: [],
    evidence: {},
  };
  const server = await startFounderControlService({
    store,
    port: 0,
    connectionsProvider: () => expected,
  });
  context.after(
    () =>
      new Promise((resolve) => {
        server.close(() => {
          store.close();
          resolve();
        });
      }),
  );

  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/v1/connections`,
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), expected);
});

test('prewarms one connection projection and serves bounded owner outcomes', async (context) => {
  const store = new FounderControlStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'founder-outcomes-')), 'outcomes.sqlite'),
  });
  let builds = 0;
  const expected = {
    schemaVersion: 'fleet.connections.v1',
    generatedAt: '2026-07-30T10:00:00.000Z',
    outputs: {
      ownerOutcomes: {
        domains: [{
          domain: 'example.com',
          projects: [],
          signal: {
            value: 12,
            series: Array.from({ length: 65 }, (_, index) => ({
              value: index,
              observedAt: `2026-07-${String((index % 30) + 1).padStart(2, '0')}T10:00:00.000Z`,
            })),
          },
        }],
        coreAi: [{ projectId: 'core', status: 'not-measured' }],
        performance: [{
          projectId: 'site',
          status: 'fast-enough',
          psi: { value: 95, series: [{ value: 90 }] },
          lcp: { value: 1200, series: [{ value: 1500 }] },
        }],
        search: [{
          projectId: 'site',
          impressions: {
            value: 120,
            series: Array.from({ length: 65 }, (_, index) => ({
              value: index,
              observedAt: `2026-07-${String((index % 30) + 1).padStart(2, '0')}T10:00:00.000Z`,
            })),
          },
          clicks: { value: 8, series: [{ value: 6 }] },
          ctr: { value: 6.67, series: [{ value: 5 }] },
          averagePosition: { value: 14.2, series: [{ value: 16 }] },
        }],
        performanceThresholds: { psiScore: 90, lcpMilliseconds: 2500 },
      },
    },
  };
  const server = await startFounderControlService({
    store,
    port: 0,
    trustLoopback: true,
    prewarmConnections: true,
    connectionsProvider: () => {
      builds += 1;
      return expected;
    },
  });
  context.after(
    () =>
      new Promise((resolve) => {
        server.close(() => {
          store.close();
          resolve();
        });
      }),
  );
  const base = `http://127.0.0.1:${server.address().port}`;
  const domains = await (await fetch(`${base}/v1/outcomes/domains`)).json();
  const search = await (await fetch(`${base}/v1/outcomes/search`)).json();
  const awareness = await (await fetch(`${base}/v1/outcomes/ai-awareness`)).json();
  const performance = await (await fetch(`${base}/v1/outcomes/performance`)).json();
  const connections = await (await fetch(`${base}/v1/connections`)).json();

  assert.equal(builds, 1);
  assert.equal(domains.family, 'domains');
  assert.equal(domains.rows[0].signal.series.length, 60);
  assert.equal(domains.rows[0].signal.series[0].value, 5);
  assert.equal(search.family, 'search');
  assert.equal(search.rows[0].impressions.series.length, 60);
  assert.equal(search.rows[0].impressions.series[0].value, 5);
  assert.equal(search.rows[0].clicks.series.length, 1);
  assert.equal(awareness.rows[0].projectId, 'core');
  assert.deepEqual(performance.thresholds, expected.outputs.ownerOutcomes.performanceThresholds);
  assert.equal(performance.rows[0].psi.value, 95);
  assert.equal('series' in performance.rows[0].psi, false);
  assert.equal('series' in performance.rows[0].lcp, false);
  assert.deepEqual(connections, expected);

  const rebuilt = await fetch(`${base}/v1/projections/rebuild`, { method: 'POST' });
  assert.equal(rebuilt.status, 200);
  assert.equal(builds, 2);
});

test('serves one bounded retained skill output only when explicitly requested', async (context) => {
  const store = new FounderControlStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'founder-service-')), 'skill-output.sqlite'),
  });
  const expected = {
    runId: 'run-123',
    streams: [{ kind: 'output', content: 'Finished the audit.', truncated: false }],
    outputCount: 1,
    truncated: false,
  };
  const server = await startFounderControlService({
    store,
    port: 0,
    skillRunOutputProvider: ({ runId }) => ({ ...expected, runId }),
  });
  context.after(
    () =>
      new Promise((resolve) => {
        server.close(() => {
          store.close();
          resolve();
        });
      }),
  );

  const response = await fetch(
    `http://127.0.0.1:${server.address().port}/v1/skill-runs/run-123/output`,
  );
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), expected);
});

test('starts and polls allowlisted metric runs through explicit loopback trust', async (context) => {
  const store = new FounderControlStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'founder-service-')), 'metric-runs.sqlite'),
  });
  const receipt = {
    runId: 'metric-1',
    family: 'psi',
    projectId: 'codevetter',
    label: 'PSI Swarm',
    state: 'running',
    startedAt: '2026-07-30T10:00:00.000Z',
    finishedAt: null,
    exitCode: null,
    summary: 'PSI Swarm is running.',
    duplicate: false,
  };
  const metricRunController = {
    start: ({ family, projectId, scope }) => ({ ...receipt, family, projectId, scope }),
    get: (runId) => runId === receipt.runId ? receipt : null,
  };
  const server = await startFounderControlService({
    store,
    port: 0,
    trustLoopback: true,
    metricRunController,
  });
  context.after(
    () =>
      new Promise((resolve) => {
        server.close(() => {
          store.close();
          resolve();
        });
      }),
  );
  const base = `http://127.0.0.1:${server.address().port}`;

  const started = await fetch(`${base}/v1/metric-runs`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ family: 'psi', projectId: 'codevetter' }),
  });
  assert.equal(started.status, 202);
  assert.equal((await started.json()).projectId, 'codevetter');

  const portfolio = await fetch(`${base}/v1/metric-runs`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ family: 'drank', scope: 'portfolio' }),
  });
  assert.equal(portfolio.status, 202);
  assert.equal((await portfolio.json()).scope, 'portfolio');
  assert.equal((await fetch(`${base}/v1/metric-runs/metric-1`)).status, 200);
});

test('accepts mutations through the explicit Cloudflare Access boundary only with both identity headers', async (context) => {
  const store = new FounderControlStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'founder-service-')), 'access.sqlite'),
  });
  const server = await startFounderControlService({ store, port: 0, trustAccessHeaders: true });
  context.after(
    () =>
      new Promise((resolve) => {
        server.close(() => {
          store.close();
          resolve();
        });
      }),
  );
  const base = `http://127.0.0.1:${server.address().port}`;
  const emailOnly = await fetch(`${base}/v1/missions/draft`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'cf-access-authenticated-user-email': 'owner@example.com',
    },
    body: JSON.stringify({ title: 'Denied without assertion' }),
  });
  assert.equal(emailOnly.status, 401);
  const accepted = await fetch(`${base}/v1/missions/draft`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'cf-access-authenticated-user-email': 'owner@example.com',
      'cf-access-jwt-assertion': 'signed-access-assertion-placeholder',
    },
    body: JSON.stringify({ title: 'Accepted through Access' }),
  });
  assert.equal(accepted.status, 201);
});
