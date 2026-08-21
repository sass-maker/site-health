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

test('serves only Dashboard health, projects, and four outcome families', async (context) => {
  const store = new DashboardStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'dashboard-service-')), 'dashboard.sqlite'),
    projects: [],
  });
  const server = await startDashboardService({
    store,
    port: 0,
    projectionProvider: () => projection,
    visibilityPortfolio: { eligible: [], scheduleIntent: { enabled: false } },
  });
  context.after(() => new Promise((resolve) => server.close(() => {
    store.close();
    resolve();
  })));
  const base = `http://127.0.0.1:${server.address().port}`;

  const health = await (await fetch(`${base}/health`)).json();
  assert.equal(health.service, 'site-health-backend');
  assert.deepEqual(await (await fetch(`${base}/v1/projects`)).json(), []);
  assert.equal((await fetch(`${base}/v1/outcomes/domains`)).status, 200);
  assert.equal((await fetch(`${base}/v1/outcomes/search`)).status, 200);
  assert.equal((await fetch(`${base}/v1/outcomes/ai-awareness`)).status, 200);
  assert.equal((await fetch(`${base}/v1/outcomes/performance`)).status, 200);
  assert.equal((await fetch(`${base}/v1/connections`)).status, 404);
  assert.equal((await fetch(`${base}/v1/home`)).status, 404);
  assert.equal((await fetch(`${base}/v1/marketing`)).status, 404);
  assert.equal((await fetch(`${base}/v1/skill-runs/example/output`)).status, 404);
});
