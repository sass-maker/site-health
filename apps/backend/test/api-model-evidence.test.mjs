import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BrandEvidenceStore } from '../lib/brand-evidence/store.mjs';
import { apiModelObservations } from '../lib/dashboard-backend/api-model-evidence.mjs';
test('API panel aggregates keep branded, neutral, unavailable and consumer answers separate', () => {
  const store = {
    lastCompletedApiModelCheck: () => ({ id: 'current', channel: 'api-model', status: 'completed' }),
    listPrompts: () => [{ id: 'b', category: 'panel-v1:brand' }, { id: 'c', category: 'panel-v1:category' }, { id: 'p', category: 'panel-v1:problem' }],
    apiModelPanelObservations: () => [
      { checkId: 'current', promptId: 'b', status: 'completed', brandMentioned: true, model: 'fixture', observedAt: '2026-10-27T00:00:00Z', answerText: 'private answer' },
      { checkId: 'current', promptId: 'c', status: 'completed', brandMentioned: false, model: 'fixture', observedAt: '2026-10-27T00:00:00Z' },
      { checkId: 'current', promptId: 'p', status: 'error', brandMentioned: false },
    ],
  };
  const rows = apiModelObservations([{ id: 'one' }], store);
  assert.equal(rows[0].value, 100); assert.equal(rows[1].value, 0);
  assert.equal(rows[2].value, null); assert.equal(rows[2].observedAt, null);
  assert.ok(!JSON.stringify(rows).includes('private answer'));
  assert.equal(rows[0].qualification, 'proxy');
});

test('real-store panel answers survive more than fifty newer cross-channel and failed-check observations', () => {
  const store = new BrandEvidenceStore({ databasePath: join(mkdtempSync(join(tmpdir(), 'api-panel-window-')), 'brand.sqlite') });
  try {
    store.saveProfile('one', { brandName: 'One' });
    const prompt = store.addPrompt('one', 'Name tools', { category: 'panel-v1:category' });
    const checkId = store.createCheck({ projectId: 'one', channel: 'api-model', trigger: 'manual', startedAt: '2026-10-01T00:00:00Z' });
    store.recordObservation({ projectId: 'one', checkId, channel: 'api-model', provider: 'free-ai', model: 'fixture', promptId: prompt.id, promptText: prompt.promptText, status: 'completed', answerText: 'private One answer', analysis: { brandMentioned: true }, observedAt: '2026-10-01T00:01:00Z' });
    store.finishCheck(checkId, { status: 'completed', attempted: 1, completed: 1, failed: 0, mentionRate: 1, summary: 'fixture', finishedAt: '2026-10-01T00:02:00Z' });
    for (let index = 0; index < 55; index++) store.recordObservation({ projectId: 'one', channel: 'consumer-assistant', provider: 'fixture', model: 'fixture', promptText: `Unrelated ${index}`, status: 'completed', answerText: 'private other answer', analysis: { brandMentioned: false }, observedAt: '2026-10-02T00:00:00Z' });
    for (let index = 0; index < 25; index++) {
      const id = store.createCheck({ projectId: 'one', channel: 'api-model', trigger: 'manual', startedAt: '2026-10-03T00:00:00Z' });
      store.finishCheck(id, { status: 'failed', attempted: 1, completed: 0, failed: 1, mentionRate: null, summary: 'fixture', finishedAt: '2026-10-03T00:01:00Z' });
    }
    const legacy = store.addPrompt('one', 'Historical question', { category: 'legacy' });
    const partial = store.createCheck({ projectId: 'one', channel: 'api-model', trigger: 'manual', startedAt: '2026-10-04T00:00:00Z' });
    store.recordObservation({ projectId: 'one', checkId: partial, channel: 'api-model', provider: 'fixture', model: 'fixture', promptId: legacy.id, promptText: legacy.promptText, status: 'completed', answerText: 'private legacy answer', analysis: { brandMentioned: false }, observedAt: '2026-10-04T00:00:00Z' });
    store.recordObservation({ projectId: 'one', checkId: partial, channel: 'api-model', provider: 'fixture', model: 'fixture', promptId: prompt.id, promptText: prompt.promptText, status: 'error', errorMessage: 'unavailable', observedAt: '2026-10-04T00:00:00Z' });
    store.finishCheck(partial, { status: 'partial', attempted: 2, completed: 1, failed: 1, mentionRate: 0, summary: 'fixture', finishedAt: '2026-10-04T00:01:00Z' });
    const rows = apiModelObservations([{ id: 'one' }], store);
    const category = rows.find(row => row.id === 'api-model:category');
    assert.equal(category.value, 100); assert.equal(category.observedAt, '2026-10-01T00:01:00.000Z');
    assert.ok(!JSON.stringify(rows).includes('private'));
  } finally { store.close(); }
});
