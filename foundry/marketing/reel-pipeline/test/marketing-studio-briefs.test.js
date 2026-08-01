import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  MARKETING_BRIEF_SCHEMA,
  MarketingBriefStore,
  classifyKind,
  generateMarketingBriefDraft,
  refineMarketingBriefDraft,
} from '../src/studio/briefs.js';
import { continuationForBrief, evaluateStudioCapability, listStudioCapabilities } from '../src/studio/capabilities.js';
import { StudioLlm } from '../src/studio/llm.js';

const offlineLlm = new StudioLlm({ apiKey: '' });

async function tempStore() {
  const dir = await mkdtemp(path.join(tmpdir(), 'marketing-studio-'));
  let tick = 0;
  return new MarketingBriefStore({
    filePath: path.join(dir, 'briefs.json'),
    now: () => new Date(`2026-07-31T12:00:0${tick++}Z`),
  });
}

test('natural-language draft uses the deterministic fallback and normalized video fields', async () => {
  const draft = await generateMarketingBriefDraft(
    'Create a 45-second guided app demo for High Signal on Instagram with a presenter.',
    { llm: offlineLlm, now: () => new Date('2026-07-31T12:00:00Z') },
  );
  assert.equal(draft.generation.source, 'template');
  assert.equal(draft.kind, 'guided-app-demo');
  assert.equal(draft.projectSlug, 'high-signal');
  assert.equal(draft.channel, 'instagram_reels');
  assert.equal(draft.durationSeconds, 45);
  assert.equal(draft.messages.length, 2);
});

test('initial conversation preserves explicit source and destination URLs without granting approval', async () => {
  const draft = await generateMarketingBriefDraft(
    'Create a guided app demo for High Signal. Source: https://highsignal.app/evidence. CTA destination: https://highsignal.app/start.',
    { llm: offlineLlm },
  );
  const store = await tempStore();
  const brief = await store.create(draft);
  assert.equal(brief.sourceEvidence.canonicalUrl, 'https://highsignal.app/evidence');
  assert.equal(brief.sourceEvidence.destinationUrl, 'https://highsignal.app/start');
  assert.equal(brief.sourceEvidence.rightsStatus, 'unknown');
  assert.equal(brief.approval.creativeStatus, 'proposed');
});

test('brief store persists normalized state and increments revisions', async () => {
  const store = await tempStore();
  const draft = await generateMarketingBriefDraft('Make a faceless High Signal lesson for YouTube.', { llm: offlineLlm });
  const created = await store.create(draft);
  assert.equal(created.schema, MARKETING_BRIEF_SCHEMA);
  assert.equal(created.revision, 1);
  assert.equal(created.lifecycle, 'planned');
  const updated = await store.update(created.id, {
    approval: { creativeStatus: 'approved' },
    sourceEvidence: { rightsStatus: 'approved' },
  });
  assert.equal(updated.revision, 2);
  assert.equal(updated.approval.creativeStatus, 'approved');
  assert.equal(updated.sourceEvidence.rightsStatus, 'approved');
  assert.equal((await store.list()).length, 1);
});

test('brief store preserves optional production selections and clears artifacts when the recipe changes', async () => {
  const store = await tempStore();
  const created = await store.create({
    request: 'Create an ASCII story for High Signal.',
    projectSlug: 'high-signal',
    ideaId: 'idea_1',
    recipeId: 'ascii-story',
    recipeOptions: {
      channel: 'instagram_reels', durationSeconds: 12, qualityTier: 'standard', variantCount: 1,
      values: { palette: 'terminal' },
    },
    media: { videoPath: '/tmp/ascii.mp4' },
    lifecycle: 'needs-review',
  });
  assert.equal(created.ideaId, 'idea_1');
  assert.equal(created.recipeId, 'ascii-story');
  assert.equal(created.recipeOptions.values.palette, 'terminal');
  const changed = await store.update(created.id, {
    recipeId: 'image-slideshow',
    recipeOptions: { channel: 'youtube_shorts', durationSeconds: 30, qualityTier: 'draft', variantCount: 1 },
    engine: 'html-composition',
  });
  assert.equal(changed.media, null);
  assert.equal(changed.lifecycle, 'planned');
});

test('follow-up instructions refine safe fields and preserve approval boundaries', async () => {
  const store = await tempStore();
  const created = await store.create(await generateMarketingBriefDraft(
    'Make a 60-second faceless High Signal lesson for YouTube.',
    { llm: offlineLlm },
  ));
  const patch = await refineMarketingBriefDraft(
    created,
    'Turn this into a 30-second guided app demo for Instagram. Source: https://highsignal.app',
    { llm: offlineLlm, now: () => new Date('2026-07-31T12:30:00Z') },
  );
  const updated = await store.update(created.id, patch);
  assert.equal(updated.kind, 'guided-app-demo');
  assert.equal(updated.durationSeconds, 30);
  assert.equal(updated.channel, 'instagram_reels');
  assert.match(updated.title, /30-second guided app demo.+Instagram Reels/i);
  assert.match(updated.hook, /30-second guided app demo.+Instagram Reels/i);
  assert.match(updated.summary, /30-second guided app demo.+Instagram Reels/i);
  assert.doesNotMatch(`${updated.title} ${updated.hook} ${updated.summary}`, /faceless|60-second|YouTube/i);
  assert.match(updated.creativeDirection, /real application dominant/i);
  assert.equal(updated.sourceEvidence.canonicalUrl, 'https://highsignal.app/');
  assert.equal(updated.sourceEvidence.rightsStatus, 'unknown');
  assert.equal(updated.approval.creativeStatus, 'proposed');
  assert.equal(updated.messages.at(-2).role, 'operator');
  assert.match(updated.messages.at(-1).content, /Updated/);
});

test('structural refinements replace contradictory generated copy but preserve neutral titles', async () => {
  const store = await tempStore();
  const created = await store.create({
    ...await generateMarketingBriefDraft(
      'Create a 60-second faceless High Signal lesson for YouTube about concrete evidence.',
      { llm: offlineLlm },
    ),
    title: 'Concrete Evidence',
    summary: 'A High Signal lesson about concrete evidence.',
    creativeDirection: 'Faceless educational video.',
  });
  const patch = await refineMarketingBriefDraft(
    created,
    'Turn this into a 30-second guided app demo for Instagram.',
    { llm: offlineLlm },
  );
  const updated = await store.update(created.id, patch);
  assert.equal(updated.title, 'Concrete Evidence');
  assert.match(updated.hook, /30-second guided app demo.+Instagram Reels/i);
  assert.match(updated.summary, /30-second guided app demo.+Instagram Reels/i);
  assert.match(updated.creativeDirection, /real application dominant/i);
  assert.doesNotMatch(`${updated.hook} ${updated.summary} ${updated.creativeDirection}`, /faceless|lesson|60-second|YouTube/i);
});

test('changing video kind clears incompatible execution and distribution state', async () => {
  const store = await tempStore();
  const created = await store.create({
    request: 'Make a faceless High Signal lesson.',
    kind: 'faceless',
    projectSlug: 'high-signal',
    media: { artifactDir: '/tmp/a', videoPath: '/tmp/a/video.mp4' },
    distribution: { preparedAt: '2026-07-31T12:00:00Z', request: { id: 'x' } },
    lifecycle: 'needs-review',
  });
  const updated = await store.update(created.id, { kind: 'coherent-film' });
  assert.equal(updated.media, null);
  assert.equal(updated.distribution, null);
  assert.equal(updated.lifecycle, 'planned');
});

test('classifier covers every supported video workflow', () => {
  assert.equal(classifyKind('clip this podcast interview'), 'podcast-short');
  assert.equal(classifyKind('record an app walkthrough with presenter'), 'guided-app-demo');
  assert.equal(classifyKind('make a cinematic LTX film'), 'coherent-film');
  assert.equal(classifyKind('make a product reel from the website'), 'brand-reel');
  assert.equal(classifyKind('teach five interview tips'), 'faceless');
});

test('capability registry reports all six owners and actionable readiness', async () => {
  const store = await tempStore();
  const draft = await generateMarketingBriefDraft('Make a faceless High Signal lesson.', { llm: offlineLlm });
  const brief = await store.create(draft);
  const capabilities = listStudioCapabilities(brief);
  assert.deepEqual(capabilities.map((entry) => entry.id), [
    'faceless',
    'brand-reel',
    'guided-app-demo',
    'coherent-film',
    'podcast-short',
    'lyric-video',
  ]);
  assert.equal(evaluateStudioCapability('faceless', brief).state, 'ready');
  const guided = evaluateStudioCapability('guided-app-demo', brief);
  assert.equal(guided.state, 'needs-input');
  assert.match(guided.blocker, /source URL/);
  const continuation = continuationForBrief(brief);
  assert.equal(continuation.endpoint, `/studio/briefs/${brief.id}/execute`);
});

test('lyric video classification and capability fail closed on timed lyrics and separate rights', async () => {
  assert.equal(classifyKind('Make a literal lyric video from my cleared song'), 'lyric-video');
  const store = await tempStore();
  const brief = await store.create(await generateMarketingBriefDraft(
    'Make a lyric video from this popular song.',
    { llm: offlineLlm },
  ));
  assert.equal(brief.kind, 'lyric-video');
  assert.equal(brief.engine, 'lyric-canvas');
  const blocked = evaluateStudioCapability('lyric-video', brief, { blenderReady: true });
  assert.equal(blocked.state, 'needs-input');
  assert.match(blocked.blocker, /operator-supplied timed lyrics/i);
  assert.match(blocked.blocker, /composition and lyric rights/i);
  assert.match(blocked.blocker, /Attribution is not permission/i);
});

test('rights-ready lyric video becomes locally executable', async () => {
  const store = await tempStore();
  const brief = await store.create({
    request: 'Make a literal lyric video from my cleared recording.',
    kind: 'lyric-video',
    title: 'Literal stars',
    lyric: {
      audioPath: './test/fixtures/lyrics/twinkle-original.wav',
      audioDurationMs: 5000,
      timedLyrics: '[00:00.00]A bright star\n[00:02.50]Above the world',
      attribution: 'Words and recording supplied by operator.',
      rights: {
        composition: 'owned',
        master: 'owned',
        evidence: 'Operator rights record 123.',
      },
    },
  });
  const ready = evaluateStudioCapability('lyric-video', brief, { blenderReady: true });
  assert.equal(ready.state, 'ready');
  assert.equal(continuationForBrief(brief).endpoint, `/studio/briefs/${brief.id}/execute`);
});

test('specialized continuations prefill only safe public context', async () => {
  const store = await tempStore();
  const brief = await store.create({
    request: 'Create a guided app demo for High Signal.',
    kind: 'guided-app-demo',
    projectSlug: 'high-signal',
    title: 'Unpublished launch prompt',
    summary: 'Private internal launch context',
    sourceEvidence: {
      canonicalUrl: 'https://highsignal.app',
      rightsStatus: 'approved',
    },
  });
  const continuation = continuationForBrief(brief);
  const url = new URL(continuation.href);
  assert.equal(url.origin, 'https://reels.sassmaker.com');
  assert.equal(url.pathname, '/forge');
  assert.equal(url.searchParams.get('studioBriefId'), brief.id);
  assert.equal(url.searchParams.get('kind'), 'guided-app-demo');
  assert.equal(url.searchParams.get('projectName'), 'high-signal');
  assert.equal(url.searchParams.get('sourceUrl'), 'https://highsignal.app/');
  assert.doesNotMatch(url.href, /Unpublished|Private/);
});
