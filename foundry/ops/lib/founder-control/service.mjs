import { timingSafeEqual } from 'node:crypto';
import { createServer } from 'node:http';

import { buildDailyBrief } from './projections.mjs';
import { draftMission } from './intake.mjs';
import { buildOwnerNotifications } from './learning.mjs';
import { cloudflareAccessAuthorized } from './access.mjs';
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
}

function safeEqual(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function mutationAuthorized(request, { ownerToken, trustAccessHeaders = false, ownerEmail } = {}) {
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
  return {
    generatedAt: projections.generatedAt,
    recommendations: projections.recommendations.filter((item) => item.projectId),
    providerEvidence: 'linked-only',
    aiVisibility: {
      projects: portfolio.eligible.map((project) => ({
        projectId: project.slug,
        name: project.name,
        attention: project.attention,
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
  ownerEmail,
  now = () => new Date().toISOString(),
  visibilityPortfolio = loadAiVisibilityPortfolio(),
  visibilityScheduleActivation = {},
}) {
  return async function founderControlHandler(request, response) {
    try {
      const url = new URL(request.url, 'http://foundry.local');
      const method = request.method ?? 'GET';
      if (method === 'GET' && url.pathname === '/health') {
        return json(response, 200, { ok: true, service: 'founder-control', database: 'available' });
      }

      const projections = projectionFor(store);
      if (method === 'GET' && url.pathname === '/v1/home') return json(response, 200, projections.home);
      if (method === 'GET' && url.pathname === '/v1/missions') return json(response, 200, projections.missions);
      if (method === 'GET' && url.pathname.startsWith('/v1/missions/')) {
        const missionId = decodeURIComponent(url.pathname.slice('/v1/missions/'.length));
        const mission = findMission(projections, missionId);
        return mission ? json(response, 200, mission) : json(response, 404, { error: 'mission not found' });
      }
      if (method === 'GET' && url.pathname === '/v1/decisions') return json(response, 200, projections.decisions);
      if (method === 'GET' && url.pathname === '/v1/activity') return json(response, 200, projections.activity);
      if (method === 'GET' && url.pathname === '/v1/projects') return json(response, 200, projections.projects);
      if (method === 'GET' && url.pathname === '/v1/schedules') return json(response, 200, projections.schedules);
      if (method === 'GET' && url.pathname === '/v1/daily-brief') {
        return json(response, 200, buildDailyBrief(projections));
      }
      if (method === 'GET' && url.pathname === '/v1/notifications') {
        return json(response, 200, buildOwnerNotifications(projections, { now: now() }));
      }
      if (method === 'GET' && url.pathname === '/v1/marketing') {
        return json(
          response,
          200,
          buildMarketingProjection(projections, visibilityPortfolio, visibilityScheduleActivation),
        );
      }

      if (method !== 'GET' && !mutationAuthorized(request, { ownerToken, trustAccessHeaders, ownerEmail })) {
        return json(response, 401, { error: 'owner authentication required' });
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
        return json(response, 200, projectionFor(store));
      }
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
  ownerEmail,
  visibilityPortfolio,
  visibilityScheduleActivation,
} = {}) {
  const server = createServer(
    createFounderControlHandler({
      store,
      ownerToken,
      trustAccessHeaders,
      ownerEmail,
      ...(visibilityPortfolio ? { visibilityPortfolio } : {}),
      ...(visibilityScheduleActivation ? { visibilityScheduleActivation } : {}),
    }),
  );
  return new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolve(server));
  });
}
