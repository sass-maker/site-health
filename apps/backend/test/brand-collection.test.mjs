import assert from 'node:assert/strict';
import test from 'node:test';
import { BrandEvidenceStore } from '../lib/brand-evidence/store.mjs';
import { collectCommunityEvidence, communityTargets, collectWebsiteEvidence } from '../lib/brand-evidence/collection.mjs';
import { refreshBrandEvidence, dueCommunityProjects, startBrandEvidenceScheduler } from '../lib/brand-evidence/scheduler.mjs';

const now = () => '2026-10-25T12:00:00.000Z';
const profile = { brandName: 'Alphatool', aliases: ['Alpha Tool'], keywords: ['uptime'],
  brandUrl: 'https://alpha.example', communities: [], schedule: 'daily' };
const hit = { objectID: '123', title: 'Alphatool uptime monitoring', created_at: '2026-10-24T10:00:00Z', author: 'sample', points: 4 };
const hnCollector = () => ({
  async collect(target) {
    if (target.url.includes('reddit.com')) throw Object.assign(new Error('secret raw provider body'), { code: 'upstream_blocked', status: 403 });
    return { data: { hits: [hit] } };
  },
  async close() {},
});

test('fresh collection dedupes finding identities, retains review state and records unavailable separately from zero', async () => {
  const store = new BrandEvidenceStore({ databasePath: ':memory:' });
  try {
    store.saveProfile('alpha', profile);
    const result = await collectCommunityEvidence({ store, projectId: 'alpha', collectorFactory: hnCollector, now });
    assert.equal(result.status, 'partial');
    assert.equal(store.listFindings('alpha').length, 1);
    const finding = store.listFindings('alpha')[0];
    store.updateFindingStatus('alpha', finding.id, { status: 'reviewed', now: now() });
    await collectCommunityEvidence({ store, projectId: 'alpha', collectorFactory: hnCollector, now });
    assert.equal(store.listFindings('alpha').length, 1);
    assert.equal(store.listFindings('alpha')[0].id, finding.id);
    assert.equal(store.listFindings('alpha')[0].status, 'reviewed');
    assert.equal(store.listFindings('beta').length, 0);
    const failed = store.listCollections('alpha').find((run) => run.status === 'error');
    assert.equal(failed.matched, null);
    assert.equal(failed.received, null);
    assert.doesNotMatch(failed.errorMessage, /secret/);
    assert.equal(store.listObservations('alpha').length, 0);
    assert.equal(communityTargets(profile, now()).length, 4);
    assert.match(communityTargets({ ...profile, communities: ['r/SaaS'] }, now()).at(-1).url, /\/r\/SaaS\/search.json/);
    const empty = () => ({ collect: async (target) => ({ data: target.url.includes('reddit') ? { data: { children: [] } } : { hits: [] } }), close: async () => {} });
    await collectCommunityEvidence({ store, projectId: 'alpha', collectorFactory: empty, now });
    const success = store.listCollections('alpha')[0];
    assert.equal(success.status, 'completed');
    assert.equal(success.matched, 0);
  } finally { store.close(); }
});

test('denied provider is not queried again, malformed data is an error, website keeps actual extraction evidence', async () => {
  const store = new BrandEvidenceStore({ databasePath: ':memory:' });
  store.saveProfile('alpha', profile);
  try {
    let requests = 0;
    const blocked = () => ({ collect: async () => { requests++; throw Object.assign(new Error(), { code: 'upstream_blocked', status: 429 }); }, close: async () => {} });
    await collectCommunityEvidence({ store, projectId: 'alpha', collectorFactory: blocked, now });
    assert.equal(requests, 2); // one HN and one Reddit attempt
    assert.equal(store.listCollections('alpha').length, 2);
    const invalid = () => ({ collect: async () => ({ data: {} }), close: async () => {} });
    const bad = await collectCommunityEvidence({ store, projectId: 'alpha', collectorFactory: invalid, now });
    assert.equal(bad.status, 'failed');
    assert.ok(bad.results.every((run) => run.matched === null));
    const website = () => ({ collect: async () => ({
      finalUrl: profile.brandUrl, fetchedAt: now(), data: { title: 'Alphatool', description: 'Uptime evidence', text: 'Alphatool monitors uptime.', headings: [{ level: 1, text: 'Alphatool' }] },
    }), close: async () => {} });
    const result = await collectWebsiteEvidence({ store, projectId: 'alpha', collectorFactory: website, now });
    assert.equal(result.status, 'completed');
    assert.equal(result.payload.textExcerpt, 'Alphatool monitors uptime.');
    assert.deepEqual(result.payload.matchedTerms, ['Alphatool', 'uptime']);
  } finally { store.close(); }
});

test('scheduled collection respects current projects and cadence; manual double clicks share one run', async () => {
  const store = new BrandEvidenceStore({ databasePath: ':memory:' });
  store.saveProfile('alpha', profile);
  store.saveProfile('retired', profile);
  let requests = 0;
  const collectorFactory = () => ({
    collect: async (target) => {
      requests++;
      await new Promise((resolve) => setTimeout(resolve, 1));
      if (target.extractor === 'page') return { data: { text: 'Alphatool', title: 'Alpha' }, fetchedAt: now() };
      return { data: target.url.includes('reddit') ? { data: { children: [] } } : { hits: [hit] } };
    }, close: async () => {},
  });
  try {
    const first = refreshBrandEvidence({ store, projectId: 'alpha', scope: 'community', collectorFactory, now });
    const second = refreshBrandEvidence({ store, projectId: 'alpha', scope: 'community', collectorFactory, now });
    assert.equal(first, second);
    await first;
    assert.equal(requests, 5);
    assert.deepEqual(dueCommunityProjects(store, { now: now() }), ['retired']);
    const scheduler = startBrandEvidenceScheduler({ store, projectsProvider: () => [
      { id: 'alpha', lifecycle: { status: 'active' } }, { id: 'retired', lifecycle: { status: 'inactive' } },
    ], now, collectorFactory, env: {}, intervalMs: 1_000_000 });
    await scheduler.tick();
    await scheduler.stop();
    assert.equal(store.listCollections('retired').length, 0);
    assert.equal(store.listChecks('alpha').length, 0); // missing key creates no invented answer
  } finally { store.close(); }
});
