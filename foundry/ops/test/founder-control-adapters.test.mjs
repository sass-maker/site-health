import assert from 'node:assert/strict';
import test from 'node:test';

import {
  cloudflareEvidence,
  collectEvidence,
  evidencePointer,
  githubEvidence,
} from '../lib/founder-control/adapters.mjs';

const observedAt = '2026-07-25T08:00:00.000Z';

test('normalizes provider pointers without copying nested payloads', () => {
  const github = githubEvidence({
    kind: 'workflow-run',
    id: '123',
    observedAt,
    url: 'https://github.com/example/actions/runs/123',
    summary: { conclusion: 'success', durationMs: 8123, nested: { logs: 'not copied' } },
  });
  assert.equal(github.state, 'verified');
  assert.deepEqual(github.summary, { conclusion: 'success', durationMs: 8123 });

  const cloudflare = cloudflareEvidence({
    kind: 'deployment',
    id: 'deploy-1',
    observedAt,
    summary: { state: 'success' },
  });
  assert.equal(cloudflare.provider, 'cloudflare');
});

test('marks expired evidence stale in projections and unavailable providers honestly', async () => {
  const unavailable = await collectEvidence(
    async () => {
      throw new Error('provider offline');
    },
    { provider: 'postiz', kind: 'publication', id: 'post-1', observedAt },
  );
  assert.equal(unavailable.state, 'unavailable');
  assert.equal(unavailable.summary.reason, 'provider offline');

  const pointer = evidencePointer('github', {
    kind: 'commit',
    id: 'abc',
    observedAt,
    ttlMs: 1_000,
  });
  assert.equal(pointer.freshUntil, '2026-07-25T08:00:01.000Z');
});
