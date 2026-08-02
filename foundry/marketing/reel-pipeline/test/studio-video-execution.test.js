import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  describeVariantExecution,
  listExecutionAdapters,
  validateExecutionRegistry,
} from '../src/studio/execution-registry.js';
import { listRecipeVariants } from '../src/studio/production-catalog.js';
import { validateVideoArsenalCompleteness } from '../src/studio/video-arsenal-contract.js';
import { executeVideoVariant } from '../src/studio/video-execution.js';

test('execution registry covers every recipe and decorates all 48 variants', () => {
  const variants = listRecipeVariants();
  assert.deepEqual(validateExecutionRegistry({ variants }), { recipes: 12, variants: 48, adapters: 12 });
  assert.equal(listExecutionAdapters().length, 12);
  const decorated = variants.map(describeVariantExecution);
  assert.ok(decorated.every((variant) => variant.execution.fixture.ready));
  assert.ok(decorated.every((variant) => variant.execution.adapter && variant.execution.owner));
  assert.equal(decorated.find((variant) => variant.recipeId === 'literal-lyric-video').execution.inputs.length, 5);
});

test('complete arsenal contract fails closed on null, duplicate, unknown, and stale identifiers', () => {
  assert.deepEqual(validateVideoArsenalCompleteness(), {
    variants: 48,
    recipes: 12,
    adapters: 12,
    galleryItems: 48,
  });
  const variants = listRecipeVariants();
  assert.throws(
    () => validateVideoArsenalCompleteness({ variants: [{ ...variants[0], id: null }] }),
    /null or empty variant id/,
  );
  assert.throws(
    () => validateVideoArsenalCompleteness({ variants: [variants[0], variants[0]] }),
    /duplicate video arsenal variant/,
  );
  assert.throws(
    () => validateVideoArsenalCompleteness({ variants: [{ ...variants[0], recipeId: 'unknown-recipe' }] }),
    /unknown video recipe/,
  );
  assert.throws(
    () => validateVideoArsenalCompleteness({ variants: variants.filter((variant) => variant.recipeId !== 'ascii-story') }),
    /stale video execution adapters/,
  );
});

test('every variant can execute its exact portable fixture without claiming a real runtime', async () => {
  for (const variant of listRecipeVariants()) {
    const result = await executeVideoVariant({
      id: `brief-${variant.id}`,
      recipeId: variant.recipeId,
      recipeOptions: { variantId: variant.id, values: variant.values },
    }, { mode: 'fixture' });
    assert.equal(result.status, 'completed');
    assert.equal(result.mode, 'fixture');
    assert.equal(result.variantId, variant.id);
    assert.equal(result.provenance.posture, 'fixture');
    assert.match(result.artifact.videoPath, /fixtures\/video-gallery\/videos/);
    assert.equal(result.quality.verdict, 'pass');
  }
});

test('real execution fails on missing declared inputs and accepts an owner executor receipt', async () => {
  const productBrief = {
    id: 'brief-product',
    recipeId: 'product-proof',
    recipeOptions: { variantId: 'product-proof--proofstyle-mini-demo' },
  };
  await assert.rejects(
    executeVideoVariant(productBrief, { mode: 'real' }),
    /Product URL/,
  );

  const root = await mkdtemp(path.join(tmpdir(), 'video-execution-'));
  const videoPath = path.join(root, 'owner.mp4');
  await writeFile(videoPath, Buffer.from('owner fixture'));
  const result = await executeVideoVariant(productBrief, {
    mode: 'real',
    inputs: { canonicalUrl: 'https://example.com' },
    realExecutors: {
      'product-proof': async () => ({
        videoPath,
        renderer: 'brand-reel',
        ownerManifestPath: path.join(root, 'manifest.json'),
        provenance: { posture: 'real', renderer: 'brand-reel' },
        quality: { verdict: 'pass' },
      }),
    },
  });
  assert.equal(result.mode, 'real');
  assert.equal(result.owner, 'Brand Reel');
  assert.equal(result.evidence.ownerManifestPath, path.join(root, 'manifest.json'));
});
