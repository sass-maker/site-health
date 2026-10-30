#!/usr/bin/env node
import { randomUUID } from 'node:crypto';
import { spawn, execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { withRefreshReceipt } from '../lib/dashboard-backend/evidence-freshness.mjs';
import { loadDashboardProjects } from '../lib/dashboard-backend/registry.mjs';
import { DashboardStore, defaultDatabasePath } from '../lib/dashboard-backend/store.mjs';
import { PERFORMANCE_TARGET } from '../lib/dashboard-backend/performance-policy.mjs';
import { PSI_NODE_VERSION } from '../lib/dashboard-backend/psi-runtime.mjs';
import { resolveCollectorRoot } from '../lib/dashboard-backend/collector-paths.mjs';

export function resolveFleetRoot(directory = import.meta.dirname, ownerRepository = process.env.SITE_HEALTH_OWNER_REPOSITORY) {
  return ownerRepository ? resolve(ownerRepository, '..') : resolve(directory, '../../../..');
}

const FLEET_ROOT = resolveFleetRoot();
const PROJECT_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function parseTargets(args) {
  const targets = args.flatMap((value, index) => {
    if (value !== '--target' || !args[index + 1]) return [];
    const separator = args[index + 1].indexOf('=');
    if (separator <= 0) throw new Error('--target must use project-id=https://domain');
    const projectId = args[index + 1].slice(0, separator);
    const url = new URL(args[index + 1].slice(separator + 1));
    if (!PROJECT_ID_PATTERN.test(projectId) || url.protocol !== 'https:') {
      throw new Error('--target must use a canonical project id and HTTPS URL');
    }
    return [{ projectId, url: url.toString() }];
  });
  if (targets.length === 0) throw new Error('at least one --target is required');
  if (new Set(targets.map((target) => target.projectId)).size !== targets.length) {
    throw new Error('portfolio targets must use unique project ids');
  }
  return targets;
}

export function completeSwarmSamples(tag, home = homedir()) {
  const database = resolve(home, '.psi-swarm/history.db');
  if (!existsSync(database)) return false;
  try {
    const rows = JSON.parse(execFileSync('sqlite3', ['-json', database,
      `SELECT preset, COUNT(*) AS count FROM runs WHERE tag = '${tag.replaceAll("'", "''")}' AND error IS NULL AND performance_score BETWEEN 0 AND 100 AND lcp >= 0 GROUP BY preset`],
      { encoding: 'utf8', timeout: 4000 }));
    return PERFORMANCE_TARGET.presets.every(preset => (rows.find(row => row.preset === preset)?.count ?? 0) >= PERFORMANCE_TARGET.samplesPerPreset);
  } catch { return false; }
}

export function runSwarmProcess(command, args, { timeout, signal, ...options }) {
  return new Promise(resolveRun => {
    const child = spawn(command, args, { ...options, detached: process.platform !== 'win32', stdio: ['ignore', 'pipe', 'pipe'] });
    let cancellation = null;
    let forceTimer;
    const cancel = reason => {
      if (cancellation) return;
      cancellation = reason;
      // Chrome Launcher owns detached browser groups and cleans them on SIGINT.
      try { if (process.platform === 'win32') child.kill('SIGINT'); else process.kill(-child.pid, 'SIGINT'); } catch {}
      forceTimer = setTimeout(() => { try { if (process.platform === 'win32') child.kill('SIGKILL'); else process.kill(-child.pid, 'SIGKILL'); } catch {} }, 15_000);
    };
    const timer = setTimeout(() => cancel('timed out'), timeout);
    const abort = () => cancel('interrupted');
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) abort();
    const cleanup = () => { clearTimeout(timer); clearTimeout(forceTimer); signal?.removeEventListener('abort', abort); };
    let stdout = '', stderr = '';
    child.stdout.on('data', chunk => { stdout = `${stdout}${chunk}`.slice(-8 * 1024 * 1024); });
    child.stderr.on('data', chunk => { stderr = `${stderr}${chunk}`.slice(-8 * 1024 * 1024); });
    child.once('error', error => { cleanup(); resolveRun({ status: null, stderr: error.message }); });
    child.once('close', status => { cleanup(); resolveRun({ status: cancellation && status === 0 ? 1 : status, stdout, stderr: cancellation ? `Performance target ${cancellation}; last complete readings retained` : stderr }); });
  });
}

export async function runPerformancePortfolio(
  targets,
  {
    workspaceRoot = FLEET_ROOT,
    projects,
    cwd = resolveCollectorRoot(workspaceRoot, 'psi-swarm', projects),
    cliPath = resolve(cwd, 'cli/dist/cli.js'),
    run = runSwarmProcess,
    log = console.log,
    verifySamples = completeSwarmSamples,
    now = Date.now,
    signal,
  } = {},
) {
  if (!existsSync(cliPath) && run === runSwarmProcess) {
    throw new Error('PSI Swarm CLI is not built');
  }
  const failed = [];
  const deadline = now() + PERFORMANCE_TARGET.portfolioTimeoutMs;
  let next = 0;
  let checked = 0;
  const workers = Array.from({ length: Math.min(PERFORMANCE_TARGET.concurrentTargets, targets.length) }, async () => {
    while (next < targets.length) {
      if (signal?.aborted) throw new Error('Performance measurement interrupted; previous readings retained');
      const index = next++;
      const target = targets[index];
      log(`Measuring ${target.projectId}`);
      const remainingMs = deadline - now();
      if (remainingMs <= 0) { failed.push(target.projectId); log(`Checked ${++checked}/${targets.length} ${target.projectId} failed`); continue; }
      const tag = `console-portfolio-${randomUUID()}`;
      const result = await run('mise', [
        'exec',
        `node@${PSI_NODE_VERSION}`,
        '--',
        'node',
        cliPath,
        'run',
        target.url,
        '--runs',
        String(PERFORMANCE_TARGET.samplesPerPreset),
        '--parallel',
        String(PERFORMANCE_TARGET.parallel),
        '--presets',
        PERFORMANCE_TARGET.presets.join(','),
        '--tag',
        tag,
        '--output',
        'html',
        '--no-suggest',
        '--no-crux',
        '--no-ahrefs',
      ], {
        cwd,
        encoding: 'utf8',
        maxBuffer: 8 * 1024 * 1024,
        shell: false,
        timeout: Math.min(PERFORMANCE_TARGET.targetTimeoutMs, remainingMs),
        signal,
      });
      if (signal?.aborted) throw new Error('Performance measurement interrupted; previous readings retained');
      const complete = result.status === 0 && verifySamples(tag);
      if (!complete) {
        failed.push(target.projectId);
        const detail = String(result.status === 0 ? 'Incomplete desktop/mobile cohort; successful samples retained' : result.stderr || result.stdout || 'PSI run failed').trim().split(/\r?\n/).at(-1);
        log(`${target.projectId}: ${detail}`);
      }
      log(`Checked ${++checked}/${targets.length} ${target.projectId} ${complete ? 'ok' : 'failed'}`);
    }
  });
  await Promise.all(workers);
  return { completed: targets.length - failed.length, failed };
}

if (resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  const cancellation = new AbortController();
  const stop = () => cancellation.abort();
  const stopSignals = ['SIGINT', 'SIGTERM', 'SIGHUP'];
  for (const signal of stopSignals) process.on(signal, stop);
  // The runner owns its own refresh receipt so the receipt reaches a terminal
  // state in the process that does the work — a crash records `failed` rather
  // than leaving `running` for a supervisor that may not outlive the run.
  const store = new DashboardStore({
    databasePath: process.env.DASHBOARD_DB || process.env.FOUNDER_CONTROL_DB || defaultDatabasePath(),
    projects: loadDashboardProjects(),
  });
  try {
    const targets = parseTargets(process.argv.slice(2));
    await withRefreshReceipt(
      store,
      {
        family: 'psi',
        scope: 'portfolio',
        projectId: null,
        runId: `psi_${randomUUID().replaceAll('-', '')}`,
        label: 'Portfolio PSI',
      },
      async () => {
        const result = await runPerformancePortfolio(targets, { signal: cancellation.signal });
        console.log(`Completed ${result.completed}/${targets.length} performance targets.`);
        if (result.failed.length > 0) {
          throw Object.assign(
            new Error(`${result.failed.length} performance target(s) failed: ${result.failed.join(', ')}`),
            { code: 'PSI_TARGETS_FAILED' },
          );
        }
        return result;
      },
      // Await owned-browser cleanup before the receipt is settled and the
      // process exits; the generic receipt handler exits synchronously.
      { signals: [], summarize: (result) => ({ resultCount: result.completed }) },
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  } finally {
    for (const signal of stopSignals) process.off(signal, stop);
    store.close();
  }
}
