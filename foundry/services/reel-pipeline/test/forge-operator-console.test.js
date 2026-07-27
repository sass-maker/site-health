import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import test from 'node:test';

import worker from '../src/worker/index.js';

const TOKEN = 'forge-console-test-token';
const ORIGIN = 'https://forge.example.test';

function authorized(pathname, init = {}) {
  const headers = new Headers(init.headers);
  headers.set('authorization', `Bearer ${TOKEN}`);
  return new Request(`${ORIGIN}${pathname}`, { ...init, headers });
}

function forgeJobInput() {
  return {
    id: 'operator-film-1',
    prompt: 'Turn one risky change into a qualified shipping verdict.',
    context: 'Use approved CodeVetter evidence and no generated product claims.',
    filmSkill: 'evidence-beam@1',
    project: {
      name: 'codevetter-launch',
      aspectRatio: '9:16',
      fps: 24,
      style: 'clean technical documentary',
    },
    shot: {
      id: 's01',
      mode: 'image-to-video',
      keyframe: 'approved.png',
      keyframeApproved: true,
      motionPrompt: 'Slow controlled push along one evidence path.',
      negativePrompt: 'camera shake, scene cuts',
      preview: {
        preset: 'preview',
        seeds: [41, 42, 43],
        width: 576,
        height: 1024,
        frames: 81,
        fps: 24,
      },
    },
    keyframe: {
      fileName: 'approved.png',
      mediaType: 'image/png',
      dataBase64: Buffer.from('approved-keyframe').toString('base64'),
      provenance: {
        sourceType: 'real-capture',
        sourceRevision: 'c59097fa',
        rights: {
          tier: 'production-safe',
          license: 'operator-owned',
          approved: true,
        },
      },
    },
  };
}

function createR2Bucket() {
  const objects = new Map();
  let revision = 0;
  return {
    async put(key, value, options = {}) {
      const existing = objects.get(key);
      if (options.onlyIf?.etagMatches && existing?.etag !== options.onlyIf.etagMatches) return null;
      const bytes = await toBytes(value);
      if (
        options.sha256
        && createHash('sha256').update(bytes).digest('hex') !== options.sha256
      ) {
        throw new Error('R2 checksum mismatch');
      }
      const etag = `"forge-${revision += 1}"`;
      objects.set(key, {
        bytes,
        etag,
        contentType: options.httpMetadata?.contentType ?? 'application/octet-stream',
      });
      return { etag };
    },
    async get(key, options = {}) {
      const stored = objects.get(key);
      if (!stored) return null;
      const requested = options.range;
      const offset = requested?.offset ?? 0;
      const length = Math.min(requested?.length ?? stored.bytes.length - offset, stored.bytes.length - offset);
      if (offset >= stored.bytes.length) throw new Error('range unsatisfiable');
      const bytes = requested ? stored.bytes.slice(offset, offset + length) : stored.bytes;
      return {
        body: bytes,
        size: stored.bytes.length,
        range: requested ? { offset, length } : undefined,
        etag: stored.etag,
        httpEtag: stored.etag,
        json: async () => JSON.parse(new TextDecoder().decode(bytes)),
        writeHttpMetadata: (headers) => headers.set('content-type', stored.contentType),
      };
    },
    async head(key) {
      const stored = objects.get(key);
      return stored ? { size: stored.bytes.length } : null;
    },
    async list({ prefix }) {
      return {
        objects: [...objects.keys()]
          .filter((key) => key.startsWith(prefix))
          .map((key) => ({ key })),
      };
    },
  };
}

async function toBytes(value) {
  if (typeof value === 'string') return new TextEncoder().encode(value);
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (value?.getReader) return new Uint8Array(await new Response(value).arrayBuffer());
  return new Uint8Array(value);
}

async function jsonRequest(pathname, method, body, env) {
  return worker.fetch(authorized(pathname, {
    method,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }), env);
}

async function completePreviewJob(env, input = forgeJobInput()) {
  const jobId = input.id;
  const created = await jsonRequest('/forge/jobs', 'POST', input, env);
  assert.equal(created.status, 201);

  const claim = await jsonRequest('/forge/jobs/claim', 'POST', {
    workerId: 'm5-pro',
    capabilities: ['apple-silicon', 'mlx-ltx-2.3'],
  }, env);
  assert.equal(claim.status, 200);

  const variants = [];
  for (const seed of [41, 42, 43]) {
    const variantId = `seed-${seed}`;
    const uploaded = await worker.fetch(authorized(`/forge/jobs/${jobId}/artifacts/${variantId}`, {
      method: 'PUT',
      headers: {
        'content-type': 'video/mp4',
        'x-forge-worker-id': 'm5-pro',
      },
      body: `video-${seed}`,
    }), env);
    assert.equal(uploaded.status, 201);
    const payload = await uploaded.json();
    variants.push({ variantId, seed, artifactKey: payload.data.key, renderDurationMs: seed * 10 });
  }

  const completed = await jsonRequest(`/forge/jobs/${jobId}/complete`, 'POST', {
    workerId: 'm5-pro',
    variants,
  }, env);
  assert.equal(completed.status, 200);
}

test('exact /forge route and nested console APIs fail closed without internal auth', async () => {
  const env = { REEL_INTERNAL_TOKEN: TOKEN, REEL_ARTIFACTS: createR2Bucket() };
  const page = await worker.fetch(new Request(`${ORIGIN}/forge`), env);
  assert.equal(page.status, 401);
  assert.match(page.headers.get('www-authenticate') ?? '', /Foundry Reel Review/);

  const skills = await worker.fetch(new Request(`${ORIGIN}/forge/skills`), env);
  assert.equal(skills.status, 401);

  const noSecret = await worker.fetch(authorized('/forge'), {
    REEL_ARTIFACTS: createR2Bucket(),
  });
  assert.equal(noSecret.status, 401);
});

test('authenticated forge console exposes the bounded production loop, not an editor', async () => {
  const credentials = Buffer.from(`foundry:${TOKEN}`).toString('base64');
  const response = await worker.fetch(new Request(`${ORIGIN}/forge`, {
    headers: { authorization: `Basic ${credentials}` },
  }), {
    REEL_INTERNAL_TOKEN: TOKEN,
    REEL_ARTIFACTS: createR2Bucket(),
  });

  assert.equal(response.status, 200);
  assert.equal(response.headers.get('cache-control'), 'private, no-store');
  const page = await response.text();
  assert.match(page, /New film task/);
  assert.match(page, /Film style/);
  assert.match(page, /Record app/);
  assert.match(page, /same-session|synchronized bottom-right presenter/);
  assert.match(page, /Queue three previews/);
  assert.match(page, /Completed final render/);
  assert.match(page, /change-motion/);
  assert.match(page, /cloud-candidate/);
  assert.match(page, /Custom timeline edits belong in the exported editor-ready package/);
  assert.doesNotMatch(page, /frame-by-frame|layer dragging|social publish/i);
});

test('console APIs pin a skill, preserve provenance, play variants, and fail closed on final approval', async () => {
  const env = { REEL_INTERNAL_TOKEN: TOKEN, REEL_ARTIFACTS: createR2Bucket() };
  const skills = await worker.fetch(authorized('/forge/skills'), env);
  assert.equal(skills.status, 200);
  assert.deepEqual(
    (await skills.json()).data.map((skill) => skill.ref),
    ['evidence-beam@1', 'guided-app-demo@1'],
  );

  await completePreviewJob(env);

  const duplicate = await jsonRequest('/forge/jobs', 'POST', forgeJobInput(), env);
  assert.equal(duplicate.status, 409);

  const blocked = await jsonRequest('/forge/jobs/operator-film-1/final-render', 'POST', {}, env);
  assert.equal(blocked.status, 409);
  assert.match((await blocked.json()).error, /accepted preview variant is required/);

  const playback = await worker.fetch(authorized('/forge/jobs/operator-film-1/artifacts/seed-41', {
    headers: { range: 'bytes=0-4' },
  }), env);
  assert.equal(playback.status, 206);
  assert.equal(playback.headers.get('content-type'), 'video/mp4');
  assert.equal(playback.headers.get('cache-control'), 'private, no-store');
  assert.equal(await playback.text(), 'video');

  const decided = await jsonRequest('/forge/jobs/operator-film-1/decision', 'PATCH', {
    variantId: 'seed-42',
    decision: 'accepted',
  }, env);
  assert.equal(decided.status, 200);
  const accepted = await decided.json();
  assert.equal(accepted.data.review.selection.variantId, 'seed-42');
  assert.equal(accepted.data.filmSkill.ref, 'evidence-beam@1');
  assert.equal(accepted.data.keyframe.provenance.rights.tier, 'production-safe');
  assert.equal(accepted.data.finalRender.status, 'ready');
  const expectedKeyframeSha = createHash('sha256').update('approved-keyframe').digest('hex');
  assert.equal(accepted.data.review.selection.sourceSha256, expectedKeyframeSha);

  const formFinal = await worker.fetch(authorized('/forge/jobs/operator-film-1/final-render', {
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
    },
    body: 'approve=true',
  }), env);
  assert.equal(formFinal.status, 415);

  const queued = await jsonRequest('/forge/jobs/operator-film-1/final-render', 'POST', {}, env);
  assert.equal(queued.status, 202);
  const final = await queued.json();
  assert.equal(final.data.finalRender.status, 'queued');
  assert.equal(final.data.finalRender.approvedVariantId, 'seed-42');
  assert.equal(final.data.finalRender.seed, 42);
  assert.equal(final.data.finalRender.filmSkill, 'evidence-beam@1');
  assert.equal(final.data.finalRender.sourceSha256, expectedKeyframeSha);

  const finalQueue = await worker.fetch(authorized('/forge/jobs?status=queued'), env);
  assert.equal(finalQueue.status, 200);
  assert.deepEqual((await finalQueue.json()).data.map((job) => job.id), ['operator-film-1']);

  const finalClaim = await jsonRequest('/forge/jobs/claim', 'POST', {
    workerId: 'm5-pro-final',
    capabilities: ['apple-silicon', 'mlx-ltx-2.3'],
  }, env);
  assert.equal(finalClaim.status, 200);
  const claimedFinal = await finalClaim.json();
  assert.equal(claimedFinal.data.activeRenderKind, 'final');
  assert.equal(claimedFinal.data.finalRender.status, 'running');
  assert.equal(claimedFinal.data.finalRender.seed, 42);

  const finalUpload = await worker.fetch(authorized('/forge/jobs/operator-film-1/artifacts/final-seed-42', {
    method: 'PUT',
    headers: {
      'content-type': 'video/mp4',
      'x-forge-worker-id': 'm5-pro-final',
    },
    body: 'final-video-42',
  }), env);
  assert.equal(finalUpload.status, 201);
  const finalArtifact = await finalUpload.json();
  assert.match(finalArtifact.data.key, /\/final\/attempt-1\/final-seed-42\.mp4$/);

  const finalCompleted = await jsonRequest('/forge/jobs/operator-film-1/complete', 'POST', {
    workerId: 'm5-pro-final',
    variants: [{
      variantId: 'final-seed-42',
      seed: 42,
      artifactKey: finalArtifact.data.key,
      renderKind: 'final',
      filmSkill: 'evidence-beam@1',
      qualityGates: ['single-story', 'real-evidence', 'mobile-legibility', 'publication-rights'],
    }],
  }, env);
  assert.equal(finalCompleted.status, 200);
  const renderedFinal = await finalCompleted.json();
  assert.equal(renderedFinal.data.finalRender.status, 'completed');
  assert.equal(renderedFinal.data.finalRender.variant.seed, 42);
  assert.equal(renderedFinal.data.variants.length, 3);

  const finalPlayback = await worker.fetch(
    authorized('/forge/jobs/operator-film-1/artifacts/final-seed-42'),
    env,
  );
  assert.equal(finalPlayback.status, 200);
  assert.equal(await finalPlayback.text(), 'final-video-42');

  const locked = await jsonRequest('/forge/jobs/operator-film-1/decision', 'PATCH', {
    variantId: 'seed-41',
    decision: 'accepted',
  }, env);
  assert.equal(locked.status, 409);
  assert.match((await locked.json()).error, /review is locked/);
});

test('final approval rejects legacy jobs without pinned rights and skill metadata', async () => {
  const input = forgeJobInput();
  input.id = 'legacy-film-1';
  delete input.filmSkill;
  delete input.keyframe.provenance;
  const env = { REEL_INTERNAL_TOKEN: TOKEN, REEL_ARTIFACTS: createR2Bucket() };
  await completePreviewJob(env, input);
  const decided = await jsonRequest('/forge/jobs/legacy-film-1/decision', 'PATCH', {
    variantId: 'seed-41',
    decision: 'accepted',
  }, env);
  assert.equal(decided.status, 200);

  const blocked = await jsonRequest('/forge/jobs/legacy-film-1/final-render', 'POST', {}, env);
  assert.equal(blocked.status, 409);
  assert.match((await blocked.json()).error, /exact film skill version is required/);
});

test('skill-bound production evidence requires server-validated source revision', async () => {
  const input = forgeJobInput();
  delete input.keyframe.provenance.sourceRevision;
  const env = { REEL_INTERNAL_TOKEN: TOKEN, REEL_ARTIFACTS: createR2Bucket() };
  const response = await jsonRequest('/forge/jobs', 'POST', input, env);
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /sourceRevision is required/);
});

test('guided app demo preserves one approved same-session capture through preview and final', async () => {
  const env = { REEL_INTERNAL_TOKEN: TOKEN, REEL_ARTIFACTS: createR2Bucket() };
  const sourceBytes = new TextEncoder().encode('same-session-app-and-presenter');
  const sourceSha256 = createHash('sha256').update(sourceBytes).digest('hex');
  const uploaded = await worker.fetch(authorized('/forge/captures/guided-take-1', {
    method: 'PUT',
    headers: {
      'content-type': 'video/webm',
      'content-length': String(sourceBytes.byteLength),
      'x-forge-duration-ms': '45000',
      'x-forge-sha256': sourceSha256,
      'x-forge-film-skill': 'guided-app-demo@1',
      'x-forge-file-name': 'guided-take-1.webm',
      'x-forge-presenter-mode': 'same-session',
      'x-forge-display-surface': 'window',
      'x-forge-source-revision': 'codevetter-c59097fa',
      'x-forge-license': 'operator-owned',
      'x-forge-rights-approved': 'true',
    },
    body: sourceBytes,
  }), env);
  assert.equal(uploaded.status, 201);
  const capture = (await uploaded.json()).data;
  assert.equal(capture.sha256, sourceSha256);
  assert.equal(capture.presenter.position, 'bottom-right');
  assert.equal(capture.presenter.sync, 'same-session');

  const created = await jsonRequest('/forge/jobs', 'POST', {
    id: 'guided-film-1',
    captureId: capture.id,
    prompt: 'Show the real review flow and explain the shipping verdict.',
    context: 'Keep the app legible and the presenter clear of the active control.',
    filmSkill: 'guided-app-demo@1',
    project: {
      name: 'codevetter-guided-demo',
      aspectRatio: '9:16',
      fps: 24,
      style: 'clean technical documentary',
    },
    shot: { id: 'guided-s01' },
  }, env);
  assert.equal(created.status, 201);
  const job = (await created.json()).data;
  assert.equal(job.sourceKind, 'guided-app-capture');
  assert.equal(job.sourceCapture.sha256, sourceSha256);
  assert.deepEqual(job.requiredCapabilities, ['ffmpeg', 'guided-app-demo']);

  const claim = await jsonRequest('/forge/jobs/claim', 'POST', {
    workerId: 'm5-guided-preview',
    capabilities: ['ffmpeg', 'guided-app-demo'],
  }, env);
  assert.equal(claim.status, 200);
  assert.equal((await claim.json()).data.activeRenderKind, 'preview');

  const source = await worker.fetch(authorized('/forge/jobs/guided-film-1/source'), env);
  assert.equal(source.status, 200);
  assert.equal(source.headers.get('content-type'), 'video/webm');
  assert.equal(await source.text(), 'same-session-app-and-presenter');

  const previewUpload = await worker.fetch(authorized(
    '/forge/jobs/guided-film-1/artifacts/capture-preview',
    {
      method: 'PUT',
      headers: {
        'content-type': 'video/mp4',
        'x-forge-worker-id': 'm5-guided-preview',
      },
      body: 'guided-preview',
    },
  ), env);
  assert.equal(previewUpload.status, 201);
  const previewArtifact = (await previewUpload.json()).data;

  const completed = await jsonRequest('/forge/jobs/guided-film-1/complete', 'POST', {
    workerId: 'm5-guided-preview',
    variants: [{
      variantId: 'capture-preview',
      artifactKey: previewArtifact.key,
      renderKind: 'preview',
      filmSkill: 'guided-app-demo@1',
      sourceSha256,
    }],
  }, env);
  assert.equal(completed.status, 200);
  assert.equal((await completed.json()).data.variants.length, 1);

  const accepted = await jsonRequest('/forge/jobs/guided-film-1/decision', 'PATCH', {
    variantId: 'capture-preview',
    decision: 'accepted',
  }, env);
  assert.equal(accepted.status, 200);
  assert.equal((await accepted.json()).data.review.selection.sourceSha256, sourceSha256);

  const queued = await jsonRequest('/forge/jobs/guided-film-1/final-render', 'POST', {}, env);
  assert.equal(queued.status, 202);
  assert.equal((await queued.json()).data.finalRender.sourceSha256, sourceSha256);

  const finalClaim = await jsonRequest('/forge/jobs/claim', 'POST', {
    workerId: 'm5-guided-final',
    capabilities: ['ffmpeg', 'guided-app-demo'],
  }, env);
  assert.equal(finalClaim.status, 200);
  assert.equal((await finalClaim.json()).data.activeRenderKind, 'final');
});

test('guided capture rejects takes longer than the short-video limit', async () => {
  const env = { REEL_INTERNAL_TOKEN: TOKEN, REEL_ARTIFACTS: createR2Bucket() };
  const response = await worker.fetch(authorized('/forge/captures/too-long', {
    method: 'PUT',
    headers: {
      'content-type': 'video/webm',
      'content-length': '4',
      'x-forge-duration-ms': '91000',
      'x-forge-sha256': 'b'.repeat(64),
      'x-forge-film-skill': 'guided-app-demo@1',
    },
    body: 'take',
  }), env);
  assert.equal(response.status, 400);
  assert.match((await response.json()).error, /between 250 and 90000/);
});
