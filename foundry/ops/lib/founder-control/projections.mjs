import { validateMissionTransition } from './contracts.mjs';

function byTime(left, right) {
  if (Number.isInteger(left.sequence) && Number.isInteger(right.sequence)) return left.sequence - right.sequence;
  return left.occurredAt.localeCompare(right.occurredAt) || left.recordedAt.localeCompare(right.recordedAt) || left.id.localeCompare(right.id);
}

function freshState(pointer, now) {
  if (pointer.state === 'unavailable') return 'unavailable';
  if (pointer.state === 'stale') return 'stale';
  if (pointer.freshUntil && Date.parse(pointer.freshUntil) < Date.parse(now)) return 'stale';
  return pointer.state;
}

function missionShell(event) {
  return {
    id: event.missionId,
    projectId: event.projectId ?? null,
    objectiveId: event.objectiveId ?? null,
    title: String(event.payload.title ?? 'Untitled mission'),
    outcome: String(event.payload.outcome ?? ''),
    state: null,
    actor: event.actor,
    authority: event.payload.authority ?? {},
    completionCriteria: event.payload.completionCriteria ?? [],
    createdAt: event.occurredAt,
    updatedAt: event.occurredAt,
    latestSummary: '',
    evidence: [],
    deliverables: [],
    decisions: [],
    outcomes: [],
    timeline: [],
  };
}

export function buildProjections(inputEvents, { now = new Date().toISOString(), projects = [] } = {}) {
  const events = [...inputEvents].sort(byTime);
  const missions = new Map();
  const decisions = new Map();
  const recommendations = new Map();
  const actors = new Map();
  const schedules = new Map();
  const correctedEvents = new Set(
    events.filter((event) => event.type === 'event.corrected').map((event) => event.payload.eventId),
  );

  for (const event of events) {
    if (correctedEvents.has(event.id) && event.type !== 'event.corrected') continue;
    if (event.type === 'actor.status-recorded') {
      actors.set(event.actor.id, {
        id: event.actor.id,
        type: event.actor.type,
        label: event.actor.label ?? event.actor.id,
        state: event.payload.state,
        updatedAt: event.occurredAt,
        freshUntil: event.payload.freshUntil,
        freshness: Date.parse(event.payload.freshUntil) < Date.parse(now) ? 'stale' : 'fresh',
        missionId: event.missionId ?? null,
      });
    }
    if (event.type === 'schedule.recorded') {
      schedules.set(String(event.payload.id ?? event.id), {
        id: String(event.payload.id ?? event.id),
        name: event.payload.name,
        enabled: Boolean(event.payload.enabled),
        nextRunAt: event.payload.nextRunAt,
        lastRunAt: event.payload.lastRunAt ?? null,
        lastState: event.payload.lastState ?? 'not-run',
        receipt: event.evidence[0] ?? null,
      });
    }
    if (event.type === 'decision.requested') {
      const id = String(event.payload.decisionId ?? event.id);
      const existing = decisions.get(id);
      decisions.set(id, {
        id,
        missionId: event.missionId ?? null,
        projectId: event.projectId ?? null,
        question: event.payload.question,
        why: event.payload.why,
        allowedResponses: event.payload.allowedResponses,
        scope: event.payload.scope,
        consequences: event.payload.consequences ?? '',
        reversible: Boolean(event.payload.reversible),
        state: existing?.state ?? 'open',
        createdAt: existing?.createdAt ?? event.occurredAt,
        updatedAt: event.occurredAt,
        expiresAt: event.payload.expiresAt ?? null,
        evidence: event.evidence,
        response: existing?.response ?? null,
      });
    }
    if (['decision.resolved', 'decision.rejected', 'decision.reversed'].includes(event.type)) {
      const id = String(event.payload.decisionId);
      const decision = decisions.get(id);
      if (decision) {
        decision.state =
          event.type === 'decision.resolved' ? 'resolved' : event.type === 'decision.rejected' ? 'rejected' : 'reversed';
        decision.updatedAt = event.occurredAt;
        decision.response = event.payload.response ?? (event.type === 'decision.rejected' ? 'reject' : 'reversed');
        decision.rationale = event.payload.rationale ?? event.payload.reason ?? '';
      }
    }
    if (event.type === 'recommendation.created') {
      const id = String(event.payload.recommendationId ?? event.id);
      recommendations.set(id, {
        id,
        projectId: event.projectId ?? null,
        missionId: event.missionId ?? null,
        title: event.payload.title,
        rationale: event.payload.rationale,
        score: Number(event.payload.score ?? 0),
        confidence: Number(event.payload.confidence),
        effort: Number(event.payload.effort),
        risk: event.payload.risk ?? null,
        state: 'open',
        createdAt: event.occurredAt,
        updatedAt: event.occurredAt,
        evidence: event.evidence,
      });
    }
    if (event.type.startsWith('recommendation.') && event.type !== 'recommendation.created') {
      const item = recommendations.get(String(event.payload.recommendationId));
      if (item) {
        item.state = event.type.split('.')[1];
        item.updatedAt = event.occurredAt;
        item.until = event.payload.until ?? null;
      }
    }

    if (!event.missionId) continue;
    let mission = missions.get(event.missionId);
    if (event.type === 'mission.drafted') {
      mission = missionShell(event);
      missions.set(event.missionId, mission);
    }
    if (!mission) continue;
    if (event.type.startsWith('mission.')) {
      mission.state = validateMissionTransition(event, mission.state);
      mission.actor = event.actor;
      mission.updatedAt = event.occurredAt;
      mission.latestSummary = String(
        event.payload.summary ?? event.payload.reason ?? event.payload.outcome ?? mission.latestSummary,
      );
    }
    if (event.type === 'evidence.recorded' || event.type === 'evidence.stale') {
      mission.evidence.push(
        ...event.evidence.map((pointer) => ({ ...pointer, currentState: freshState(pointer, now) })),
      );
      mission.updatedAt = event.occurredAt;
    }
    if (event.type === 'deliverable.recorded') {
      mission.deliverables.push({
        id: String(event.payload.deliverableId ?? event.id),
        title: event.payload.title,
        kind: event.payload.kind,
        url: event.payload.url ?? null,
        recordedAt: event.occurredAt,
        evidence: event.evidence,
      });
    }
    if (event.type.startsWith('decision.')) {
      const decisionId = String(event.payload.decisionId ?? event.id);
      if (!mission.decisions.includes(decisionId)) mission.decisions.push(decisionId);
    }
    if (event.type === 'outcome.recorded') {
      mission.outcomes.push({
        verdict: event.payload.verdict,
        summary: event.payload.summary,
        baseline: event.payload.baseline ?? null,
        measured: event.payload.measured ?? null,
        caveats: event.payload.caveats ?? [],
        recordedAt: event.occurredAt,
        evidence: event.evidence,
      });
    }
    mission.timeline.push({
      id: event.id,
      type: event.type,
      occurredAt: event.occurredAt,
      actor: event.actor,
      summary: String(event.payload.summary ?? event.payload.reason ?? event.payload.question ?? event.payload.title ?? event.type),
      evidence: event.evidence,
    });
  }

  for (const decision of decisions.values()) {
    if (decision.state === 'open' && decision.expiresAt && Date.parse(decision.expiresAt) < Date.parse(now)) {
      decision.state = 'stale';
    }
  }

  const projectMap = new Map(projects.map((project) => [project.id, { ...project, missions: [], recommendations: [] }]));
  for (const mission of missions.values()) {
    if (!mission.projectId) continue;
    const project = projectMap.get(mission.projectId) ?? {
      id: mission.projectId,
      name: mission.projectId,
      attention: 'unknown',
      missions: [],
      recommendations: [],
    };
    project.missions.push(mission.id);
    projectMap.set(mission.projectId, project);
  }
  for (const recommendation of recommendations.values()) {
    if (!recommendation.projectId) continue;
    const project = projectMap.get(recommendation.projectId);
    if (project) project.recommendations.push(recommendation.id);
  }

  const missionList = [...missions.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const decisionList = [...decisions.values()].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const recommendationList = [...recommendations.values()]
    .filter((item) => item.state === 'open')
    .sort((a, b) => b.score - a.score || b.updatedAt.localeCompare(a.updatedAt));
  const activity = missionList
    .flatMap((mission) => mission.timeline.map((event) => ({ ...event, missionId: mission.id, projectId: mission.projectId })))
    .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  const home = {
    generatedAt: now,
    needsMe: decisionList.filter((decision) => ['open', 'stale'].includes(decision.state)),
    workingNow: missionList.filter((mission) => ['accepted', 'active', 'blocked', 'awaiting-verification'].includes(mission.state)),
    whatShipped: missionList.filter((mission) => mission.state === 'completed'),
    whatChanged: activity.slice(0, 12),
    recommendedNext: recommendationList,
  };

  return {
    generatedAt: now,
    home,
    missions: missionList,
    decisions: decisionList,
    recommendations: [...recommendations.values()],
    activity,
    projects: [...projectMap.values()],
    actors: [...actors.values()],
    schedules: [...schedules.values()],
  };
}

export function buildDailyBrief(projections) {
  const { home, schedules } = projections;
  return {
    generatedAt: projections.generatedAt,
    headline:
      home.needsMe.length > 0
        ? `${home.needsMe.length} owner decision${home.needsMe.length === 1 ? '' : 's'} need attention`
        : home.workingNow.length > 0
          ? `${home.workingNow.length} mission${home.workingNow.length === 1 ? '' : 's'} currently moving`
          : 'No owner action is required',
    ownerActionPath: home.needsMe.length > 0 ? '/decisions' : null,
    decisions: home.needsMe.slice(0, 5),
    currentWork: home.workingNow.slice(0, 5),
    verifiedOutcomes: home.whatShipped.slice(0, 5),
    materialChanges: home.whatChanged.slice(0, 8),
    recommendedNext: home.recommendedNext.slice(0, 5),
    schedules: schedules.filter((schedule) => schedule.enabled || ['failed', 'stale'].includes(schedule.lastState)),
  };
}
