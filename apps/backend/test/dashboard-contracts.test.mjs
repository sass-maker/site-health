import assert from 'node:assert/strict';
import test from 'node:test';

import {
  DashboardValidationError,
  normalizeEvent,
  redactForExport,
} from '../lib/dashboard-backend/contracts.mjs';

const actor = { type: 'automation', id: 'dashboard-test', label: 'Dashboard test' };
const now = '2026-07-25T08:00:00.000Z';

function visibilityInput() {
  return {
    type: 'visibility.run-recorded',
    actor,
    projectId: 'codevetter',
    idempotencyKey: 'test/visibility/example',
    payload: {
      runId: 'run-1',
      promptSetId: 'buyer-discovery',
      coverage: {},
      cost: {},
      metrics: {},
      citations: [],
      attempts: [],
    },
  };
}

test('normalizes bounded AI-awareness events with one generated identity', () => {
  const event = normalizeEvent(visibilityInput(), { now });
  assert.match(event.id, /^[0-9a-f-]{36}$/);
  assert.equal(event.recordedAt, now);
  assert.equal(event.projectId, 'codevetter');
});

test('rejects retired workflow event types and private fields', () => {
  assert.throws(
    () => normalizeEvent({
      type: 'mission.drafted',
      actor,
      idempotencyKey: 'test/retired-workflow',
      payload: {},
    }, { now }),
    (error) => error instanceof DashboardValidationError && error.code === 'INVALID_EVENT_TYPE',
  );
  assert.throws(
    () => normalizeEvent({
      ...visibilityInput(),
      payload: { ...visibilityInput().payload, apiKey: 'must-not-be-stored' },
    }, { now }),
    (error) => error instanceof DashboardValidationError && error.code === 'PRIVATE_PAYLOAD_FIELD',
  );
});

test('redacts unsafe nested export fields', () => {
  assert.deepEqual(
    redactForExport({
      result: 'ok',
      nested: { authorization: 'secret', count: 4 },
      request_parameters: { email: 'private' },
    }),
    { result: 'ok', nested: { count: 4 } },
  );
});
