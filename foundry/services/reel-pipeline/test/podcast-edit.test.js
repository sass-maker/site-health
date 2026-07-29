import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

import {
  PODCAST_EDIT_SCHEMA,
  PODCAST_SCORE_TERMS,
  normalizePodcastEdit,
} from '../src/podcast-edit.js';

const FIXTURE = path.resolve('test/fixtures/approved-podcast-edit.json');

async function fixture() {
  return JSON.parse(await readFile(FIXTURE, 'utf8'));
}

test('normalizes a complete approved podcast edit without losing editorial evidence', async () => {
  const edit = normalizePodcastEdit(await fixture());

  assert.equal(edit.schema, PODCAST_EDIT_SCHEMA);
  assert.equal(edit.approval.status, 'approved');
  assert.deepEqual(Object.keys(edit.editorial.terms), PODCAST_SCORE_TERMS);
  assert.equal(edit.editorial.clips[0].source_title, '01 Believe In Something');
  assert.equal(edit.editorial.clips[0].render_start, 3396.238);
  assert.equal(edit.sources[0].license, 'CC0 / zero rights reserved');
  assert.deepEqual(edit.visualCues.map((cue) => cue.kind), ['kinetic-quote', 'ascii-signal']);
});

test('rejects a podcast edit that hides one score term', async () => {
  const input = await fixture();
  delete input.editorial.terms.callback;

  assert.throws(
    () => normalizePodcastEdit(input),
    /must surface exactly the eight podcast score terms/,
  );
});

test('rejects invalid clip source and render ranges', async () => {
  const sourceRange = await fixture();
  sourceRange.editorial.clips[0].end = sourceRange.editorial.clips[0].start;
  assert.throws(() => normalizePodcastEdit(sourceRange), /source range/);

  const renderRange = await fixture();
  renderRange.editorial.clips[0].render_end = renderRange.editorial.clips[0].render_start;
  assert.throws(() => normalizePodcastEdit(renderRange), /render range/);
});

test('requires rights evidence for filmed or photographic visual inserts', async () => {
  const input = await fixture();
  input.editorial.clips[0].visuals = [{
    mode: 'motion',
    start: 0,
    end: 5,
    source_path: 'visuals/road.mp4',
    source_time: 12,
    source_title: 'Owned road footage',
    source_url: '',
  }];

  assert.throws(() => normalizePodcastEdit(input), /source_url is required/);
});

test('approved edits require a named approver and timestamp', async () => {
  const input = await fixture();
  input.approval.approvedBy = null;
  assert.throws(() => normalizePodcastEdit(input), /approved podcast edits require/);
});

test('rejects repeated member material and overlapping source audio', async () => {
  const repeated = await fixture();
  repeated.editorial.clips.push({
    ...structuredClone(repeated.editorial.clips[0]),
    index: 1,
    start: 3500,
    end: 3520,
    render_start: 3500,
    render_end: 3520,
  });
  assert.throws(() => normalizePodcastEdit(repeated), /repeat material id/);

  const overlap = await fixture();
  overlap.editorial.clips.push({
    ...structuredClone(overlap.editorial.clips[0]),
    index: 1,
    segment_id: '01-believe-in-something:0090',
    segment_ids: ['01-believe-in-something:0090'],
    start: 3440,
    end: 3460,
    render_start: 3440,
    render_end: 3460,
  });
  assert.throws(() => normalizePodcastEdit(overlap), /overlapping planned audio/);

  const renderOverlap = await fixture();
  renderOverlap.editorial.clips.push({
    ...structuredClone(renderOverlap.editorial.clips[0]),
    index: 1,
    segment_id: '01-believe-in-something:0091',
    segment_ids: ['01-believe-in-something:0091'],
    start: 3450,
    end: 3470,
    render_start: 3440,
    render_end: 3470,
  });
  assert.throws(() => normalizePodcastEdit(renderOverlap), /overlapping rendered audio/);
});

test('accepts an approved seven-minute multi-clip edit', async () => {
  const input = await fixture();
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

  const edit = normalizePodcastEdit(input);
  assert.equal(edit.editorial.target_duration, 420);
  assert.equal(
    edit.editorial.clips.reduce(
      (total, clip) => total + clip.render_end - clip.render_start,
      0,
    ),
    420,
  );
});
