import assert from 'node:assert/strict';
import test from 'node:test';

import {
  FounderControlValidationError,
  normalizeEvent,
  redactForExport,
  validateMissionTransition,
} from '../lib/founder-control/contracts.mjs';

const actor = { type: 'owner', id: 'founder', label: 'Founder' };
const now = '2026-07-25T08:00:00.000Z';

test('normalizes bounded events and preserves one generated identity', () => {
  const event = normalizeEvent(
    {
      type: 'mission.drafted',
      actor,
      missionId: 'mission/example',
      idempotencyKey: 'test/mission/example',
      payload: {
        title: 'Example',
        outcome: 'A verified example',
        completionCriteria: ['Verified'],
        authority: { mode: 'owner-acceptance-required' },
      },
    },
    { now },
  );
  assert.match(event.id, /^[0-9a-f-]{36}$/);
  assert.equal(event.recordedAt, now);
  assert.equal(validateMissionTransition(event, null), 'draft');
});

test('rejects private fields and illegal mission transitions', () => {
  assert.throws(
    () =>
      normalizeEvent(
        {
          type: 'mission.completed',
          actor,
          missionId: 'mission/example',
          idempotencyKey: 'test/mission/private',
          payload: { summary: 'Done', apiKey: 'must-not-be-stored' },
        },
        { now },
      ),
    (error) => error instanceof FounderControlValidationError && error.code === 'PRIVATE_PAYLOAD_FIELD',
  );
  const completed = normalizeEvent(
    {
      type: 'mission.completed',
      actor,
      missionId: 'mission/example',
      idempotencyKey: 'test/mission/completed',
      payload: { summary: 'Done' },
    },
    { now },
  );
  assert.throws(
    () => validateMissionTransition(completed, 'draft'),
    (error) => error.code === 'ILLEGAL_MISSION_TRANSITION',
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
