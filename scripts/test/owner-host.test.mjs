import assert from 'node:assert/strict';
import { execFileSync, spawn } from 'node:child_process';
import { once } from 'node:events';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, symlinkSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { bundleId, launchAgent } from '../owner-service.mjs';

const entry = resolve(import.meta.dirname, '../start-owner.mjs');
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(predicate, message) {
  const deadline = Date.now() + 8_000;
  while (Date.now() < deadline) { if (predicate()) return; await wait(25); }
  assert.fail(typeof message === 'function' ? message() : message);
}
function alive(pid) { try { process.kill(pid, 0); return true; } catch { return false; } }
function nativeFixture(root, paths) {
  const app = join(root, 'Fixture.app/Contents');
  mkdirSync(join(app, 'MacOS'), { recursive: true });
  mkdirSync(join(app, 'Resources'));
  const executable = join(app, 'MacOS/SiteHealthOwner');
  copyFileSync(process.env.SITE_HEALTH_HOST_TEST_BINARY, executable);
  writeFileSync(join(app, 'Info.plist'), '<?xml version="1.0"?><plist version="1.0"><dict><key>CFBundleExecutable</key><string>SiteHealthOwner</string><key>CFBundleIdentifier</key><string>com.fleet.site-health.owner-host</string></dict></plist>');
  writeFileSync(join(app, 'Resources/owner-host.json'), JSON.stringify(paths));
  execFileSync('/usr/bin/codesign', ['--force', '--sign', '-', join(root, 'Fixture.app')], { stdio: 'ignore' });
  return executable;
}
async function fixture(t, mode = '', native = false) {
  const root = mkdtempSync(join(tmpdir(), 'site-health-owner-'));
  mkdirSync(join(root, 'apps/backend/scripts'), { recursive: true });
  mkdirSync(join(root, 'apps/web/scripts'), { recursive: true });
  mkdirSync(join(root, 'bin'));
  const ports = [];
  for (let i = 0; i < 2; i++) {
    const server = createServer();
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    ports.push(server.address().port);
    await new Promise((resolve) => server.close(resolve));
  }
  writeFileSync(join(root, 'service.mjs'), `
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { appendFileSync } from 'node:fs';
const backend = process.argv.includes('serve');
appendFileSync(process.env.PIDS, process.pid + '\\n');
if (backend && process.env.MODE === 'clean-exit') setTimeout(() => process.exit(0), 300);
else if (!(backend && process.env.MODE === 'unready')) {
  createServer((req, res) => {
    res.setHeader('content-type', backend ? 'application/json' : 'text/html');
    res.end(backend ? JSON.stringify({ service: 'site-health-backend', brandEvidence: 'native-v2' }) : 'Site Health data-brand-evidence-collect');
  }).listen(backend ? process.env.BACKEND_PORT : process.env.WEB_PORT, '127.0.0.1');
}
const grandchild = spawn(process.execPath, ['-e', 'setInterval(() => {}, 1000)'], { stdio: 'ignore' });
appendFileSync(process.env.PIDS, grandchild.pid + '\\n');
process.on('SIGTERM', () => { grandchild.kill('SIGTERM'); process.exit(0); });
process.on('exit', () => grandchild.kill('SIGTERM'));
setInterval(() => {}, 1000);
`);
  writeFileSync(join(root, 'apps/backend/scripts/server.mjs'), "import '../../../service.mjs';\n");
  writeFileSync(join(root, 'apps/web/scripts/owner-server.mjs'), "import '../../../service.mjs';\n");
  const pidsPath = join(root, 'pids');
  writeFileSync(pidsPath, '');
  const pids = () => readFileSync(pidsPath, 'utf8').trim().split('\n').filter(Boolean).map(Number);
  const env = { ...process.env, SITE_HEALTH_OWNER_HOST: '1', PATH: `${join(root, 'bin')}:${process.env.PATH}`, PIDS: pidsPath, MODE: mode, BACKEND_PORT: String(ports[0]), WEB_PORT: String(ports[1]) };
  const urls = ports.map((port) => `http://127.0.0.1:${port}`);
  const config = { repositoryRoot: root, backendUrl: urls[0], webUrl: urls[1], startupTimeout: mode === 'unready' ? 500 : 3_000 };
  const runner = join(root, 'runner.mjs');
  writeFileSync(runner, `import { startOwner } from ${JSON.stringify(new URL(`file://${entry}`).href)}; process.exitCode = await startOwner(${JSON.stringify(config)});`);
  let command = process.execPath;
  let args = [runner];
  if (native) {
    mkdirSync(join(root, 'scripts'));
    copyFileSync(runner, join(root, 'scripts/start-owner.mjs'));
    symlinkSync(process.execPath, join(root, 'bin/node'));
    writeFileSync(join(root, 'catalog.json'), '{}');
    command = nativeFixture(root, { nodePath: join(root, 'bin/node'), repositoryPath: root, ownerRepositoryPath: root, catalogPath: join(root, 'catalog.json') });
    args = [];
  }
  const child = spawn(command, args, { env, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  const exited = once(child, 'exit');
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGTERM');
    await Promise.race([exited, wait(4_000)]);
    for (const pid of pids()) if (alive(pid)) process.kill(pid, 'SIGKILL');
  });
  return { child, exited, pids, output: () => output, urls };
}

test('launchd attributes the native Mach-O to the signed app and retries failures only', () => {
  const plist = launchAgent('/Applications/Fleet/Site Health & Tools.app', '/tmp/Site Health');
  assert.match(plist, /Site Health &amp; Tools.app\/Contents\/MacOS\/SiteHealthOwner/);
  assert.ok(plist.includes(`<key>AssociatedBundleIdentifiers</key><array><string>${bundleId}</string>`));
  assert.match(plist, /<key>SuccessfulExit<\/key><false\/>/);
  assert.match(plist, /<key>AbandonProcessGroup<\/key><false\/>/);
  assert.doesNotMatch(plist, /EnvironmentVariables|node|\.mjs/);
});

test('stop during an initial readiness probe does not start a service afterward', { timeout: 5_000 }, async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'site-health-stopping-'));
  const probe = createServer((req, res) => {
    child.kill('SIGTERM');
    setTimeout(() => { res.statusCode = 503; res.end(); }, 100);
  });
  probe.listen(0, '127.0.0.1');
  await once(probe, 'listening');
  t.after(() => new Promise((resolve) => probe.close(resolve)));
  const config = { repositoryRoot: root, backendUrl: `http://127.0.0.1:${probe.address().port}` };
  const child = spawn(process.execPath, ['--input-type=module', '-e', `import { startOwner } from ${JSON.stringify(new URL(`file://${entry}`).href)}; process.exitCode = await startOwner(${JSON.stringify(config)});`], { stdio: ['ignore', 'pipe', 'pipe'] });
  let error = '';
  child.stderr.on('data', (chunk) => { error += chunk; });
  t.after(() => { if (child.exitCode === null) child.kill('SIGKILL'); });
  assert.equal((await once(child, 'exit'))[0], 0);
  assert.equal(error, '');
});

test('host startup waits for backend and web, then termination removes owned process trees', { timeout: 12_000 }, async (t) => {
  const f = await fixture(t);
  await until(() => f.output().includes('owner ready.'), f.output);
  assert.equal(f.pids().length, 4);
  f.child.kill('SIGTERM');
  assert.equal((await f.exited)[0], 0);
  await until(() => f.pids().every((pid) => !alive(pid)), 'owned descendants survived owner termination');
});

test('a clean unexpected child exit fails the owner and tears down its peer', { timeout: 12_000 }, async (t) => {
  const f = await fixture(t, 'clean-exit');
  assert.equal((await f.exited)[0], 1);
  assert.match(f.output(), /backend exited \(0\)/);
  await until(() => f.pids().every((pid) => !alive(pid)), 'peer or descendants survived child failure');
});

test('dashboard-only startup never reports readiness and timeout tears down both trees', { timeout: 12_000 }, async (t) => {
  const f = await fixture(t, 'unready');
  assert.equal((await f.exited)[0], 1);
  assert.match(f.output(), /backend and dashboard did not become ready/);
  assert.doesNotMatch(f.output(), /owner ready\./);
  await until(() => f.pids().every((pid) => !alive(pid)), 'startup failure left descendants');
});

test('native host parents Node and forwards stop through both owned service trees', { timeout: 12_000, skip: !process.env.SITE_HEALTH_HOST_TEST_BINARY }, async (t) => {
  const f = await fixture(t, '', true);
  await until(() => f.output().includes('owner ready.'), f.output);
  f.child.kill('SIGTERM');
  assert.equal((await f.exited)[0], 0);
  await until(() => f.pids().every((pid) => !alive(pid)), 'native host stop left descendants');
});

test('native host fails a missing catalog without launching Node', { timeout: 5_000, skip: !process.env.SITE_HEALTH_HOST_TEST_BINARY }, async () => {
  const root = mkdtempSync(join(tmpdir(), 'site-health-access-'));
  const executable = nativeFixture(root, { nodePath: process.execPath, repositoryPath: root, ownerRepositoryPath: root, catalogPath: join(root, 'missing.json') });
  const child = spawn(executable, [], { stdio: ['ignore', 'pipe', 'pipe'] });
  let error = '';
  child.stderr.on('data', (chunk) => { error += chunk; });
  assert.equal((await once(child, 'exit'))[0], 1);
  assert.match(error, /cannot read its canonical catalog/);
});

test('actual Astro owner server remains foreground and stop releases its listening port', { timeout: 30_000, skip: !process.env.SITE_HEALTH_TEST_ASTRO }, async (t) => {
  const reservation = createServer();
  reservation.listen(0, '127.0.0.1');
  await once(reservation, 'listening');
  const port = reservation.address().port;
  await new Promise((resolve) => reservation.close(resolve));
  const child = spawn(process.execPath, [resolve(import.meta.dirname, '../../apps/web/scripts/owner-server.mjs'), String(port)], { stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  child.stderr.on('data', (chunk) => { output += chunk; });
  const exited = once(child, 'exit');
  t.after(async () => {
    if (child.exitCode === null) child.kill('SIGTERM');
    await Promise.race([exited, wait(4_000)]);
    if (child.exitCode === null) child.kill('SIGKILL');
  });
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    assert.equal(child.exitCode, null, output);
    try {
      const response = await fetch(`http://127.0.0.1:${port}/ai-awareness`, { signal: AbortSignal.timeout(1_000) });
      const html = await response.text();
      if (response.ok && html.includes('Site Health') && html.includes('data-brand-evidence-collect')) { ready = true; break; }
    } catch {}
    await wait(200);
  }
  assert.ok(ready, output);
  assert.equal(Number(execFileSync('/bin/ps', ['-o', 'ppid=', '-p', String(child.pid)], { encoding: 'utf8' }).trim()), process.pid);
  child.kill('SIGTERM');
  assert.equal((await exited)[0], 0, output);
  await assert.rejects(fetch(`http://127.0.0.1:${port}/ai-awareness`, { signal: AbortSignal.timeout(1_000) }));
});

test('host reuses both external services without exiting or killing them on stop', { timeout: 12_000 }, async (t) => {
  const servers = [];
  const ports = [];
  for (const backend of [true, false]) {
    const server = createServer((req, res) => res.end(backend
      ? JSON.stringify({ service: 'site-health-backend', brandEvidence: 'native-v2' })
      : 'Site Health data-brand-evidence-collect'));
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    servers.push(server);
    ports.push(server.address().port);
    t.after(() => new Promise((resolve) => server.close(resolve)));
  }
  const config = { backendUrl: `http://127.0.0.1:${ports[0]}`, webUrl: `http://127.0.0.1:${ports[1]}` };
  const child = spawn(process.execPath, ['--input-type=module', '-e', `import { startOwner } from ${JSON.stringify(new URL(`file://${entry}`).href)}; process.exitCode = await startOwner(${JSON.stringify(config)});`], { env: { ...process.env, SITE_HEALTH_OWNER_HOST: '1' }, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  child.stdout.on('data', (chunk) => { output += chunk; });
  const exited = once(child, 'exit');
  t.after(() => { if (child.exitCode === null) child.kill('SIGTERM'); });
  await until(() => output.includes('owner ready.'), output);
  await wait(300);
  assert.equal(child.exitCode, null);
  child.kill('SIGTERM');
  assert.equal((await exited)[0], 0);
  assert.ok(servers.every((server) => server.listening));
});
