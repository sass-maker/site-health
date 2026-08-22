#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const repositoryRoot = resolve(import.meta.dirname, '..');
const workspaceRoot = resolve(repositoryRoot, '..');
const required = [
  ['Drank', resolve(workspaceRoot, 'drank/scripts/update-global-dr.mjs')],
  ['PSI Swarm', resolve(workspaceRoot, 'psi-swarm/cli/dist/cli.js')],
  ['Fleet skills', resolve(workspaceRoot, 'saas-maker/tooling/skills/site-health/SKILL.md')],
];

console.log('Site Health owner dashboard');
for (const [label, path] of required) {
  console.log(`  ${existsSync(path) ? 'ready' : 'missing'}  ${label}`);
}
console.log('  automatic  free Google Search startup refresh');
console.log('  approval required  paid AI refresh');
console.log('  cached evidence remains available if any provider is unavailable');

async function healthyBackend() {
  try {
    const response = await fetch('http://127.0.0.1:4187/health', { signal: AbortSignal.timeout(1_500) });
    const body = await response.json();
    return response.ok && body.service === 'site-health-backend';
  } catch {
    return false;
  }
}

async function healthyWeb() {
  try {
    const response = await fetch('http://127.0.0.1:4321/', { signal: AbortSignal.timeout(1_500) });
    const body = (await response.text()).slice(0, 20_000);
    return response.ok && body.includes('dashboard-api-base') && body.includes('Site Health');
  } catch {
    return false;
  }
}

async function requestPrefill() {
  const response = await fetch('http://127.0.0.1:4187/v1/prefill', {
    method: 'POST',
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: '{}',
    signal: AbortSignal.timeout(5_000),
  });
  if (!response.ok) throw new Error(`Site Health prefill request failed with HTTP ${response.status}`);
  const payload = await response.json();
  console.log(`  prefill  ${payload.sources.map((item) => `${item.family}=${item.action}`).join(', ')}`);
}

const backendReady = await healthyBackend();
const webReady = await healthyWeb();
const children = [];
if (!backendReady) children.push(spawn(process.execPath, ['apps/backend/scripts/server.mjs', 'serve'], {
    cwd: repositoryRoot,
    env: process.env,
    stdio: 'inherit',
}));
else {
  console.log('  reused  healthy backend on http://127.0.0.1:4187');
  await requestPrefill();
}
if (!webReady) children.push(spawn('pnpm', ['--dir', 'apps/web', 'dev'], {
    cwd: repositoryRoot,
    env: process.env,
    stdio: 'inherit',
    shell: false,
  }));
else console.log('  reused  healthy dashboard on http://127.0.0.1:4321');
console.log('Open http://127.0.0.1:4321');

if (children.length === 0) process.exit(0);

let closing = false;
function close(code = 0) {
  if (closing) return;
  closing = true;
  for (const child of children) {
    if (!child.killed) child.kill('SIGTERM');
  }
  process.exitCode = code;
}

for (const child of children) {
  child.once('error', (error) => {
    console.error(error.message);
    close(1);
  });
  child.once('exit', (code, signal) => {
    if (!closing && code !== 0) {
      console.error(`Site Health process exited (${signal ?? code}).`);
      close(code ?? 1);
    }
  });
}
process.on('SIGINT', () => close(0));
process.on('SIGTERM', () => close(0));
