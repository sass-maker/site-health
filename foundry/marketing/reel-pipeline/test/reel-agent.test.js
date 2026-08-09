import assert from 'node:assert/strict';
import test from 'node:test';

import { VIDEO_AGENT_SCHEMA, operationFailure } from '../src/agent/protocol.js';
import { REEL_AGENT_PRODUCT, reelAgentManifest, runReelAgent } from '../src/agent/reel-agent.js';
import { listExecutionAdapters } from '../src/studio/execution-registry.js';
import { listRecipeVariants } from '../src/studio/production-catalog.js';

function request(operation, input = {}, extra = {}) {
  return { schema: VIDEO_AGENT_SCHEMA, product: REEL_AGENT_PRODUCT, operation, input, ...extra };
}

test('manifest covers every registered recipe adapter and variant', async () => {
  const result = await runReelAgent(request('manifest'));
  assert.equal(result.state, 'completed');
  assert.equal(result.result.schema, 'fleet.video-agent-manifest.v1');
  assert.equal(result.result.completeness.adapters, listExecutionAdapters().length);
  assert.equal(result.result.completeness.variants, listRecipeVariants().length);
  assert.deepEqual(result.result.operations.map((entry) => entry.id), ['manifest', 'readiness', 'validate', 'execute', 'package', 'publish']);
});

test('execution validation is machine readable and side effect free', async () => {
  const variant = listRecipeVariants().find((entry) => entry.recipeId === 'image-slideshow');
  const result = await runReelAgent(request('validate', {
    brief: { id: 'agent-brief', recipeId: variant.recipeId, recipeOptions: { variantId: variant.id } },
    mode: 'fixture',
  }));
  assert.equal(result.state, 'completed');
  assert.equal(result.sideEffect, 'plan');
  assert.equal(result.result.ready, true);
  assert.equal(result.result.variant.variantId, variant.id);
});

test('unknown and arbitrary execution inputs fail with stable codes', async () => {
  await assert.rejects(() => runReelAgent(request('missing')), (error) => error.code === 'UNKNOWN_OPERATION');
  await assert.rejects(() => runReelAgent(request('validate', { command: 'rm anything' })), (error) => error.code === 'ARBITRARY_EXECUTION_REJECTED');
  const failure = operationFailure(request('missing'), new Error('nope'), REEL_AGENT_PRODUCT);
  assert.equal(failure.state, 'failed');
  assert.equal(failure.error.code, 'OPERATION_FAILED');
});

test('publication requires a configured channel policy', async () => {
  await assert.rejects(
    () => runReelAgent(request('publish', {
      contentPackage: {}, mediaReceipt: {}, distributionRequest: {
        schema: 'fleet.distribution-request.v1',
        id: 'request', packageId: 'package', packageRevision: 1, variantId: 'variant', brand: 'brand',
        channel: 'youtube_shorts', provider: 'manual', createdAt: '2026-08-09T00:00:00.000Z', scheduledFor: null,
        accountSlug: null, media: { receiptSchema: 'fleet.media-receipt.v1', artifact: '/tmp/video.mp4', publicUrl: null },
        copy: { title: 'Title', caption: 'Caption', destinationUrl: 'https://example.com/' },
        approval: { status: 'approved', approvedAt: '2026-08-09T00:00:00.000Z', approvedBy: 'owner' },
      },
    }), { channelPolicies: { schema: 'fleet.video-agent-channels.v1', channels: [] } }),
    (error) => error.code === 'CHANNEL_NOT_CONFIGURED',
  );
});

test('manifest can expose configured autonomous channels without credentials', () => {
  const manifest = reelAgentManifest({ channelPolicies: {
    schema: 'fleet.video-agent-channels.v1',
    channels: [{ brand: 'brand', channel: 'youtube_shorts', provider: 'postiz', mode: 'autonomous' }],
  } });
  assert.equal(manifest.capabilities.channels[0].mode, 'autonomous');
  assert.equal(manifest.safety.publicationRequiresConfiguredPolicy, true);
});
