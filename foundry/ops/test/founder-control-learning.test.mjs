import assert from 'node:assert/strict';
import test from 'node:test';

import { attributionReady, recommendationEvent, scoreRecommendation } from '../lib/founder-control/recommendations.mjs';
import { draftMission } from '../lib/founder-control/intake.mjs';
import { buildOwnerNotifications, evaluateOutcomeWindow } from '../lib/founder-control/learning.mjs';
import { deliverOwnerNotifications, toFleetNotification } from '../lib/founder-control/notification-delivery.mjs';

const now = '2026-07-25T08:00:00.000Z';

test('drafts known projects and asks for clarification on unknown ownership', () => {
  const projects = [{ id: 'codevetter', attention: 'focus' }];
  const known = draftMission({ title: 'Ship proof', projectId: 'codevetter' }, { projects, now });
  assert.equal(known.event.projectId, 'codevetter');
  assert.equal(known.decision, null);

  const unknown = draftMission({ title: 'Ship proof', projectId: 'unknown' }, { projects, now });
  assert.equal(unknown.event.projectId, undefined);
  assert.equal(unknown.event.payload.unresolvedProject, 'unknown');
  assert.equal(unknown.decision.type, 'decision.requested');
});

test('scores useful work and suppresses ignored noise except material risks', () => {
  const high = scoreRecommendation(
    { impact: 1, confidence: 0.9, effort: 0.2, reversibility: 1, attention: 'focus', observedAt: now },
    { now },
  );
  const low = scoreRecommendation(
    { impact: 0.2, confidence: 0.3, effort: 0.9, reversibility: 0.2, attention: 'parked', observedAt: now },
    { now },
  );
  assert.ok(high > low);
  assert.equal(
    recommendationEvent({
      title: 'Polish ignored project',
      rationale: 'No material risk',
      impact: 0.5,
      confidence: 0.5,
      effort: 0.5,
      reversibility: 1,
      attention: 'ignored',
      idempotencyKey: 'recommendation/ignored',
      observedAt: now,
    }),
    null,
  );
  assert.ok(
    recommendationEvent({
      title: 'Stop data loss',
      rationale: 'Data is at risk',
      impact: 1,
      confidence: 1,
      effort: 0.2,
      reversibility: 1,
      attention: 'ignored',
      risk: 'data-loss',
      idempotencyKey: 'recommendation/data-loss',
      observedAt: now,
    }),
  );
});

test('requires merge, CI, deployment, and smoke evidence before attribution', () => {
  const pointer = (provider, kind) => ({ provider, kind, state: 'verified' });
  assert.equal(
    attributionReady([
      pointer('github', 'commit'),
      pointer('github', 'workflow-run'),
      pointer('cloudflare', 'deployment'),
      pointer('cloudflare', 'production-smoke'),
    ]).ready,
    true,
  );
  assert.equal(attributionReady([pointer('cloudflare', 'deployment')]).ready, false);
});

test('evaluates bounded outcome windows without overstating weak evidence', () => {
  assert.equal(
    evaluateOutcomeWindow({ baseline: 100, measured: 118, minimumChange: 10 }).verdict,
    'supported',
  );
  assert.equal(
    evaluateOutcomeWindow({ baseline: 100, measured: 95, minimumChange: 10 }).verdict,
    'unsupported',
  );
  assert.equal(
    evaluateOutcomeWindow({ baseline: 100, measured: 118, minimumChange: 10, caveats: ['campaign overlap'] }).verdict,
    'mixed',
  );
  assert.equal(
    evaluateOutcomeWindow({ baseline: 100, measured: null, windowEnded: false }).verdict,
    'not-yet-measurable',
  );
});

test('deduplicates notifications and only escalates owner-relevant states', () => {
  const projections = {
    decisions: [
      {
        id: 'decision/1',
        state: 'open',
        updatedAt: now,
        question: 'Approve release?',
        projectId: 'codevetter',
        missionId: 'mission/1',
      },
    ],
    missions: [
      {
        id: 'mission/2',
        title: 'Blocked mission',
        state: 'blocked',
        projectId: 'codevetter',
        authority: {},
        timeline: [{ type: 'mission.blocked', occurredAt: '2026-07-23T08:00:00.000Z' }],
      },
    ],
    schedules: [
      {
        id: 'schedule/1',
        name: 'Critical smoke',
        lastState: 'failed',
        lastRunAt: now,
      },
    ],
    recommendations: [
      {
        id: 'recommendation/risk',
        title: 'Stop unexpected provider spend',
        state: 'open',
        updatedAt: now,
        projectId: 'codevetter',
        risk: 'cost',
      },
      {
        id: 'recommendation/routine',
        title: 'Routine polish',
        state: 'open',
        updatedAt: now,
        projectId: 'codevetter',
        risk: null,
      },
    ],
  };
  const notifications = buildOwnerNotifications(projections, { now });
  assert.deepEqual(
    notifications.map((item) => item.kind).sort(),
    ['critical-work-failed', 'material-risk', 'owner-decision', 'prolonged-blocker'],
  );
  assert.equal(new Set(notifications.map((item) => item.key)).size, notifications.length);
});

test('maps owner actions to the durable Fleet outbox without hiding duplicates', async () => {
  const projections = {
    decisions: [
      {
        id: 'decision/1',
        state: 'open',
        updatedAt: now,
        question: 'Approve release?',
        projectId: 'codevetter',
        missionId: 'mission/1',
      },
    ],
    missions: [],
    schedules: [],
    recommendations: [],
  };
  const emitted = [];
  const summary = await deliverOwnerNotifications(projections, {
    now,
    emit: async (notification) => {
      emitted.push(notification);
      return emitted.length === 1 ? { queued: true } : { duplicate: true };
    },
  });
  assert.equal(summary.considered, 1);
  assert.equal(summary.queued, 1);
  assert.equal(summary.duplicates, 0);
  assert.equal(emitted[0].dedupeKey, `decision/decision/1/${now}`);
  assert.equal(emitted[0].severity, 'warning');
  assert.equal(emitted[0].url, 'https://fleet.sassmaker.com/decisions');

  const completion = toFleetNotification({
    key: 'complete/1',
    kind: 'requested-completion',
    severity: 'info',
    title: 'Requested work completed',
    missionId: 'mission/1',
  });
  assert.equal(completion.forceOwnerChannel, true);
  assert.equal(completion.severity, 'success');
});
