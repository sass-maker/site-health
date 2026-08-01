import assert from 'node:assert/strict';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  listExploreGallery,
  openExploreGalleryMedia,
  validateExploreGallery,
} from '../src/studio/explore-gallery.js';

function fixtureConfig(source = 'sample.mp4') {
  return {
    schema: 'fleet.video-explore-gallery.v1',
    version: 1,
    items: [{
      id: 'kinetic-proof',
      title: 'Kinetic proof',
      family: 'Motion graphics',
      description: 'A real local fixture.',
      engine: 'HTML / Canvas',
      sourcePosture: 'local-render',
      qualityTier: 'showcase',
      spend: 'No API spend',
      variantId: 'web-motion--visualstyle-kinetic-type',
      source,
    }],
  };
}

test('gallery registry reports playable media without exposing local paths', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'explore-gallery-'));
  await writeFile(path.join(root, 'sample.mp4'), Buffer.from('playable fixture'));
  const gallery = await listExploreGallery({ galleryRoot: root, galleryConfig: fixtureConfig() });
  assert.equal(gallery.count, 1);
  assert.equal(gallery.playableCount, 1);
  assert.deepEqual(gallery.families, ['Motion graphics']);
  assert.equal(gallery.items[0].playable, true);
  assert.equal(gallery.items[0].mediaUrl, '/studio/explore-gallery/kinetic-proof/media');
  assert.equal('source' in gallery.items[0], false);
  assert.equal('resolvedSource' in gallery.items[0], false);

  const media = await openExploreGalleryMedia('kinetic-proof', { galleryRoot: root, galleryConfig: fixtureConfig() });
  assert.equal(media.path, path.join(root, 'sample.mp4'));
  assert.equal(media.contentType, 'video/mp4');
  assert.equal(media.size, 16);
});

test('gallery registry preserves unavailable samples and rejects unsafe definitions', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'explore-gallery-'));
  const gallery = await listExploreGallery({ galleryRoot: root, galleryConfig: fixtureConfig('missing.mp4') });
  assert.equal(gallery.playableCount, 0);
  assert.equal(gallery.items[0].playable, false);
  assert.equal(gallery.items[0].mediaUrl, null);
  assert.equal(await openExploreGalleryMedia('missing', { galleryRoot: root, galleryConfig: fixtureConfig() }), null);
  assert.throws(
    () => validateExploreGallery(fixtureConfig('../escape.mp4'), { galleryRoot: root }),
    /escapes the gallery root/,
  );
  assert.throws(
    () => validateExploreGallery({ ...fixtureConfig(), items: [{ ...fixtureConfig().items[0], variantId: 'made-up' }] }, { galleryRoot: root }),
    /unknown variant/,
  );
});
