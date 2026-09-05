#!/usr/bin/env node
import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  clarityCapabilityProjection,
  clarityEligibility,
  claritySnapshotKey,
  fetchClaritySnapshot,
  loadClarityRegistry,
  promptAndStoreClarityToken,
  readClarityProjection,
  recordClarityProviderAudit,
  resolveClarityToken,
} from '../lib/dashboard-backend/clarity.mjs';
import { isCurrentPortfolioProject } from '../lib/dashboard-backend/domain-scope.mjs';
import { recordRefreshReceipt } from '../lib/dashboard-backend/evidence-freshness.mjs';
import { loadDashboardProjects } from '../lib/dashboard-backend/registry.mjs';
import { DashboardStore, defaultDatabasePath } from '../lib/dashboard-backend/store.mjs';

function usage() {
  console.log(`Site Health Clarity collector

Usage:
  clarity-collect.mjs status <project-id>
  clarity-collect.mjs fetch <project-id> [--days 1|2|3]
  clarity-collect.mjs status-all
  clarity-collect.mjs fetch-all [--days 1|2|3] [--reuse-fresh <project-id>]
  clarity-collect.mjs token-store <project-id>
  clarity-collect.mjs provider-audit <project-id> < receipt.json

Tokens are read from CLARITY_API_TOKEN_<PROJECT_ID> or the macOS Keychain
service com.sassmaker.site-health.clarity. token-store uses a native hidden
Keychain prompt and never accepts a token argument, pipe, or environment value.`);
}

function fail(code, message) {
  throw Object.assign(new Error(message), { code });
}

function projectState(project, eligibility) {
  if (!project) return 'not-cataloged';
  if (!isCurrentPortfolioProject(project)) return 'inactive';
  return eligibility.eligible ? 'eligible' : 'unwired';
}

function sanitizedFailure(error) {
  const messages = {
    CLARITY_TOKEN_REQUIRED: 'No Clarity Data Export token is configured.',
    CLARITY_UNAUTHORIZED: 'Clarity rejected the configured Data Export token.',
    CLARITY_RATE_LIMITED: 'Clarity reached its project export limit.',
    CLARITY_PROVIDER_UNAVAILABLE: 'Clarity could not be reached.',
    CLARITY_PROVIDER_TIMEOUT: 'Clarity did not respond before the bounded timeout.',
    CLARITY_PROVIDER_ERROR: 'Clarity could not provide project traffic evidence.',
    CLARITY_RESPONSE_INVALID: 'Clarity returned an invalid export.',
  };
  const code = messages[error?.code] ? error.code : 'CLARITY_REFRESH_FAILED';
  return { code, message: messages[code] ?? 'Clarity refresh failed.' };
}

async function collectProject({
  projectId,
  days,
  store,
  tokenResolver,
  snapshotFetcher,
  now,
}) {
  const startedAt = now();
  const run = {
    family: 'clarity',
    scope: 'project',
    projectId,
    runId: `clarity_${randomUUID().replaceAll('-', '')}`,
    label: 'Microsoft Clarity',
    state: 'running',
    startedAt,
    finishedAt: null,
    summary: 'Microsoft Clarity is running.',
  };
  recordRefreshReceipt(store, run);
  try {
    const token = tokenResolver(projectId);
    if (!token) fail('CLARITY_TOKEN_REQUIRED', 'No Clarity Data Export token is configured');
    const snapshot = await snapshotFetcher({ token, projectId, days });
    store.setMetadata(claritySnapshotKey(projectId), snapshot, { now: snapshot.observedAt });
    recordRefreshReceipt(store, {
      ...run,
      state: 'succeeded',
      finishedAt: snapshot.observedAt,
      summary: 'Microsoft Clarity completed.',
    });
    return snapshot;
  } catch (error) {
    const failure = sanitizedFailure(error);
    recordRefreshReceipt(store, {
      ...run,
      state: failure.code === 'CLARITY_TOKEN_REQUIRED' ? 'unavailable' : 'failed',
      finishedAt: now(),
      code: failure.code,
      summary: failure.message,
    });
    throw Object.assign(new Error(failure.message), failure);
  }
}

function capabilitySummary(results) {
  return results.reduce((totals, result) => {
    for (const key of [
      'desired',
      'conditional',
      'blocked',
      'notApplicable',
      'providerVerified',
      'providerAccounted',
    ]) {
      totals[key] += Number(result.capabilities?.summary?.[key] ?? 0);
    }
    return totals;
  }, {
    desired: 0,
    conditional: 0,
    blocked: 0,
    notApplicable: 0,
    providerVerified: 0,
    providerAccounted: 0,
  });
}

function fleetSummary(results) {
  const counts = {};
  for (const result of results) counts[result.state] = (counts[result.state] ?? 0) + 1;
  const activeEligible = results.filter(
    (result) => !['inactive', 'not-cataloged', 'unwired'].includes(result.state),
  );
  return {
    schemaVersion: 'site-health.clarity-fleet-collection.v1',
    projects: results.length,
    counts,
    capabilityCounts: capabilitySummary(results),
    activeEligibleCapabilityCounts: capabilitySummary(activeEligible),
    results,
  };
}

async function runFleetCollector({
  command,
  days,
  projects,
  registry,
  store,
  tokenResolver,
  snapshotFetcher,
  now,
  reuseProjectIds = [],
}) {
  const projectsById = new Map(projects.map((project) => [project.id, project]));
  const reusableProjects = new Map();
  for (const projectId of reuseProjectIds) {
    const project = projectsById.get(projectId);
    const eligibility = clarityEligibility(projectId, registry);
    const projection = readClarityProjection(store, projectId, registry, { now: now() });
    if (
      projectState(project, eligibility) !== 'eligible'
      || projection.state !== 'fresh'
      || Number(projection.snapshot?.period?.days) !== Number(days)
    ) {
      fail(
        'CLARITY_REUSE_INVALID',
        `A same-range fresh Clarity snapshot is required before reusing ${projectId}`,
      );
    }
    reusableProjects.set(projectId, projection);
  }
  const results = [];
  for (const projectId of new Set([...registry.keys(), ...projectsById.keys()])) {
    const project = projectsById.get(projectId);
    const eligibility = clarityEligibility(projectId, registry);
    const candidateState = projectState(project, eligibility);
    if (command === 'status-all') {
      const projection = readClarityProjection(store, projectId, registry, { now: now() });
      results.push({
        projectId,
        state: ['not-cataloged', 'inactive', 'unwired'].includes(candidateState)
          ? candidateState
          : projection.state,
        eligibility,
        capabilities: projection.capabilities,
        snapshot: projection.snapshot,
        lastAttemptAt: projection.lastAttemptAt,
        failure: projection.failure,
      });
      continue;
    }
    if (candidateState !== 'eligible') {
      const projection = readClarityProjection(store, projectId, registry, { now: now() });
      results.push({
        projectId,
        state: candidateState,
        eligibility,
        capabilities: projection.capabilities,
      });
      continue;
    }
    if (reusableProjects.has(projectId)) {
      const projection = reusableProjects.get(projectId);
      results.push({
        projectId,
        state: 'measured',
        eligibility,
        capabilities: projection.capabilities,
        observedAt: projection.snapshot.observedAt,
        metrics: projection.snapshot.metrics,
        reusedFreshSnapshot: true,
      });
      continue;
    }
    try {
      const snapshot = await collectProject({
        projectId,
        days,
        store,
        tokenResolver,
        snapshotFetcher,
        now,
      });
      results.push({
        projectId,
        state: 'measured',
        eligibility,
        capabilities: readClarityProjection(store, projectId, registry, { now: now() }).capabilities,
        observedAt: snapshot.observedAt,
        metrics: snapshot.metrics,
      });
    } catch (error) {
      const failure = sanitizedFailure(error);
      results.push({
        projectId,
        state: failure.code === 'CLARITY_TOKEN_REQUIRED' ? 'unavailable' : 'failed',
        eligibility,
        capabilities: readClarityProjection(store, projectId, registry, { now: now() }).capabilities,
        failure,
      });
    }
  }
  return fleetSummary(results);
}

export async function runClarityCollector({
  command,
  projectId,
  days = 1,
  projects = loadDashboardProjects(),
  registry = loadClarityRegistry(),
  store,
  tokenResolver = resolveClarityToken,
  snapshotFetcher = fetchClaritySnapshot,
  now = () => new Date().toISOString(),
  reuseProjectIds = [],
} = {}) {
  if (['status-all', 'fetch-all'].includes(command)) {
    return runFleetCollector({
      command,
      days,
      projects,
      registry,
      store,
      tokenResolver,
      snapshotFetcher,
      now,
      reuseProjectIds,
    });
  }
  const project = projects.find((item) => item.id === projectId);
  if (!project) fail('CLARITY_PROJECT_INVALID', 'Unknown Site Health project');
  const eligibility = clarityEligibility(projectId, registry);
  if (command === 'status') return readClarityProjection(store, projectId, registry);
  if (command !== 'fetch') fail('CLARITY_COMMAND_INVALID', 'Unknown Clarity collector command');
  if (!isCurrentPortfolioProject(project)) {
    fail('CLARITY_PROJECT_INACTIVE', 'Inactive Site Health projects cannot refresh Clarity');
  }
  if (!eligibility.eligible) {
    fail('CLARITY_PROJECT_UNWIRED', eligibility.reason);
  }
  const snapshot = await collectProject({
    projectId,
    days,
    store,
    tokenResolver,
    snapshotFetcher,
    now,
  });
  return {
    schemaVersion: 'site-health.clarity-collection.v1',
    projectId,
    observedAt: snapshot.observedAt,
    metrics: snapshot.metrics,
  };
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(import.meta.filename)) {
  const cliArguments = process.argv.slice(2);
  if (cliArguments[0] === '--') cliArguments.shift();
  const [command, projectId, ...args] = cliArguments;
  const fleetCommand = ['status-all', 'fetch-all'].includes(command);
  if (!command || (!fleetCommand && !projectId) || ['help', '--help', '-h'].includes(command)) {
    usage();
    process.exit(command ? 0 : 1);
  }
  const optionArguments = fleetCommand ? [projectId, ...args].filter(Boolean) : args;
  const daysIndex = optionArguments.indexOf('--days');
  const days = daysIndex >= 0 ? Number(optionArguments[daysIndex + 1]) : 1;
  const reuseFreshIndex = optionArguments.indexOf('--reuse-fresh');
  const reuseProjectIds = reuseFreshIndex >= 0 ? [optionArguments[reuseFreshIndex + 1]] : [];
  const projects = loadDashboardProjects();
  const store = new DashboardStore({
    databasePath: process.env.DASHBOARD_DB || process.env.FOUNDER_CONTROL_DB || defaultDatabasePath(),
    projects,
  });
  try {
    let result;
    if (command === 'token-store') {
      const registry = loadClarityRegistry();
      const project = projects.find((item) => item.id === projectId);
      const eligibility = clarityEligibility(projectId, registry);
      if (!project || !isCurrentPortfolioProject(project) || !eligibility.eligible) {
        fail('CLARITY_TOKEN_TARGET_INVALID', 'Only current wired Clarity projects can store a token');
      }
      result = promptAndStoreClarityToken(projectId);
    } else if (command === 'provider-audit') {
      const registry = loadClarityRegistry();
      const input = JSON.parse(readFileSync(0, 'utf8'));
      const audit = recordClarityProviderAudit(store, projectId, input, registry);
      const projection = clarityCapabilityProjection(projectId, registry, { providerAudit: audit });
      result = {
        schemaVersion: audit.schemaVersion,
        projectId,
        observedAt: audit.observedAt,
        providerState: projection.providerState,
        summary: projection.summary,
      };
    } else {
      result = await runClarityCollector({
        command,
        projectId,
        days,
        projects,
        store,
        reuseProjectIds,
      });
    }
    console.log(JSON.stringify(result, null, 2));
    if (fleetCommand && ((result.counts.failed ?? 0) > 0 || (result.counts.unavailable ?? 0) > 0)) {
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`${error.code ?? 'CLARITY_ERROR'}: ${error.message}`);
    process.exitCode = 1;
  } finally {
    store.close();
  }
}
