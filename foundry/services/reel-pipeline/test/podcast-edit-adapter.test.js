import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';

import { renderPodcastEdit } from '../src/adapters/podcast-edit.js';

const FIXTURE = path.resolve('test/fixtures/approved-podcast-edit.json');

async function preparedEdit() {
  const root = await mkdtemp(path.join(os.tmpdir(), 'podcast-edit-'));
  const mediaDir = path.join(root, 'fixtures', 'podcast');
  await mkdir(mediaDir, { recursive: true });
  const sourcePath = path.join(mediaDir, '01-believe-in-something.mp3');
  const sourceBytes = Buffer.from('source-audio-fixture');
  await writeFile(sourcePath, sourceBytes);
  const input = JSON.parse(await readFile(FIXTURE, 'utf8'));
  input.sources[0].sha256 = createHash('sha256').update(sourceBytes).digest('hex');
  return { input, root, sourcePath };
}

test('renders an approved edit through the nested editorial command and writes a receipt', async () => {
  const { input, root, sourcePath } = await preparedEdit();
  const calls = [];
  const result = await renderPodcastEdit({
    input,
    manifestPath: path.join(root, 'podcast-edit.json'),
    repoRoot: root,
    editorialRoot: path.join(root, 'editorial'),
    outputRoot: path.join(root, 'runs'),
    now: () => new Date('2026-07-29T12:00:00.000Z'),
    runCommand: async (command, args, options) => {
      calls.push({ command, args, options });
      const outputIndex = args.indexOf('--output');
      await writeFile(args[outputIndex + 1], Buffer.from('rendered-mp4'));
      await writeFile(args[outputIndex + 1].replace(/\.mp4$/, '.srt'), '1\n00:00:00,000 --> 00:00:01,000\nSource speech\n');
    },
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].command, 'uv');
  assert.ok(calls[0].args.includes('--source-label'));
  assert.ok(calls[0].args.includes('--watermark'));
  assert.ok(calls[0].args.includes('ZEROPOD'));
  assert.equal(result.receipt.schema, 'reel-pipeline.podcast-render-receipt.v1');
  assert.equal(result.receipt.input.sources[0].path, sourcePath);
  assert.equal(result.receipt.output.video.sha256.length, 64);
  assert.equal(result.receipt.output.captions.sha256.length, 64);

  const materializedEdl = JSON.parse(await readFile(result.paths.edl, 'utf8'));
  assert.equal(materializedEdl.clips[0].source_path, sourcePath);
  assert.equal(materializedEdl.clips[0].render_start, 3396.238);
});

test('refuses an unapproved podcast edit before invoking the renderer', async () => {
  const { input, root } = await preparedEdit();
  input.approval = { status: 'proposed', approvedAt: null, approvedBy: null };
  let invoked = false;

  await assert.rejects(
    renderPodcastEdit({
      input,
      manifestPath: path.join(root, 'podcast-edit.json'),
      repoRoot: root,
      outputRoot: path.join(root, 'runs'),
      runCommand: async () => {
        invoked = true;
      },
    }),
    /must be approved/,
  );
  assert.equal(invoked, false);
});

test('fails closed when source bytes do not match provenance', async () => {
  const { input, root } = await preparedEdit();
  input.sources[0].sha256 = 'b'.repeat(64);

  await assert.rejects(
    renderPodcastEdit({
      input,
      manifestPath: path.join(root, 'podcast-edit.json'),
      repoRoot: root,
      outputRoot: path.join(root, 'runs'),
      runCommand: async () => {},
    }),
    /hash does not match provenance/,
  );
});

test('keeps long-form multi-clip edits on the same approved render path', async () => {
  const { input, root } = await preparedEdit();
  const template = input.editorial.clips[0];
  input.editorial.target_duration = 420;
  input.editorial.clips = [
    {
      ...structuredClone(template),
      index: 0,
      segment_id: 'long-1',
      segment_ids: ['long-1'],
      start: 0,
      end: 210,
      render_start: 0,
      render_end: 210,
    },
    {
      ...structuredClone(template),
      index: 1,
      segment_id: 'long-2',
      segment_ids: ['long-2'],
      start: 210,
      end: 420,
      render_start: 210,
      render_end: 420,
    },
  ];

  let renderedEdl;
  const result = await renderPodcastEdit({
    input,
    manifestPath: path.join(root, 'podcast-edit.json'),
    repoRoot: root,
    editorialRoot: path.join(root, 'editorial'),
    outputRoot: path.join(root, 'runs'),
    runCommand: async (_command, args) => {
      const edlIndex = args.indexOf('render') + 1;
      renderedEdl = JSON.parse(await readFile(args[edlIndex], 'utf8'));
      const outputIndex = args.indexOf('--output');
      await writeFile(args[outputIndex + 1], Buffer.from('long-form-mp4'));
    },
  });

  assert.equal(renderedEdl.target_duration, 420);
  assert.equal(renderedEdl.clips.length, 2);
  assert.equal(result.receipt.output.video.bytes, 13);
});
