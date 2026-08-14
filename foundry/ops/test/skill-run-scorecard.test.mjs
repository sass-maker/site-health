import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { parseTeammateScorecard } from '../lib/skill-run-scorecard.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const scorecardPath = resolve(here, '../teammates/SCORECARD.md');

test('parses the curated Codex and Devin history without inventing metrics', async () => {
  const markdown = await readFile(scorecardPath, 'utf8');
  const entries = parseTeammateScorecard(markdown);
  const codex = entries.filter((entry) => entry.run.actor.id === 'codex');
  const devin = entries.filter((entry) => entry.run.actor.id === 'devin');

  assert.equal(codex.length, 27);
  assert.equal(devin.length, 19);
  assert.equal(entries.length, 46);
  assert.ok(entries.every((entry) => entry.metrics.length === 0));
  assert.ok(entries.every((entry) => entry.run.source === 'backfill'));
  assert.ok(entries.every((entry) => entry.run.captureCompleteness === 'summary-only'));
  assert.ok(entries.every((entry) => entry.run.reconstructionConfidence === 'curated-summary'));
  assert.ok(entries.every((entry) => entry.output.length > 0));
});

test('produces deterministic idempotency keys and preserves categorical verdicts', () => {
  const markdown = [
    '| date | teammate | task type | repo/scope | verdict | note |',
    '| --- | --- | --- | --- | --- | --- |',
    '| 2026-07-04 | devin | test-fix | scratch e2e | accepted | useful result |',
  ].join('\n');

  const first = parseTeammateScorecard(markdown);
  const second = parseTeammateScorecard(markdown);

  assert.deepEqual(first, second);
  assert.match(first[0].run.idempotencyKey, /^scorecard:devin:[a-f0-9]{64}$/);
  assert.deepEqual(first[0].run.metadata, {
    teammate: 'devin',
    taskType: 'test-fix',
    repoScope: 'scratch e2e',
    verdict: 'accepted',
  });
});
