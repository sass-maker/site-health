import assert from 'node:assert/strict';
import test from 'node:test';
import { createOutcomeScope } from '../src/lib/cohort-scope.mjs';

test('failed inventory keeps outcome evidence visible and retries before applying current scope', async () => {
  let attempts = 0;
  const messages = [];
  const scope = createOutcomeScope(async () => {
    if (++attempts === 1) throw new Error('temporary inventory failure');
    return [{ id: 'current', lifecycle: { status: 'active' } }];
  }, (message) => messages.push(message));
  const payload = { rows: [{ projectId: 'current', clicks: 0 }, { projectId: 'retired', clicks: 12 }] };
  assert.equal(await scope(payload), payload);
  assert.match(messages.at(-1), /Scope unavailable.*all recorded/);
  assert.deepEqual((await scope(payload)).rows, [payload.rows[0]]);
  assert.match(messages.at(-1), /^1 current products/);
  assert.equal((await scope(payload, true)).rows, payload.rows);
  assert.equal(attempts, 2);
});
