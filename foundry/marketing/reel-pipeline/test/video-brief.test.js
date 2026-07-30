import assert from 'node:assert/strict';
import test from 'node:test';

import { normalizeVideoBrief, toMoneyPrinterRequest } from '../src/video-brief.js';
import { MoneyPrinterTurboAdapter } from '../src/adapters/moneyprinterturbo.js';
import { ReelMakerAdapter, splitBriefIntoScenes } from '../src/adapters/reel-maker.js';
import { publishRenderArtifacts, publishRenderArtifactsToR2 } from '../src/artifact-publisher.js';
import { createDraftVideo, createRenderer, getDraftVideoStatus } from '../src/pipeline.js';
import { scoreVariant } from '../src/reel-quality.js';

const reelBody = [
  'Script: show the user pain, product proof, then payoff.',
  'Shot list: messy inbox, generated answer, final profile.',
  'Captions: "stop answering this manually" and "send one link".',
  'Asset prompts: vertical phone footage and product UI.',
].join('\n');

test('normalizes a reel-platform video brief', () => {
  const brief = normalizeVideoBrief({
    id: 'brief-1',
    projectSlug: 'linkchat',
    channel: 'tiktok',
    title: 'DM fatigue demo',
    hook: 'Stop answering the same question.',
    body: reelBody,
  });

  assert.equal(brief.channel, 'tiktok');
  assert.equal(brief.renderMode, 'stock');
  assert.equal(brief.durationSeconds, 20);
});

test('rejects reel bodies that are generic copy instead of video briefs', () => {
  assert.throws(() => normalizeVideoBrief({
    id: 'brief-2',
    projectSlug: 'linkchat',
    channel: 'youtube_shorts',
    title: 'Generic post',
    hook: 'Try this',
    body: 'This is just a promotional post.',
  }), /reel channel body/);
});

test('converts video brief into MoneyPrinterTurbo request shape', () => {
  const req = toMoneyPrinterRequest(normalizeVideoBrief({
    id: 'brief-3',
    projectSlug: 'reader',
    channel: 'tiktok',
    title: 'Reading backlog',
    hook: 'Your read-it-later app became a guilt folder.',
    body: reelBody,
  }));

  assert.equal(req.video_aspect, '9:16');
  assert.equal(req.video_source, 'pexels');
  assert.match(req.video_script, /guilt folder/);
});

test('stock render mode maps to MoneyPrinterTurbo adapter', () => {
  assert.equal(createRenderer('stock').constructor.name, 'MoneyPrinterTurboAdapter');
});

test('remotion render mode maps to ReelMaker adapter', () => {
  assert.equal(createRenderer('remotion').constructor.name, 'ReelMakerAdapter');
  assert.equal(createRenderer('reel-maker').constructor.name, 'ReelMakerAdapter');
});

test('openshorts render mode is removed', () => {
  assert.throws(() => createRenderer('openshorts'), /removed/);
  assert.throws(() => createRenderer('ugc_actor'), /removed/);
});

test('MoneyPrinterTurbo adapter posts to v1 video API and reads task id', async () => {
  const calls = [];
  const adapter = new MoneyPrinterTurboAdapter({
    baseUrl: 'http://mpt.local',
    fetchImpl: async (url, init) => {
      calls.push({ url, init });
      return Response.json({ data: { task_id: 'task-123' } });
    },
  });

  const result = await adapter.createVideo(normalizeVideoBrief({
    id: 'brief-4',
    projectSlug: 'starboard',
    channel: 'tiktok',
    title: 'Find starred repos',
    hook: 'You starred it because it mattered. Now you cannot find it.',
    body: reelBody,
  }));

  assert.equal(result.externalTaskId, 'task-123');
  assert.equal(calls[0].url, 'http://mpt.local/api/v1/videos');
});

test('ReelMaker adapter creates Remotion timeline and render job', async () => {
  const commands = [];
  const adapter = new ReelMakerAdapter({
    engineDir: './tmp/reel-maker-engine',
    now: () => new Date('2026-01-01T00:00:00.000Z'),
    commandRunner: async (command, args, options = {}) => {
      commands.push({ command, args, options });
      if (command === 'ffprobe') return { stdout: '2.5\n', stderr: '' };
      return { stdout: '', stderr: '' };
    },
  });
  const brief = normalizeVideoBrief({
    id: 'brief-remotion',
    projectSlug: 'linkchat',
    channel: 'tiktok',
    title: 'AI profile answers DMs',
    hook: 'Stop answering the same profile question manually.',
    body: reelBody,
    cta: 'Ask the profile one question.',
    renderMode: 'remotion',
  });

  const result = await adapter.createVideo(brief);

  assert.equal(result.provider, 'reel-maker');
  assert.equal(result.status, 'completed');
  assert.match(result.videos[0], /brief-remotion\.mp4$/);
  assert.equal(commands.some((call) => call.command === 'bunx' && call.args.includes('remotion')), true);
  assert.equal(splitBriefIntoScenes(brief).length, 3);
});

test('mock renderer creates a completed draft artifact', async () => {
  const result = await createDraftVideo({
    id: 'brief-5',
    projectSlug: 'swe-interview-prep',
    channel: 'tiktok',
    title: 'Know what you forgot',
    hook: 'You do not need more LeetCode. You need to know what decayed.',
    body: reelBody,
    renderMode: 'mock',
  }, {
    mock: { artifactDir: './tmp/test-artifacts' },
  });

  assert.equal(result.status, 'video_ready');
  assert.equal(result.render.provider, 'mock');
  assert.equal(result.render.videos.length, 1);

  const stored = await getDraftVideoStatus(result.id, {
    mock: { artifactDir: './tmp/test-artifacts' },
  });
  assert.equal(stored.status, 'video_ready');
  assert.equal(stored.id, result.id);
});

test('quality scoring accepts combinedVideos as the final asset', () => {
  const score = scoreVariant({
    brief: {
      hook: 'Stop answering the same DM.',
      cta: 'Ask once.',
      body: reelBody,
      projectSlug: 'linkchat',
    },
    variant: {
      hook: 'Stop answering the same DM.',
      cta: 'Ask once.',
    },
    proof: {
      proofType: 'screenshot',
      paths: ['proof.png'],
    },
    render: {
      status: 'completed',
      combinedVideos: ['https://cdn.example.test/final.mp4'],
      aspect: '9:16',
      durationSeconds: 12,
    },
  });

  assert.equal(score.status, 'video_ready');
  assert.equal(score.reasons.includes('no asset URL after upload'), false);
});

test('publishes local render artifacts to a configured public directory', async () => {
  const published = await publishRenderArtifacts({
    provider: 'mock',
    externalTaskId: 'render-public',
    status: 'completed',
    videos: ['./test/fixtures/render-mode-brief.json'],
  }, {
    baseUrl: 'https://assets.example.test/reels',
    publicDir: './tmp/public-artifacts',
  });

  assert.equal(
    published.videos[0],
    'https://assets.example.test/reels/fixtures-render-mode-brief.json',
  );
});

test('publishes local render artifacts through wrangler R2 when configured', async () => {
  const commands = [];
  const published = await publishRenderArtifactsToR2({
    provider: 'mock',
    externalTaskId: 'render-r2',
    status: 'completed',
    videos: ['./test/fixtures/render-mode-brief.json'],
  }, {
    baseUrl: 'https://assets.example.test/reels',
    r2Bucket: 'reel-artifacts',
    commandRunner: async (command, args) => {
      commands.push({ command, args });
    },
  });

  assert.equal(
    published.videos[0],
    'https://assets.example.test/reels/fixtures-render-mode-brief.json',
  );
  assert.equal(commands[0].command, 'npx');
  assert.deepEqual(commands[0].args.slice(0, 5), ['wrangler', 'r2', 'object', 'put', 'reel-artifacts/fixtures-render-mode-brief.json']);
  assert.equal(commands[0].args.includes('--remote'), true);
});

test('publishes localhost render artifact URLs by downloading them first', async () => {
  const commands = [];
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('fake-video-bytes', {
    headers: { 'content-type': 'video/mp4' },
  });
  try {
    const published = await publishRenderArtifactsToR2({
      provider: 'moneyprinterturbo',
      externalTaskId: 'render-http',
      status: 'completed',
      videos: ['http://127.0.0.1:8080/tasks/render-http/final-1.mp4'],
    }, {
      baseUrl: 'https://assets.example.test/reels',
      r2Bucket: 'reel-artifacts',
      commandRunner: async (command, args) => {
        commands.push({ command, args });
      },
    });

    assert.equal(published.videos[0], 'https://assets.example.test/reels/render-http-final-1.mp4');
    assert.match(commands[0].args[commands[0].args.indexOf('--file') + 1], /tmp\/downloaded-artifacts\/render-http\/final-1\.mp4$/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
