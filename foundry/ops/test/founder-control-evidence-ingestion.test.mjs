import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  appendCurrentEvidenceBatch,
  appendMarketingReceipt,
  marketingReceiptStages,
} from '../lib/founder-control/evidence-ingestion.mjs';
import { FounderControlStore } from '../lib/founder-control/store.mjs';

const now = '2026-07-25T10:00:00.000Z';

function seededStore() {
  const store = new FounderControlStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'founder-evidence-')), 'ledger.sqlite'),
    projects: [{ id: 'high-signal', name: 'High Signal', attention: 'my-work' }],
  });
  store.append(
    {
      type: 'mission.drafted',
      actor: { type: 'owner', id: 'founder' },
      missionId: 'mission/high-signal-marketing',
      projectId: 'high-signal',
      idempotencyKey: 'test/mission/high-signal-marketing',
      occurredAt: now,
      payload: {
        title: 'Measure High Signal launch',
        outcome: 'Marketing outcome is measured',
        completionCriteria: ['Publication and measurement receipts exist'],
        authority: { mode: 'owner-acceptance-required' },
      },
    },
    { now },
  );
  return store;
}

function receipt(overrides = {}) {
  return {
    missionId: 'mission/high-signal-marketing',
    projectId: 'high-signal',
    stage: 'publication',
    provider: 'postiz',
    kind: 'publication',
    id: 'publication-42',
    state: 'verified',
    observedAt: now,
    freshUntil: '2026-07-26T10:00:00.000Z',
    url: 'https://postiz.example.test/publications/42',
    summary: { status: 'published', channel: 'linkedin' },
    confidence: 1,
    ...overrides,
  };
}

test('backfills only current safe evidence and remains idempotent', () => {
  const store = seededStore();
  const document = { version: 1, receipts: [receipt({ stage: undefined })] };
  const first = appendCurrentEvidenceBatch(store, document);
  const second = appendCurrentEvidenceBatch(store, document);
  assert.deepEqual(first, { received: 1, appended: 1, duplicates: 0 });
  assert.deepEqual(second, { received: 1, appended: 0, duplicates: 1 });
  assert.equal(store.rebuildProjections({ now }).missions[0].evidence.length, 1);
  store.close();
});

test('rejects raw or unsupported evidence fields', () => {
  const store = seededStore();
  assert.throws(
    () =>
      appendCurrentEvidenceBatch(store, {
        version: 1,
        receipts: [receipt({ stage: undefined, rawLog: 'private provider output' })],
      }),
    /unsupported fields: rawLog/,
  );
  store.close();
});

test('attaches every marketing stage to the canonical mission without provider payloads', () => {
  const store = seededStore();
  marketingReceiptStages.forEach((stage, index) => {
    appendMarketingReceipt(
      store,
      receipt({
        stage,
        provider: stage === 'approval' ? 'foundry' : 'postiz',
        kind: stage,
        id: `${stage}-${index}`,
      }),
    );
  });
  appendMarketingReceipt(store, receipt({ stage: 'publication', id: 'publication-extra' }));
  const repeated = appendMarketingReceipt(
    store,
    receipt({ stage: 'publication', id: 'publication-extra' }),
  );
  const projection = store.rebuildProjections({ now });
  assert.equal(repeated.duplicate, true);
  assert.equal(projection.missions[0].evidence.length, marketingReceiptStages.length + 1);
  assert.deepEqual(
    projection.missions[0].timeline
      .filter((event) => event.type === 'evidence.recorded')
      .map((event) => event.summary),
    marketingReceiptStages
      .map((stage) => `Marketing ${stage} receipt`)
      .concat('Marketing publication receipt'),
  );
  store.close();
});

test('requires an existing mission and a known marketing stage', () => {
  const store = seededStore();
  assert.throws(
    () => appendMarketingReceipt(store, receipt({ missionId: 'mission/unknown' })),
    /unknown mission/,
  );
  assert.throws(
    () => appendMarketingReceipt(store, receipt({ stage: 'auto-publish' })),
    /unsupported marketing receipt stage/,
  );
  store.close();
});
