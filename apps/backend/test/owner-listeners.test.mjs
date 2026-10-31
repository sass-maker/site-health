import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { createServer, request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { generateKeyPair, SignJWT } from 'jose';
import { ownerListenerConfiguration, startOwnerListeners } from '../lib/dashboard-backend/owner-listeners.mjs';
import { emptyReadinessState } from '../lib/dashboard-backend/readiness-model.mjs';
import { DashboardStore } from '../lib/dashboard-backend/store.mjs';
import { createMetricRunController } from '../lib/dashboard-backend/metric-runs.mjs';

const env = { SITE_HEALTH_TUNNEL: '1', SITE_HEALTH_PUBLIC_ORIGIN: 'https://health.example.com',
  ACCESS_TEAM_DOMAIN: 'https://team.cloudflareaccess.com', ACCESS_AUD: 'owner-dashboard',
  ACCESS_OWNER_EMAIL: 'owner@example.com' };

function http(server, path, { method = 'GET', headers = {}, body } = {}) {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port: server.address().port, path, method, headers }, response => {
      const chunks = [];
      response.on('data', chunk => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    req.end(body);
  });
}

const close = server => new Promise(resolve => server.close(resolve));

test('tunnel mode adds a distinct port, requires complete Access configuration, and preserves existing modes', () => {
  const local = ownerListenerConfiguration({});
  assert.deepEqual(local, { hosted: null, tunnel: false, port: 4187, tunnelPort: null });
  const tunnel = ownerListenerConfiguration(env);
  assert.equal(tunnel.port, 4187);
  assert.equal(tunnel.tunnelPort, 4188);
  assert.equal(tunnel.hosted.origin, env.SITE_HEALTH_PUBLIC_ORIGIN);
  const hosted = ownerListenerConfiguration({ ...env, SITE_HEALTH_TUNNEL: undefined, SITE_HEALTH_HOSTED: '1', PORT: '8080' });
  assert.equal(hosted.port, 8080);
  assert.equal(hosted.tunnel, false);
  assert.equal(hosted.tunnelPort, null);
  const custom = ownerListenerConfiguration({ ...env, SITE_HEALTH_TUNNEL_PORT: '8190' }, '8189');
  assert.equal(custom.port, 8189);
  assert.equal(custom.tunnelPort, 8190);
  for (const patch of [
    { SITE_HEALTH_TUNNEL: 'true' }, { SITE_HEALTH_HOSTED: 'true' }, { ACCESS_AUD: undefined }, { SITE_HEALTH_PUBLIC_ORIGIN: undefined },
    { SITE_HEALTH_TUNNEL_PORT: '0' }, { SITE_HEALTH_TUNNEL_PORT: '4187' },
  ]) assert.throws(() => ownerListenerConfiguration({ ...env, ...patch }));
});

test('the production command rejects invalid tunnel ports before opening private databases', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'site-health-tunnel-cli-'));
  const databasePath = join(directory, 'must-not-exist.sqlite');
  for (const SITE_HEALTH_TUNNEL_PORT of ['0', '4187', 'invalid']) {
    const child = spawnSync(process.execPath, [fileURLToPath(new URL('../scripts/server.mjs', import.meta.url)), 'serve'], {
      env: { ...env, SITE_HEALTH_TUNNEL_PORT, HOME: directory, PATH: directory,
        SITE_HEALTH_OWNER_REPOSITORY: directory, DASHBOARD_DB: databasePath },
      encoding: 'utf8', timeout: 2000,
    });
    assert.notEqual(child.status, 0);
    assert.match(child.stderr, /PORT must be an integer|ports must differ/);
    assert.equal(existsSync(databasePath), false);
  }
});

test('local and Access listeners use one store; private routes remain authenticated and both listeners close', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'site-health-owner-listeners-'));
  const distDirectory = join(directory, 'dist');
  await mkdir(distDirectory);
  await writeFile(join(distDirectory, 'index.html'), '<h1>Private owner dashboard</h1>');
  const projects = [{ id: 'sample', name: 'Private Sample', lifecycle: { status: 'active' } }];
  const store = new DashboardStore({ databasePath: join(directory, 'dashboard.sqlite'), projects });
  t.after(() => store.close());
  const keys = await generateKeyPair('RS256');
  const config = ownerListenerConfiguration(env);
  const metricRunController = createMetricRunController({ projects });
  const run = metricRunController.start({ family: 'ai', projectId: 'sample' });
  const servers = await startOwnerListeners({ listeners: { ...config, port: 0, tunnelPort: 0 }, store,
    distDirectory, keyResolver: async () => keys.publicKey, trustLoopback: true,
    metricRunController,
    visibilityPortfolio: { eligible: [] }, projectionProvider: () => ({ outcomes: {} }),
    clarityRegistryProvider: () => new Map() });
  t.after(() => Promise.all(servers.map(close)));
  const [local, hosted] = servers;
  for (const server of servers) assert.equal(server.address().address, '127.0.0.1');
  const ports = servers.map(server => server.address().port);
  assert.notEqual(ports[0], ports[1]);
  for (const path of ['/', '/api/dashboard/v1/projects', '/api/dashboard/v1/readiness']) {
    const denied = await http(hosted, path, { headers: { host: config.hosted.host,
      'cf-access-authenticated-user-email': env.ACCESS_OWNER_EMAIL } });
    assert.equal(denied.status, 401);
    assert.doesNotMatch(denied.body, /Private Sample|Private owner/);
  }
  const now = Math.floor(Date.now() / 1000);
  const assertion = await new SignJWT({ sub: 'owner', email: env.ACCESS_OWNER_EMAIL })
    .setProtectedHeader({ alg: 'RS256', kid: 'fixture' }).setIssuer(config.hosted.issuer)
    .setAudience(config.hosted.audience).setIssuedAt(now).setExpirationTime(now + 300).sign(keys.privateKey);
  const headers = { host: config.hosted.host, 'cf-access-jwt-assertion': assertion };
  assert.match((await http(hosted, '/', { headers })).body, /Private owner dashboard/);
  assert.deepEqual(JSON.parse((await http(hosted, '/api/dashboard/v1/projects', { headers })).body),
    JSON.parse((await http(local, '/v1/projects')).body));
  assert.deepEqual(JSON.parse((await http(hosted, `/api/dashboard/v1/metric-runs/${run.runId}`, { headers })).body), run);
  assert.deepEqual(JSON.parse((await http(local, `/v1/metric-runs/${run.runId}`)).body), run);
  const state = emptyReadinessState();
  state.nextLevers.product = 'Shared local and remote data';
  const saved = await http(local, '/v1/readiness/sample', { method: 'PUT',
    headers: { origin: 'http://127.0.0.1:4321', 'content-type': 'application/json' },
    body: JSON.stringify({ expectedRevision: 0, idempotencyKey: 'local-save', state }) });
  assert.equal(saved.status, 200);
  const remote = JSON.parse((await http(hosted, '/api/dashboard/v1/readiness', { headers })).body).projects[0];
  assert.equal(remote.revision, 1);
  assert.equal(remote.state.nextLevers.product, state.nextLevers.product);
  state.nextLevers.product = 'Remote save visible locally';
  const body = JSON.stringify({ expectedRevision: 1, idempotencyKey: 'remote-save', state });
  const invalidWrite = await http(hosted, '/api/dashboard/v1/readiness/sample', { method: 'PUT', body,
    headers: { ...headers, origin: 'https://attacker.example', 'content-type': 'application/json' } });
  assert.equal(invalidWrite.status, 403);
  const remoteSaved = await http(hosted, '/api/dashboard/v1/readiness/sample', { method: 'PUT', body,
    headers: { ...headers, origin: config.hosted.origin, 'content-type': 'application/json' } });
  assert.equal(remoteSaved.status, 200);
  const localRead = JSON.parse((await http(local, '/v1/readiness')).body).projects[0];
  assert.equal(localRead.revision, 2);
  assert.equal(localRead.state.nextLevers.product, state.nextLevers.product);
  await Promise.all(servers.map(close));
  for (const server of servers) assert.equal(server.listening, false);
});

test('a tunnel startup failure releases the local port instead of leaving a partial service', async t => {
  const occupied = createServer();
  await new Promise(resolve => occupied.listen(0, '127.0.0.1', resolve));
  t.after(() => close(occupied));
  const directory = await mkdtemp(join(tmpdir(), 'site-health-owner-startup-'));
  await writeFile(join(directory, 'index.html'), '<h1>Private</h1>');
  const reservation = createServer();
  await new Promise(resolve => reservation.listen(0, '127.0.0.1', resolve));
  const localPort = reservation.address().port;
  await close(reservation);
  const store = new DashboardStore({ databasePath: join(directory, 'dashboard.sqlite'), projects: [] });
  t.after(() => store.close());
  await assert.rejects(startOwnerListeners({ listeners: { ...ownerListenerConfiguration(env),
    port: localPort, tunnelPort: occupied.address().port }, store, distDirectory: directory,
    visibilityPortfolio: { eligible: [] }, projectionProvider: () => ({ outcomes: {} }) }), { code: 'EADDRINUSE' });
  const rebound = createServer();
  await new Promise((resolve, reject) => { rebound.once('error', reject); rebound.listen(localPort, '127.0.0.1', resolve); });
  await close(rebound);
});
