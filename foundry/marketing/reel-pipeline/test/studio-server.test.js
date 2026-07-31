import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { writeFile } from 'node:fs/promises';
import { createServer } from '../src/server/index.js';
import { StudioLlm } from '../src/studio/llm.js';
import { IdeaStore } from '../src/studio/idea-store.js';
import { MarketingBriefStore } from '../src/studio/briefs.js';

async function startServer(studioOverrides = {}) {
  const scratch = await mkdtemp(path.join(tmpdir(), 'studio-server-'));
  const server = createServer({
    reelStoreOptions: { filePath: path.join(scratch, 'reels.json') },
    lessonStoreOptions: { filePath: path.join(scratch, 'lessons.json') },
    studio: {
      llm: new StudioLlm({ apiKey: '' }),
      ideaStore: new IdeaStore({ filePath: path.join(scratch, 'ideas.json') }),
      briefStore: new MarketingBriefStore({ filePath: path.join(scratch, 'briefs.json') }),
      facelessOutputDir: path.join(scratch, 'faceless'),
      artifactRoots: [scratch],
      rendererOptions: { mock: { artifactDir: path.join(scratch, 'renders') } },
      logger: { info: () => {}, warn: () => {} },
      ...studioOverrides,
    },
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  return { server, base, scratch };
}

test('studio server routes', async (t) => {
  const { server, base, scratch } = await startServer();
  t.after(() => server.close());

  await t.test('GET /studio serves the page with all tool panels', async () => {
    const res = await fetch(`${base}/studio`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/html/);
    const page = await res.text();
    for (const marker of ['Video ideas', 'Titles', 'Tags', 'Script', 'Keywords', 'Transcript', 'Thumbnails', 'Brand voice', 'Ideas manager', 'Faceless run']) {
      assert.ok(page.includes(marker), `page missing panel: ${marker}`);
    }
    for (const marker of [
      'What should we make?',
      'Faceless lesson',
      'Brand reel',
      'Guided app demo',
      'Coherent film',
      'Podcast short',
      'YouTube Shorts',
      'Instagram Reels',
      'Create Postiz draft',
      'Schedule in Postiz',
      'Open Postiz',
    ]) {
      assert.ok(page.includes(marker), `page missing Marketing Studio control: ${marker}`);
    }
    assert.doesNotMatch(page, /type=["']datetime-local["']/);
  });

  await t.test('POST /studio/titles returns tool output', async () => {
    const res = await fetch(`${base}/studio/titles`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ topic: 'latte art' }),
    });
    assert.equal(res.status, 200);
    const payload = await res.json();
    assert.equal(payload.data.source, 'template');
    assert.ok(payload.data.data.titles.length >= 5);
  });

  await t.test('invalid input returns 400 naming the field', async () => {
    const res = await fetch(`${base}/studio/titles`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 400);
    const payload = await res.json();
    assert.match(payload.error, /topic/);
  });

  await t.test('unknown tool returns 404', async () => {
    const res = await fetch(`${base}/studio/bogus`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.equal(res.status, 404);
  });

  await t.test('faceless mock run and ideas-list round trip', async () => {
    const res = await fetch(`${base}/studio/faceless`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ topic: 'server smoke topic', engine: 'bogus-engine' }),
    });
    assert.equal(res.status, 200);
    const payload = await res.json();
    assert.equal(payload.data.engine, 'mock');
    assert.equal(payload.data.renderStatus, 'completed');
    assert.equal(payload.data.postHandoff, null);

    const listRes = await fetch(`${base}/studio/ideas-list`);
    assert.equal(listRes.status, 200);
    const list = await listRes.json();
    assert.ok(list.data.some((idea) => idea.title === 'server smoke topic'));
  });

  await t.test('renders-list surfaces rendered ideas with quality', async () => {
    const res = await fetch(`${base}/studio/renders-list`);
    assert.equal(res.status, 200);
    const payload = await res.json();
    const entry = payload.data.find((render) => render.title === 'server smoke topic');
    assert.ok(entry, 'faceless run should appear in renders-list');
    assert.ok(entry.artifactDir);
    assert.ok(entry.quality === null || typeof entry.quality.verdict === 'string');
  });

  await t.test('render-file serves whitelisted files and blocks traversal', async () => {
    const inside = path.join(scratch, 'inside.mp4');
    await writeFile(inside, 'fake video bytes');
    const ok = await fetch(`${base}/studio/render-file?path=${encodeURIComponent(inside)}`);
    assert.equal(ok.status, 200);
    assert.equal(ok.headers.get('content-type'), 'video/mp4');

    const outside = await fetch(`${base}/studio/render-file?path=${encodeURIComponent('/etc/hosts')}`);
    assert.equal(outside.status, 403);
    const sneaky = await fetch(`${base}/studio/render-file?path=${encodeURIComponent(path.join(scratch, '..', '..', 'etc', 'hosts'))}`);
    assert.equal(sneaky.status, 403);
  });

  await t.test('factory plan/produce/status over the API', async () => {
    const plan = await fetch(`${base}/studio/plan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ niche: 'api factory', count: 2 }),
    });
    assert.equal(plan.status, 200);
    const produce = await fetch(`${base}/studio/produce`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ count: 1, engine: 'mock' }),
    });
    assert.equal(produce.status, 200);
    const producePayload = await produce.json();
    assert.equal(producePayload.data.succeeded, 1);
    const status = await fetch(`${base}/studio/factory-status`);
    const statusPayload = await status.json();
    assert.ok(statusPayload.data.counts.new >= 1);
    assert.ok(statusPayload.data.counts.rendered >= 1);
  });

  await t.test('idea status update via POST /studio/status', async () => {
    const listRes = await fetch(`${base}/studio/ideas-list`);
    const list = await listRes.json();
    const idea = list.data[0];
    const res = await fetch(`${base}/studio/status`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: idea.id, to: 'posted' }),
    });
    assert.equal(res.status, 200);
    const payload = await res.json();
    assert.equal(payload.data.status, 'posted');
  });

  await t.test('conversational briefs list, update, route, and execute only after confirmation', async () => {
    const createdRes = await fetch(`${base}/studio/briefs`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ request: 'Make a 45-second faceless High Signal lesson for Instagram.' }),
    });
    assert.equal(createdRes.status, 201);
    const created = (await createdRes.json()).data;
    assert.equal(created.kind, 'faceless');
    assert.equal(created.projectSlug, 'high-signal');
    assert.equal(created.capability.state, 'ready');

    const blocked = await fetch(`${base}/studio/briefs/${created.id}/execute`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ confirm: false }),
    });
    assert.equal(blocked.status, 400);
    assert.match((await blocked.json()).error, /confirmation/);

    const patched = await fetch(`${base}/studio/briefs/${created.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ cta: 'Read the evidence' }),
    });
    assert.equal(patched.status, 200);
    assert.equal((await patched.json()).data.revision, 2);

    const refined = await fetch(`${base}/studio/briefs/${created.id}/refine`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ instruction: 'Make it a 30-second YouTube lesson.' }),
    });
    assert.equal(refined.status, 200);
    const refinedBrief = (await refined.json()).data;
    assert.equal(refinedBrief.durationSeconds, 30);
    assert.equal(refinedBrief.channel, 'youtube_shorts');
    assert.equal(refinedBrief.revision, 3);
    assert.equal(refinedBrief.messages.at(-2).content, 'Make it a 30-second YouTube lesson.');

    const executed = await fetch(`${base}/studio/briefs/${created.id}/execute`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ confirm: true }),
    });
    assert.equal(executed.status, 200);
    const execution = (await executed.json()).data;
    assert.equal(execution.executed, true);
    assert.equal(execution.brief.lifecycle, 'needs-review');
    assert.ok(execution.brief.media.videoPath);

    const productions = await fetch(`${base}/studio/productions`);
    const productionPayload = await productions.json();
    assert.equal(productionPayload.data.briefs.length, 1);
    assert.equal(productionPayload.data.briefs[0].media.ideaId, execution.brief.media.ideaId);

    const capabilities = await fetch(`${base}/studio/capabilities?briefId=${created.id}`);
    assert.equal((await capabilities.json()).data.length, 5);
  });

  await t.test('every specialized workflow returns its authoritative continuation instead of fake execution', async () => {
    const cases = [
      {
        request: 'Create a brand reel for High Signal.',
        fields: { sourceEvidence: { canonicalUrl: 'https://highsignal.app' } },
        owner: 'Brand Reel',
        href: '/',
      },
      {
        request: 'Create a guided app demo for High Signal.',
        fields: {
          sourceEvidence: {
            canonicalUrl: 'https://highsignal.app',
            rightsStatus: 'approved',
          },
        },
        owner: 'Forge',
        href: 'https://reels.sassmaker.com/forge',
      },
      {
        request: 'Create a cinematic LTX film for High Signal.',
        fields: {
          creativeDirection: 'Use one approved evidence path from tension to clarity.',
          sourceEvidence: { rightsStatus: 'approved' },
        },
        owner: 'Forge',
        href: 'https://reels.sassmaker.com/forge',
      },
      {
        request: 'Clip this podcast interview.',
        fields: {
          sourceEvidence: {
            canonicalUrl: 'https://media.example.test/episode.mp4',
            rightsStatus: 'approved',
          },
        },
        owner: 'Editorial',
        href: 'http://127.0.0.1:8765',
      },
    ];

    for (const item of cases) {
      const createdRes = await fetch(`${base}/studio/briefs`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ request: item.request, fields: item.fields }),
      });
      assert.equal(createdRes.status, 201);
      const created = (await createdRes.json()).data;
      const executed = await fetch(`${base}/studio/briefs/${created.id}/execute`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ confirm: true }),
      });
      assert.equal(executed.status, 200);
      const payload = await executed.json();
      assert.equal(payload.data.executed, false);
      assert.equal(payload.data.continuation.owner, item.owner);
      const continuation = new URL(payload.data.continuation.href, base);
      const expected = new URL(item.href, base);
      assert.equal(continuation.origin, expected.origin);
      assert.equal(continuation.pathname, expected.pathname);
      assert.equal(continuation.searchParams.get('studioBriefId'), created.id);
      if (created.sourceEvidence.canonicalUrl?.startsWith('https://')) {
        const sourceParam = created.kind === 'brand-reel' ? 'url' : 'sourceUrl';
        assert.equal(continuation.searchParams.get(sourceParam), created.sourceEvidence.canonicalUrl);
      }
      if (created.kind === 'guided-app-demo' || created.kind === 'coherent-film') {
        assert.equal(continuation.searchParams.get('kind'), created.kind);
        assert.equal(continuation.searchParams.get('projectName'), created.projectSlug);
      }
    }
  });
});

test('studio distribution endpoints prepare locally and create an unscheduled Postiz draft', async (t) => {
  const postCalls = [];
  const { server, base } = await startServer({
    postizClient: {
      post: async (post) => {
        postCalls.push(post);
        return { provider: 'postiz', status: 'draft', externalId: 'post-studio-1', externalUrl: null };
      },
    },
    postizAppUrl: 'https://postiz.example.test',
  });
  t.after(() => server.close());

  const createdRes = await fetch(`${base}/studio/briefs`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ request: 'Make a faceless High Signal lesson for YouTube.' }),
  });
  const created = (await createdRes.json()).data;
  await fetch(`${base}/studio/briefs/${created.id}/execute`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ confirm: true }),
  });
  const patchedRes = await fetch(`${base}/studio/briefs/${created.id}`, {
    method: 'PATCH',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      cta: 'Read the evidence',
      sourceEvidence: {
        canonicalUrl: 'https://highsignal.app/evidence',
        destinationUrl: 'https://highsignal.app',
        claim: 'High Signal keeps evidence attached to recommendations.',
        rightsStatus: 'approved',
      },
      approval: { creativeStatus: 'approved', qualityAccepted: true },
      media: {
        publicUrl: 'https://assets.example.test/video.mp4',
        reviewedAt: '2026-07-31T12:00:00Z',
      },
    }),
  });
  assert.equal(patchedRes.status, 200);

  const prepared = await fetch(`${base}/studio/briefs/${created.id}/prepare-distribution`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  });
  assert.equal(prepared.status, 200);
  const preparedPayload = await prepared.json();
  assert.equal(preparedPayload.data.posted, false);
  assert.equal(postCalls.length, 0);
  assert.equal(preparedPayload.data.bundle.request.scheduledFor, null);

  const draft = await fetch(`${base}/studio/briefs/${created.id}/create-postiz-draft`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ approvedBy: 'owner' }),
  });
  assert.equal(draft.status, 200);
  const draftPayload = await draft.json();
  assert.equal(draftPayload.data.receipt.status, 'draft');
  assert.equal(postCalls.length, 1);
  assert.equal(postCalls[0].scheduled_for, null);

  const rejectedSchedule = await fetch(`${base}/studio/briefs/${created.id}/create-postiz-draft`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ approvedBy: 'owner', scheduledFor: '2026-08-01T12:00:00Z' }),
  });
  assert.equal(rejectedSchedule.status, 400);
  assert.match((await rejectedSchedule.json()).error, /does not accept schedules/);

  const readiness = await fetch(`${base}/studio/postiz-readiness`);
  const readinessPayload = await readiness.json();
  assert.equal(readinessPayload.data.state, 'ready-for-draft');
  assert.equal(readinessPayload.data.appUrl, 'https://postiz.example.test/');
});
