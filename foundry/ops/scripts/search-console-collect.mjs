#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { collectSearchConsoleOutcomes } from '../lib/search-console.mjs';
import {
  appendVisibilityOutcomeBundle,
  defaultVisibilityOutcomePath,
} from '../lib/visibility-outcome-store.mjs';
import { visibilityProjects } from '../lib/visibility-projects.mjs';

const FLEET_ROOT = resolve(import.meta.dirname, '../../..');
const catalog = JSON.parse(readFileSync(resolve(FLEET_ROOT, 'foundry/ops/config/projects.json'), 'utf8'));
const config = JSON.parse(readFileSync(resolve(FLEET_ROOT, 'foundry/ops/config/search-console.json'), 'utf8'));

function parseArgs(args) {
  const options = { projectId: null, ledgerPath: null };
  for (let index = 0; index < args.length; index += 1) {
    const flag = args[index];
    const value = args[index + 1];
    if (!value || value.startsWith('--')) throw new Error(`Missing value for ${flag ?? 'argument'}`);
    if (flag === '--project') options.projectId = value;
    else if (flag === '--ledger') options.ledgerPath = resolve(value);
    else throw new Error(`Unknown option: ${flag}`);
    index += 1;
  }
  return options;
}

function accessToken() {
  const result = spawnSync(
    'gcloud',
    ['auth', 'application-default', 'print-access-token'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  if (result.status !== 0 || !result.stdout.trim()) {
    throw new Error('Google Application Default Credentials are unavailable');
  }
  return result.stdout.trim();
}

const options = parseArgs(process.argv.slice(2));
const eligible = visibilityProjects(catalog);
const projects = options.projectId
  ? eligible.filter((project) => project.id === options.projectId)
  : eligible;
if (projects.length === 0) throw new Error(`Unknown Search Console project: ${options.projectId}`);

const collected = await collectSearchConsoleOutcomes({
  projects,
  accessToken: accessToken(),
  quotaProject: config.quotaProject,
  reportingWindowDays: config.reportingWindowDays,
  reportingLagDays: config.reportingLagDays,
  searchTermLimit: config.searchTermLimit,
});
if (collected.bundle.observations.length === 0) {
  throw new Error('No accessible Search Console properties matched Fleet projects');
}
const ledgerPath = options.ledgerPath ?? defaultVisibilityOutcomePath();
const receipt = appendVisibilityOutcomeBundle(collected.bundle, {
  path: ledgerPath,
  allowedProjectIds: new Set(eligible.map((project) => project.id)),
});

process.stdout.write(`${JSON.stringify({
  schema: 'fleet.search-console-collection-receipt.v1',
  period: collected.period,
  accessibleProperties: collected.propertyCount,
  measuredProjects: collected.bundle.observations.length,
  unavailable: collected.unavailable,
  recorded: receipt.recorded,
  duplicates: receipt.duplicates,
}, null, 2)}\n`);
