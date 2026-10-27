import assert from 'node:assert/strict';
import test from 'node:test';
import { apiModelObservations } from '../lib/dashboard-backend/api-model-evidence.mjs';
test('API panel aggregates keep branded, neutral, unavailable and consumer answers separate', () => {
  const store = {
    listChecks: () => [{ id: 'current', channel: 'api-model', status: 'completed' }],
    listPrompts: () => [{ id: 'b', category: 'panel-v1:brand' }, { id: 'c', category: 'panel-v1:category' }, { id: 'p', category: 'panel-v1:problem' }],
    listObservations: () => [
      { checkId: 'current', promptId: 'b', status: 'completed', brandMentioned: true, model: 'fixture', observedAt: '2026-10-27T00:00:00Z', answerText: 'private answer' },
      { checkId: 'current', promptId: 'c', status: 'completed', brandMentioned: false, model: 'fixture', observedAt: '2026-10-27T00:00:00Z' },
      { checkId: 'current', promptId: 'p', status: 'error', brandMentioned: false },
      { checkId: 'consumer', promptId: 'c', status: 'completed', brandMentioned: true },
    ],
  };
  const rows = apiModelObservations([{ id: 'one' }], store);
  assert.equal(rows[0].value, 100); assert.equal(rows[1].value, 0);
  assert.equal(rows[2].value, null); assert.equal(rows[2].observedAt, null);
  assert.ok(!JSON.stringify(rows).includes('private answer'));
  assert.equal(rows[0].qualification, 'proxy');
});
