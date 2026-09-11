import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { DashboardStore, verifyBackup } from '../lib/dashboard-backend/store.mjs';
import { normalizeHistoricalEvent } from '../lib/dashboard-backend/contracts.mjs';

const now = '2026-07-25T08:00:00.000Z';
const actor = { type: 'automation', id: 'dashboard-test', label: 'Dashboard test' };

function createStore(name = 'ledger.sqlite') {
  return new DashboardStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'dashboard-backend-')), name),
    projects: [{ id: 'codevetter', name: 'CodeVetter', attention: 'focus' }],
  });
}

function visibilityInput() {
  return {
    type: 'visibility.run-recorded',
    actor,
    projectId: 'codevetter',
    idempotencyKey: 'test/visibility/example',
    occurredAt: now,
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

function recommendationInput() {
  return {
    type: 'recommendation.created',
    actor,
    projectId: 'codevetter',
    idempotencyKey: 'test/recommendation/example',
    occurredAt: now,
    payload: {
      title: 'Improve evidence freshness',
      rationale: 'Synthetic historical fixture',
      impact: 'medium',
      effort: 'small',
      confidence: 0.8,
      score: 4,
      reversibility: 'high',
      attention: 'focus',
    },
    evidence: [],
  };
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

function digestEvents(events) {
  return createHash('sha256').update(stableJson(events)).digest('hex');
}

test('appends AI-awareness events idempotently and rejects conflicts', () => {
  const store = createStore();
  const first = store.append(visibilityInput(), { now });
  const repeated = store.append(visibilityInput(), { now });
  assert.equal(first.duplicate, false);
  assert.equal(repeated.duplicate, true);
  assert.equal(store.listEvents().length, 1);
  assert.throws(
    () => store.append({
      ...visibilityInput(),
      payload: { ...visibilityInput().payload, runId: 'different' },
    }, { now }),
    (error) => error.code === 'IDEMPOTENCY_CONFLICT',
  );
  store.close();
});

test('rebuilds deterministic projections and verifies restore/replay', () => {
  const store = createStore();
  store.append(visibilityInput(), { now });
  const firstProjection = store.rebuildProjections({ now: '2026-07-25T09:00:00.000Z' });
  assert.equal(firstProjection.aiVisibility.projects[0].latest.runId, 'run-1');
  const backup = store.createBackup({ now: '2026-07-25T09:00:00.000Z' });
  assert.equal(verifyBackup(backup).valid, true);

  const restored = createStore('restored.sqlite');
  const replayed = restored.restoreBackup(backup);
  assert.deepEqual(replayed, firstProjection);
  store.close();
  restored.close();
});

test('verifies and restores retired recommendation events without weakening ingest', () => {
  const store = createStore();
  const historicalEvent = normalizeHistoricalEvent({
    ...recommendationInput(),
    id: 'historical-recommendation-1',
  }, { now });
  const backup = {
    format: 'fleet-founder-control-backup',
    version: 1,
    createdAt: '2026-07-25T09:00:00.000Z',
    eventCount: 1,
    events: [{ sequence: 1, ...historicalEvent }],
    backupDestination: 'not-configured',
  };
  backup.digest = digestEvents(backup.events);
  assert.equal(verifyBackup(backup).valid, true);

  const restored = createStore('historical-restored.sqlite');
  restored.restoreBackup(backup);
  assert.deepEqual(restored.createBackup().events, backup.events);
  assert.throws(
    () => restored.append({ ...recommendationInput(), idempotencyKey: 'test/recommendation/live-ingest' }, { now }),
    (error) => error.code === 'INVALID_EVENT_TYPE',
  );
  store.close();
  restored.close();
});

test('rejects malformed retired events and tampered backup digests', () => {
  const store = createStore();
  const malformedEvent = {
    sequence: 1,
    ...recommendationInput(),
    id: 'historical-recommendation-malformed',
    payload: { title: 'missing fields' },
  };
  const backup = {
    format: 'fleet-founder-control-backup',
    version: 1,
    eventCount: 1,
    events: [malformedEvent],
    digest: digestEvents([malformedEvent]),
  };
  assert.throws(() => verifyBackup(backup), (error) => error.code === 'MISSING_PAYLOAD_FIELD');
  const unknownEvent = { ...malformedEvent, id: 'unknown-event', type: 'unknown.event' };
  const unknownBackup = { ...backup, events: [unknownEvent], digest: digestEvents([unknownEvent]) };
  assert.throws(() => verifyBackup(unknownBackup), (error) => error.code === 'INVALID_EVENT_TYPE');
  store.close();
});
