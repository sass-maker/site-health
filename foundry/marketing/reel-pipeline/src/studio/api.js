import { generateIdeas, exploreNiche, suggestChannelNames } from './ideas.js';
import { generateTitles, generateDescription, generateTags, organizeTags } from './metadata.js';
import { generateScript } from './script.js';
import { deriveVoiceProfile } from './brand-voice.js';
import { researchKeywords } from './keywords.js';
import { fetchTranscript } from './transcript.js';
import { generateThumbnailConcepts } from './thumbnails.js';
import { IdeaStore } from './idea-store.js';
import { runFacelessWorkflow } from './workflow.js';
import { planIdeas, produceNext, factoryStatus } from './factory.js';
import {
  MarketingBriefStore,
  generateMarketingBriefDraft,
  refineMarketingBriefDraft,
} from './briefs.js';
import { continuationForBrief, evaluateStudioCapability, listStudioCapabilities } from './capabilities.js';
import {
  buildStudioDistributionBundle,
  createStudioPostizDraft,
  studioPostizReadiness,
} from './distribution.js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const FACELESS_ENGINES = new Set(['mock', 'moneyprinterturbo', 'kokoro']);

function toolHandlers(options) {
  const llm = options.llm;
  const store = () => options.ideaStore ?? new IdeaStore(options.ideaStoreOptions);
  return {
    ideas: (body) => generateIdeas({ niche: body.niche, count: body.count, llm }),
    niche: (body) => exploreNiche({ niche: body.niche, llm }),
    channel: (body) => suggestChannelNames({ niche: body.niche, count: body.count, llm }),
    titles: (body) => generateTitles({ topic: body.topic, count: body.count, llm }),
    description: (body) => generateDescription({ topic: body.topic, hook: body.hook, cta: body.cta, llm }),
    tags: (body) => generateTags({ topic: body.topic, niche: body.niche, llm }),
    organize: (body) => organizeTags(Array.isArray(body.tags) ? body.tags : String(body.tags ?? '').split(',')),
    script: (body) => generateScript({
      topic: body.topic,
      durationSeconds: body.durationSeconds ?? body.duration,
      niche: body.niche,
      article: body.article,
      inspiration: body.inspiration,
      voiceProfile: body.voiceProfile,
      llm,
    }),
    voice: (body) => deriveVoiceProfile({
      transcripts: Array.isArray(body.samples) ? body.samples : [body.samples],
      llm,
    }),
    keywords: (body) => researchKeywords({ seed: body.seed, fetchImpl: options.fetchImpl ?? fetch }),
    transcript: (body) => fetchTranscript({ url: body.url, fetchImpl: options.fetchImpl ?? fetch }),
    thumbnails: (body) => generateThumbnailConcepts({ topic: body.topic, count: body.count, llm }),
    plan: (body) => planIdeas({ niche: body.niche, count: body.count, store: options.ideaStore, llm }),
    produce: (body) => produceNext({
      count: body.count,
      engine: FACELESS_ENGINES.has(body.engine) ? body.engine : 'kokoro',
      durationSeconds: body.durationSeconds ?? body.duration,
      store: options.ideaStore,
      outputDir: options.facelessOutputDir,
      rendererOptions: options.rendererOptions ?? {},
      llm,
      logger: options.logger ?? console,
    }),
    save: (body) => store().saveIdea(body),
    status: (body) => store().updateIdeaStatus(body.id, body.to ?? body.status),
    faceless: (body) => runFacelessWorkflow({
      topic: body.topic,
      niche: body.niche,
      durationSeconds: body.durationSeconds ?? body.duration,
      engine: FACELESS_ENGINES.has(body.engine) ? body.engine : 'mock',
      voice: body.voice,
      voiceRotation: Boolean(body.voiceRotation),
      voiceProfile: body.voiceProfile,
      outputDir: options.facelessOutputDir,
      ideaStore: options.ideaStore,
      rendererOptions: options.rendererOptions ?? {},
      llm,
      logger: options.logger ?? console,
    }),
  };
}

function artifactRoots(options) {
  const roots = options.artifactRoots ?? [
    path.resolve('tmp/studio'),
    path.resolve('artifacts'),
  ];
  return roots.map((root) => path.resolve(root));
}

async function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(await readFile(filePath, 'utf8'));
  } catch {
    return null;
  }
}

export async function listRenders(options) {
  const store = options.ideaStore ?? new IdeaStore(options.ideaStoreOptions);
  const ideas = await store.listIdeas();
  const renders = [];
  for (const idea of ideas) {
    if (idea.status !== 'rendered' && idea.status !== 'posted') continue;
    const artifactDir = idea.notes?.match(/artifacts: (.+)$/)?.[1];
    if (!artifactDir) continue;
    const render = await readJsonIfPresent(path.join(artifactDir, 'render.json'));
    const quality = await readJsonIfPresent(path.join(artifactDir, 'quality.json'));
    renders.push({
      ideaId: idea.id,
      title: idea.title,
      status: idea.status,
      updatedAt: idea.updatedAt,
      video: render?.videos?.[0] ?? null,
      provider: render?.provider ?? null,
      quality: quality ? { overall: quality.overall, verdict: quality.verdict, videoEvidence: quality.videoEvidence } : null,
      artifactDir,
    });
  }
  renders.sort((a, b) => (b.updatedAt ?? '').localeCompare(a.updatedAt ?? ''));
  return renders;
}

const FILE_TYPES = { '.mp4': 'video/mp4', '.png': 'image/png', '.html': 'text/html; charset=utf-8', '.md': 'text/plain; charset=utf-8', '.json': 'application/json' };

async function serveRenderFile(rawPath, options) {
  const resolved = path.resolve(String(rawPath ?? ''));
  const roots = artifactRoots(options);
  if (!roots.some((root) => resolved === root || resolved.startsWith(root + path.sep))) {
    return { status: 403, body: { error: 'path outside artifact roots' } };
  }
  const type = FILE_TYPES[path.extname(resolved).toLowerCase()];
  if (!type) return { status: 403, body: { error: 'unsupported file type' } };
  try {
    const content = await readFile(resolved);
    return { status: 200, raw: { content, contentType: type } };
  } catch {
    return { status: 404, body: { error: 'file not found' } };
  }
}

export async function handleStudioRequest(method, pathname, readBody, options = {}, query = {}) {
  if (!pathname.startsWith('/studio/')) return null;
  const tool = pathname.slice('/studio/'.length);
  const briefStore = () => options.briefStore ?? new MarketingBriefStore(options.briefStoreOptions);

  if (method === 'GET' && tool === 'capabilities') {
    const brief = query.briefId ? await briefStore().get(query.briefId) : null;
    if (query.briefId && !brief) return { status: 404, body: { error: 'marketing brief not found' } };
    return {
      status: 200,
      body: { data: listStudioCapabilities(brief, capabilityOptions(options)) },
    };
  }
  if (method === 'GET' && tool === 'briefs') {
    const briefs = await briefStore().list();
    return { status: 200, body: { data: briefs.map((brief) => decorateBrief(brief, options)) } };
  }
  if (method === 'POST' && tool === 'briefs') {
    const body = await readBody();
    const draft = body?.request
      ? await generateMarketingBriefDraft(body.request, { llm: options.llm, now: options.now })
      : body;
    const brief = await briefStore().create({ ...draft, ...(body?.fields ?? {}) });
    return { status: 201, body: { data: decorateBrief(brief, options) } };
  }
  const briefMatch = tool.match(/^briefs\/([^/]+)$/);
  if (briefMatch && method === 'GET') {
    const brief = await briefStore().get(decodeURIComponent(briefMatch[1]));
    if (!brief) return { status: 404, body: { error: 'marketing brief not found' } };
    return { status: 200, body: { data: decorateBrief(brief, options) } };
  }
  if (briefMatch && method === 'PATCH') {
    const body = await readBody();
    const brief = await briefStore().update(decodeURIComponent(briefMatch[1]), body ?? {});
    return { status: 200, body: { data: decorateBrief(brief, options) } };
  }
  const refineMatch = tool.match(/^briefs\/([^/]+)\/refine$/);
  if (refineMatch && method === 'POST') {
    const id = decodeURIComponent(refineMatch[1]);
    const store = briefStore();
    const current = await store.get(id);
    if (!current) return { status: 404, body: { error: 'marketing brief not found' } };
    const body = await readBody();
    const patch = await refineMarketingBriefDraft(current, body?.instruction, {
      llm: options.llm,
      now: options.now,
    });
    const brief = await store.update(id, patch);
    return { status: 200, body: { data: decorateBrief(brief, options) } };
  }
  const executeMatch = tool.match(/^briefs\/([^/]+)\/execute$/);
  if (executeMatch && method === 'POST') {
    const body = await readBody();
    const data = await executeMarketingBrief(decodeURIComponent(executeMatch[1]), body ?? {}, options, briefStore());
    return { status: 200, body: { data } };
  }
  const prepareMatch = tool.match(/^briefs\/([^/]+)\/prepare-distribution$/);
  if (prepareMatch && method === 'POST') {
    const id = decodeURIComponent(prepareMatch[1]);
    const store = briefStore();
    const brief = await store.get(id);
    if (!brief) return { status: 404, body: { error: 'marketing brief not found' } };
    const bundle = buildStudioDistributionBundle(brief, { now: options.now });
    const updated = await store.update(id, {
      lifecycle: 'ready-for-distribution',
      distribution: {
        preparedAt: (options.now?.() ?? new Date()).toISOString(),
        request: bundle.request,
        receipt: null,
      },
    });
    return {
      status: 200,
      body: {
        data: {
          brief: decorateBrief(updated, options),
          bundle,
          posted: false,
          boundary: 'Prepared only. No Postiz network call, schedule, or publication occurred.',
        },
      },
    };
  }
  const draftMatch = tool.match(/^briefs\/([^/]+)\/create-postiz-draft$/);
  if (draftMatch && method === 'POST') {
    const id = decodeURIComponent(draftMatch[1]);
    const body = await readBody();
    const store = briefStore();
    const brief = await store.get(id);
    if (!brief) return { status: 404, body: { error: 'marketing brief not found' } };
    const draft = await createStudioPostizDraft(brief, {
      ...options,
      approvedBy: body?.approvedBy,
      scheduledFor: body?.scheduledFor,
      publishNow: body?.publishNow,
    });
    const updated = await store.update(id, {
      lifecycle: 'distributed',
      distribution: {
        preparedAt: draft.request.createdAt,
        request: draft.request,
        receipt: draft.receipt,
      },
    });
    return {
      status: 200,
      body: {
        data: {
          brief: decorateBrief(updated, options),
          receipt: draft.receipt,
          boundary: 'Unscheduled Postiz draft created. Continue in Postiz to schedule or publish.',
        },
      },
    };
  }
  if (method === 'GET' && tool === 'productions') {
    const [briefs, renders] = await Promise.all([briefStore().list(), listRenders(options)]);
    return {
      status: 200,
      body: {
        data: {
          briefs: briefs.map((brief) => decorateBrief(brief, options)),
          legacyRenders: renders,
        },
      },
    };
  }
  if (method === 'GET' && tool === 'postiz-readiness') {
    return { status: 200, body: { data: studioPostizReadiness(options) } };
  }

  if (method === 'GET' && tool === 'ideas-list') {
    const store = options.ideaStore ?? new IdeaStore(options.ideaStoreOptions);
    return { status: 200, body: { data: await store.listIdeas() } };
  }
  if (method === 'GET' && tool === 'renders-list') {
    return { status: 200, body: { data: await listRenders(options) } };
  }
  if (method === 'GET' && tool === 'render-file') {
    return serveRenderFile(query.path, options);
  }
  if (method === 'GET' && tool === 'factory-status') {
    const store = options.ideaStore ?? new IdeaStore(options.ideaStoreOptions);
    return { status: 200, body: { data: await factoryStatus({ store }) } };
  }
  if (method !== 'POST') return { status: 404, body: { error: 'not found' } };

  const handlers = toolHandlers(options);
  const handler = handlers[tool];
  if (!handler) return { status: 404, body: { error: `unknown studio tool: ${tool}` } };

  const body = await readBody();
  const data = await handler(body ?? {});
  return { status: 200, body: { data } };
}

async function executeMarketingBrief(id, body, options, store) {
  if (body.confirm !== true) throw new Error('explicit execution confirmation is required');
  const brief = await store.get(id);
  if (!brief) throw new Error('marketing brief not found');
  const capability = evaluateStudioCapability(brief.kind, brief, capabilityOptions(options));
  if (brief.kind !== 'faceless') {
    return {
      brief: decorateBrief(brief, options),
      continuation: continuationForBrief(brief, capabilityOptions(options)),
      executed: false,
    };
  }
  if (capability.state !== 'ready') throw new Error(capability.blocker ?? 'video workflow is not ready');
  await store.update(id, { lifecycle: 'producing', lastError: null });
  try {
    const summary = await runFacelessWorkflow({
      topic: brief.title,
      niche: brief.summary,
      durationSeconds: brief.durationSeconds,
      engine: brief.engine,
      projectSlug: brief.projectSlug,
      channel: brief.channel,
      briefId: brief.id,
      hook: brief.hook,
      cta: brief.cta,
      creativeDirection: brief.creativeDirection,
      outputDir: options.facelessOutputDir,
      ideaStore: options.ideaStore,
      rendererOptions: options.rendererOptions ?? {},
      llm: options.llm,
      logger: options.logger ?? console,
    });
    const updated = await store.update(id, {
      lifecycle: 'needs-review',
      lastError: null,
      media: {
        artifactDir: summary.artifactDir,
        videoPath: summary.video,
        publicUrl: null,
        ideaId: summary.ideaId,
        provider: summary.engine,
        quality: summary.quality,
        reviewedAt: null,
      },
    });
    return { brief: decorateBrief(updated, options), production: summary, executed: true };
  } catch (error) {
    await store.update(id, { lifecycle: 'failed', lastError: error.message });
    throw error;
  }
}

function decorateBrief(brief, options) {
  const capability = evaluateStudioCapability(brief.kind, brief, capabilityOptions(options));
  return {
    ...brief,
    capability,
    continuation: continuationForBrief(brief, capabilityOptions(options)),
  };
}

function capabilityOptions(options) {
  return {
    forgeUrl: options.forgeUrl ?? process.env.REEL_FORGE_URL,
    editorialUrl: options.editorialUrl ?? process.env.REEL_EDITORIAL_URL,
  };
}
