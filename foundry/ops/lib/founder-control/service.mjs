import { timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';

import { buildDailyBrief } from './projections.mjs';
import { draftMission } from './intake.mjs';
import { buildOwnerNotifications } from './learning.mjs';
import { cloudflareAccessAuthorized } from './access.mjs';
import { buildFleetConnections, readSkillRunOutput } from './connections.mjs';
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

function boundedText(value, maximum) {
  if (value === null || value === undefined) return null;
  return String(value).slice(0, maximum);
}

function publicPostUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(String(value));
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null;
  } catch {
    return null;
  }
}

function boundedTrackedQuery(query) {
  const liveSearch = { state: query.liveSearch?.state === 'observed' ? 'observed' : 'not-observed' };
  if (liveSearch.state === 'observed') {
    liveSearch.class = ['A', 'B', 'C'].includes(query.liveSearch?.class)
      ? query.liveSearch.class
      : null;
    liveSearch.observedAt = Number.isFinite(Date.parse(query.liveSearch?.observedAt))
      ? query.liveSearch.observedAt
      : null;
  }

  const searchConsole = {
    state: query.searchConsole?.state === 'observed' ? 'observed' : 'not-observed',
  };
  if (searchConsole.state === 'observed') {
    for (const key of ['impressions', 'clicks', 'position']) {
      const value = Number(query.searchConsole?.[key]);
      searchConsole[key] = Number.isFinite(value) ? value : null;
    }
  }

  const collisionState = ['clear', 'ambiguous'].includes(query.collision?.state)
    ? query.collision.state
    : null;
  return {
    id: boundedText(query.id, 160),
    kind: boundedText(query.kind, 40),
    text: boundedText(query.text, 240),
    rootDomain: boundedText(query.rootDomain, 240),
    collision: collisionState
      ? { state: collisionState, note: boundedText(query.collision?.note, 320) }
      : null,
    liveSearch,
    searchConsole,
  };
}

function outcomeProjection(connections, family) {
  const outcomes = connections.outputs?.ownerOutcomes ?? {};
  let rows = [];
  if (family === 'domains') {
    rows = (outcomes.domains ?? []).map((row) => ({
      ...row,
      signal: boundedSignal(row.signal, { includeSeries: true }),
    }));
  } else if (family === 'ai-awareness') {
    rows = (outcomes.coreAi ?? []).map((row) => ({
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
      crawlerRequests: boundedSignal(row.crawlerRequests, { includeSeries: true }),
      aiReferralVisits: boundedSignal(row.aiReferralVisits, { includeSeries: true }),
    }));
  } else if (family === 'performance') {
    rows = (outcomes.performance ?? []).map((row) => ({
      ...row,
      psi: boundedSignal(row.psi),
      lcp: boundedSignal(row.lcp),
      fieldLcp: boundedSignal(row.fieldLcp, { includeSeries: true }),
      fieldInp: boundedSignal(row.fieldInp, { includeSeries: true }),
      fieldCls: boundedSignal(row.fieldCls, { includeSeries: true }),
      fieldTtfb: boundedSignal(row.fieldTtfb, { includeSeries: true }),
      rumSamples: boundedSignal(row.rumSamples),
    }));
  } else if (family === 'marketing') {
    rows = (outcomes.marketing ?? []).map((row) => {
      const posts = (row.posts ?? []).slice(0, 20).map((post) => ({
        id: boundedText(post.id, 160),
        title: boundedText(post.title, 240),
        provider: boundedText(post.provider, 80),
        stage: boundedText(post.stage, 60),
        status: boundedText(post.status, 60) ?? 'recorded',
        observedAt: Number.isFinite(Date.parse(post.observedAt)) ? post.observedAt : null,
        url: publicPostUrl(post.url),
      }));
      return {
        projectId: boundedText(row.projectId, 160),
        name: boundedText(row.name, 160) ?? 'Unnamed project',
        domain: boundedText(row.domain, 240),
        postCount: Number.isFinite(Number(row.postCount))
          ? Math.max(posts.length, Number(row.postCount))
          : posts.length,
        posts,
      };
    });
  } else if (family === 'search') {
    rows = (outcomes.search ?? []).map((row) => ({
      ...row,
      trackedQueries: (row.trackedQueries ?? []).slice(0, 12).map(boundedTrackedQuery),
      impressions: boundedSignal(row.impressions, { includeSeries: true }),
      clicks: boundedSignal(row.clicks, { includeSeries: true }),
      ctr: boundedSignal(row.ctr, { includeSeries: true }),
      averagePosition: boundedSignal(row.averagePosition, { includeSeries: true }),
    }));
  } else if (family === 'growth') {
    rows = (outcomes.growth ?? []).map((row) => ({
      projectId: boundedText(row.projectId, 160),
      name: boundedText(row.name, 160) ?? 'Unnamed project',
      domain: boundedText(row.domain, 240),
      mode: ['focus', 'maintain', 'observe'].includes(row.mode) ? row.mode : 'observe',
      target: row.target ? {
        queryId: boundedText(row.target.queryId, 160),
        query: boundedText(row.target.query, 500),
        destination: publicPostUrl(row.target.destination),
      } : null,
      intervention: row.intervention ? {
        actionId: boundedText(row.intervention.actionId, 160),
        query: boundedText(row.intervention.query, 500),
        landingPage: publicPostUrl(row.intervention.landingPage),
        revision: boundedText(row.intervention.revision, 40),
        changedAt: Number.isFinite(Date.parse(row.intervention.changedAt)) ? row.intervention.changedAt : null,
      } : null,
      search: {
        status: boundedText(row.search?.status, 80) ?? 'not-measured',
        impressions: boundedSignal(row.search?.impressions),
        clicks: boundedSignal(row.search?.clicks),
        averagePosition: boundedSignal(row.search?.averagePosition),
        observedAt: Number.isFinite(Date.parse(row.search?.observedAt)) ? row.search.observedAt : null,
        period: row.search?.period ? {
          start: boundedText(row.search.period.start, 40),
          end: boundedText(row.search.period.end, 40),
        } : null,
        providerUrl: publicPostUrl(row.search?.providerUrl),
      },
      traffic: {
        visits: boundedSignal(row.traffic?.visits),
        pageViews: boundedSignal(row.traffic?.pageViews),
        searchReferrals: boundedSignal(row.traffic?.searchReferrals),
        observedAt: Number.isFinite(Date.parse(row.traffic?.observedAt)) ? row.traffic.observedAt : null,
        providerUrl: publicPostUrl(row.traffic?.providerUrl),
      },
      marketing: {
        status: boundedText(row.marketing?.status, 80) ?? 'never-marketed',
        postCount: Math.max(0, Number(row.marketing?.postCount ?? 0)),
        latest: row.marketing?.latest ? {
          title: boundedText(row.marketing.latest.title, 240),
          provider: boundedText(row.marketing.latest.provider, 80),
          status: boundedText(row.marketing.latest.status, 80) ?? 'recorded',
          observedAt: Number.isFinite(Date.parse(row.marketing.latest.observedAt)) ? row.marketing.latest.observedAt : null,
          url: publicPostUrl(row.marketing.latest.url),
        } : null,
      },
      links: {
        acknowledgedSubmissions: Math.max(0, Number(row.links?.acknowledgedSubmissions ?? 0)),
        submissionObservedAt: Number.isFinite(Date.parse(row.links?.submissionObservedAt)) ? row.links.submissionObservedAt : null,
        evidenceClass: boundedText(row.links?.evidenceClass, 80) ?? 'not-recorded',
        verifiedCount: Math.max(0, Number(row.links?.verifiedCount ?? 0)),
        earnedStatus: row.links?.earnedStatus === 'verified' ? 'verified' : 'not-measured',
        verified: (row.links?.verified ?? []).slice(0, 20).map((link) => ({
          sourceUrl: publicPostUrl(link.sourceUrl),
          destinationUrl: publicPostUrl(link.destinationUrl),
          observedAt: Number.isFinite(Date.parse(link.observedAt)) ? link.observedAt : null,
          kind: boundedText(link.kind, 80) ?? 'editorial',
        })),
      },
      commercial: {
        conversions: { status: 'not-connected', owner: boundedText(row.commercial?.conversions?.owner, 240) },
        revenue: { status: 'not-connected', owner: boundedText(row.commercial?.revenue?.owner, 240) },
      },
      attribution: {
        search: boundedText(row.attribution?.search, 120),
        traffic: boundedText(row.attribution?.traffic, 120),
        causality: boundedText(row.attribution?.causality, 240),
      },
      next: {
        id: boundedText(row.next?.id, 160),
        label: boundedText(row.next?.label, 160) ?? 'Measure now',
        stage: boundedText(row.next?.stage, 80) ?? 'measure',
        reason: boundedText(row.next?.reason, 500),
        priority: Number.isFinite(Number(row.next?.priority)) ? Number(row.next.priority) : 7,
        nextMeasurementAt: Number.isFinite(Date.parse(row.next?.nextMeasurementAt)) ? row.next.nextMeasurementAt : null,
      },
      observedAt: Number.isFinite(Date.parse(row.observedAt)) ? row.observedAt : null,
    }));
  } else if (family === 'user-metrics') {
    rows = (outcomes.userMetrics ?? []).map((row) => ({
      projectId: boundedText(row.projectId, 160),
      name: boundedText(row.name, 160) ?? 'Unnamed project',
      domain: boundedText(row.domain, 240),
      status: row.status === 'observed' ? 'observed' : 'not-measured',
      visitors: boundedSignal(row.visitors),
      identifiedUsers: boundedSignal(row.identifiedUsers),
      accounts: boundedSignal(row.accounts),
      newAccounts: boundedSignal(row.newAccounts),
      activationRate: boundedSignal(row.activationRate),
      d1Retention: boundedSignal(row.d1Retention),
      d7Retention: boundedSignal(row.d7Retention),
      coreActions: boundedSignal(row.coreActions),
      provider: boundedText(row.provider, 80),
      providers: Array.isArray(row.providers) ? row.providers.filter((p) => typeof p === 'string' && p.length <= 80) : [],
      discrepancies: Array.isArray(row.discrepancies) ? row.discrepancies.filter((d) => d && typeof d.metric === 'string').map((d) => ({
        metric: boundedText(d.metric, 80),
        posthogValue: Number.isFinite(Number(d.posthogValue)) ? Number(d.posthogValue) : null,
        d1Value: Number.isFinite(Number(d.d1Value)) ? Number(d.d1Value) : null,
        variance: Number.isFinite(Number(d.variance)) ? Number(d.variance) : null,
      })) : [],
      observedAt: Number.isFinite(Date.parse(row.observedAt)) ? row.observedAt : null,
      period: row.period ? {
        start: boundedText(row.period.start, 40),
        end: boundedText(row.period.end, 40),
      } : null,
    }));
  } else {
    return null;
  }
  return {
    schemaVersion: 'fleet.owner-outcome.v1',
    generatedAt: connections.generatedAt,
    family,
    rows,
    ...(family === 'performance'
      ? { thresholds: outcomes.performanceThresholds ?? {} }
      : {}),
  };
}

function findMission(projections, missionId) {
  return projections.missions.find((mission) => mission.id === missionId);
}

function transitionPayload(action, body) {
  if (action === 'progressed') return { summary: String(body.summary ?? '') };
  if (action === 'blocked') return { reason: String(body.reason ?? ''), owner: String(body.owner ?? 'founder') };
  if (action === 'awaiting-verification') return { reason: String(body.reason ?? 'Awaiting verification evidence') };
  if (action === 'completed') return { summary: String(body.summary ?? '') };
  if (action === 'cancelled') return { reason: String(body.reason ?? '') };
  return body.summary ? { summary: String(body.summary) } : {};
}

export function buildMarketingProjection(projections, portfolio, scheduleActivation = {}) {
  const projectedProjects = new Map(
    projections.aiVisibility.projects.map((project) => [project.projectId, project]),
  );
  const outcomes = projections.activity.flatMap((event) => {
    const match = String(event.summary ?? '').match(/^Marketing (publication|measurement) receipt$/);
    if (!match) return [];
    const pointer = event.evidence?.[0] ?? null;
    return [{
      id: event.id,
      projectId: event.projectId ?? null,
      missionId: event.missionId ?? null,
      stage: match[1],
      status: pointer?.state ?? 'recorded',
      provider: pointer?.provider ?? event.actor?.id ?? null,
      title: pointer?.summary ?? event.summary,
      observedAt: event.occurredAt,
      url: pointer?.url ?? null,
    }];
  });
  return {
    generatedAt: projections.generatedAt,
    recommendations: projections.recommendations.filter((item) => item.projectId),
    outcomes,
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

export function createFounderControlHandler({
  store,
  ownerToken,
  trustAccessHeaders = false,
  trustLoopback = false,
  ownerEmail,
  now = () => new Date().toISOString(),
  visibilityPortfolio = loadAiVisibilityPortfolio(),
  visibilityScheduleActivation = {},
  connectionsProvider = buildFleetConnections,
  prewarmConnections = false,
  skillRunOutputProvider = readSkillRunOutput,
  metricRunController,
}) {
  const resolvedMetricRunController = metricRunController ?? createMetricRunController({
    projects: store.projects,
  });
  let connectionCache = null;
  const completedMetricRuns = new Set();
  const rebuildConnections = (projections = projectionFor(store)) => {
    const marketing = buildMarketingProjection(
      projections,
      visibilityPortfolio,
      visibilityScheduleActivation,
    );
    const payload = connectionsProvider({
      marketing,
      missions: projections.missions,
      now: now(),
    });
    connectionCache = { payload };
    return payload;
  };
  const cachedConnections = (projections) => {
    if (!connectionCache) return rebuildConnections(projections);
    return connectionCache.payload;
  };
  if (prewarmConnections) rebuildConnections();
  const handleEarlyRoutes = (url, method, response) => {
    if (method === 'GET' && url.pathname === '/health') {
      return json(response, 200, { ok: true, service: 'founder-control', database: 'available' });
    }
    const skillRunOutputMatch = url.pathname.match(/^\/v1\/skill-runs\/([^/]+)\/output$/);
    if (method === 'GET' && skillRunOutputMatch) {
      return json(
        response,
        200,
        skillRunOutputProvider({ runId: decodeURIComponent(skillRunOutputMatch[1]) }),
      );
    }
    const metricRunMatch = url.pathname.match(/^\/v1\/metric-runs\/([^/]+)$/);
    if (method === 'GET' && metricRunMatch) {
      const run = resolvedMetricRunController.get(decodeURIComponent(metricRunMatch[1]));
      if (run && run.state !== 'running' && !completedMetricRuns.has(run.runId)) {
        completedMetricRuns.add(run.runId);
        connectionCache = null;
      }
      return run
        ? json(response, 200, run)
        : json(response, 404, { error: 'metric run not found' });
    }
    return false;
  };
  const handleProjectionReadRoutes = (url, projections, response) => {
    if (url.pathname === '/v1/home') return json(response, 200, projections.home);
    if (url.pathname === '/v1/missions') return json(response, 200, projections.missions);
    if (url.pathname.startsWith('/v1/missions/')) {
      const missionId = decodeURIComponent(url.pathname.slice('/v1/missions/'.length));
      const mission = findMission(projections, missionId);
      return mission ? json(response, 200, mission) : json(response, 404, { error: 'mission not found' });
    }
    if (url.pathname === '/v1/decisions') return json(response, 200, projections.decisions);
    if (url.pathname === '/v1/activity') return json(response, 200, projections.activity);
    if (url.pathname === '/v1/projects') return json(response, 200, projections.projects);
    if (url.pathname === '/v1/schedules') return json(response, 200, projections.schedules);
    if (url.pathname === '/v1/daily-brief') {
      return json(response, 200, buildDailyBrief(projections));
    }
    if (url.pathname === '/v1/notifications') {
      return json(response, 200, buildOwnerNotifications(projections, { now: now() }));
    }
    if (url.pathname === '/v1/marketing') {
      return json(
        response,
        200,
        buildMarketingProjection(projections, visibilityPortfolio, visibilityScheduleActivation),
      );
    }
    const outcomeMatch = url.pathname.match(
      /^\/v1\/outcomes\/(domains|search|ai-awareness|performance|marketing|growth|user-metrics)$/,
    );
    if (outcomeMatch) {
      return json(
        response,
        200,
        outcomeProjection(cachedConnections(projections), outcomeMatch[1]),
      );
    }
    if (url.pathname === '/v1/connections') {
      return json(response, 200, cachedConnections(projections));
    }
    return false;
  };
  const handleMissionDraftMutations = async (url, method, request, response) => {
    if (method === 'POST' && url.pathname === '/v1/metric-runs') {
      const body = await readBody(request);
      return json(response, 202, resolvedMetricRunController.start({
        family: String(body.family ?? ''),
        projectId: String(body.projectId ?? ''),
        scope: String(body.scope ?? 'project'),
      }));
    }
    if (method === 'POST' && url.pathname === '/v1/missions/draft') {
      const body = await readBody(request);
      const drafted = draftMission(body, { projects: store.projects, now: now() });
      const mission = store.append(drafted.event);
      if (drafted.decision) store.append(drafted.decision);
      if (body.readOnly === true) {
        store.append({
          type: 'mission.accepted',
          actor: { type: 'owner', id: 'founder', label: 'Founder' },
          missionId: mission.event.missionId,
          projectId: mission.event.projectId,
          idempotencyKey: `${mission.event.idempotencyKey}/read-only-accepted`,
          payload: { reason: 'Explicitly read-only mission' },
        });
      }
      return json(response, 201, findMission(projectionFor(store), mission.event.missionId));
    }
    return false;
  };
  const handleMissionTransitionMutations = async (url, method, projections, request, response) => {
    const acceptanceMatch = url.pathname.match(/^\/v1\/missions\/(.+)\/accept$/);
    if (method === 'POST' && acceptanceMatch) {
      const missionId = decodeURIComponent(acceptanceMatch[1]);
      const mission = findMission(projections, missionId);
      if (!mission) return json(response, 404, { error: 'mission not found' });
      store.append({
        type: 'mission.accepted',
        actor: { type: 'owner', id: 'founder', label: 'Founder' },
        missionId,
        ...(mission.projectId ? { projectId: mission.projectId } : {}),
        idempotencyKey: `mission-accept/${missionId}`,
        payload: { reason: 'Accepted through Founder control' },
        occurredAt: now(),
      });
      return json(response, 200, findMission(projectionFor(store), missionId));
    }
    const transitionMatch = url.pathname.match(
      /^\/v1\/missions\/(.+)\/(start|progress|block|await-verification|complete|cancel)$/,
    );
    if (method === 'POST' && transitionMatch) {
      const missionId = decodeURIComponent(transitionMatch[1]);
      const action = transitionMatch[2];
      const mission = findMission(projections, missionId);
      if (!mission) return json(response, 404, { error: 'mission not found' });
      const body = await readBody(request);
      const eventSuffix = {
        start: 'started',
        progress: 'progressed',
        block: 'blocked',
        'await-verification': 'awaiting-verification',
        complete: 'completed',
        cancel: 'cancelled',
      }[action];
      const occurredAt = now();
      store.append({
        type: `mission.${eventSuffix}`,
        actor: body.actor ?? { type: 'automation', id: 'foundry-control', label: 'Foundry control' },
        missionId,
        ...(mission.projectId ? { projectId: mission.projectId } : {}),
        idempotencyKey: body.idempotencyKey ?? `mission-${eventSuffix}/${missionId}/${occurredAt}`,
        occurredAt,
        payload: transitionPayload(eventSuffix, body),
        evidence: body.evidence ?? [],
      });
      return json(response, 200, findMission(projectionFor(store), missionId));
    }
    return false;
  };
  const handleDecisionMutations = async (url, method, projections, request, response) => {
    const decisionMatch = url.pathname.match(/^\/v1\/decisions\/(.+)\/respond$/);
    if (method === 'POST' && decisionMatch) {
      const decisionId = decodeURIComponent(decisionMatch[1]);
      const decision = projections.decisions.find((item) => item.id === decisionId);
      if (!decision) return json(response, 404, { error: 'decision not found' });
      const body = await readBody(request);
      store.append({
        type: body.response === 'reject' ? 'decision.rejected' : 'decision.resolved',
        actor: { type: 'owner', id: 'founder', label: 'Founder' },
        ...(decision.missionId ? { missionId: decision.missionId } : {}),
        ...(decision.projectId ? { projectId: decision.projectId } : {}),
        idempotencyKey: `decision-response/${decisionId}/${body.response}`,
        occurredAt: now(),
        payload: {
          decisionId,
          ...(body.response === 'reject' ? {} : { response: body.response }),
          scope: decision.scope,
          ...(body.rationale ? { rationale: String(body.rationale) } : {}),
        },
      });
      return json(response, 200, projectionFor(store).decisions.find((item) => item.id === decisionId));
    }
    const recommendationMatch = url.pathname.match(/^\/v1\/recommendations\/(.+)\/(accept|reject|snooze|refine)$/);
    if (method === 'POST' && recommendationMatch) {
      const [, encodedId, action] = recommendationMatch;
      const recommendationId = decodeURIComponent(encodedId);
      const item = projections.recommendations.find((recommendation) => recommendation.id === recommendationId);
      if (!item) return json(response, 404, { error: 'recommendation not found' });
      const body = await readBody(request);
      const suffix = action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : action === 'snooze' ? 'snoozed' : 'refined';
      store.append({
        type: `recommendation.${suffix}`,
        actor: { type: 'owner', id: 'founder', label: 'Founder' },
        ...(item.projectId ? { projectId: item.projectId } : {}),
        ...(item.missionId ? { missionId: item.missionId } : {}),
        idempotencyKey: `recommendation-${action}/${recommendationId}/${body.until ?? 'now'}`,
        occurredAt: now(),
        payload: {
          recommendationId,
          ...(action === 'snooze' ? { until: body.until } : {}),
          ...(action === 'refine' ? { changes: body.changes ?? {} } : {}),
        },
      });
      let mission = null;
      if (action === 'accept') {
        const drafted = draftMission(
          {
            title: item.title,
            outcome: item.rationale,
            projectId: item.projectId,
          },
          { projects: store.projects, now: now() },
        );
        mission = store.append(drafted.event).event;
      }
      return json(response, 200, { recommendation: recommendationId, action, missionId: mission?.missionId ?? null });
    }
    if (method === 'POST' && url.pathname === '/v1/projections/rebuild') {
      const rebuilt = projectionFor(store);
      rebuildConnections(rebuilt);
      return json(response, 200, rebuilt);
    }
    return false;
  };
  return async function founderControlHandler(request, response) {
    try {
      const url = new URL(request.url, 'http://foundry.local');
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

      if (await handleMissionDraftMutations(url, method, request, response)) return;
      if (await handleMissionTransitionMutations(url, method, projections, request, response)) return;
      if (await handleDecisionMutations(url, method, projections, request, response)) return;
      return json(response, 404, { error: 'route not found' });
    } catch (error) {
      return json(response, error.statusCode ?? (error.code ? 422 : 500), {
        error: error.message,
        ...(error.code ? { code: error.code } : {}),
      });
    }
  };
}

export function startFounderControlService({
  store,
  host = '127.0.0.1',
  port = 4187,
  ownerToken,
  trustAccessHeaders = false,
  trustLoopback = false,
  ownerEmail,
  visibilityPortfolio,
  visibilityScheduleActivation,
  connectionsProvider,
  prewarmConnections = false,
  skillRunOutputProvider,
  metricRunController,
} = {}) {
  const server = createServer(
    createFounderControlHandler({
      store,
      ownerToken,
      trustAccessHeaders,
      trustLoopback,
      ownerEmail,
      ...(visibilityPortfolio ? { visibilityPortfolio } : {}),
      ...(visibilityScheduleActivation ? { visibilityScheduleActivation } : {}),
      ...(connectionsProvider ? { connectionsProvider } : {}),
      prewarmConnections,
      ...(skillRunOutputProvider ? { skillRunOutputProvider } : {}),
      ...(metricRunController ? { metricRunController } : {}),
    }),
  );
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolve(server));
  });
}
