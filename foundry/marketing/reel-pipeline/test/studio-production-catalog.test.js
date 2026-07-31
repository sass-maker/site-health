import assert from 'node:assert/strict';
import test from 'node:test';

import {
  PRODUCTION_RECIPE_IDS,
  PRODUCTION_SPEND_CLASSES,
  getProductionRecipe,
  listProductionProjects,
  listProductionRecipes,
  normalizeRecipeOptions,
  productionActions,
} from '../src/studio/production-catalog.js';

test('production catalog covers every requested runtime with normalized comparison fields', () => {
  const recipes = listProductionRecipes({
    blenderCapability: { ready: false, blocker: 'Blender unavailable for test.' },
    kokoroReady: false,
    moneyprinterReady: false,
  });
  assert.equal(recipes.length, 13);
  assert.deepEqual(recipes.map((entry) => entry.id), PRODUCTION_RECIPE_IDS);
  assert.deepEqual(PRODUCTION_SPEND_CLASSES, ['none', 'local-compute', 'external-service', 'paid-api']);
  for (const recipe of recipes) {
    assert.ok(recipe.group);
    assert.ok(recipe.outputStyle);
    assert.ok(recipe.owner);
    assert.ok(recipe.engine);
    assert.ok(PRODUCTION_SPEND_CLASSES.includes(recipe.spend.id));
    assert.ok(['ready', 'needs-input', 'needs-runtime', 'external-step'].includes(recipe.readiness.state));
    assert.deepEqual(recipe.channels, ['instagram_reels', 'youtube_shorts']);
  }
  assert.equal(getProductionRecipe('threejs-scene').owner, 'Editorial');
  assert.equal(getProductionRecipe('blender-film', { blenderCapability: { ready: true } }).readiness.state, 'ready');
  assert.match(getProductionRecipe('local-voice-film').readiness.blocker, /Kokoro/i);
  assert.match(getProductionRecipe('stock-faceless').readiness.blocker, /MoneyPrinterTurbo/i);
});

test('recipe options are bounded, normalized, and reject unsupported values', () => {
  assert.deepEqual(normalizeRecipeOptions('ascii-story', {
    channel: 'instagram_reels',
    durationSeconds: 18,
    qualityTier: 'draft',
    variantCount: 3,
    values: { palette: 'terminal' },
  }), {
    channel: 'instagram_reels',
    durationSeconds: 18,
    qualityTier: 'draft',
    variantCount: 3,
    values: { palette: 'terminal' },
  });
  assert.throws(() => normalizeRecipeOptions('ascii-story', { variantCount: 8 }), /between 1 and 6/);
  assert.throws(() => normalizeRecipeOptions('ascii-story', { palette: 'neon' }), /palette must be one of/);
  assert.throws(() => getProductionRecipe('imaginary-engine'), /unknown video recipe/);
});

test('terminal actions distinguish local build, external continuation, preview, and Postiz evidence', () => {
  const local = productionActions({
    id: 'brief-local', recipeId: 'image-slideshow', projectSlug: 'high-signal',
    media: null, sourceEvidence: {}, approval: {},
  });
  assert.equal(local.build.kind, 'execute');
  assert.equal(local.build.enabled, true);
  assert.equal(local.preview.enabled, false);
  assert.equal(local.post.enabled, false);

  const external = productionActions({
    id: 'brief-three', recipeId: 'threejs-scene', projectSlug: 'high-signal',
    sourceEvidence: {}, approval: {}, media: null,
  });
  assert.equal(external.build.kind, 'continue');
  assert.equal(external.build.enabled, true);
  const url = new URL(external.build.href);
  assert.equal(url.searchParams.get('studioBriefId'), 'brief-three');
  assert.equal(url.searchParams.get('recipeId'), 'threejs-scene');

  const grok = productionActions({
    id: 'brief-grok', recipeId: 'grok-asset-film', projectSlug: 'high-signal',
    recipeOptions: normalizeRecipeOptions('grok-asset-film'), sourceEvidence: {}, approval: {}, media: null,
  });
  assert.equal(grok.build.enabled, false);
  assert.match(grok.build.blocker, /approved local Grok MP4/i);
});

test('project catalog is sourced from Fleet brand configuration', () => {
  const projects = listProductionProjects();
  assert.ok(projects.some((entry) => entry.slug === 'high-signal' && entry.name === 'High Signal'));
  assert.ok(projects.every((entry) => entry.channels.length > 0 && entry.palette.accent));
});
