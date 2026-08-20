import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FounderControlValidationError,
  normalizeEvent,
  redactForExport,
} from '../lib/founder-control/contracts.mjs';

const actor = { type: 'automation', id: 'foundry-test', label: 'Foundry test' };
const now = '2026-07-25T08:00:00.000Z';

function recommendationInput() {
  return {
    type: 'recommendation.created',
    actor,
    projectId: 'codevetter',
    idempotencyKey: 'test/recommendation/example',
    payload: {
      title: 'Verify the release',
      rationale: 'Current evidence is incomplete.',
      impact: 0.8,
      confidence: 0.7,
      effort: 0.2,
      reversibility: 1,
    },
  };
}

test('normalizes bounded evidence events with one generated identity', () => {
  const event = normalizeEvent(recommendationInput(), { now });
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
    (error) => error instanceof FounderControlValidationError && error.code === 'INVALID_EVENT_TYPE',
  );
  assert.throws(
    () => normalizeEvent({
      ...recommendationInput(),
      payload: { ...recommendationInput().payload, apiKey: 'must-not-be-stored' },
    }, { now }),
    (error) => error instanceof FounderControlValidationError && error.code === 'PRIVATE_PAYLOAD_FIELD',
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
