import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { startDashboardService } from '../lib/dashboard-backend/service.mjs';
import { DashboardStore } from '../lib/dashboard-backend/store.mjs';

const projection = {
  schemaVersion: 'dashboard.projection.v1',
  generatedAt: '2026-08-21T00:00:00.000Z',
  outcomes: {
    domains: [{ domain: 'example.com', status: 'fresh', signal: null, projects: [] }],
    search: [],
    aiAwareness: [],
    aiCoverage: { total: 0, observedCount: 0, unobservedCount: 0, observed: [], unobserved: [] },
    performance: [],
  },
};

test('serves Dashboard evidence, capabilities, and four outcome families', async (context) => {
  const store = new DashboardStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'dashboard-service-')), 'dashboard.sqlite'),
    projects: [],
  });
  const server = await startDashboardService({
    store,
    port: 0,
    trustLoopback: true,
    projectionProvider: () => projection,
    visibilityPortfolio: { eligible: [], scheduleIntent: { enabled: false } },
    prefillEvidence: () => ({ schemaVersion: 'site-health.prefill.v1', sources: [] }),
  });
  context.after(() => new Promise((resolve) => server.close(() => {
    store.close();
    resolve();
  })));
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.equal(server.address().address, '127.0.0.1');

  const health = await (await fetch(`${base}/health`)).json();
  assert.equal(health.service, 'site-health-backend');
  assert.deepEqual(await (await fetch(`${base}/v1/projects`)).json(), []);
  assert.equal((await fetch(`${base}/v1/outcomes/domains`)).status, 200);
  assert.equal((await fetch(`${base}/v1/outcomes/search`)).status, 200);
  assert.equal((await fetch(`${base}/v1/outcomes/ai-awareness`)).status, 200);
  assert.equal((await fetch(`${base}/v1/outcomes/performance`)).status, 200);
  assert.equal((await fetch(`${base}/v1/capabilities`)).status, 200);
  assert.equal((await fetch(`${base}/v1/evidence-status`)).status, 200);
  const prefill = await fetch(`${base}/v1/prefill`, { method: 'POST' });
  assert.equal(prefill.status, 202);
  assert.equal((await prefill.json()).schemaVersion, 'site-health.prefill.v1');
  assert.equal((await fetch(`${base}/v1/connections`)).status, 404);
  assert.equal((await fetch(`${base}/v1/home`)).status, 404);
  assert.equal((await fetch(`${base}/v1/marketing`)).status, 404);
  assert.equal((await fetch(`${base}/v1/skill-runs/example/output`)).status, 404);
});

test('does not trust spoofed Cloudflare Access headers', async (context) => {
  const store = new DashboardStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'dashboard-local-auth-')), 'dashboard.sqlite'),
    projects: [],
  });
  const server = await startDashboardService({
    store,
    port: 0,
    trustLoopback: false,
    projectionProvider: () => projection,
    visibilityPortfolio: { eligible: [], scheduleIntent: { enabled: false } },
    prefillEvidence: () => ({ schemaVersion: 'site-health.prefill.v1', sources: [] }),
  });
  context.after(() => new Promise((resolve) => server.close(() => {
    store.close();
    resolve();
  })));

  const response = await fetch(`http://127.0.0.1:${server.address().port}/v1/prefill`, {
    method: 'POST',
    headers: {
      'cf-access-authenticated-user-email': 'owner@example.com',
      'cf-access-jwt-assertion': 'spoofed',
    },
  });
  assert.equal(response.status, 401);
});
