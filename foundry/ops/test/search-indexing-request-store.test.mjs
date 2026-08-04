import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  appendSearchIndexingRequest,
  readSearchIndexingRequests,
  SEARCH_INDEXING_REQUEST_SCHEMA,
} from '../lib/search-indexing-request-store.mjs';

test('stores bounded indexing request receipts in chronological order', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'fleet-indexing-requests-')), 'ledger.jsonl');
  const older = {
    schemaVersion: SEARCH_INDEXING_REQUEST_SCHEMA,
    projectId: 'research-papers',
    inspectedUrl: 'https://papers.highsignal.app/',
    requestedAt: '2026-08-05T10:00:00.000Z',
  };
  const newer = { ...older, requestedAt: '2026-08-05T11:00:00.000Z' };
  appendSearchIndexingRequest(newer, { path });
  appendSearchIndexingRequest(older, { path });

  assert.deepEqual(readSearchIndexingRequests({ path }), [older, newer]);
  assert.equal(readFileSync(path, 'utf8').trim().split('\n').length, 2);
});

test('rejects credentials and unknown fields in indexing request receipts', () => {
  assert.throws(() => appendSearchIndexingRequest({
    schemaVersion: SEARCH_INDEXING_REQUEST_SCHEMA,
    projectId: 'research-papers',
    inspectedUrl: 'https://user:secret@papers.highsignal.app/',
    requestedAt: '2026-08-05T10:00:00.000Z',
  }, { path: join(tmpdir(), 'unused-indexing-request.jsonl') }), /must be an HTTPS URL/);
  assert.throws(() => appendSearchIndexingRequest({
    schemaVersion: SEARCH_INDEXING_REQUEST_SCHEMA,
    projectId: 'research-papers',
    inspectedUrl: 'https://papers.highsignal.app/',
    requestedAt: '2026-08-05T10:00:00.000Z',
    providerResponse: 'private',
  }, { path: join(tmpdir(), 'unused-indexing-request.jsonl') }), /is not allowed/);
});
