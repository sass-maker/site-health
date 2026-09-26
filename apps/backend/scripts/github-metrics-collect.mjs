#!/usr/bin/env node
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { withRefreshReceipt } from '../lib/dashboard-backend/evidence-freshness.mjs';
import { loadDashboardProjects } from '../lib/dashboard-backend/registry.mjs';
import { DashboardStore, defaultDatabasePath } from '../lib/dashboard-backend/store.mjs';
import {
  appendVisibilityOutcomeBundle,
  defaultVisibilityOutcomePath,
} from '../lib/visibility-outcome-store.mjs';
import { githubProjects, githubRepositorySlug, githubRepositoryUrl } from '../lib/visibility-projects.mjs';

const REPOSITORY_ROOT = resolve(import.meta.dirname, '../../..');
const TRAFFIC_WINDOW_DAYS = 14;
const catalog = JSON.parse(readFileSync(resolve(REPOSITORY_ROOT, 'apps/backend/config/projects.json'), 'utf8'));

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

function gh(endpoint) {
  const result = spawnSync('gh', ['api', endpoint], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error?.code === 'ENOENT') {
    throw Object.assign(new Error('gh CLI is not installed or not on PATH'), { code: 'GH_UNAVAILABLE' });
  }
  if (result.status !== 0) {
    const detail = (result.stderr || '').trim().split('\n')[0] ?? `exit ${result.status}`;
    throw Object.assign(new Error(`gh api ${endpoint} failed: ${detail}`), { code: 'GH_API_FAILED' });
  }
  return JSON.parse(result.stdout);
}

function tryGh(endpoint) {
  try {
    return gh(endpoint);
  } catch (error) {
    if (error?.code === 'GH_UNAVAILABLE') throw error;
    return null;
  }
}

function dayString(date) {
  return date.toISOString().slice(0, 10);
}

async function collect() {
  const eligible = githubProjects(catalog);
  const projects = options.projectId
    ? eligible.filter((project) => project.id === options.projectId)
    : eligible;
  if (options.projectId && projects.length === 0) {
    throw new Error(`No public GitHub repository is cataloged for project: ${options.projectId}`);
  }

  const now = new Date();
  const observedAt = now.toISOString();
  const endDate = dayString(now);
  const startDate = dayString(new Date(now.getTime() - (TRAFFIC_WINDOW_DAYS - 1) * 24 * 60 * 60 * 1000));
  const runId = randomUUID().replaceAll('-', '');

  const repoCache = new Map();
  const observations = [];
  const errors = [];
  for (const project of projects) {
    const slug = githubRepositorySlug(project);
    let entry = repoCache.get(slug);
    if (!entry) {
      entry = { repo: tryGh(`repos/${slug}`) };
      if (entry.repo) {
        entry.views = tryGh(`repos/${slug}/traffic/views`);
        entry.clones = tryGh(`repos/${slug}/traffic/clones`);
        entry.referrers = tryGh(`repos/${slug}/traffic/popular/referrers`);
      }
      repoCache.set(slug, entry);
    }
    if (!entry.repo) {
      errors.push({ projectId: project.id, repository: slug, reason: 'repository metadata unreadable' });
      continue;
    }
    const metrics = [
      { label: 'GitHub stars', value: entry.repo.stargazers_count },
      { label: 'GitHub forks', value: entry.repo.forks_count },
      { label: 'GitHub watchers', value: entry.repo.subscribers_count },
      { label: 'GitHub open issues', value: entry.repo.open_issues_count },
    ];
    if (entry.views) {
      metrics.push(
        { label: 'GitHub traffic views (14d)', value: entry.views.count },
        { label: 'GitHub traffic visitors (14d)', value: entry.views.uniques },
      );
    }
    if (entry.clones) {
      metrics.push(
        { label: 'GitHub clones (14d)', value: entry.clones.count },
        { label: 'GitHub clone uniques (14d)', value: entry.clones.uniques },
      );
    }
    const referrers = (entry.referrers ?? [])
      .filter((item) => Number.isFinite(Number(item?.count)) && item?.referrer)
      .slice(0, 10)
      .map((item) => ({ label: String(item.referrer), value: Number(item.count) }));
    observations.push({
      id: `github-${project.id}-${endDate}-${runId}`,
      projectId: project.id,
      family: 'github',
      provider: 'github-api',
      providerUrl: githubRepositoryUrl(project),
      scope: `repo:${slug}`,
      observedAt,
      period: {
        start: `${startDate}T00:00:00.000Z`,
        end: observedAt,
      },
      metrics,
      ...(referrers.length > 0
        ? { breakdowns: [{ id: 'referrers', label: 'Top referrers (14d)', unit: 'views', values: referrers }] }
        : {}),
    });
  }
  if (observations.length === 0) {
    throw new Error('No GitHub repository metrics could be collected');
  }
  const ledgerPath = options.ledgerPath ?? defaultVisibilityOutcomePath();
  const receipt = appendVisibilityOutcomeBundle(
    { schema: 'fleet.visibility-outcome-bundle.v1', observations },
    { path: ledgerPath, allowedProjectIds: new Set(eligible.map((project) => project.id)) },
  );

  return {
    schema: 'fleet.github-metrics-collection-receipt.v1',
    period: { start: startDate, end: endDate },
    eligibleProjects: eligible.length,
    measuredProjects: observations.length,
    repositoriesRead: [...repoCache.values()].filter((entry) => entry.repo).length,
    trafficUnavailable: [...repoCache.entries()]
      .filter(([, entry]) => entry.repo && !entry.views)
      .map(([slug]) => slug),
    errors,
    recorded: receipt.recorded,
    duplicates: receipt.duplicates,
  };
}

const options = parseArgs(process.argv.slice(2));

/**
 * The collector owns its own refresh receipt. Whoever starts it — the backend's
 * metric-run controller, a routine, or a hand-run — the receipt reaches a
 * terminal state in this process, so a crash records `failed` instead of
 * leaving `running` behind for a supervisor that may not outlive the run.
 */
const store = new DashboardStore({
  databasePath: process.env.DASHBOARD_DB || process.env.FOUNDER_CONTROL_DB || defaultDatabasePath(),
  projects: loadDashboardProjects(),
});
try {
  const summary = await withRefreshReceipt(
    store,
    {
      family: 'github',
      scope: 'portfolio',
      projectId: null,
      runId: `github_${randomUUID().replaceAll('-', '')}`,
      label: 'Portfolio GitHub visibility',
    },
    collect,
    { summarize: (result) => ({ resultCount: result.measuredProjects }) },
  );
  process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
} finally {
  store.close();
}
