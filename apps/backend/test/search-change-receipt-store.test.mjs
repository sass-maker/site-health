import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { appendSearchChangeReceipt, readSearchChangeReceipts, SEARCH_CHANGE_RECEIPT_SCHEMA } from '../lib/search-change-receipt-store.mjs';

test('stores bounded search change receipts', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'fleet-search-changes-')), 'ledger.jsonl');
  const receipt = appendSearchChangeReceipt({
    schemaVersion: SEARCH_CHANGE_RECEIPT_SCHEMA,
    projectId: 'rolepatch',
    actionId: 'build-search-relevance',
    query: 'ats metrics',
    landingPage: 'https://rolepatch.com/blog/ats-score-explained',
    revision: 'eae1a6e9b937810f80edbba0befa01cf356f1718',
    changedAt: '2026-08-05T12:00:00.000Z',
  }, { path });
  assert.deepEqual(readSearchChangeReceipts({ path }), [receipt]);
});

test('rejects unbounded search change evidence', () => {
  assert.throws(() => appendSearchChangeReceipt({
    schemaVersion: SEARCH_CHANGE_RECEIPT_SCHEMA,
    projectId: 'rolepatch',
    actionId: 'build-search-relevance',
    query: 'ats metrics',
    landingPage: 'https://user:secret@rolepatch.com/',
    revision: 'short',
    changedAt: 'now',
  }), /landingPage must be an HTTPS URL/);
});
