import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BrandEvidenceStore } from '../lib/brand-evidence/store.mjs';
import { apiModelObservations } from '../lib/dashboard-backend/api-model-evidence.mjs';
test('API panel aggregates keep branded, neutral, unavailable and consumer answers separate', () => {
  const store = {
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
    const brand = store.addPrompt('one', 'What is One?', { category: 'panel-v1:brand' });
    const legacy = store.addPrompt('one', 'Historical question', { category: 'legacy' });
    const partial = store.createCheck({ projectId: 'one', channel: 'api-model', trigger: 'manual', startedAt: '2026-10-04T00:00:00Z' });
    store.recordObservation({ projectId: 'one', checkId: partial, channel: 'api-model', provider: 'fixture', model: 'fixture', promptId: legacy.id, promptText: legacy.promptText, status: 'completed', answerText: 'private legacy answer', analysis: { brandMentioned: false }, observedAt: '2026-10-04T00:00:00Z' });
    store.recordObservation({ projectId: 'one', checkId: partial, channel: 'api-model', provider: 'fixture', model: 'fixture', promptId: prompt.id, promptText: prompt.promptText, status: 'error', errorMessage: 'unavailable', observedAt: '2026-10-04T00:00:00Z' });
    store.recordObservation({ projectId: 'one', checkId: partial, channel: 'api-model', provider: 'fixture', model: 'fixture', promptId: brand.id, promptText: brand.promptText, status: 'completed', answerText: 'private brand answer', analysis: { brandMentioned: true }, observedAt: '2026-10-04T00:00:00Z' });
    store.finishCheck(partial, { status: 'partial', attempted: 3, completed: 2, failed: 1, mentionRate: 0, summary: 'fixture', finishedAt: '2026-10-04T00:01:00Z' });
    const rows = apiModelObservations([{ id: 'one' }], store);
    const category = rows.find(row => row.id === 'api-model:category');
    assert.equal(rows.find(row => row.id === 'api-model:brand').value, 100);
    assert.equal(rows.find(row => row.id === 'api-model:brand').observedAt, '2026-10-04T00:00:00.000Z');
    assert.equal(category.value, 100); assert.equal(category.observedAt, '2026-10-01T00:01:00.000Z');
    assert.ok(!JSON.stringify(rows).includes('private'));
    const newest = store.createCheck({ projectId: 'one', channel: 'api-model', trigger: 'manual', startedAt: '2026-10-05T00:00:00Z' });
    store.recordObservation({ projectId: 'one', checkId: newest, channel: 'api-model', provider: 'fixture', model: 'fixture', promptId: prompt.id, promptText: prompt.promptText, status: 'completed', answerText: 'private newest answer', analysis: { brandMentioned: false }, observedAt: '2026-10-05T00:00:00Z' });
    store.finishCheck(newest, { status: 'completed', attempted: 1, completed: 1, failed: 0, mentionRate: 0, summary: 'fixture', finishedAt: '2026-10-05T00:01:00Z' });
    const fresh = apiModelObservations([{ id: 'one' }], store).find(row => row.id === 'api-model:category');
    assert.equal(fresh.value, 0); assert.equal(fresh.observedAt, '2026-10-05T00:00:00.000Z');
  } finally { store.close(); }
});


test('mixed-date intent aggregates retain the oldest date and disclose the full answer date range', () => {
  const rows = apiModelObservations([{ id: 'one' }], {
    listPrompts: () => [{ id: 'a', category: 'panel-v1:category' }, { id: 'b', category: 'panel-v1:category' }],
    apiModelPanelObservations: () => [{ promptId: 'a', status: 'completed', brandMentioned: true, observedAt: '2026-10-01T00:00:00Z' }, { promptId: 'b', status: 'completed', brandMentioned: false, observedAt: '2026-10-04T00:00:00Z' }],
  });
  const category = rows.find(row => row.id === 'api-model:category');
  assert.equal(category.value, 50); assert.equal(category.observedAt, '2026-10-01T00:00:00Z');
  assert.match(category.window, /answers dated 2026-10-01 to 2026-10-04/);
});
