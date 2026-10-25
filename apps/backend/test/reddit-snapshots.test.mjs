import assert from 'node:assert/strict';
import test from 'node:test';
import { loadRedditCatalog, loadRedditSnapshot, snapshotThreads } from '../lib/brand-evidence/reddit-snapshots.mjs';
import { containsTerm } from '../lib/brand-evidence/term-match.mjs';

test('snapshot contract rejects expired leases and wrong revisions and omits authors', async () => {
  const entry = { subreddit: 'SaaS', date: '2026-10-25', source: { revision: 'a'.repeat(64) },
    capturedAt: '2026-10-25T00:00:00Z', expiresAt: '2026-10-26T00:00:00Z' };
  const now = '2026-10-25T12:00:00Z';
  const catalog = await loadRedditCatalog({ collect: async () => ({ data: { schema: 'reddit-insights.catalog.v1',
    entries: [entry, { ...entry, subreddit: 'expired', expiresAt: '2026-10-01T00:00:00Z' }] } }) }, now);
  assert.deepEqual([...catalog.keys()], ['saas']);
  const data = { ...entry, schema: 'reddit-insights.snapshot.v1',
    posts: [{ id: '1', title: 'AI tools', body: 'How do you choose?', permalink: '/r/SaaS/comments/1/ai/',
      createdUtc: Date.parse(now) / 1000 - 60, author: 'must-not-retain' }], comments: [] };
  const result = await loadRedditSnapshot({ collect: async () => ({ data }) }, entry, now);
  assert.doesNotMatch(JSON.stringify(result), /must-not-retain/);
  assert.equal(snapshotThreads(result, ['AI'], now).length, 1);
  await assert.rejects(loadRedditSnapshot({ collect: async () => ({ data: { ...data, expiresAt: '2026-10-01' } }) }, entry, now), /expired/);
  await assert.rejects(loadRedditSnapshot({ collect: async () => ({ data: { ...data, source: { revision: 'b'.repeat(64) } } }) }, entry, now), /Invalid/);
  assert.equal(containsTerm('He said something about paid plans', 'AI'), false);
});
