#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function startOwner({
  repositoryRoot = resolve(import.meta.dirname, '..'),
  env = process.env,
  backendUrl = 'http://127.0.0.1:4187',
  webUrl = 'http://127.0.0.1:4321',
  startupTimeout = 60_000,
  healthInterval = 5_000,
} = {}) {
  const workspaceRoot = resolve(env.SITE_HEALTH_OWNER_REPOSITORY ?? repositoryRoot, '..');
  console.log('Site Health owner dashboard');
  for (const [label, path] of [
    ['Drank', resolve(workspaceRoot, 'drank/scripts/update-global-dr.mjs')],
    ['PSI Swarm', resolve(workspaceRoot, 'psi-swarm/cli/dist/cli.js')],
    ['Fleet skills', resolve(workspaceRoot, 'saas-maker/tooling/skills/site-health/SKILL.md')],
  ]) console.log(`  ${existsSync(path) ? 'ready' : 'missing'}  ${label}`);

  async function healthy(url, backend) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1_500) });
      if (!response.ok) return false;
      if (backend) {
        const body = await response.json();
        return body.service === 'site-health-backend' && body.brandEvidence === 'native-v2';
      }
      const body = (await response.text()).slice(0, 1_000_000);
      return body.includes('data-brand-evidence-collect') && body.includes('Site Health');
    } catch { return false; }
  }

  const services = [
    { name: 'backend', url: `${backendUrl}/health`, command: process.execPath, args: ['apps/backend/scripts/server.mjs', 'serve'] },
    { name: 'dashboard', url: `${webUrl}/ai-awareness`, command: process.execPath, args: ['apps/web/scripts/owner-server.mjs', new URL(webUrl).port || '4321'] },
  ];
  const children = [];
  let closing = false;
  let finish;
  const finished = new Promise((resolve) => { finish = resolve; });
  let stopTimer;
  let monitor;
  function signalChild(child, signal) {
    if (!child.pid) return;
    try { child.kill(signal); } catch (error) {
      if (error.code !== 'ESRCH') console.error(error.message);
    }
  }
  function close(code = 0) {
    if (closing) return;
    closing = true;
    clearInterval(monitor);
    for (const child of children) signalChild(child, 'SIGTERM');
    stopTimer = setTimeout(() => {
      for (const child of children) signalChild(child, 'SIGKILL');
      finish(code);
    }, 3_000);
    if (children.every((child) => child.exitCode !== null || child.signalCode !== null)) {
      clearTimeout(stopTimer);
      finish(code);
    }
  }
  const onSignal = () => close(0);
  process.on('SIGINT', onSignal);
  process.on('SIGTERM', onSignal);
  try {
    for (const service of services) {
      const ready = await healthy(service.url, service.name === 'backend');
      if (closing) break;
      if (ready) {
        console.log(`  reused  healthy ${service.name}`);
        if (service.name === 'backend' && env.SITE_HEALTH_OWNER_HOST !== '1') {
          const response = await fetch(`${backendUrl}/v1/prefill`, {
            method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}',
            signal: AbortSignal.timeout(5_000),
          });
          if (!response.ok) throw new Error(`Site Health prefill request failed with HTTP ${response.status}`);
        }
      } else {
        const child = spawn(service.command, service.args, {
          cwd: repositoryRoot, env, stdio: 'inherit',
        });
        children.push(child);
        child.once('error', (error) => { console.error(error.message); close(1); });
        child.once('exit', (code, signal) => {
          if (!closing) {
            console.error(`Site Health ${service.name} exited (${signal ?? code}).`);
            close(1);
          }
        });
      }
      if (closing) break;
    }
    if (closing) return await finished;
    if (children.length === 0 && env.SITE_HEALTH_OWNER_HOST !== '1') return 0;
    const deadline = Date.now() + startupTimeout;
    while (!closing) {
      const ready = await Promise.all(services.map((service) => healthy(service.url, service.name === 'backend')));
      if (ready.every(Boolean)) break;
      if (Date.now() >= deadline) { console.error('Site Health backend and dashboard did not become ready.'); close(1); break; }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (!closing) {
      console.log(`Site Health owner ready. Open ${webUrl}/ai-awareness`);
      let checking = false;
      let misses = 0;
      monitor = setInterval(async () => {
        if (checking || closing) return;
        checking = true;
        const ready = await Promise.all(services.map((service) => healthy(service.url, service.name === 'backend')));
        checking = false;
        misses = ready.every(Boolean) ? 0 : misses + 1;
        if (!closing && misses >= 3) { console.error('Site Health service became unavailable after three consecutive probes.'); close(1); }
      }, healthInterval);
    }
    return await finished;
  } catch (error) {
    console.error(error.message);
    close(1);
    return await finished;
  } finally {
    process.off('SIGINT', onSignal);
    process.off('SIGTERM', onSignal);
    clearInterval(monitor);
    clearTimeout(stopTimer);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  process.exitCode = await startOwner();
}
