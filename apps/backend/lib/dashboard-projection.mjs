import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { validateRootBrandContract } from './root-brand-contract.mjs';
import { validateRootSearchQueryContract } from './root-search-query-contract.mjs';
import { defaultVisibilityOutcomePath, readVisibilityOutcomes } from './visibility-outcome-store.mjs';
import { searchConsoleProjects, visibilityProjects } from './visibility-projects.mjs';
import { domainStrengthRoots, registrableDomain } from './dashboard-backend/domain-scope.mjs';

const DAY_MS = 24 * 60 * 60 * 1000;
// The portfolio runner measures each target with `--runs 2` so lab noise averages out.
// Runs of the same surface and preset within this window of the newest run are one measurement
// batch, including a same-window re-run under a different tag. The window is anchored on the
// newest run rather than chained run-to-run so a repeatedly measured surface cannot grow an
// unbounded batch that blends a before-fix and after-fix reading.
const PERFORMANCE_BATCH_WINDOW_MS = 10 * 60 * 1000;

function readJson(path, fallback = null) {
  if (!existsSync(path)) return fallback;
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

function readJsonLines(path) {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .split('\n')
    .flatMap((line) => {
      const trimmed = line.trim();
      if (!trimmed) return [];
      try {
        return [JSON.parse(trimmed)];
      } catch {
        return [];
      }
    });
}

function normalizedDomain(value) {
  return String(value ?? '').trim().toLowerCase().replace(/^www\./, '');
}

// The ledger records a calendar date, not an instant. Noon UTC keeps a run date inside its own
// day under every timezone a reader might format it in, matching the daily-series convention
// the Search Console projection already uses.
function runTimestamp(date) {
  return Number.isFinite(Date.parse(`${date}T12:00:00.000Z`)) ? `${date}T12:00:00.000Z` : null;
}

function observedState(observedAt, now, maximumAge) {
  if (!observedAt || !Number.isFinite(Date.parse(observedAt))) return 'unknown';
  return Date.parse(now) - Date.parse(observedAt) > maximumAge ? 'stale' : 'fresh';
}

// `Number(null)` and `Number('')` are both 0, so coercing first would turn "the provider
// returned nothing" into a measured zero — the one conflation every reader of this dashboard
// has to be able to rule out. Absent inputs are rejected before any coercion happens.
export function numeric(value) {
  if (value === null || value === undefined || value === '' || typeof value === 'boolean') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function signal(label, value, observedAt, series = []) {
  const parsed = numeric(value);
  return parsed === null
    ? null
    : { label, value: parsed, observedAt, series, history: series.length > 1 ? 'comparable' : 'baseline-only' };
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
      `SELECT url, preset, started_at, performance_score, lcp
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
        preset: row.preset ?? null,
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

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

// The headline reads the whole most recent measurement batch, not its last row: a single PSI
// sample carries the full per-sample lab variance the runner's repeated runs exist to cancel.
export function latestPerformanceBatch(history = []) {
  const runs = (history ?? [])
    .filter((run) => Number.isFinite(Number(run?.score))
      && Number.isFinite(Number(run?.lcp))
      && Number.isFinite(Date.parse(run?.observedAt)))
    .sort((left, right) => Date.parse(left.observedAt) - Date.parse(right.observedAt));
  const newest = runs.at(-1);
  if (!newest) return null;
  const batch = runs.filter((run) =>
    // Presets are separate measurement conditions, so a batch never mixes them.
    (run.preset ?? null) === (newest.preset ?? null)
    && Date.parse(newest.observedAt) - Date.parse(run.observedAt) <= PERFORMANCE_BATCH_WINDOW_MS);
  return {
    observedAt: newest.observedAt,
    score: median(batch.map((run) => Number(run.score))),
    lcp: median(batch.map((run) => Number(run.lcp))),
    sampleCount: batch.length,
  };
}

export function performanceStatus(score, lcp) {
  if (!Number.isFinite(score) || !Number.isFinite(lcp)) return 'not-measured';
  return score >= 90 && lcp <= 2500 ? 'fast-enough' : 'needs-work';
}

function performanceProjection(projects, home) {
  const historyByDomain = psiHistory(home);
  return projects.map((project) => {
    const domain = normalizedDomain(project.domains?.[0]);
    const history = historyByDomain.get(domain) ?? [];
    const batch = latestPerformanceBatch(history);
    const observedAt = batch?.observedAt ?? null;
    // The sparkline keeps every stored run; only the headline value collapses to the batch median.
    const psi = signal('PSI performance', batch?.score, observedAt, history.map((item) => ({
      observedAt: item.observedAt,
      value: item.score,
    })));
    const lcp = signal('PSI LCP', batch?.lcp, observedAt, history.map((item) => ({
      observedAt: item.observedAt,
      value: item.lcp,
    })));
    return {
      projectId: project.id,
      name: project.name ?? project.id,
      domain,
      status: psi && lcp ? performanceStatus(psi.value, lcp.value) : 'not-measured',
      observedAt,
      samples: batch?.sampleCount ?? 0,
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

// GEO Observatory rubric, fixed by config/geo-observatory.json: A = the product's own domain in
// the top three organic results, B = partial page-one visibility, C = absent from page one.
const GEO_CLASSES = Object.freeze(['A', 'B', 'C']);

function geoStatus(counts) {
  if (counts.A > 0) return 'top-three';
  if (counts.B > 0) return 'page-one';
  return 'absent';
}

// A product is enumerated when either side of the system knows it should be measured: it has a
// GEO panel, or it is a public-metric surface the rest of the dashboard already covers. That is
// what makes an unmeasured product render as an explicit state instead of dropping out silently.
function geoProjection(catalog, configRoot, dataRoot) {
  const config = readJson(resolve(configRoot, 'geo-observatory.json'), { products: [] });
  const configured = new Map((config.products ?? []).map((product) => [product.id, product]));
  const projects = new Map((catalog.projects ?? []).map((project) => [project.id, project]));
  const byProduct = new Map();
  for (const row of readJsonLines(resolve(dataRoot, 'geo-observatory/ledger.jsonl'))) {
    if (!row?.product || !GEO_CLASSES.includes(row.class) || !runTimestamp(row.date)) continue;
    const rows = byProduct.get(row.product) ?? [];
    rows.push(row);
    byProduct.set(row.product, rows);
  }
  const enumerated = [...new Set([
    ...configured.keys(),
    ...visibilityProjects(catalog).map((project) => project.id),
  ])];
  return enumerated.map((projectId) => {
    const project = projects.get(projectId);
    const name = project?.name ?? projectId;
    const domain = normalizedDomain(project?.domains?.[0]);
    const observations = byProduct.get(projectId) ?? [];
    const runDates = [...new Set(observations.map((row) => row.date))].sort();
    const latestDate = runDates.at(-1) ?? null;
    if (!latestDate) {
      return {
        projectId,
        name,
        domain,
        // Configured but never observed is a different failure from never configured at all,
        // and both are different from a measured zero. All three stay distinguishable.
        status: configured.has(projectId) ? 'not-measured' : 'not-configured',
        observedAt: null,
        queries: (configured.get(projectId)?.queries ?? []).length,
        runCount: 0,
        classes: null,
        topThree: null,
        pageOne: null,
        observations: [],
      };
    }
    const latest = observations.filter((row) => row.date === latestDate);
    const counts = Object.fromEntries(GEO_CLASSES.map((letter) => [
      letter,
      latest.filter((row) => row.class === letter).length,
    ]));
    const observedAt = runTimestamp(latestDate);
    const rateSeries = (predicate) => runDates.map((date) => {
      const runRows = observations.filter((row) => row.date === date);
      return {
        observedAt: runTimestamp(date),
        value: (runRows.filter(predicate).length / runRows.length) * 100,
      };
    });
    return {
      projectId,
      name,
      domain,
      status: geoStatus(counts),
      observedAt,
      queries: latest.length,
      runCount: runDates.length,
      classes: counts,
      topThree: signal(
        'GEO top-three rate',
        (counts.A / latest.length) * 100,
        observedAt,
        rateSeries((row) => row.class === 'A'),
      ),
      pageOne: signal(
        'GEO page-one rate',
        ((counts.A + counts.B) / latest.length) * 100,
        observedAt,
        rateSeries((row) => row.class !== 'C'),
      ),
      observations: latest
        .map((row) => ({
          qid: row.qid,
          query: row.query,
          kind: configured.get(projectId)?.queries?.find((item) => item.qid === row.qid)?.kind ?? null,
          class: row.class,
          source: row.source ?? null,
          // The previous run for this exact query is what makes a class change readable as a
          // move rather than a fresh reading.
          previousClass: observations
            .filter((item) => item.qid === row.qid && item.date < latestDate)
            .sort((left, right) => left.date.localeCompare(right.date))
            .at(-1)?.class ?? null,
        }))
        .sort((left, right) => String(left.qid).localeCompare(String(right.qid))),
    };
  }).sort((left, right) => left.name.localeCompare(right.name));
}

function seoAuditStatus(entry) {
  if (entry.reachable === false) return 'unreachable';
  if (Number(entry.fail) > 0) return 'failing';
  if (Number(entry.warn) > 0) return 'warnings';
  return 'clean';
}

function seoAuditProjection(catalog, dataRoot) {
  const audit = readJson(resolve(dataRoot, 'seo-audit/latest.json'), {}) ?? {};
  const projects = new Map((catalog.projects ?? []).map((project) => [project.id, project]));
  const enumerated = [...new Set([
    ...Object.keys(audit),
    ...visibilityProjects(catalog).map((project) => project.id),
  ])];
  return enumerated.map((projectId) => {
    const project = projects.get(projectId);
    const entry = audit[projectId] ?? null;
    const observedAt = entry?.auditedAt ?? (entry?.date ? runTimestamp(entry.date) : null);
    const base = {
      projectId,
      name: project?.name ?? projectId,
      domain: normalizedDomain(project?.domains?.[0]),
      url: entry?.url ?? null,
    };
    if (!entry) {
      return {
        ...base,
        status: 'not-audited',
        observedAt: null,
        reachable: null,
        checks: null,
        pass: null,
        fail: null,
        warn: null,
        failedChecks: [],
        warningChecks: [],
      };
    }
    const pass = Number(entry.pass);
    const fail = Number(entry.fail);
    const warn = Number(entry.warn);
    const checks = [pass, fail, warn].every(Number.isFinite) ? pass + fail + warn : null;
    return {
      ...base,
      status: seoAuditStatus(entry),
      observedAt,
      reachable: entry.reachable ?? null,
      checks,
      // A surface that passes every check reports 0 failures as a measured zero; a surface that
      // was never audited reports null, and the renderer prints "Not audited" for it.
      pass: signal('SEO checks passed', pass, observedAt),
      fail: signal('SEO checks failed', fail, observedAt),
      warn: signal('SEO checks warned', warn, observedAt),
      failedChecks: (entry.failedChecks ?? []).map(String),
      warningChecks: (entry.warningChecks ?? []).map(String),
    };
  }).sort((left, right) => left.name.localeCompare(right.name));
}

export function buildDashboardProjection({
  repositoryRoot = resolve(import.meta.dirname, '../../..'),
  workspaceRoot = resolve(repositoryRoot, '..'),
  home = process.env.HOME ?? '',
  now = new Date().toISOString(),
  aiVisibilityProjects = [],
} = {}) {
  const configRoot = resolve(repositoryRoot, 'apps/backend/config');
  const dataRoot = resolve(repositoryRoot, 'apps/backend/data');
  const catalog = readJson(resolve(configRoot, 'projects.json'), { projects: [] });
  const publicProjects = visibilityProjects(catalog);
  const ai = aiProjection(catalog, aiVisibilityProjects);
  return {
    schemaVersion: 'dashboard.projection.v1',
    generatedAt: now,
    outcomes: {
      domains: drankProjection(workspaceRoot, catalog, now),
      performance: performanceProjection(publicProjects, home),
      search: searchProjection(catalog, configRoot, home),
      seoAudit: seoAuditProjection(catalog, dataRoot),
      geoAwareness: geoProjection(catalog, configRoot, dataRoot),
      aiAwareness: ai.rows,
      aiCoverage: ai.coverage,
    },
  };
}
