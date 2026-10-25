import assert from 'node:assert/strict';
import test from 'node:test';
import { prepareCommunityBrief, normalizeDrafts, normalizeProductAnalysis } from '../lib/brand-evidence/community-brief.mjs';
import { BrandEvidenceStore } from '../lib/brand-evidence/store.mjs';
import { assertPublicWebsite } from '../lib/brand-evidence/collection.mjs';

const now = () => '2026-10-25T12:00:00.000Z';

function modelReply(content) {
  return new Response(JSON.stringify({ id: 'fixture', object: 'chat.completion', created: 1, model: 'fixture-model',
    choices: [{ index: 0, finish_reason: 'stop', message: { role: 'assistant', content: JSON.stringify(content) } }],
  }), { headers: { 'content-type': 'application/json' } });
}

const analysis = {
  brandName: 'Alphatool', summary: 'Uptime monitoring for small teams.', targetCustomer: 'Small teams',
  keywords: ['uptime'], prompts: ['Which uptime tools suit a small team?'],
  communities: [{ name: 'SaaS', reason: 'Small software teams discuss monitoring here.' }],
};
const factory = () => ({
  collect: async ({ url, extractor }) => {
    if (extractor === 'page') return { fetchedAt: now(), finalUrl: url, data: { title: 'Alphatool', text: 'Alphatool helps small teams monitor uptime.' } };
    if (url.includes('about/rules')) return { data: { rules: [{ short_name: 'Be useful', description: 'Disclose affiliations.' }] } };
    if (url.includes('about.json')) return { data: { data: { display_name: 'SaaS', public_description: 'Software teams' } } };
    return { data: { data: { children: [
      { data: { id: 'thread-1', title: 'How do you monitor uptime?', selftext: 'I need advice for a small team.', permalink: '/r/SaaS/comments/thread1/uptime/', created_utc: Date.parse(now()) / 1000 - 3600, num_comments: 3 } },
      { data: { id: 'locked', title: 'Locked thread', permalink: '/r/SaaS/comments/locked/', locked: true, created_utc: Date.parse(now()) / 1000 } },
      { data: { id: 'stale', title: 'Old thread', permalink: '/r/SaaS/comments/old/', created_utc: 1 } },
    ] } } };
  },
  close: async () => {},
});

test('URL workflow creates verified communities, sourced threads and editable post/comment drafts with gateway attribution', async () => {
  const store = new BrandEvidenceStore({ databasePath: ':memory:' });
  let requests = 0;
  const fetchImpl = async (_url, options) => {
    const request = JSON.parse(options.body);
    assert.equal(request.model, 'auto');
    assert.equal(request.project_id, 'site-health');
    assert.equal(options.headers['x-gateway-project-id'], 'site-health');
    const content = requests++ === 0 ? analysis : {
      posts: [{ subreddit: 'SaaS', title: 'How do small teams handle uptime alerts?', body: 'I build Alphatool. I would like to compare how teams keep alerts useful.' },
        { subreddit: 'invented', title: 'Invented destination', body: 'Should not survive' }],
      comments: [{ threadId: 'thread-1', relevance: 5, fitReason: 'The thread asks about uptime, which the observed product monitors.', body: 'Start by separating availability checks from latency checks. I build Alphatool, so that is the perspective I bring.' },
        { threadId: 'nonexistent', body: 'Invented thread' }],
    };
    return modelReply(content);
  };
  try {
    const brief = await prepareCommunityBrief({
      store, projectId: 'alpha', url: 'https://alpha.example', env: { AI_GATEWAY_API_KEY: 'fixture-only' }, fetchImpl,
      collectorFactory: factory, now,
    });
    assert.equal(brief.status, 'completed');
    assert.equal(brief.communities[0].status, 'verified');
    assert.equal(brief.communities[0].rulesStatus, 'verified');
    assert.equal(brief.threads.length, 1);
    assert.equal(brief.drafts.length, 2);
    assert.equal(brief.drafts[1].sourceUrl, brief.threads[0].url);
    assert.equal(brief.analysisModel, 'fixture-model');
    assert.equal(store.listPrompts('alpha').length, 1);
    assert.equal(store.getProfile('alpha').brandName, 'Alphatool');
    assert.equal(store.listCommunityBriefs('other').length, 0);
    assert.doesNotMatch(JSON.stringify(brief), /fixture-only/);
    assert.throws(() => store.updateCommunityDraft('other', brief.id, brief.drafts[0].id, 'Wrong project'), /not found/);
    store.updateCommunityDraft('alpha', brief.id, brief.drafts[0].id, 'Edited by the owner', 'Edited title', now());
    assert.equal(store.listCommunityBriefs('alpha')[0].drafts[0].body, 'Edited by the owner');
    assert.equal(requests, 2);
  } finally { store.close(); }
});

test('missing model and blocked Reddit remain explicit and never produce invented communities or drafts', async () => {
  const store = new BrandEvidenceStore({ databasePath: ':memory:' });
  try {
    const unavailable = await prepareCommunityBrief({ store, projectId: 'alpha', url: 'https://alpha.example', env: {}, collectorFactory: factory, now });
    assert.equal(unavailable.status, 'unavailable');
    assert.equal(unavailable.website.title, 'Alphatool');
    assert.equal(unavailable.drafts.length, 0);
    let requests = 0;
    const blocked = () => ({
      collect: async (target) => {
        if (target.extractor === 'page') return factory().collect(target);
        requests++;
        throw Object.assign(new Error('raw provider body'), { code: 'upstream_blocked', status: 403 });
      }, close: async () => {},
    });
    const brief = await prepareCommunityBrief({
      store, projectId: 'alpha', url: 'https://alpha.example', env: { AI_GATEWAY_API_KEY: 'fixture' }, now,
      collectorFactory: blocked,
      fetchImpl: async () => modelReply(analysis),
    });
    assert.equal(brief.status, 'partial');
    assert.equal(brief.communities[0].status, 'unverified');
    assert.equal(brief.threads.length, 0);
    assert.equal(brief.drafts.length, 0);
    assert.equal(requests, 2);
    assert.doesNotMatch(JSON.stringify(brief), /raw provider body/);
  } finally { store.close(); }
});

test('generated destinations and public website policies reject unrelated or private targets', async () => {
  assert.equal(normalizeProductAnalysis({ ...analysis, communities: [{ name: 'https://malicious.example', reason: 'x' }] }).communities.length, 0);
  assert.deepEqual(normalizeDrafts({ posts: [{ subreddit: 'unknown', title: 'x', body: 'x' }], comments: [{ threadId: 'x', body: 'x' }] }, [], []), []);
  await assert.rejects(assertPublicWebsite('https://127.0.0.1/'), /Public website/);
  await assert.rejects(assertPublicWebsite('https://example.com', async () => [{ address: '10.0.0.1' }]), /Public website/);
  await assert.rejects(assertPublicWebsite('https://[::1]/'), /Public website/);
  await assertPublicWebsite('https://example.com', async () => [{ address: '93.184.216.34' }]);
  const destination = [{ name: 'SaaS', rulesStatus: 'unavailable' }];
  const threads = [{ id: 'one', subreddit: 'SaaS', title: 'Uptime?', url: 'https://www.reddit.com/r/SaaS/comments/one/' }];
  const drafts = normalizeDrafts({ comments: [
    { threadId: 'one', relevance: 5, fitReason: 'Uptime checks', body: 'Alphatool separates availability from latency.' },
    { threadId: 'one', relevance: 5, fitReason: 'Uptime checks', body: 'In my experience, our customers all prefer Alphatool.' },
    { threadId: 'one', relevance: 2, fitReason: 'Weak fit', body: 'Unrelated advice' },
  ] }, destination, threads, 'Alphatool');
  assert.equal(drafts.length, 1);
  assert.match(drafts[0].body, /^Disclosure: I maintain Alphatool/);
});

test('fresh public snapshots provide real thread context when direct Reddit access is unavailable', async () => {
  const store = new BrandEvidenceStore({ databasePath: ':memory:' });
  const entry = { subreddit: 'SaaS', date: '2026-10-25', capturedAt: now(),
    expiresAt: '2026-10-26T00:00:00Z', source: { revision: 'a'.repeat(64) } };
  let calls = 0;
  const snapshotFactory = () => ({
    collect: async (target) => {
      if (target.extractor === 'page') return factory().collect(target);
      if (target.url.endsWith('/catalog')) return { data: { schema: 'reddit-insights.catalog.v1', entries: [entry] } };
      if (target.url.includes('/api/snapshots/2026-10-25')) return { data: {
        ...entry, schema: 'reddit-insights.snapshot.v1', coverage: { status: 'complete', note: 'Sampled public discussion' },
        posts: [{ id: 'snapshot-thread', title: 'Uptime for small teams?', body: 'Which checks are useful?',
          permalink: '/r/SaaS/comments/snapshot/uptime/', createdUtc: Date.parse(now()) / 1000 - 3600, commentCount: 4 }],
        comments: [{ postId: 'snapshot-thread', body: 'We separate alerts by severity.' }],
      } };
      throw Object.assign(new Error(), { code: 'upstream_blocked', status: 403 });
    }, close: async () => {},
  });
  try {
    const brief = await prepareCommunityBrief({
      store, projectId: 'alpha', url: 'https://alpha.example', env: { AI_GATEWAY_API_KEY: 'fixture' }, now,
      collectorFactory: snapshotFactory,
      fetchImpl: async (_url, options) => {
        const body = JSON.parse(options.body);
        if (calls++ === 0) {
          assert.match(body.messages.at(-1).content, /availableCapturedCommunities/);
          return modelReply(analysis);
        }
        assert.match(body.messages.at(-1).content, /separate alerts by severity/);
        return modelReply({ posts: [{ subreddit: 'SaaS', title: 'Useful monitoring checks', body: 'I build Alphatool. What do you monitor first?' }],
          comments: [{ threadId: 'snapshot-thread', relevance: 5, fitReason: 'The captured discussion needs uptime monitoring.', body: 'Separating alert severity is useful before adding more checks.' }] });
      },
    });
    assert.equal(brief.status, 'partial'); // current rules were not retrieved
    assert.equal(brief.communities[0].evidenceSource, 'Reddit Insights public snapshot');
    assert.equal(brief.threads[0].capturedAt, now());
    assert.equal(brief.threads[0].sourceRevision, 'a'.repeat(64));
    assert.equal(brief.drafts.length, 2);
    assert.equal(brief.drafts[1].rulesStatus, 'unavailable');
  } finally { store.close(); }
});
