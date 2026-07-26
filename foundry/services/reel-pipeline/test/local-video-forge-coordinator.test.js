import assert from 'node:assert/strict';
import test from 'node:test';

import {
  claimForgeJob,
  createForgeJob,
  getForgeJob,
  listForgeJobs,
  updateForgeJob,
} from '../src/local-video-forge-coordinator.js';

function createR2Bucket() {
  const objects = new Map();
  let revision = 0;
  return {
    async put(key, value, options = {}) {
      const existing = objects.get(key);
      if (options.onlyIf?.etagMatches && existing?.etag !== options.onlyIf.etagMatches) return null;
      let bytes;
      if (typeof value === 'string') bytes = new TextEncoder().encode(value);
      else if (value instanceof Uint8Array) bytes = value;
      else if (value?.getReader) bytes = new Uint8Array(await new Response(value).arrayBuffer());
      else bytes = new Uint8Array(value);
      const etag = `"test-${revision += 1}"`;
      objects.set(key, { bytes, etag, contentType: options.httpMetadata?.contentType });
      return { etag };
    },
    async get(key) {
      const object = objects.get(key);
      if (!object) return null;
      return {
        body: object.bytes,
        etag: object.etag,
        httpEtag: object.etag,
        json: async () => JSON.parse(new TextDecoder().decode(object.bytes)),
        writeHttpMetadata: (headers) => headers.set('content-type', object.contentType ?? 'application/octet-stream'),
      };
    },
    async list({ prefix }) {
      return {
        objects: Array.from(objects.keys())
          .filter((key) => key.startsWith(prefix))
          .map((key) => ({ key })),
      };
    },
  };
}

function submittedJob() {
  return {
    id: 'forge-job-1',
    project: { name: 'forge-test', aspectRatio: '9:16', fps: 24, style: 'clean' },
    shot: {
      id: 's01',
      mode: 'image-to-video',
      keyframe: 'keyframe.png',
      keyframeApproved: true,
      motionPrompt: 'Slow controlled push.',
      negativePrompt: 'camera shake',
      preview: { preset: 'smoke', seeds: [41, 42, 43], width: 256, height: 384, frames: 9, fps: 24 },
    },
    keyframe: {
      fileName: 'keyframe.png',
      mediaType: 'image/png',
      dataBase64: Buffer.from('approved-keyframe').toString('base64'),
    },
  };
}

test('shared forge queue accepts a job and leases it only to a capable worker', async () => {
  const bucket = createR2Bucket();
  const created = await createForgeJob(submittedJob(), { bucket });
  assert.equal(created.status, 'queued');
  assert.equal((await listForgeJobs({}, { bucket })).length, 1);

  const incompatible = await claimForgeJob({
    workerId: 'remote-linux',
    capabilities: ['linux'],
  }, { bucket });
  assert.equal(incompatible, null);

  const claimed = await claimForgeJob({
    workerId: 'local-mac',
    capabilities: ['apple-silicon', 'mlx-ltx-2.3'],
  }, { bucket });
  assert.equal(claimed.status, 'running');
  assert.equal(claimed.lease.workerId, 'local-mac');
  assert.equal(claimed.attempts, 1);

  const secondClaim = await claimForgeJob({
    workerId: 'other-mac',
    capabilities: ['apple-silicon', 'mlx-ltx-2.3'],
  }, { bucket });
  assert.equal(secondClaim, null);
});

test('shared forge queue rejects a mismatched keyframe hash', async () => {
  const input = submittedJob();
  input.keyframe.sha256 = 'incorrect';
  await assert.rejects(createForgeJob(input, { bucket: createR2Bucket() }), /sha256 does not match/);
});

test('forge worker progress, retry and completion preserve the shared task', async () => {
  const bucket = createR2Bucket();
  await createForgeJob(submittedJob(), { bucket });
  await claimForgeJob({
    workerId: 'local-mac',
    capabilities: ['apple-silicon', 'mlx-ltx-2.3'],
  }, { bucket });

  await assert.rejects(updateForgeJob('forge-job-1', 'complete', {
    workerId: 'other-mac',
    variants: [],
  }, { bucket }), /lease is not owned/);

  const progressed = await updateForgeJob('forge-job-1', 'progress', {
    workerId: 'local-mac',
    progress: { stage: 'variant-completed', completed: 1, total: 3 },
  }, { bucket });
  assert.equal(progressed.progress.completed, 1);

  const retried = await updateForgeJob('forge-job-1', 'fail', {
    workerId: 'local-mac',
    error: 'transient render failure',
  }, { bucket });
  assert.equal(retried.status, 'queued');

  await claimForgeJob({
    workerId: 'local-mac',
    capabilities: ['apple-silicon', 'mlx-ltx-2.3'],
  }, { bucket });
  await assert.rejects(updateForgeJob('forge-job-1', 'complete', {
    workerId: 'local-mac',
    variants: [{ variantId: 'seed-41', artifactKey: 'seed-41.mp4' }],
  }, { bucket }), /exactly three variants/);
  const completed = await updateForgeJob('forge-job-1', 'complete', {
    workerId: 'local-mac',
    variants: [
      { variantId: 'seed-41', artifactKey: 'seed-41.mp4' },
      { variantId: 'seed-42', artifactKey: 'seed-42.mp4' },
      { variantId: 'seed-43', artifactKey: 'seed-43.mp4' },
    ],
  }, { bucket });
  assert.equal(completed.status, 'completed');
  assert.equal(completed.variants.length, 3);
  assert.equal((await getForgeJob('forge-job-1', { bucket })).lease, null);
});
