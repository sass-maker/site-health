import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, symlink } from 'node:fs/promises';
import { request } from 'node:http';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { generateKeyPair, SignJWT } from 'jose';

import { hostedConfiguration, startHostedDashboardService } from '../lib/dashboard-backend/hosted.mjs';
import { emptyReadinessState } from '../lib/dashboard-backend/readiness-model.mjs';
import { DashboardStore } from '../lib/dashboard-backend/store.mjs';

const env = { SITE_HEALTH_HOSTED: '1', SITE_HEALTH_PUBLIC_ORIGIN: 'https://health.example.com',
  ACCESS_TEAM_DOMAIN: 'https://team.cloudflareaccess.com', ACCESS_AUD: 'test-access-app',
  ACCESS_OWNER_EMAIL: 'owner@example.com' };
const config = hostedConfiguration(env);
const keys = await generateKeyPair('RS256');
const projects = [{ id: 'sample', name: 'Private Sample', lifecycle: { status: 'active' } }];
const seconds = () => Math.floor(Date.now() / 1000);
async function token(claims = {}, privateKey = keys.privateKey, header = {}) {
  return new SignJWT({ sub: 'owner-subject', email: env.ACCESS_OWNER_EMAIL, iat: seconds(),
    exp: seconds() + 300, iss: config.issuer, aud: config.audience, ...claims })
    .setProtectedHeader({ alg: 'RS256', kid: 'fixture', ...header }).sign(privateKey);
}

function http(server, path, { assertion, headers = {}, method = 'GET', body } = {}) {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port: server.address().port, path, method,
      headers: { host: config.host, ...(assertion ? { 'cf-access-jwt-assertion': assertion } : {}), ...headers } }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString() }));
    });
    req.on('error', reject);
    req.end(body);
  });
}

async function fixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'site-health-hosted-'));
  const distDirectory = join(directory, 'dist');
  await mkdir(join(distDirectory, '_astro'), { recursive: true });
  await mkdir(join(distDirectory, 'server'));
  await mkdir(join(distDirectory, 'readiness'));
  await writeFile(join(distDirectory, 'index.html'), '<h1>Private dashboard</h1>');
  await writeFile(join(distDirectory, 'readiness/index.html'), '<h1>Private readiness</h1>');
  await writeFile(join(distDirectory, '_astro/app.js'), 'console.log("private asset");');
  await writeFile(join(distDirectory, 'server/index.js'), 'PRIVATE_SERVER_CODE');
  await writeFile(join(directory, 'outside.txt'), 'PRIVATE_OUTSIDE_FILE');
  await symlink(join(directory, 'outside.txt'), join(distDirectory, 'leak.txt'));
  const databasePath = join(directory, 'dashboard.sqlite');
  let server;
  let store;
  const stop = async () => {
    if (server) { await new Promise(resolve => server.close(resolve)); server = null; }
    if (store) { store.close(); store = null; }
  };
  const start = async () => {
    store = new DashboardStore({ databasePath, projects });
    server = await startHostedDashboardService({ config, distDirectory, store, port: 0,
      keyResolver: async () => keys.publicKey, visibilityPortfolio: { eligible: [] },
      projectionProvider: () => ({ outcomes: {} }), clarityRegistryProvider: () => new Map(),
      ownerToken: 'must-not-work', trustLoopback: true });
    return server;
  };
  t.after(stop);
  return { server: await start(), stop, start, databasePath };
}

test('hosted configuration fails closed on incomplete or ambiguous configuration', () => {
  assert.equal(hostedConfiguration({}), null);
  assert.deepEqual(hostedConfiguration(env), config);
  for (const key of Object.keys(env)) {
    if (key === 'SITE_HEALTH_HOSTED') continue;
    assert.throws(() => hostedConfiguration({ ...env, [key]: undefined }), new RegExp(key));
  }
  for (const patch of [
    { SITE_HEALTH_HOSTED: 'true' }, { SITE_HEALTH_PUBLIC_ORIGIN: 'http://health.example.com' },
    { SITE_HEALTH_PUBLIC_ORIGIN: 'https://health.example.com/' },
    { SITE_HEALTH_PUBLIC_ORIGIN: 'https://user:pass@health.example.com' },
    { ACCESS_TEAM_DOMAIN: 'https://attacker.example' },
    { ACCESS_TEAM_DOMAIN: 'https://team.cloudflareaccess.com:443/' },
    { ACCESS_AUD: ' ' }, { ACCESS_OWNER_EMAIL: 'owner' },
  ]) assert.throws(() => hostedConfiguration({ ...env, ...patch }));
});

test('signed owner authentication protects API, HTML, assets and internal health even over loopback', async (t) => {
  const { server } = await fixture(t);
  assert.equal(server.address().address, '127.0.0.1');
  const forgedKeys = await generateKeyPair('RS256');
  const invalid = [undefined, 'spoofed', await token({}, forgedKeys.privateKey), await token({ exp: seconds() - 1 }),
    await token({ aud: 'another-app' }), await token({ iss: 'https://other.cloudflareaccess.com' }),
    await token({ email: 'attacker@example.com' }), await token({ email: undefined }),
    await token({ sub: '' }), await token({ sub: undefined }), await token({ iat: undefined }),
    await token({ exp: undefined }), await token({ iat: seconds() + 600 })];
  for (const assertion of invalid) {
    for (const path of ['/api/dashboard/v1/projects', '/', '/_astro/app.js', '/api/dashboard/health', '/health']) {
      const response = await http(server, path, { assertion, headers: {
        'cf-access-authenticated-user-email': env.ACCESS_OWNER_EMAIL, authorization: 'Bearer must-not-work' } });
      assert.equal(response.status, 401, `${path} accepted invalid assertion`);
      assert.doesNotMatch(response.body, /Private Sample|Private dashboard|private asset|available/);
    }
  }
  const assertion = await token();
  assert.equal((await http(server, '/api/dashboard/v1/projects', { assertion })).status, 200);
  assert.match((await http(server, '/', { assertion })).body, /Private dashboard/);
  assert.match((await http(server, '/_astro/app.js', { assertion })).body, /private asset/);
  assert.equal((await http(server, '/api/dashboard/v1/projects', { assertion, headers: {
    host: '127.0.0.1', 'x-forwarded-host': config.host, 'x-forwarded-proto': 'https' } })).status, 401);
  assert.equal((await http(server, '/', { method: 'HEAD' })).status, 401);
  const head = await http(server, '/', { assertion, method: 'HEAD' });
  assert.equal(head.status, 200); assert.equal(head.body, '');
});

test('owner writes require exact HTTPS origin and JSON, and survive restart in real SQLite', async (t) => {
  const host = await fixture(t);
  const assertion = await token();
  const state = emptyReadinessState(); state.nextLevers.product = 'Verify hosted persistence';
  const body = JSON.stringify({ expectedRevision: 0, idempotencyKey: 'hosted-write', state });
  const validHeaders = { origin: config.origin, 'content-type': 'application/json', 'sec-fetch-site': 'same-origin' };
  const put = headers => http(host.server, '/api/dashboard/v1/readiness/sample', { assertion, method: 'PUT', body, headers });
  for (const headers of [
    { ...validHeaders, origin: 'https://attacker.example' }, { ...validHeaders, origin: 'http://health.example.com' },
    { ...validHeaders, origin: `${config.origin}/` }, { ...validHeaders, origin: undefined },
    { ...validHeaders, 'sec-fetch-site': 'cross-site' },
  ]) {
    const cleaned = Object.fromEntries(Object.entries(headers).filter(([, value]) => value !== undefined));
    assert.equal((await put(cleaned)).status, 403);
  }
  assert.equal((await put({ ...validHeaders, 'content-type': 'text/plain' })).status, 415);
  assert.equal((await http(host.server, '/api/dashboard/v1/readiness/sample', { method: 'PUT', body, headers: validHeaders })).status, 401);
  const saved = await put(validHeaders);
  assert.equal(saved.status, 200); assert.equal(JSON.parse(saved.body).revision, 1);
  assert.equal(JSON.parse((await put(validHeaders)).body).duplicate, true);
  await host.stop();
  host.server = await host.start();
  const read = await http(host.server, '/api/dashboard/v1/readiness', { assertion });
  assert.equal(read.status, 200);
  const retained = JSON.parse(read.body).projects[0];
  assert.equal(retained.revision, 1); assert.equal(retained.state.nextLevers.product, state.nextLevers.product);
  assert.equal(read.headers['cache-control'], 'no-store');
});

test('static whitelist serves built routes and rejects traversal, symlinks and server output', async (t) => {
  const { server } = await fixture(t);
  const assertion = await token();
  assert.match((await http(server, '/readiness', { assertion })).body, /Private readiness/);
  for (const path of ['/../outside.txt', '/%2e%2e/outside.txt', '/%2e%2e%2foutside.txt', '/%5c..%5coutside.txt',
    '/leak.txt', '/server/index.js', '/server%2findex.js', '/.git/config', '/%00', '/%zz']) {
    const response = await http(server, path, { assertion });
    assert.ok([400, 404].includes(response.status), `${path} returned ${response.status}`);
    assert.doesNotMatch(response.body, /PRIVATE_OUTSIDE_FILE|PRIVATE_SERVER_CODE/);
  }
});
