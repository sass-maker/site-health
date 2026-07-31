import assert from 'node:assert/strict';
import { copyFile, mkdtemp } from 'node:fs/promises';
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
      rendererOptions: {
        mock: { artifactDir: path.join(scratch, 'renders') },
        htmlComposition: { artifactDir: path.join(scratch, 'html-renders') },
      },
      blenderCapability: { ready: false, executable: null, version: null, blocker: 'Blender unavailable for deterministic test.' },
      kokoroReady: false,
      moneyprinterReady: false,
      platformAudioCommandRunner: async (command, args) => {
        if (command !== 'ffmpeg') throw new Error(`unexpected platform-audio command: ${command}`);
        await copyFile(args[args.indexOf('-i') + 1], args.at(-1));
        return { stdout: '', stderr: '' };
      },
      platformAudioProbe: async () => ({
        durationSeconds: 30,
        bytes: 128,
        hasVideo: true,
        hasAudio: false,
        videoCodec: 'h264',
        width: 1080,
        height: 1920,
        frameRate: '30/1',
      }),
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

  await t.test('GET /studio serves a simple Video Maker while keeping tool APIs available', async () => {
    const res = await fetch(`${base}/studio`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /text\/html/);
    const page = await res.text();
    for (const marker of ['Video ideas', 'Titles', 'Tags', 'Script', 'Keywords', 'Transcript', 'Thumbnails', 'Brand voice', 'Ideas manager', 'Faceless run']) {
      assert.ok(page.includes(marker), `page missing panel: ${marker}`);
    }
    for (const marker of [
      '<h1>Video Maker</h1>',
      'Describe the video.',
      'Everything else is chosen automatically.',
      'Make video',
      'Settings <span>Optional</span>',
      'What should we make?',
      'Faceless lesson',
      'Brand reel',
      'Guided app demo',
      'Coherent film',
      'Lyric video',
    ]) {
      assert.ok(page.includes(marker), `page missing Video Maker control: ${marker}`);
    }
    assert.doesNotMatch(page, /<section class="capability-picker"/);
    assert.match(page, /id="tab-tools"[^>]+hidden/);
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

  await t.test('production planner scopes ideas, saves a normalized plan, and builds an HTML preview explicitly', async () => {
    const catalogRes = await fetch(`${base}/studio/production-planner`);
    assert.equal(catalogRes.status, 200);
    const catalog = (await catalogRes.json()).data;
    assert.ok(catalog.projects.some((project) => project.slug === 'high-signal'));
    assert.ok(catalog.recipes.some((recipe) => recipe.id === 'threejs-scene' && recipe.owner === 'Editorial'));
    assert.equal(catalog.ideas.length, 0);

    const ideaRes = await fetch(`${base}/studio/project-ideas`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ projectSlug: 'high-signal', title: 'Evidence over vibes', hook: 'Show the proof first.' }),
    });
    assert.equal(ideaRes.status, 201);
    const idea = (await ideaRes.json()).data;
    assert.equal(idea.projectSlug, 'high-signal');

    const scoped = await fetch(`${base}/studio/production-planner?projectSlug=high-signal`);
    assert.ok((await scoped.json()).data.ideas.some((entry) => entry.id === idea.id));
    const otherProject = await fetch(`${base}/studio/ideas-list?projectSlug=karte`);
    assert.ok(!(await otherProject.json()).data.some((entry) => entry.id === idea.id));

    const planRes = await fetch(`${base}/studio/production-plans`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        projectSlug: 'high-signal', ideaId: idea.id, recipeId: 'image-slideshow',
        options: { channel: 'instagram_reels', durationSeconds: 24, qualityTier: 'standard', variantCount: 1, transition: 'push' },
      }),
    });
    const planJson = await planRes.json();
    assert.equal(planRes.status, 201, JSON.stringify(planJson));
    const plan = planJson.data;
    assert.equal(plan.ideaId, idea.id);
    assert.equal(plan.recipeId, 'image-slideshow');
    assert.equal(plan.engine, 'html-composition');
    assert.equal(plan.actions.build.kind, 'execute');
    assert.equal(plan.actions.preview.enabled, false);
    assert.equal(plan.actions.post.enabled, false);

    const invalidRes = await fetch(`${base}/studio/production-plans`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        projectSlug: 'high-signal', ideaId: idea.id, recipeId: 'ascii-story', options: { variantCount: 9 },
      }),
    });
    assert.equal(invalidRes.status, 400);
    assert.match((await invalidRes.json()).error, /between 1 and 6/);

    const builtRes = await fetch(`${base}/studio/briefs/${plan.id}/execute`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ confirm: true }),
    });
    const builtJson = await builtRes.json();
    assert.equal(builtRes.status, 200, JSON.stringify(builtJson));
    assert.equal(builtJson.data.executed, true);
    assert.equal(builtJson.data.brief.media.previewType, 'html');
    assert.match(builtJson.data.brief.media.previewPath, /composition\.html$/);
    assert.equal(builtJson.data.brief.actions.preview.enabled, true);
    assert.equal(builtJson.data.brief.actions.post.enabled, false);
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

    const previewRes = await fetch(`${base}/studio/platform-audio-preview`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        briefId: created.id,
        confirm: true,
        reference: {
          provider: 'youtube',
          videoId: 'weRHyjj34ZE',
          spotifyTrackId: '2N7vjHuOfnyF5eUzv5brZ0',
          artist: 'Shakira',
          title: 'Whenever, Wherever',
          startSeconds: 47,
          durationSeconds: 30,
          targetPlatform: 'youtube_shorts',
        },
      }),
    });
    const previewJson = await previewRes.json();
    assert.equal(previewRes.status, 200, JSON.stringify(previewJson));
    const previewPayload = previewJson.data;
    assert.equal(previewPayload.downloadedAudio, false);
    assert.equal(previewPayload.preview.reference.videoId, 'weRHyjj34ZE');
    assert.equal(previewPayload.preview.reference.reviewProvider, 'spotify');
    assert.equal(previewPayload.preview.ready, true);
    assert.equal(previewPayload.brief.media.platformAudio.receiptPath, previewPayload.preview.receiptPath);

    const productions = await fetch(`${base}/studio/productions`);
    const productionPayload = await productions.json();
    const productionBrief = productionPayload.data.briefs.find((brief) => brief.id === created.id);
    assert.ok(productionBrief);
    assert.equal(productionBrief.media.ideaId, execution.brief.media.ideaId);
    assert.ok(
      !productionPayload.data.legacyRenders.some((render) => render.video === execution.brief.media.videoPath),
      'brief-owned video should not be duplicated through the legacy render index',
    );

    const capabilities = await fetch(`${base}/studio/capabilities?briefId=${created.id}`);
    assert.equal((await capabilities.json()).data.length, 6);
  });

  await t.test('projectless prompt can create a faceless video', async () => {
    const createdRes = await fetch(`${base}/studio/briefs`, {
      method:'POST',
      headers:{ 'content-type':'application/json' },
      body:JSON.stringify({
        request:'Create a 15-second faceless explainer about why the moon has phases.',
        fields:{ kind:'faceless', durationSeconds:15, engine:'mock' },
      }),
    });
    assert.equal(createdRes.status, 201);
    const created = (await createdRes.json()).data;
    assert.equal(created.projectSlug, null);
    assert.equal(created.capability.state, 'ready');
    const executedRes = await fetch(`${base}/studio/briefs/${created.id}/execute`, {
      method:'POST', headers:{ 'content-type':'application/json' }, body:JSON.stringify({ confirm:true }),
    });
    assert.equal(executedRes.status, 200);
    const executed = (await executedRes.json()).data;
    assert.equal(executed.executed, true);
    assert.ok(executed.brief.media.videoPath);
  });

  await t.test('projectless prompt preserves the selected visual recipe', async () => {
    const arsenalRes = await fetch(`${base}/studio/arsenal`);
    assert.equal(arsenalRes.status, 200);
    const arsenal = (await arsenalRes.json()).data;
    const recipe = arsenal.recipes.find((entry) => entry.id === 'image-slideshow');
    assert.equal(recipe.readiness.state, 'ready');
    assert.equal(recipe.engine, 'html-composition');

    const createdRes = await fetch(`${base}/studio/briefs`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        request: 'Explain why the sky changes color at sunset.',
        fields: { recipeId: 'image-slideshow', recipeOptions: { durationSeconds: 15 } },
      }),
    });
    assert.equal(createdRes.status, 201);
    const created = (await createdRes.json()).data;
    assert.equal(created.projectSlug, null);
    assert.equal(created.recipeId, 'image-slideshow');
    assert.equal(created.engine, 'html-composition');
    assert.equal(created.durationSeconds, 15);
    assert.equal(created.actions.build.enabled, true);
    assert.equal(created.actions.build.kind, 'execute');
  });

  await t.test('Blender readiness and lyric route expose truthful safe boundaries', async () => {
    const readiness = await fetch(`${base}/studio/blender-readiness`);
    assert.equal(readiness.status, 200);
    const capability = (await readiness.json()).data;
    assert.equal(typeof capability.ready, 'boolean');
    assert.equal('apiKey' in capability, false);

    const createdRes = await fetch(`${base}/studio/briefs`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ request: 'Make a literal lyric video from this cleared song.' }),
    });
    assert.equal(createdRes.status, 201);
    const created = (await createdRes.json()).data;
    assert.equal(created.kind, 'lyric-video');
    assert.match(created.capability.blocker, /operator-supplied timed lyrics/i);

    const unconfirmed = await fetch(`${base}/studio/lyric-video`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ briefId: created.id, confirm: false }),
    });
    assert.equal(unconfirmed.status, 400);
    assert.match((await unconfirmed.json()).error, /confirmation/i);
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

test('studio distribution endpoints prepare, draft, and schedule through Postiz', async (t) => {
  const postCalls = [];
  const { server, base } = await startServer({
    postizClient: {
      post: async (post) => {
        postCalls.push(post);
        return {
          provider: 'postiz',
          status: post.scheduled_for ? 'scheduled' : 'draft',
          externalId: `post-studio-${postCalls.length}`,
          externalUrl: null,
        };
      },
    },
    postizAppUrl: 'https://postiz.example.test',
    now: () => new Date('2026-07-31T12:05:00Z'),
  });
  t.after(() => server.close());

  async function createApprovedProduction(request) {
    const createdRes = await fetch(`${base}/studio/briefs`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ request }),
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
    return created;
  }

  const draftProduction = await createApprovedProduction('Make a faceless High Signal lesson for YouTube.');

  const prepared = await fetch(`${base}/studio/briefs/${draftProduction.id}/prepare-distribution`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: '{}',
  });
  assert.equal(prepared.status, 200);
  const preparedPayload = await prepared.json();
  assert.equal(preparedPayload.data.posted, false);
  assert.equal(postCalls.length, 0);
  assert.equal(preparedPayload.data.bundle.request.scheduledFor, null);

  const draft = await fetch(`${base}/studio/briefs/${draftProduction.id}/create-postiz-draft`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ approvedBy: 'owner' }),
  });
  assert.equal(draft.status, 200);
  const draftPayload = await draft.json();
  assert.equal(draftPayload.data.receipt.status, 'draft');
  assert.equal(postCalls.length, 1);
  assert.equal(postCalls[0].scheduled_for, null);

  const scheduledProduction = await createApprovedProduction('Make a faceless High Signal lesson for Instagram.');
  const scheduled = await fetch(`${base}/studio/briefs/${scheduledProduction.id}/schedule-postiz`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ approvedBy: 'owner', scheduledFor: '2026-08-01T12:00:00Z' }),
  });
  assert.equal(scheduled.status, 200);
  const scheduledPayload = await scheduled.json();
  assert.equal(scheduledPayload.data.brief.lifecycle, 'scheduled');
  assert.equal(scheduledPayload.data.brief.distribution.request.scheduledFor, '2026-08-01T12:00:00.000Z');
  assert.equal(scheduledPayload.data.receipt.status, 'scheduled');
  assert.equal(scheduledPayload.data.receipt.scheduledFor, '2026-08-01T12:00:00.000Z');
  assert.equal(postCalls.length, 2);
  assert.equal(postCalls[1].scheduled_for, '2026-08-01T12:00:00.000Z');

  const rejectedDuplicate = await fetch(`${base}/studio/briefs/${scheduledProduction.id}/schedule-postiz`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ approvedBy: 'owner', scheduledFor: '2026-08-02T12:00:00Z' }),
  });
  assert.equal(rejectedDuplicate.status, 400);
  assert.match((await rejectedDuplicate.json()).error, /receipt already exists/);
  assert.equal(postCalls.length, 2);

  const rejectedImmediate = await fetch(`${base}/studio/briefs/${scheduledProduction.id}/schedule-postiz`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ approvedBy: 'owner', scheduledFor: '2026-08-02T12:00:00Z', publishNow: true }),
  });
  assert.equal(rejectedImmediate.status, 400);
  assert.match((await rejectedImmediate.json()).error, /does not accept immediate publication/);
  assert.equal(postCalls.length, 2);

  const readiness = await fetch(`${base}/studio/postiz-readiness`);
  const readinessPayload = await readiness.json();
  assert.equal(readinessPayload.data.state, 'ready-for-submission');
  assert.equal(readinessPayload.data.appUrl, 'https://postiz.example.test/');
});

test('studio autopilot APIs expose policy and status reads plus one confirmed bounded invocation', async (t) => {
  const calls = [];
  const { server, base } = await startServer({
    autopilotRunner: async (input) => {
      calls.push(input);
      return { schema: 'fleet.studio-autopilot-run.v1', runId: 'fixture-run', mode: input.execute ? 'execute' : 'dry-run' };
    },
  });
  t.after(() => server.close());

  const policies = await fetch(`${base}/studio/autopilot/policies`);
  assert.equal(policies.status, 200);
  assert.deepEqual((await policies.json()).data.policies.map((entry) => entry.id), [
    'high-signal-daily', 'significant-hobbies-weekly', 'major-project-changelog',
  ]);

  const status = await fetch(`${base}/studio/autopilot/status`);
  assert.equal(status.status, 200);
  assert.deepEqual((await status.json()).data.lanes, {
    'project-automation': 0, 'operator-request': 0, 'personal-automation': 0,
  });
  assert.equal((await (await fetch(`${base}/studio/autopilot/runs`)).json()).data.length, 0);
  assert.equal((await (await fetch(`${base}/studio/autopilot/exceptions`)).json()).data.length, 0);

  const rejected = await fetch(`${base}/studio/autopilot/run`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ policy: 'high-signal-daily' }),
  });
  assert.equal(rejected.status, 400);
  assert.match((await rejected.json()).error, /confirmation/);

  const invoked = await fetch(`${base}/studio/autopilot/run`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ confirm: true, policy: 'high-signal-daily', execute: false, count: 1 }),
  });
  assert.equal(invoked.status, 200);
  assert.equal((await invoked.json()).data.mode, 'dry-run');
  assert.equal(calls.length, 1);
  assert.equal(calls[0].count, 1);
});

test('studio probes and caches Blender readiness before creating a recipe brief', async (t) => {
  const calls = [];
  const { server, base } = await startServer({
    blenderCapability: undefined,
    blender: {
      blenderPath: '/test/blender',
      commandRunner: async (executable, args) => {
        calls.push({ executable, args });
        return { stdout: 'Blender 5.2.0 LTS\n', stderr: '' };
      },
    },
  });
  t.after(() => server.close());

  const createdRes = await fetch(`${base}/studio/briefs`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      request: 'Make an abstract 3D animation about momentum.',
      fields: { recipeId: 'blender-film', recipeOptions: { durationSeconds: 15 } },
    }),
  });
  const createdJson = await createdRes.json();
  assert.equal(createdRes.status, 201, JSON.stringify(createdJson));
  assert.equal(createdJson.data.recipe.readiness.ready, true);
  assert.equal(createdJson.data.actions.build.enabled, true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].executable, '/test/blender');

  const readinessRes = await fetch(`${base}/studio/blender-readiness`);
  assert.equal(readinessRes.status, 200);
  assert.equal((await readinessRes.json()).data.version, '5.2.0');
  assert.equal(calls.length, 1, 'the server should reuse the readiness result across requests');
});
