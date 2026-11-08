#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { acquireIndexCoverageLock, defaultIndexCoveragePath, readIndexCoverage, saveIndexCoverage } from '../lib/search-index-coverage.mjs';
import { collectIndexFollowups, registerIndexFollowup } from '../lib/search-index-followups.mjs';
import { inspectSearchConsoleUrl } from '../lib/search-console.mjs';

const repository = resolve(import.meta.dirname, '../../..');
const options = { output: defaultIndexCoveragePath(), catalog: resolve(repository, 'apps/backend/config/projects.json'), maxInspections: 100 };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i];
  if (flag === '--due') { options.due = true; continue; }
  if (!['--output', '--catalog', '--register', '--max-inspections'].includes(flag)) throw new Error('Use --due or --register baseline.json [--catalog catalog.json] [--output checkpoint.json] [--max-inspections 0..200]');
  const value = process.argv[++i];
  if (!value || value.startsWith('--')) throw new Error(`Missing value: ${flag}`);
  if (flag === '--max-inspections') options.maxInspections = Number(value);
  else options[flag.slice(2)] = resolve(value);
}
if (Boolean(options.register) === Boolean(options.due)) throw new Error('Choose exactly one of --register or --due');
if (!Number.isInteger(options.maxInspections) || options.maxInspections < 0 || options.maxInspections > 200) throw new Error('Inspection budget must be 0-200');
const controller = new AbortController();
let interrupted;
const release = acquireIndexCoverageLock(options.output, { onInterrupt: signal => { interrupted = signal; controller.abort(); } });
try {
  const previous = readIndexCoverage({ path: options.output });
  if (!previous) throw new Error('Retain a valid coverage checkpoint before registering or reviewing follow-ups');
  const catalog = JSON.parse(readFileSync(options.catalog, 'utf8'));
  if (options.register) {
    const input = JSON.parse(readFileSync(options.register, 'utf8'));
    const artifact = registerIndexFollowup(previous, input, { catalog });
    saveIndexCoverage(options.output, artifact);
    console.log(JSON.stringify({ registered: input.id, requests: 0 }));
  } else {
    let authorization;
    const inspect = async request => {
      if (!authorization) {
        const config = JSON.parse(readFileSync(resolve(repository, 'apps/backend/config/search-console.json'), 'utf8'));
        const auth = spawnSync('gcloud', ['auth', 'application-default', 'print-access-token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], timeout: 30000 });
        if (auth.status !== 0 || !auth.stdout.trim()) throw Object.assign(new Error('Existing Google authorization unavailable'),{code:'GOOGLE_AUTH_UNAVAILABLE'});
        authorization = { accessToken: auth.stdout.trim(), quotaProject: config.quotaProject };
      }
      return inspectSearchConsoleUrl({ ...request, ...authorization, maxAttempts: 1,
        fetchImpl: (url, init) => fetch(url, { ...init, signal: AbortSignal.any([controller.signal, ...(init.signal ? [init.signal] : [])]) }) });
    };
    const result = await collectIndexFollowups({ previous, catalog, inspect, maxInspections: options.maxInspections, signal: controller.signal,
      onProgress: artifact => saveIndexCoverage(options.output, artifact) });
    console.log(JSON.stringify({ requests: result.requests, cohorts: (result.artifact.followups ?? []).map(row => ({ id: row.id, rounds: row.rounds.map(({days,status,dueAt}) => ({days,status,dueAt})) })) }));
    if ((result.artifact.followups ?? []).some(row => row.rounds.some(round => ['failed', 'retrying', 'scope-changed', 'missed'].includes(round.status)))) process.exitCode = 1;
  }
} finally { release(); if (interrupted) process.exitCode = interrupted === 'SIGINT' ? 130 : 143; }
