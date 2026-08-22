import { timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';

import { buildDashboardProjection } from '../dashboard-projection.mjs';
import { createMetricRunController } from './metric-runs.mjs';
import {
  buildEvidenceEnvelope,
  readRefreshReceipt,
  recordRefreshReceipt,
} from './evidence-freshness.mjs';
import { buildCapabilityProjection } from './capabilities.mjs';
import { readCampaignReconciliation } from './campaign-reconciliation.mjs';
import {
  evaluateAiVisibilityScheduleActivation,
  loadAiVisibilityPortfolio,
} from './ai-visibility-registry.mjs';

const MAX_REQUEST_BYTES = 32 * 1024;

function json(response, status, body) {
  const encoded = JSON.stringify(body);
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(encoded),
    'cache-control': 'no-store',
  });
  response.end(encoded);
  return true;
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function mutationAuthorized(
  request,
  { ownerToken, trustLoopback = false } = {},
) {
  if (
    trustLoopback &&
    ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(request.socket?.remoteAddress)
  ) return true;
  if (ownerToken) {
    const authorization = request.headers.authorization ?? '';
    return authorization.startsWith('Bearer ') && safeEqual(authorization.slice(7), ownerToken);
  }
  return false;
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_REQUEST_BYTES) throw Object.assign(new Error('request body too large'), { statusCode: 413 });
    chunks.push(chunk);
  }
  if (chunks.length === 0) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw Object.assign(new Error('request body must be valid JSON'), { statusCode: 400 });
  }
}

function projectionFor(store) {
  return store.rebuildProjections();
}

function boundedSignal(signal, { includeSeries = false } = {}) {
  if (!signal) return null;
  const { series, ...bounded } = signal;
  return includeSeries
    ? { ...bounded, series: (series ?? []).slice(-60) }
    : bounded;
}

const OUTCOME_SOURCES = Object.freeze({
  domains: 'drank',
  performance: 'psi',
  search: 'search',
  'ai-awareness': 'ai',
});

function outcomeProjection(projection, family, { receipt = null, now } = {}) {
  const outcomes = projection.outcomes ?? {};
  let rows = [];
  if (family === 'domains') {
    rows = (outcomes.domains ?? []).map((row) => ({
      ...row,
      signal: boundedSignal(row.signal, { includeSeries: true }),
    }));
  } else if (family === 'ai-awareness') {
    rows = (outcomes.aiAwareness ?? []).map((row) => ({
      ...row,
      mention: boundedSignal(row.mention),
      recommendation: boundedSignal(row.recommendation),
      citation: boundedSignal(row.citation),
      averageRank: boundedSignal(row.averageRank),
      questions: (row.questions ?? []).slice(0, 12).map((question) => ({
        id: question.id,
        setId: question.setId,
        text: question.text,
      })),
      coverage: row.coverage
        ? {
            configured: Number(row.coverage.configured ?? 0),
            completed: Number(row.coverage.completed ?? 0),
            unavailable: Number(row.coverage.unavailable ?? 0),
            timedOut: Number(row.coverage.timedOut ?? 0),
            failed: Number(row.coverage.failed ?? 0),
          }
        : null,
      attempts: (row.attempts ?? []).slice(0, 24).map((attempt) => ({
        promptId: attempt.promptId,
        persona: attempt.persona,
        providerId: attempt.providerId,
        model: attempt.model,
        status: attempt.status,
      })),
      citationSources: {
        total: Number(row.citationSources?.total ?? 0),
        owned: Number(row.citationSources?.owned ?? 0),
        external: Number(row.citationSources?.external ?? 0),
        unclassified: Number(row.citationSources?.unclassified ?? 0),
        sources: (row.citationSources?.sources ?? []).slice(0, 50).map((source) => ({
          url: source.url,
          host: source.host,
          ownership: source.ownership,
        })),
      },
    }));
  } else if (family === 'performance') {
    rows = (outcomes.performance ?? []).map((row) => ({
      ...row,
      psi: boundedSignal(row.psi),
      lcp: boundedSignal(row.lcp),
    }));
  } else if (family === 'search') {
    rows = (outcomes.search ?? []).map((row) => ({
      ...row,
      impressions: boundedSignal(row.impressions, { includeSeries: true }),
      clicks: boundedSignal(row.clicks, { includeSeries: true }),
      ctr: boundedSignal(row.ctr, { includeSeries: true }),
      averagePosition: boundedSignal(row.averagePosition, { includeSeries: true }),
    }));
  } else {
    return null;
  }
  return {
    schemaVersion: 'dashboard.owner-outcome.v1',
    generatedAt: projection.generatedAt,
    family,
    source: buildEvidenceEnvelope({ family: OUTCOME_SOURCES[family], rows, receipt, now }),
    rows,
    ...(family === 'performance'
      ? { thresholds: { psiScore: 90, lcpMilliseconds: 2500 } }
      : {}),
  };
}

export function buildAiVisibilityProjection(projections, portfolio, scheduleActivation = {}) {
  const projectedProjects = new Map(
    projections.aiVisibility.projects.map((project) => [project.projectId, project]),
  );
  return {
    generatedAt: projections.generatedAt,
    outcomes: [],
    providerEvidence: 'linked-only',
    aiVisibility: {
      projects: portfolio.eligible.map((project) => ({
        projectId: project.slug,
        name: project.name,
        attention: project.attention,
        questions: project.promptSets.flatMap((set) =>
          set.prompts.map((prompt) => ({
            id: `${set.id}:${prompt.id}`,
            setId: set.id,
            text: prompt.text,
          }))),
        latest: projectedProjects.get(project.slug)?.latest ?? null,
        previous: projectedProjects.get(project.slug)?.previous ?? null,
        comparison: projectedProjects.get(project.slug)?.comparison ?? null,
        history: projectedProjects.get(project.slug)?.history ?? [],
      })),
      scheduleIntent: {
        ...portfolio.scheduleIntent,
        activation: evaluateAiVisibilityScheduleActivation({
          scheduleIntent: portfolio.scheduleIntent,
          ...scheduleActivation,
        }),
      },
    },
  };
}

export function createDashboardHandler({
  store,
  ownerToken,
  trustLoopback = false,
  now = () => new Date().toISOString(),
  visibilityPortfolio = loadAiVisibilityPortfolio(),
  visibilityScheduleActivation = {},
  projectionProvider = buildDashboardProjection,
  prewarmProjection = false,
  metricRunController,
  prefillEvidence,
  projectsProvider = () => store.projects,
}) {
  let projectionCache = null;
  const completedMetricRuns = new Set();
  const resolvedMetricRunController = metricRunController ?? createMetricRunController({
    projectsProvider,
    onRunChange: (run) => {
      recordRefreshReceipt(store, run);
      if (run.state !== 'running') projectionCache = null;
    },
  });
  const rebuildDashboardProjection = (projections = projectionFor(store)) => {
    const aiVisibility = buildAiVisibilityProjection(
      projections,
      visibilityPortfolio,
      visibilityScheduleActivation,
    );
    const payload = projectionProvider({
      aiVisibilityProjects: aiVisibility.aiVisibility.projects,
      now: now(),
    });
    projectionCache = { payload };
    return payload;
  };
  const cachedDashboardProjection = (projections) => {
    // Evidence is file/provider-backed and may be updated by sibling collectors.
    // Rebuild on every owner read so a completed run is visible even when no client
    // happened to poll its run receipt to completion.
    return rebuildDashboardProjection(projections);
  };
  if (prewarmProjection) rebuildDashboardProjection();
  const handleEarlyRoutes = (url, method, response) => {
    if (method === 'GET' && url.pathname === '/health') {
      return json(response, 200, { ok: true, service: 'site-health-backend', database: 'available' });
    }
    const metricRunMatch = url.pathname.match(/^\/v1\/metric-runs\/([^/]+)$/);
    if (method === 'GET' && metricRunMatch) {
      const run = resolvedMetricRunController.get(decodeURIComponent(metricRunMatch[1]));
      if (run && run.state !== 'running' && !completedMetricRuns.has(run.runId)) {
        completedMetricRuns.add(run.runId);
        projectionCache = null;
      }
      return run
        ? json(response, 200, run)
        : json(response, 404, { error: 'metric run not found' });
    }
    return false;
  };
  const handleProjectionReadRoutes = (url, projections, response) => {
    if (url.pathname === '/v1/projects') return json(response, 200, projections.projects);
    if (url.pathname === '/v1/capabilities') {
      return json(response, 200, buildCapabilityProjection({ now: now(), store }));
    }
    if (url.pathname === '/v1/evidence-status') {
      const payload = cachedDashboardProjection(projections);
      const sources = Object.fromEntries(Object.entries(OUTCOME_SOURCES).map(([family, source]) => [
        source,
        buildEvidenceEnvelope({
          family: source,
          rows: outcomeProjection(payload, family, { now: now() }).rows,
          receipt: readRefreshReceipt(store, source),
          now: now(),
        }),
      ]));
      return json(response, 200, {
        schemaVersion: 'site-health.evidence-status.v1',
        generatedAt: now(),
        sources,
        campaigns: readCampaignReconciliation(store),
        capabilities: buildCapabilityProjection({ now: now(), store }).sources,
      });
    }
    const outcomeMatch = url.pathname.match(
      /^\/v1\/outcomes\/(domains|search|ai-awareness|performance)$/,
    );
    if (outcomeMatch) {
      const family = outcomeMatch[1];
      const source = OUTCOME_SOURCES[family];
      return json(
        response,
        200,
        outcomeProjection(cachedDashboardProjection(projections), family, {
          receipt: readRefreshReceipt(store, source),
          now: now(),
        }),
      );
    }
    return false;
  };
  const handleMetricRunMutations = async (url, method, request, response) => {
    if (method === 'POST' && url.pathname === '/v1/prefill') {
      if (!prefillEvidence) return json(response, 503, { error: 'dashboard prefill is unavailable' });
      return json(response, 202, prefillEvidence({ force: true }));
    }
    if (method === 'POST' && url.pathname === '/v1/metric-runs') {
      const body = await readBody(request);
      return json(response, 202, resolvedMetricRunController.start({
        family: String(body.family ?? ''),
        projectId: String(body.projectId ?? ''),
        scope: String(body.scope ?? 'project'),
      }));
    }
    return false;
  };
  const handleProjectionMutations = async (url, method, response) => {
    if (method === 'POST' && url.pathname === '/v1/projections/rebuild') {
      const rebuilt = projectionFor(store);
      rebuildDashboardProjection(rebuilt);
      return json(response, 200, rebuilt);
    }
    return false;
  };
  return async function dashboardHandler(request, response) {
    try {
      const url = new URL(request.url, 'http://dashboard.local');
      const method = request.method ?? 'GET';
      if (handleEarlyRoutes(url, method, response)) return;

      store.projects = projectsProvider();
      const projections = projectionFor(store);
      if (method === 'GET' && handleProjectionReadRoutes(url, projections, response)) return;

      if (
        method !== 'GET' &&
        !mutationAuthorized(request, {
          ownerToken,
          trustLoopback,
        })
      ) {
        return json(response, 401, { error: 'owner authentication required' });
      }

      if (await handleMetricRunMutations(url, method, request, response)) return;
      if (await handleProjectionMutations(url, method, response)) return;
      return json(response, 404, { error: 'route not found' });
    } catch (error) {
      return json(response, error.statusCode ?? (error.code ? 422 : 500), {
        error: error.message,
        ...(error.code ? { code: error.code } : {}),
      });
    }
  };
}

export function startDashboardService({
  store,
  host = '127.0.0.1',
  port = 4187,
  ownerToken,
  trustLoopback = false,
  visibilityPortfolio,
  visibilityScheduleActivation,
  projectionProvider,
  prewarmProjection = false,
  metricRunController,
  prefillEvidence,
  projectsProvider,
} = {}) {
  const server = createServer(
    createDashboardHandler({
      store,
      ownerToken,
      trustLoopback,
      ...(visibilityPortfolio ? { visibilityPortfolio } : {}),
      ...(visibilityScheduleActivation ? { visibilityScheduleActivation } : {}),
      ...(projectionProvider ? { projectionProvider } : {}),
      prewarmProjection,
      ...(metricRunController ? { metricRunController } : {}),
      ...(prefillEvidence ? { prefillEvidence } : {}),
      ...(projectsProvider ? { projectsProvider } : {}),
    }),
  );
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolve(server));
  });
}
