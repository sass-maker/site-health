import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import registry from '../config/local-video-workflow-recipes.json' with { type: 'json' };
import {
  deterministicHash,
  extractComfyPromptFromMp4,
  listLocalVideoWorkflowRecipes,
  resolveLocalVideoWorkflowRun,
  validateWorkflowRecipeRegistry,
  verifyWorkflowRecipeFiles,
} from '../src/local-video-workflow-recipes.js';

test('workflow registry distinguishes final, preview, and blocked specialist lanes', async (t) => {
  assert.equal(validateWorkflowRecipeRegistry(registry), registry);
  const rootDir = await mkdtemp(path.join(tmpdir(), 'workflow-readiness-'));
  t.after(() => rm(rootDir, { recursive: true, force: true }));
  const fixtureRegistry = structuredClone(registry);
  for (const [recipeIndex, recipe] of fixtureRegistry.recipes.entries()) {
    recipe.runtime.path = `runtime-${recipeIndex}`;
    recipe.models.forEach((model, modelIndex) => {
      model.path = `model-${recipeIndex}-${modelIndex}.safetensors`;
    });
  }
  await writeFile(path.join(rootDir, fixtureRegistry.recipes[1].runtime.path), 'runtime');
  await Promise.all(fixtureRegistry.recipes[1].models.map((model) => writeFile(path.join(rootDir, model.path), 'model')));

  const recipes = listLocalVideoWorkflowRecipes({ rootDir, registry: fixtureRegistry });
  assert.deepEqual(recipes.map(({ id, qualityLane }) => [id, qualityLane]), [
    ['ltx-2.3-mlx-q4-final', 'final'],
    ['ltx-2b-comfy-i2v-preview', 'preview'],
    ['minimax-h3-comfy-r2v-specialist', 'specialist'],
  ]);
  assert.equal(recipes[0].readiness.ready, false);
  assert.equal(recipes[1].readiness.ready, true);
  assert.match(recipes[2].readiness.blocker, /aten::_int_mm/);
});

test('only declared inputs can alter graph fields and signatures are deterministic', () => {
  const input = {
    prompt: 'A full-body hero crosses a rain-slick rooftop as the camera orbits.',
    referenceImage: '/tmp/approved/hero.png',
    width: 512,
    height: 320,
    frames: 49,
    motionStrength: 0.3,
    seed: 919191,
  };
  const first = resolveLocalVideoWorkflowRun('ltx-2b-comfy-i2v-preview', input);
  const second = resolveLocalVideoWorkflowRun('ltx-2b-comfy-i2v-preview', { ...input });
  assert.equal(first.inputSignature, second.inputSignature);
  assert.equal(first.graph['3'].inputs.text, input.prompt);
  assert.equal(first.graph['5'].inputs.image, 'hero.png');
  assert.equal(first.graph['8'].inputs.steps, 8);
  assert.equal(first.graph['13'].class_type, 'SaveVideo');
  assert.throws(() => resolveLocalVideoWorkflowRun('ltx-2b-comfy-i2v-preview', { ...input, steps: 100 }), /unknown workflow inputs: steps/);
  assert.throws(() => resolveLocalVideoWorkflowRun('ltx-2b-comfy-i2v-preview', { ...input, frames: 48 }), /must equal 1 plus a multiple of 8/);
});

test('unknown Comfy nodes fail closed', () => {
  const copy = structuredClone(registry);
  copy.recipes[1].graph['99'] = { class_type: 'InstallAnythingFromTheInternet', inputs: {} };
  assert.throws(() => validateWorkflowRecipeRegistry(copy), /unsupported Comfy node/);
});

test('model verification reports stale hashes without reading real model payloads', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'workflow-model-hash-'));
  const modelPath = path.join(root, 'model.safetensors');
  await writeFile(modelPath, 'fixture');
  const recipe = structuredClone(registry.recipes[1]);
  recipe.models = [{ ...recipe.models[0], path: 'model.safetensors' }];
  const stale = await verifyWorkflowRecipeFiles(recipe, {
    rootDir: root,
    hashFile: async () => '0'.repeat(64),
  });
  assert.equal(stale.ready, false);
  assert.match(stale.failures.join(' '), /stale model hash/);
});

test('embedded Comfy prompt extraction validates the node allowlist', async () => {
  const graph = registry.recipes[1].graph;
  const result = await extractComfyPromptFromMp4('/tmp/proof.mp4', {
    execFile: async () => ({ stdout: JSON.stringify({ format: { tags: { prompt: JSON.stringify(graph) } } }) }),
  });
  assert.equal(result.graphSha256, deterministicHash(graph));
  assert.equal(result.sourcePath, '/tmp/proof.mp4');
});
