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

test('projects marketing coverage for every maintained product with the latest publication only', () => {
  const result = buildMarketingProjection({
    generatedAt: '2026-07-30T10:00:00.000Z',
    projects: [
      { id: 'pace', name: 'Pace', description: 'Private voice assistant.', lifecycle: 'maintained' },
      { id: 'quiet', name: 'Quiet', lifecycle: 'maintained' },
      { id: 'past', name: 'Past', lifecycle: 'past' },
    ],
    recommendations: [
      { id: 'open', projectId: 'pace', state: 'open' },
      { id: 'closed', projectId: 'pace', state: 'accepted' },
    ],
    missions: [{
      projectId: 'pace',
      timeline: [
        {
          summary: 'Marketing publication receipt',
          occurredAt: '2026-07-20T10:00:00.000Z',
          evidence: [{
            id: 'old',
            provider: 'postiz',
            kind: 'social-post',
            state: 'published',
            observedAt: '2026-07-20T10:00:00.000Z',
            summary: 'Older launch note',
          }],
        },
        {
          summary: 'Marketing publication receipt',
          occurredAt: '2026-07-30T10:00:00.000Z',
          evidence: [{
            id: 'new',
            provider: 'postiz',
            kind: 'social-post',
            state: 'published',
            observedAt: '2026-07-30T10:00:00.000Z',
            summary: 'New launch note',
            url: 'https://example.com/post',
          }],
        },
      ],
    }],
    aiVisibility: { projects: [] },
  }, {
    eligible: [],
    scheduleIntent: {},
  });

  assert.deepEqual(result.coverage.map((project) => project.projectId), ['pace', 'quiet']);
  assert.equal(result.coverage[0].positioning.description, 'Private voice assistant.');
  assert.equal(result.coverage[0].recommendationCount, 1);
  assert.equal(result.coverage[0].latestPublication.id, 'new');
  assert.equal(result.coverage[1].publicationState, 'never-marketed');
  assert.deepEqual(result.recommendations.map((item) => item.id), ['open']);
  assert.equal(result.outcomes.length, 1);
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
    start: ({ family, projectId }) => ({ ...receipt, family, projectId }),
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
