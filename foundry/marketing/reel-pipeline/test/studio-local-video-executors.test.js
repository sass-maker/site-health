import assert from 'node:assert/strict';
import test from 'node:test';

import registry from '../config/local-video-workflow-recipes.json' with { type: 'json' };
import {
  executeCoherentLocalFilm,
  selectWorkflowRecipe,
} from '../src/studio/local-video-executors.js';

test('coherent local film routes previews to Comfy and finals to MLX LTX 2.3', async () => {
  assert.equal(selectWorkflowRecipe({ modelProfileId: 'auto' }, { qualityLane: 'preview' }), 'ltx-2b-comfy-i2v-preview');
  assert.equal(selectWorkflowRecipe({ modelProfileId: 'ltx-2.3-mlx-q4' }, {}), 'ltx-2.3-mlx-q4-final');
  assert.equal(selectWorkflowRecipe({ modelProfileId: 'minimax-h3-mlx-q4' }, {}), 'minimax-h3-comfy-r2v-specialist');

  let receivedRun;
  const result = await executeCoherentLocalFilm({
    brief: { modelProfileId: 'auto' },
    inputs: {
      qualityLane: 'preview',
      prompt: 'A full-body adult hero walks through a neon alley as the camera tracks sideways.',
      referenceImage: '/tmp/reference.png',
    },
  }, {
    recipeOptions: { registry, rootDir: process.cwd() },
    verifyRecipeFiles: async () => ({ ready: true, failures: [] }),
    executeComfy: async (run) => {
      receivedRun = run;
      return { videoPath: '/tmp/video.mp4' };
    },
  });
  assert.equal(result.videoPath, '/tmp/video.mp4');
  assert.equal(receivedRun.qualityLane, 'preview');
  assert.equal(receivedRun.inputs.frames, 49);
});

test('blocked H3 never reaches an executor', async () => {
  await assert.rejects(executeCoherentLocalFilm({
    brief: { modelProfileId: 'minimax-h3-mlx-q4' },
    inputs: { prompt: 'A cinematic adult character scene.', referenceImage: '/tmp/reference.png' },
  }, { recipeOptions: { registry, rootDir: '/' } }), /not ready.*aten::_int_mm/i);
});
