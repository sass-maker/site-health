import assert from 'node:assert/strict';
import { request as httpRequest } from 'node:http';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { startDashboardService } from '../lib/dashboard-backend/service.mjs';
import { DashboardStore } from '../lib/dashboard-backend/store.mjs';
import { claritySnapshotKey } from '../lib/dashboard-backend/clarity.mjs';
import { loadProjectDirectory, groupProjectCollections } from '../../web/src/lib/project-directory.mjs';

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
  let currentProjects = [];
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
    projectsProvider: () => currentProjects,
    projectCollectionsProvider: () => [{ id: 'family', name: 'Family', projectIds: ['first', 'second'], priority: 'P1' }],
    clarityRegistryProvider: () => new Map([
      ['retained', { projectId: 'retained', wired: true, hostname: 'example.com' }],
    ]),
    readinessObservationProvider: () => [{ projectId: 'retained', id: 'private-revenue', label: 'Provider revenue', value: 12345, unit: 'USD minor units', qualification: 'proxy' }],
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
  assert.deepEqual(await (await fetch(`${base}/v1/project-collections`)).json(), [{ id: 'family', name: 'Family', projectIds: ['first', 'second'], priority: 'P1' }]);
  currentProjects = [{ id: 'retained', name: 'Retained', status: 'live', lifecycle: { status: 'inactive', shareable: false, resumeCondition: null } }];
  assert.equal((await (await fetch(`${base}/v1/projects`)).json())[0].id, 'retained');
  assert.equal((await fetch(`${base}/v1/readiness`)).status, 200);
  assert.equal((await fetch(`${base}/v1/ui-library`)).status, 200);
  const uiSummary=await (await fetch(`${base}/v1/ui-library?summary=1`)).json();
  assert.deepEqual(Object.keys(uiSummary),['siteHealth']);
  if(uiSummary.siteHealth)assert.deepEqual(Object.keys(uiSummary.siteHealth).sort(),['current','stale','total']);
  for (const privatePath of ['/v1/readiness', '/v1/ui-library','/v1/ui-library?summary=1', '/v1/project-collections']) {
  const rebound = await new Promise((resolve, reject) => {
    const request = httpRequest({ hostname: '127.0.0.1', port: server.address().port, path: privatePath, headers: { host: 'attacker.example' } }, (response) => {
      let body = '';
      response.setEncoding('utf8'); response.on('data', (chunk) => { body += chunk; });
      response.on('end', () => resolve({ status: response.statusCode, body }));
    });
    request.on('error', reject); request.end();
  });
  assert.equal(rebound.status, 403);
  assert.doesNotMatch(rebound.body, /12345/);
  }
  store.setMetadata(claritySnapshotKey('retained'), {
    projectId: 'retained',
    observedAt: '2026-09-01T08:00:00.000Z',
    metrics: { sessions: 7 },
  });
  const clarity = await (await fetch(`${base}/v1/projects/retained/clarity`)).json();
  assert.equal(clarity.eligibility.eligible, true);
  assert.equal(clarity.snapshot.metrics.sessions, 7);
  assert.equal((await fetch(`${base}/v1/projects/unknown/clarity`)).status, 404);
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

test('optional collections fail gently over HTTP while the required product directory stays available', async (context) => {
  const projects = [{ id: 'first', name: 'First', lifecycle: { status: 'active' } }, { id: 'second', name: 'Second', lifecycle: { status: 'active' } }];
  const store = new DashboardStore({ databasePath: join(mkdtempSync(join(tmpdir(), 'collection-fallback-')), 'dashboard.sqlite'), projects });
  const server = await startDashboardService({
    store, port: 0, trustLoopback: true, projectionProvider: () => projection,
    visibilityPortfolio: { eligible: [], scheduleIntent: { enabled: false } },
    projectCollectionsProvider: () => { throw new Error('Collection configuration is stale'); },
  });
  context.after(() => new Promise(resolve => server.close(() => { store.close(); resolve(); })));
  const request = (path, mode) => new Promise((resolve, reject) => {
    const optional = path === '/v1/project-collections';
    const call = httpRequest({ hostname: '127.0.0.1', port: server.address().port,
      path: optional && mode === 'missing' ? '/v1/old-collections' : path,
      headers: optional && mode === 'forbidden' ? { host: 'attacker.example' } : {},
    }, response => {
      let body = '';
      response.setEncoding('utf8'); response.on('data', chunk => { body += chunk; });
      response.on('end', () => response.statusCode === 200 ? resolve(JSON.parse(body)) : reject(new Error(`HTTP ${response.statusCode}`)));
    });
    call.on('error', reject); call.end();
  });
  for (const [mode, status] of [['missing', 404], ['forbidden', 403], ['provider', 500]]) {
    await assert.rejects(request('/v1/project-collections', mode), new RegExp(`HTTP ${status}`));
    const result = await loadProjectDirectory(path => request(path, mode));
    assert.deepEqual(result.projects.map(project => project.id), ['first', 'second']);
    assert.equal(result.collectionsUnavailable, true);
    assert.deepEqual(result.collections, []);
    const flat = groupProjectCollections(result.projects, result.collections);
    assert.deepEqual(flat.ungrouped.map(project => project.id), ['first', 'second']);
    assert.equal(flat.visible.length, 2);
  }
  await assert.rejects(loadProjectDirectory(path => request(path === '/v1/projects' ? '/v1/missing-projects' : path, 'provider')), /HTTP 404/);
});

test('loopback mutations reject cross-site browser requests and accept dashboard JSON and bearer CLI', async (context) => {
  const store = new DashboardStore({ databasePath: join(mkdtempSync(join(tmpdir(), 'dashboard-browser-auth-')), 'dashboard.sqlite'), projects: [] });
  let mutations = 0;
  const server = await startDashboardService({
    store, port: 0, trustLoopback: true, ownerToken: 'test-owner',
    projectionProvider: () => projection,
    visibilityPortfolio: { eligible: [], scheduleIntent: { enabled: false } },
    prefillEvidence: () => { mutations++; return { sources: [] }; },
  });
  context.after(() => new Promise((resolve) => server.close(() => { store.close(); resolve(); })));
  const endpoint = `http://127.0.0.1:${server.address().port}/v1/prefill`;
  for (const headers of [
    { origin: 'https://attacker.example', 'sec-fetch-site': 'cross-site', 'content-type': 'text/plain' },
    { origin: 'https://attacker.example', 'content-type': 'application/json', authorization: 'Bearer test-owner' },
    { 'sec-fetch-site': 'cross-site', 'content-type': 'text/plain' },
    { origin: 'http://attacker.localhost.example:9999', 'sec-fetch-site': 'same-site', 'content-type': 'application/json' },
  ]) assert.equal((await fetch(endpoint, { method: 'POST', headers, body: '{}' })).status, 403);
  assert.equal(mutations, 0);
  assert.equal((await fetch(endpoint, { method: 'POST', headers: { origin: 'http://127.0.0.1:4321', 'sec-fetch-site': 'same-origin', 'content-type': 'text/plain' }, body: '{}' })).status, 415);
  assert.equal((await fetch(endpoint, { method: 'POST', headers: { origin: 'http://127.0.0.1:4321', 'sec-fetch-site': 'same-origin', 'content-type': 'application/json' }, body: '{}' })).status, 202);
  assert.equal((await fetch(endpoint, { method: 'POST', headers: { authorization: 'Bearer test-owner', 'content-type': 'application/json' }, body: '{}' })).status, 202);
  assert.equal((await fetch(endpoint, { method: 'POST', headers: { origin: 'http://127.0.0.1:9999', 'sec-fetch-site': 'same-site', 'content-type': 'application/json' }, body: '{}' })).status, 202);
  assert.equal(mutations, 3);
  const bearer = await startDashboardService({
    store, port: 0, trustLoopback: false, ownerToken: 'test-owner',
    projectionProvider: () => projection,
    visibilityPortfolio: { eligible: [], scheduleIntent: { enabled: false } },
    prefillEvidence: () => ({ sources: [] }),
  });
  context.after(() => new Promise((resolve) => bearer.close(resolve)));
  const bearerEndpoint = `http://127.0.0.1:${bearer.address().port}/v1/prefill`;
  assert.equal((await fetch(bearerEndpoint, { method: 'POST', headers: { authorization: 'Bearer test-owner', 'content-type': 'application/json' }, body: '{}' })).status, 202);
  assert.equal((await fetch(bearerEndpoint, { method: 'POST', headers: { authorization: 'Bearer wrong', 'content-type': 'application/json' }, body: '{}' })).status, 401);
});

test('Search API exposes indexing separately without adding traffic or freshness evidence', async (context) => {
  const store = new DashboardStore({ databasePath: join(mkdtempSync(join(tmpdir(), 'dashboard-index-coverage-')), 'dashboard.sqlite'), projects: [] });
  const indexCoverage = Array.from({ length: 38 }, (_, index) => ({ projectId: `current-${index}`, status: 'google-report', observedAt: '2026-10-29T12:00:00Z', indexCoverage: { googleReport: { indexedCount: 3, totalKnownCount: 4 }, total: 10 } }));
  const server = await startDashboardService({ store, port: 0, trustLoopback: true,
    projectionProvider: () => ({ ...projection, outcomes: { ...projection.outcomes, indexCoverage } }),
    visibilityPortfolio: { eligible: [], scheduleIntent: { enabled: false } }, projectsProvider: () => [], projectCollectionsProvider: () => [],
  });
  context.after(() => new Promise(resolve => server.close(() => { store.close(); resolve(); })));
  const payload = await (await fetch(`http://127.0.0.1:${server.address().port}/v1/outcomes/search`)).json();
  assert.deepEqual(payload.rows, []);
  assert.equal(payload.indexCoverage.length, 38);
  assert.equal(payload.source.resultCount, 0);
  assert.equal(payload.source.observedAt, null);
});
