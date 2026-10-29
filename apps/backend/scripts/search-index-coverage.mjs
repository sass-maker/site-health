#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { acquireIndexCoverageLock, collectIndexCoverage, defaultIndexCoveragePath, importGoogleIndexingReports, readIndexCoverage, saveIndexCoverage, summarizeIndexCoverage } from '../lib/search-index-coverage.mjs';

const repository = resolve(import.meta.dirname, '../../..');
const options = { registry: resolve(repository, 'apps/backend/config/projects.json'), output: defaultIndexCoveragePath(), maxInspections: 0, inventoryOnly: false };
for (let i = 2; i < process.argv.length; i++) {
  const flag = process.argv[i];
  if (flag === '--import-only') { options.importOnly = true; continue; }
  if (flag === '--inventory-only') { options.inventoryOnly = true; continue; }
  if (flag === '--help') {
    console.log('search-index-coverage.mjs [--registry operations.json] [--catalog projects.json] [--output private.json] [--project id] [--inventory-only] [--max-inspections 0..2000] [--properties accessible-properties.json] [--reports reports.json --import-only] [--replace-cohort projectId]');
    console.log('Coverage inspections use a local 1800-request/property/day budget (Pacific time), leaving headroom within Google quota for other collectors.');
    process.exit(0);
  }
  const value = process.argv[++i];
  if (!value || value.startsWith('--')) throw new Error(`Missing value: ${flag}`);
  if (flag === '--registry') options.registry = resolve(value);
  else if (flag === '--catalog') options.catalog = resolve(value);
  else if (flag === '--output') options.output = resolve(value);
  else if (flag === '--project') options.projectId = value;
  else if (flag === '--max-inspections') options.maxInspections = Number(value);
  else if (flag === '--reports') options.reportsPath = resolve(value);
  else if (flag === '--replace-cohort') options.replaceCohortProjectId = value;
  else if (flag === '--properties') options.propertiesPath = resolve(value);
  else throw new Error(`Unknown option: ${flag}`);
}
if (options.replaceCohortProjectId && !options.importOnly) throw new Error('--replace-cohort requires --import-only');
if (options.replaceCohortProjectId && options.projectId && options.replaceCohortProjectId !== options.projectId) throw new Error('--replace-cohort must match --project');
if (options.importOnly && !options.reportsPath) throw new Error('--import-only requires --reports');
if (!options.inventoryOnly && !options.importOnly && !(options.maxInspections > 0)) throw new Error('Inspection requires explicit --max-inspections (or use --inventory-only)');
const catalog = JSON.parse(readFileSync(options.catalog ?? options.registry, 'utf8'));
let token;
let properties = [];
let quotaProject;
if (!options.inventoryOnly && !options.importOnly) {
  const config = JSON.parse(readFileSync(resolve(repository, 'apps/backend/config/search-console.json'), 'utf8'));
  quotaProject = config.quotaProject;
  const auth = spawnSync('gcloud', ['auth', 'application-default', 'print-access-token'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  if (auth.status !== 0 || !auth.stdout.trim()) throw new Error('Google Application Default Credentials are unavailable');
  token = auth.stdout.trim();
  if (options.propertiesPath) {
    const supplied = JSON.parse(readFileSync(options.propertiesPath, 'utf8'));
    properties = Array.isArray(supplied) ? supplied : supplied.siteEntry ?? supplied.properties ?? [];
  } else {
    const response = await fetch('https://www.googleapis.com/webmasters/v3/sites', { headers: { authorization: `Bearer ${token}`, 'x-goog-user-project': quotaProject }, signal: AbortSignal.timeout(20000) });
    if (!response.ok) throw new Error(`Google property discovery failed (${response.status})`);
    properties = (await response.json()).siteEntry ?? [];
  }
}
const controller = new AbortController();
let latestArtifact = null;
let interruptedSignal = null;
const releaseLock = acquireIndexCoverageLock(options.output, { onInterrupt: signal => {
  interruptedSignal = signal;
  controller.abort(new Error(`Collection interrupted by ${signal}`));
  if (latestArtifact) saveIndexCoverage(options.output, latestArtifact);
} });
try {
  let previous = readIndexCoverage({ path: options.output });
  if (existsSync(options.output) && !previous) throw new Error('Existing checkpoint is unreadable or has an unsupported schema; preserve and inspect it before collecting');
  latestArtifact = previous;
  if (options.reportsPath) previous = importGoogleIndexingReports({ catalog, previous, projectId: options.projectId, replaceCohortProjectId: options.replaceCohortProjectId, reports: JSON.parse(readFileSync(options.reportsPath, 'utf8')) });
  const result = options.importOnly ? previous : await collectIndexCoverage({ ...options, catalog, properties, accessToken: token, quotaProject,
    previous, signal: controller.signal,
    sitemapOverrides: catalog.systems?.searchConsole?.sitemapOverrides ?? {},
    onProgress: artifact => { latestArtifact = artifact; saveIndexCoverage(options.output, artifact); } });
  saveIndexCoverage(options.output, result);
  console.log(JSON.stringify({ output: options.output, interrupted: interruptedSignal, budgetPolicy: result.budgetPolicy, records: result.records.map(record => ({ projectId: record.projectId, ...summarizeIndexCoverage(record) })) }, null, 2));
} finally { releaseLock(); if (interruptedSignal) process.exitCode = interruptedSignal === 'SIGINT' ? 130 : 143; }
