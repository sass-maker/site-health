const JSON_HEADERS = { 'content-type': 'application/json; charset=utf-8' };
const JOB_PREFIX = 'video-forge/jobs/';
const ASSET_PREFIX = 'video-forge/assets/';
const OUTPUT_PREFIX = 'video-forge/outputs/';
const MAX_KEYFRAME_BYTES = 12 * 1024 * 1024;
const MAX_ATTEMPTS = 2;

export async function handleForgeWorkerRequest(request, env) {
  const url = new URL(request.url);
  const bucket = env.REEL_ARTIFACTS;
  if (!bucket) return responseJson({ error: 'missing REEL_ARTIFACTS binding' }, 500);

  if (request.method === 'POST' && url.pathname === '/forge/jobs') {
    try {
      const data = await createForgeJob(await request.json(), { bucket });
      return responseJson({ data }, 201);
    } catch (error) {
      return responseJson({ error: formatError(error) }, 400);
    }
  }

  if (request.method === 'GET' && url.pathname === '/forge/jobs') {
    const data = await listForgeJobs(Object.fromEntries(url.searchParams), { bucket });
    return responseJson({ data });
  }

  if (request.method === 'POST' && url.pathname === '/forge/jobs/claim') {
    try {
      const data = await claimForgeJob(await request.json(), { bucket });
      return data ? responseJson({ data }) : new Response(null, { status: 204 });
    } catch (error) {
      return responseJson({ error: formatError(error) }, 400);
    }
  }

  const keyframeMatch = request.method === 'GET' && url.pathname.match(/^\/forge\/jobs\/([^/]+)\/keyframe$/);
  if (keyframeMatch) {
    const job = await getForgeJob(decodeURIComponent(keyframeMatch[1]), { bucket });
    if (!job) return responseJson({ error: 'forge job not found' }, 404);
    const object = await bucket.get(job.keyframe.assetKey);
    if (!object) return responseJson({ error: 'keyframe not found' }, 404);
    const headers = new Headers();
    object.writeHttpMetadata?.(headers);
    headers.set('content-type', job.keyframe.mediaType);
    headers.set('cache-control', 'no-store');
    return new Response(object.body, { headers });
  }

  const artifactMatch = request.method === 'PUT' && url.pathname.match(/^\/forge\/jobs\/([^/]+)\/artifacts\/([^/]+)$/);
  if (artifactMatch) {
    try {
      const jobId = decodeURIComponent(artifactMatch[1]);
      const variantId = safeId(decodeURIComponent(artifactMatch[2]));
      const workerId = requiredString(request.headers.get('x-forge-worker-id'), 'x-forge-worker-id');
      const job = await getForgeJob(jobId, { bucket });
      assertLeaseOwner(job, workerId);
      const key = `${OUTPUT_PREFIX}${safeId(jobId)}/attempt-${job.attempts}/${variantId}.mp4`;
      await bucket.put(key, request.body, {
        httpMetadata: { contentType: request.headers.get('content-type') ?? 'video/mp4' },
      });
      return responseJson({ data: { key, variantId } }, 201);
    } catch (error) {
      return responseJson({ error: formatError(error) }, statusForError(error));
    }
  }

  const actionMatch = request.method === 'POST' && url.pathname.match(/^\/forge\/jobs\/([^/]+)\/(progress|complete|fail)$/);
  if (actionMatch) {
    try {
      const data = await updateForgeJob(
        decodeURIComponent(actionMatch[1]),
        actionMatch[2],
        await request.json(),
        { bucket },
      );
      return responseJson({ data });
    } catch (error) {
      return responseJson({ error: formatError(error) }, statusForError(error));
    }
  }

  const jobMatch = request.method === 'GET' && url.pathname.match(/^\/forge\/jobs\/([^/]+)$/);
  if (jobMatch) {
    const data = await getForgeJob(decodeURIComponent(jobMatch[1]), { bucket });
    return data ? responseJson({ data }) : responseJson({ error: 'forge job not found' }, 404);
  }

  return null;
}

export async function createForgeJob(input, options) {
  const bucket = requiredBucket(options.bucket);
  const project = normalizeSubmittedProject(input.project);
  const shot = normalizeSubmittedShot(input.shot);
  const keyframe = normalizeKeyframe(input.keyframe);
  const keyframeSha256 = await sha256(keyframe.bytes);
  if (input.keyframe.sha256 && input.keyframe.sha256 !== keyframeSha256) {
    throw new Error('keyframe sha256 does not match uploaded bytes');
  }
  const id = safeId(input.id ?? `forge_${new Date().toISOString().replace(/[^0-9]/g, '').slice(0, 14)}_${crypto.randomUUID().slice(0, 8)}`);
  const assetKey = `${ASSET_PREFIX}${id}.${extensionFor(keyframe.mediaType)}`;
  await bucket.put(assetKey, keyframe.bytes, { httpMetadata: { contentType: keyframe.mediaType } });
  const now = new Date().toISOString();
  const record = {
    schema: 'reel-pipeline.local-video-forge-job.v0.1',
    id,
    status: 'queued',
    attempts: 0,
    maxAttempts: MAX_ATTEMPTS,
    requiredCapabilities: ['apple-silicon', 'mlx-ltx-2.3'],
    project,
    shot,
    keyframe: {
      assetKey,
      fileName: keyframe.fileName,
      mediaType: keyframe.mediaType,
      bytes: keyframe.bytes.byteLength,
      sha256: keyframeSha256,
    },
    lease: null,
    progress: null,
    variants: [],
    createdAt: now,
    updatedAt: now,
  };
  await putJob(bucket, record);
  return record;
}

export async function listForgeJobs(filters = {}, options) {
  const bucket = requiredBucket(options.bucket);
  const listed = await bucket.list({ prefix: JOB_PREFIX });
  const records = [];
  for (const item of listed.objects ?? []) {
    const object = await bucket.get(item.key);
    if (!object) continue;
    const record = await object.json();
    if (filters.status && record.status !== filters.status) continue;
    if (filters.project && record.project.name !== filters.project) continue;
    records.push(record);
  }
  return records.sort((left, right) => String(left.createdAt).localeCompare(String(right.createdAt)));
}

export async function getForgeJob(id, options) {
  const object = await requiredBucket(options.bucket).get(jobKey(id));
  return object ? object.json() : null;
}

export async function claimForgeJob(input, options) {
  const bucket = requiredBucket(options.bucket);
  const workerId = requiredString(input.workerId, 'workerId');
  const capabilities = Array.isArray(input.capabilities) ? input.capabilities.map(String) : [];
  const leaseSeconds = Math.max(60, Math.min(6 * 60 * 60, Number(input.leaseSeconds ?? 4 * 60 * 60)));
  const now = options.now?.() ?? new Date();
  const candidates = await listForgeJobs({}, { bucket });
  for (const candidate of candidates) {
    if (!isClaimable(candidate, capabilities, now)) continue;
    const object = await bucket.get(jobKey(candidate.id));
    if (!object) continue;
    const current = await object.json();
    if (!isClaimable(current, capabilities, now)) continue;
    const next = {
      ...current,
      status: 'running',
      attempts: Number(current.attempts ?? 0) + 1,
      lease: {
        workerId,
        claimedAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + leaseSeconds * 1000).toISOString(),
      },
      updatedAt: now.toISOString(),
    };
    const stored = await putJob(bucket, next, { etag: object.etag });
    if (stored) return next;
  }
  return null;
}

export async function updateForgeJob(id, action, input, options) {
  const bucket = requiredBucket(options.bucket);
  const object = await bucket.get(jobKey(id));
  if (!object) throw forgeError('forge job not found', 404);
  const current = await object.json();
  const workerId = requiredString(input.workerId, 'workerId');
  assertLeaseOwner(current, workerId);
  const now = options.now?.() ?? new Date();
  let next;

  if (action === 'progress') {
    next = {
      ...current,
      progress: input.progress ?? null,
      lease: { ...current.lease, expiresAt: new Date(now.getTime() + 4 * 60 * 60 * 1000).toISOString() },
      updatedAt: now.toISOString(),
    };
  } else if (action === 'complete') {
    const variants = normalizeCompletedVariants(input.variants);
    next = {
      ...current,
      status: 'completed',
      progress: { stage: 'completed' },
      variants,
      lease: null,
      completedAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  } else if (action === 'fail') {
    const retryable = Number(current.attempts ?? 0) < Number(current.maxAttempts ?? MAX_ATTEMPTS);
    next = {
      ...current,
      status: retryable ? 'queued' : 'failed',
      error: optionalString(input.error) ?? 'worker failed',
      progress: { stage: retryable ? 'retry-queued' : 'failed' },
      lease: null,
      failedAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  } else {
    throw new Error(`unsupported forge action: ${action}`);
  }

  const stored = await putJob(bucket, next, { etag: object.etag });
  if (!stored) throw forgeError('forge job changed concurrently', 409);
  return next;
}

function isClaimable(job, capabilities, now) {
  const expired = job.status === 'running' && Date.parse(job.lease?.expiresAt ?? '') <= now.getTime();
  if (job.status !== 'queued' && !expired) return false;
  if (Number(job.attempts ?? 0) >= Number(job.maxAttempts ?? MAX_ATTEMPTS)) return false;
  return (job.requiredCapabilities ?? []).every((capability) => capabilities.includes(capability));
}

function normalizeSubmittedProject(project) {
  if (!project || typeof project !== 'object') throw new Error('project is required');
  return {
    name: requiredString(project.name, 'project.name'),
    aspectRatio: requiredString(project.aspectRatio, 'project.aspectRatio'),
    fps: Number(project.fps ?? 24),
    style: optionalString(project.style) ?? '',
  };
}

function normalizeSubmittedShot(shot) {
  if (!shot || typeof shot !== 'object') throw new Error('shot is required');
  if (shot.keyframeApproved !== true) throw new Error('shot keyframe is not explicitly approved');
  const seeds = shot.preview?.seeds;
  if (!Array.isArray(seeds) || seeds.length !== 3 || seeds.some((seed) => !Number.isInteger(Number(seed)))) {
    throw new Error('shot preview requires exactly three integer seeds');
  }
  return {
    ...shot,
    id: requiredString(shot.id, 'shot.id'),
    motionPrompt: requiredString(shot.motionPrompt, 'shot.motionPrompt'),
    keyframeApproved: true,
    preview: { ...shot.preview, seeds: seeds.map(Number) },
  };
}

function normalizeKeyframe(keyframe) {
  if (!keyframe || typeof keyframe !== 'object') throw new Error('keyframe is required');
  const fileName = safeFileName(requiredString(keyframe.fileName, 'keyframe.fileName'));
  const mediaType = requiredString(keyframe.mediaType, 'keyframe.mediaType');
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(mediaType)) throw new Error('keyframe media type is unsupported');
  const dataBase64 = requiredString(keyframe.dataBase64, 'keyframe.dataBase64');
  if (dataBase64.length > Math.ceil(MAX_KEYFRAME_BYTES / 3) * 4 + 4) {
    throw new Error('keyframe must be between 1 byte and 12 MB');
  }
  const bytes = Uint8Array.from(atob(dataBase64), (character) => character.charCodeAt(0));
  if (bytes.byteLength === 0 || bytes.byteLength > MAX_KEYFRAME_BYTES) throw new Error('keyframe must be between 1 byte and 12 MB');
  return { fileName, mediaType, bytes };
}

function normalizeCompletedVariants(variants) {
  if (!Array.isArray(variants) || variants.length !== 3) {
    throw new Error('completed forge job requires exactly three variants');
  }
  const ids = new Set();
  for (const variant of variants) {
    const variantId = requiredString(variant?.variantId, 'variant.variantId');
    requiredString(variant?.artifactKey, 'variant.artifactKey');
    ids.add(variantId);
  }
  if (ids.size !== 3) throw new Error('completed forge variants must have unique ids');
  return variants;
}

function assertLeaseOwner(job, workerId) {
  if (!job) throw forgeError('forge job not found', 404);
  if (job.status !== 'running' || job.lease?.workerId !== workerId) {
    throw forgeError('forge job lease is not owned by this worker', 409);
  }
}

async function putJob(bucket, record, options = {}) {
  return bucket.put(jobKey(record.id), `${JSON.stringify(record, null, 2)}\n`, {
    ...(options.etag ? { onlyIf: { etagMatches: options.etag } } : {}),
    httpMetadata: { contentType: 'application/json; charset=utf-8' },
  });
}

function requiredBucket(bucket) {
  if (!bucket) throw new Error('bucket is required');
  return bucket;
}

function jobKey(id) {
  return `${JOB_PREFIX}${safeId(id)}.json`;
}

function safeId(value) {
  const result = String(value).replace(/[^a-zA-Z0-9_.-]/g, '_');
  if (!result) throw new Error('id is required');
  return result;
}

function safeFileName(value) {
  return value.replace(/[^a-zA-Z0-9_.-]/g, '_');
}

function extensionFor(mediaType) {
  if (mediaType === 'image/png') return 'png';
  if (mediaType === 'image/webp') return 'webp';
  return 'jpg';
}

function requiredString(value, name) {
  const result = optionalString(value);
  if (!result) throw new Error(`${name} is required`);
  return result;
}

function optionalString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function responseJson(body, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: JSON_HEADERS });
}

function forgeError(message, status) {
  const error = new Error(message);
  error.status = status;
  return error;
}

function statusForError(error) {
  return Number(error?.status ?? 400);
}

function formatError(error) {
  return error instanceof Error ? error.message : String(error);
}

async function sha256(bytes) {
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}
