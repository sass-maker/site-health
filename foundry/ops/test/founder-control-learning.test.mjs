import assert from 'node:assert/strict';
import test from 'node:test';

import { attributionReady, recommendationEvent, scoreRecommendation } from '../lib/founder-control/recommendations.mjs';
import { buildOwnerNotifications, evaluateOutcomeWindow } from '../lib/founder-control/learning.mjs';
import { deliverOwnerNotifications, toFleetNotification } from '../lib/founder-control/notification-delivery.mjs';

const now = '2026-07-25T08:00:00.000Z';

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
  assert.equal(recommendationEvent({
    title: 'Polish ignored project',
    rationale: 'No material risk',
    impact: 0.5,
    confidence: 0.5,
    effort: 0.5,
    reversibility: 1,
    attention: 'ignored',
    idempotencyKey: 'recommendation/ignored',
    observedAt: now,
  }), null);
  assert.ok(recommendationEvent({
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
  }));
});

test('requires merge, CI, deployment, and smoke evidence before attribution', () => {
  const pointer = (provider, kind) => ({ provider, kind, state: 'verified' });
  assert.equal(attributionReady([
    pointer('github', 'commit'),
    pointer('github', 'workflow-run'),
    pointer('cloudflare', 'deployment'),
    pointer('cloudflare', 'production-smoke'),
  ]).ready, true);
  assert.equal(attributionReady([pointer('cloudflare', 'deployment')]).ready, false);
});

test('evaluates bounded outcome windows without overstating weak evidence', () => {
  assert.equal(evaluateOutcomeWindow({ baseline: 100, measured: 118, minimumChange: 10 }).verdict, 'supported');
  assert.equal(evaluateOutcomeWindow({ baseline: 100, measured: 95, minimumChange: 10 }).verdict, 'unsupported');
  assert.equal(evaluateOutcomeWindow({
    baseline: 100,
    measured: 118,
    minimumChange: 10,
    caveats: ['campaign overlap'],
  }).verdict, 'mixed');
  assert.equal(evaluateOutcomeWindow({ baseline: 100, measured: null, windowEnded: false }).verdict, 'not-yet-measurable');
});

function notificationProjection() {
  return {
    schedules: [{ id: 'schedule/1', name: 'Critical smoke', lastState: 'failed', lastRunAt: now }],
    recommendations: [{
      id: 'recommendation/risk',
      title: 'Stop unexpected provider spend',
      state: 'open',
      updatedAt: now,
      projectId: 'codevetter',
      risk: 'cost',
    }],
  };
}

test('deduplicates notifications and only escalates critical evidence', () => {
  const notifications = buildOwnerNotifications(notificationProjection(), { now });
  assert.deepEqual(notifications.map((item) => item.kind).sort(), ['critical-work-failed', 'material-risk']);
  assert.equal(new Set(notifications.map((item) => item.key)).size, notifications.length);
});

test('maps critical evidence to the durable Fleet outbox', async () => {
  const emitted = [];
  const summary = await deliverOwnerNotifications(notificationProjection(), {
    now,
    emit: async (notification) => {
      emitted.push(notification);
      return { queued: true };
    },
  });
  assert.equal(summary.considered, 2);
  assert.equal(summary.queued, 2);
  assert.equal(emitted[1].url, 'https://fleet.sassmaker.com/projects/codevetter');

  const schedule = toFleetNotification({
    key: 'schedule/1',
    kind: 'critical-work-failed',
    severity: 'critical',
    title: 'Critical smoke failed',
  });
  assert.equal(schedule.forceOwnerChannel, false);
  assert.equal(schedule.severity, 'critical');
});
