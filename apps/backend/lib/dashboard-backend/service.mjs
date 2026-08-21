import { timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';

import { cloudflareAccessAuthorized } from './access.mjs';
import { buildDashboardProjection } from '../dashboard-projection.mjs';
import { createMetricRunController } from './metric-runs.mjs';
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
  { ownerToken, trustAccessHeaders = false, trustLoopback = false, ownerEmail } = {},
) {
  if (
    trustLoopback &&
    ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(request.socket?.remoteAddress)
  ) return true;
  if (ownerToken) {
    const authorization = request.headers.authorization ?? '';
    return authorization.startsWith('Bearer ') && safeEqual(authorization.slice(7), ownerToken);
  }
  if (trustAccessHeaders) {
    return cloudflareAccessAuthorized(request, { ownerEmail });
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

function outcomeProjection(projection, family) {
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
  trustAccessHeaders = false,
  trustLoopback = false,
  ownerEmail,
  now = () => new Date().toISOString(),
  visibilityPortfolio = loadAiVisibilityPortfolio(),
  visibilityScheduleActivation = {},
  projectionProvider = buildDashboardProjection,
  prewarmProjection = false,
  metricRunController,
}) {
  const resolvedMetricRunController = metricRunController ?? createMetricRunController({
    projects: store.projects,
  });
  let projectionCache = null;
  const completedMetricRuns = new Set();
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
    if (!projectionCache) return rebuildDashboardProjection(projections);
    return projectionCache.payload;
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
    const outcomeMatch = url.pathname.match(
      /^\/v1\/outcomes\/(domains|search|ai-awareness|performance)$/,
    );
    if (outcomeMatch) {
      return json(
        response,
        200,
        outcomeProjection(cachedDashboardProjection(projections), outcomeMatch[1]),
      );
    }
    return false;
  };
  const handleMetricRunMutations = async (url, method, request, response) => {
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

      const projections = projectionFor(store);
      if (method === 'GET' && handleProjectionReadRoutes(url, projections, response)) return;

      if (
        method !== 'GET' &&
        !mutationAuthorized(request, {
          ownerToken,
          trustAccessHeaders,
          trustLoopback,
          ownerEmail,
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
  trustAccessHeaders = false,
  trustLoopback = false,
  ownerEmail,
  visibilityPortfolio,
  visibilityScheduleActivation,
  projectionProvider,
  prewarmProjection = false,
  metricRunController,
} = {}) {
  const server = createServer(
    createDashboardHandler({
      store,
      ownerToken,
      trustAccessHeaders,
      trustLoopback,
      ownerEmail,
      ...(visibilityPortfolio ? { visibilityPortfolio } : {}),
      ...(visibilityScheduleActivation ? { visibilityScheduleActivation } : {}),
      ...(projectionProvider ? { projectionProvider } : {}),
      prewarmProjection,
      ...(metricRunController ? { metricRunController } : {}),
    }),
  );
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolve(server));
  });
}
