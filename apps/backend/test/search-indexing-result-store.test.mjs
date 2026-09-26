import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  appendSearchIndexingResult,
  readSearchIndexingResults,
  SEARCH_INDEXING_RESULT_SCHEMA,
} from '../lib/search-indexing-result-store.mjs';

test('stores bounded indexing result receipts in chronological order', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'fleet-indexing-results-')), 'results.jsonl');
  const older = {
    schemaVersion: SEARCH_INDEXING_RESULT_SCHEMA,
    projectId: 'research-papers',
    inspectedUrl: 'https://papers.highsignal.app/',
    checkedAt: '2026-08-05T10:00:00.000Z',
    state: 'not-indexed',
    verdict: 'NEUTRAL',
    coverageState: 'Discovered - currently not indexed',
  };
  const newer = {
    ...older,
    checkedAt: '2026-08-06T10:00:00.000Z',
    state: 'indexed',
    verdict: 'PASS',
    coverageState: 'Submitted and indexed',
    lastCrawlTime: '2026-08-06T08:00:00.000Z',
    googleCanonical: 'https://papers.highsignal.app/',
  };
  appendSearchIndexingResult(newer, { path });
  appendSearchIndexingResult(older, { path });

  assert.deepEqual(readSearchIndexingResults({ path }), [older, newer]);
  assert.equal(readFileSync(path, 'utf8').trim().split('\n').length, 2);
});

test('rejects credentials, unknown fields, and invalid states in indexing results', () => {
  const path = join(tmpdir(), 'unused-indexing-result.jsonl');
  assert.throws(() => appendSearchIndexingResult({
    schemaVersion: SEARCH_INDEXING_RESULT_SCHEMA,
    projectId: 'research-papers',
    inspectedUrl: 'https://user:secret@papers.highsignal.app/',
    checkedAt: '2026-08-05T10:00:00.000Z',
    state: 'indexed',
  }, { path }), /must be an HTTPS URL/);
  assert.throws(() => appendSearchIndexingResult({
    schemaVersion: SEARCH_INDEXING_RESULT_SCHEMA,
    projectId: 'research-papers',
    inspectedUrl: 'https://papers.highsignal.app/',
    checkedAt: '2026-08-05T10:00:00.000Z',
    state: 'indexed',
    providerResponse: 'private',
  }, { path }), /is not allowed/);
  assert.throws(() => appendSearchIndexingResult({
    schemaVersion: SEARCH_INDEXING_RESULT_SCHEMA,
    projectId: 'research-papers',
    inspectedUrl: 'https://papers.highsignal.app/',
    checkedAt: '2026-08-05T10:00:00.000Z',
    state: 'maybe',
  }, { path }), /state is invalid/);
});
