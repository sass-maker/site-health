import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { validateRootBrandContract } from './root-brand-contract.mjs';
import { validateRootSearchQueryContract } from './root-search-query-contract.mjs';
import { defaultVisibilityOutcomePath, readVisibilityOutcomes } from './visibility-outcome-store.mjs';
import { searchConsoleProjects, visibilityProjects } from './visibility-projects.mjs';
import { domainStrengthRoots, registrableDomain } from './dashboard-backend/domain-scope.mjs';

const DAY_MS = 24 * 60 * 60 * 1000;

function readJson(path, fallback = null) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

function normalizedDomain(value) {
  return String(value ?? '').trim().toLowerCase().replace(/^www\./, '');
}

function observedState(observedAt, now, maximumAge) {
  if (!observedAt || !Number.isFinite(Date.parse(observedAt))) return 'unknown';
  return Date.parse(now) - Date.parse(observedAt) > maximumAge ? 'stale' : 'fresh';
}

function signal(label, value, observedAt, series = []) {
  return Number.isFinite(Number(value))
    ? { label, value: Number(value), observedAt, series, history: series.length > 1 ? 'comparable' : 'baseline-only' }
    : null;
}

function drankProjection(fleetRoot, catalog, now) {
  const payload = readJson(resolve(fleetRoot, 'drank/data/fleet-dr.json'), { domains: {} });
  const projects = catalog.projects ?? [];
  const records = new Map(Object.entries(payload.domains ?? {}).map(([domain, record]) => [
    normalizedDomain(domain),
    record,
  ]));
  return domainStrengthRoots(projects).map((domain) => {
    const record = records.get(domain) ?? {};
    const history = [...(record.history ?? [])]
      .filter((item) => Number.isFinite(Number(item.ts)) && Number.isFinite(Number(item.dr)))
      .sort((left, right) => Number(left.ts) - Number(right.ts));
    const latest = history.at(-1);
    const observedAt = latest ? new Date(Number(latest.ts)).toISOString() : payload.lastUpdated ?? null;
    return {
      domain,
      projects: projects
        .filter((project) => (project.domains ?? []).some((item) =>
          registrableDomain(normalizedDomain(item)) === domain))
        .map((project) => ({ projectId: project.id, name: project.name ?? project.id })),
      status: latest ? observedState(observedAt, now, 14 * DAY_MS) : 'not-measured',
      observedAt,
      signal: signal(
        'Domain rating',
        latest?.dr,
        observedAt,
        history.slice(-60).map((item) => ({
          observedAt: new Date(Number(item.ts)).toISOString(),
          value: Number(item.dr),
        })),
      ),
    };
  }).sort((left, right) => left.domain.localeCompare(right.domain));
}

function psiHistory(home) {
  const database = resolve(home, '.psi-swarm/history.db');
  if (!existsSync(database)) return new Map();
  try {
    const rows = JSON.parse(execFileSync('sqlite3', [
      '-json',
      database,
      `SELECT url, started_at, performance_score, lcp
       FROM runs
       WHERE error IS NULL
       ORDER BY started_at DESC`,
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 4000 }) || '[]');
    const byDomain = new Map();
    for (const row of rows) {
      let domain;
      try {
        domain = normalizedDomain(new URL(row.url).hostname);
      } catch {
        continue;
      }
      const history = byDomain.get(domain) ?? [];
      if (history.length >= 30) continue;
      history.push({
        observedAt: new Date(Number(row.started_at)).toISOString(),
        score: Number(row.performance_score),
        lcp: Number(row.lcp),
      });
      byDomain.set(domain, history);
    }
    return new Map([...byDomain].map(([domain, history]) => [domain, history.reverse()]));
  } catch {
    return new Map();
  }
}

function performanceProjection(projects, home, now) {
  const historyByDomain = psiHistory(home);
  return projects.map((project) => {
    const domain = normalizedDomain(project.domains?.[0]);
    const history = historyByDomain.get(domain) ?? [];
    const latest = history.at(-1);
    const observedAt = latest?.observedAt ?? null;
    const psi = signal('PSI performance', latest?.score, observedAt, history.map((item) => ({
      observedAt: item.observedAt,
      value: item.score,
    })));
    const lcp = signal('PSI LCP', latest?.lcp, observedAt, history.map((item) => ({
      observedAt: item.observedAt,
      value: item.lcp,
    })));
    return {
      projectId: project.id,
      name: project.name ?? project.id,
      domain,
      status: psi && lcp ? (psi.value >= 90 && lcp.value <= 2500 ? 'fast-enough' : 'needs-work') : 'not-measured',
      observedAt,
      psi,
      lcp,
    };
  }).sort((left, right) => left.name.localeCompare(right.name));
}

function searchProjectsFor(catalog, configRoot) {
  const brands = readJson(resolve(configRoot, 'root-brands.json'));
  const queries = readJson(resolve(configRoot, 'root-search-queries.json'));
  if (!brands || !queries) return visibilityProjects(catalog);
  const brandMap = validateRootBrandContract(brands, catalog.projects ?? []);
  const roots = validateRootSearchQueryContract(queries, brandMap, catalog.projects ?? []);
  return searchConsoleProjects(catalog, roots);
}

function searchProjection(catalog, configRoot, home) {
  const observations = readVisibilityOutcomes({ path: defaultVisibilityOutcomePath({ home }) })
    .filter((item) => item.family === 'search');
  const byProject = new Map();
  for (const observation of observations) {
    const rows = byProject.get(observation.projectId) ?? [];
    rows.push(observation);
    byProject.set(observation.projectId, rows);
  }
  return searchProjectsFor(catalog, configRoot).map((project) => {
    const history = (byProject.get(project.id) ?? [])
      .sort((left, right) => Date.parse(left.observedAt) - Date.parse(right.observedAt));
    const latest = history.at(-1) ?? null;
    const metric = (label, dailyKey) => {
      const aggregate = latest?.metrics.find((candidate) => candidate.label === label);
      const daily = (latest?.dailySeries ?? []).flatMap((point) =>
        Number.isFinite(Number(point[dailyKey]))
          ? [{ observedAt: `${point.date}T12:00:00.000Z`, value: Number(point[dailyKey]) }]
          : []);
      return signal(label, aggregate?.value, latest?.observedAt, daily);
    };
    const impressions = metric('Search impressions', 'impressions');
    return {
      projectId: project.id,
      name: project.name ?? project.id,
      domain: normalizedDomain(project.domains?.[0]),
      status: latest ? (Number(impressions?.value) > 0 ? 'observed' : 'zero-impressions') : 'not-measured',
      observedAt: latest?.observedAt ?? null,
      scope: latest?.scope ?? null,
      provider: latest?.provider ?? null,
      provenance: latest?.provenance ?? 'provider',
      providerUrl: latest?.providerUrl ?? null,
      period: latest?.period ?? null,
      previousPeriod: latest?.previousPeriod ?? null,
      indexInspection: latest?.indexInspection ?? null,
      impressions,
      clicks: metric('Search clicks', 'clicks'),
      ctr: metric('Search CTR', 'ctr'),
      averagePosition: metric('Search average position', 'position'),
    };
  }).sort((left, right) => left.name.localeCompare(right.name));
}

function aiProjection(catalog, aiVisibilityProjects) {
  const projects = new Map((catalog.projects ?? []).map((project) => [project.id, project]));
  const rows = aiVisibilityProjects
    .filter((item) => projects.get(item.projectId)?.portfolio?.priority === 'P1')
    .map((item) => {
      const latest = item.latest;
      const metrics = latest?.metrics ?? {};
      const observedAt = latest?.observedAt ?? null;
      return {
        projectId: item.projectId,
        name: item.name,
        domain: normalizedDomain(projects.get(item.projectId)?.domains?.[0]),
        status: latest ? (Number(metrics.mentionRate) > 0 ? 'known' : 'not-known') : 'not-measured',
        observedAt,
        mention: signal('AI mention rate', Number(metrics.mentionRate) * 100, observedAt),
        recommendation: signal('AI recommendation rate', Number(metrics.recommendationRate) * 100, observedAt),
        citation: signal('AI citation rate', Number(metrics.citationRate) * 100, observedAt),
        averageRank: signal('AI average rank', metrics.averagePosition, observedAt),
        questions: item.questions ?? [],
        coverage: latest?.coverage ?? null,
        attempts: latest?.attempts ?? [],
        citationSources: latest?.citationSources ?? { total: 0, owned: 0, external: 0, unclassified: 0, sources: [] },
      };
    })
    .sort((left, right) => left.name.localeCompare(right.name));
  const observed = aiVisibilityProjects.filter((item) => item.latest).map((item) => item.projectId);
  return {
    rows,
    coverage: {
      total: aiVisibilityProjects.length,
      observedCount: observed.length,
      unobservedCount: aiVisibilityProjects.length - observed.length,
      observed,
      unobserved: aiVisibilityProjects.filter((item) => !item.latest).map((item) => item.projectId),
    },
  };
}

export function buildDashboardProjection({
  repositoryRoot = resolve(import.meta.dirname, '../../..'),
  workspaceRoot = resolve(repositoryRoot, '..'),
  home = process.env.HOME ?? '',
  now = new Date().toISOString(),
  aiVisibilityProjects = [],
} = {}) {
  const configRoot = resolve(repositoryRoot, 'apps/backend/config');
  const catalog = readJson(resolve(configRoot, 'projects.json'), { projects: [] });
  const publicProjects = visibilityProjects(catalog);
  const ai = aiProjection(catalog, aiVisibilityProjects);
  return {
    schemaVersion: 'dashboard.projection.v1',
    generatedAt: now,
    outcomes: {
      domains: drankProjection(workspaceRoot, catalog, now),
      performance: performanceProjection(publicProjects, home, now),
      search: searchProjection(catalog, configRoot, home),
      aiAwareness: ai.rows,
      aiCoverage: ai.coverage,
    },
  };
}
