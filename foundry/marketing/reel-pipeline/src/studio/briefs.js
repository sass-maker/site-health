import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

import brandConfig from '../../config/brand-channels.json' with { type: 'json' };

import { normalizeLyricDetails } from '../lyric-video/contracts.js';
import { resolveStudioLlm } from './llm.js';
import { getProductionRecipe, normalizeRecipeOptions, PRODUCTION_RECIPE_IDS } from './production-catalog.js';
import { normalizeContentOrigin } from './content-origin.js';

export const MARKETING_BRIEF_SCHEMA = 'fleet.marketing-studio-brief.v1';
export const VIDEO_KINDS = ['faceless', 'brand-reel', 'guided-app-demo', 'coherent-film', 'podcast-short', 'lyric-video'];
export const BRIEF_LIFECYCLES = ['planned', 'producing', 'needs-review', 'ready-for-distribution', 'scheduled', 'distributed', 'failed'];
const CHANNELS = ['instagram_reels', 'youtube_shorts'];
const ENGINES = [
  'mock', 'kokoro', 'lyric-canvas', 'blender',
  'html-composition', 'ascii', 'grok-video', 'brand-reel', 'forge', 'ltx', 'editorial', 'threejs',
];
const RIGHTS_STATES = ['unknown', 'approved', 'rejected'];
const CREATIVE_STATES = ['proposed', 'approved', 'rejected'];

export class MarketingBriefStore {
  constructor(options = {}) {
    this.filePath = path.resolve(options.filePath ?? process.env.STUDIO_BRIEFS_FILE ?? './tmp/studio/briefs.json');
    this.now = options.now ?? (() => new Date());
  }

  async load() {
    try {
      const parsed = JSON.parse(await readFile(this.filePath, 'utf8'));
      return Array.isArray(parsed.briefs) ? parsed.briefs.map((brief) => normalizeMarketingBrief(brief)) : [];
    } catch (error) {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  }

  async persist(briefs) {
    await mkdir(path.dirname(this.filePath), { recursive: true });
    const temporary = `${this.filePath}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temporary, `${JSON.stringify({ schema: 'fleet.marketing-studio-state.v1', briefs }, null, 2)}\n`);
    await rename(temporary, this.filePath);
  }

  async create(input = {}) {
    const briefs = await this.load();
    const timestamp = this.now().toISOString();
    const brief = normalizeMarketingBrief({
      ...input,
      schema: MARKETING_BRIEF_SCHEMA,
      id: input.id ?? `brief_${timestamp.replace(/\D/g, '').slice(0, 14)}_${briefs.length + 1}`,
      revision: 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    });
    briefs.push(brief);
    await this.persist(briefs);
    return structuredClone(brief);
  }

  async list() {
    const briefs = await this.load();
    return briefs.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).map((brief) => structuredClone(brief));
  }

  async get(id) {
    const brief = (await this.load()).find((entry) => entry.id === id);
    return brief ? structuredClone(brief) : null;
  }

  async update(id, patch = {}) {
    const briefs = await this.load();
    const index = briefs.findIndex((entry) => entry.id === id);
    if (index === -1) throw new Error(`marketing brief not found: ${id}`);
    const current = briefs[index];
    const productionChanged = changesProductionSelection(current, patch);
    const merged = mergeBrief(current, patch);
    if (productionChanged) {
      merged.media = null;
      merged.distribution = null;
      merged.lifecycle = 'planned';
    }
    const updated = normalizeMarketingBrief({
      ...merged,
      schema: MARKETING_BRIEF_SCHEMA,
      id: current.id,
      revision: current.revision + 1,
      createdAt: current.createdAt,
      updatedAt: this.now().toISOString(),
    });
    briefs[index] = updated;
    await this.persist(briefs);
    return structuredClone(updated);
  }
}

export async function generateMarketingBriefDraft(request, options = {}) {
  const text = requiredString(request, 'request');
  const fallback = templateBrief(text);
  const llm = resolveStudioLlm({ llm: options.llm });
  const result = await llm.generate({
    messages: [
      {
        role: 'system',
        content: [
          'Turn the operator request into strict JSON for a video production brief.',
          'Allowed kind values: faceless, brand-reel, guided-app-demo, coherent-film, podcast-short, lyric-video.',
          'Allowed channel values: instagram_reels, youtube_shorts.',
          'Return: kind, projectSlug, channel, durationSeconds, engine, title, hook, summary, cta, creativeDirection.',
          'Use null when the request does not provide a project. Do not invent claims, URLs, rights, approvals, or publication actions.',
        ].join('\n'),
      },
      { role: 'user', content: text },
    ],
    maxTokens: 1200,
    temperature: 0.2,
    fallback: () => fallback,
    normalize: (raw) => ({ ...fallback, ...pickGeneratedFields(raw) }),
  });
  return {
    ...result.data,
    request: text,
    generation: { source: result.source, provider: result.provider ?? null },
    messages: [
      { role: 'operator', content: text, at: options.now?.().toISOString() ?? new Date().toISOString() },
      {
        role: 'assistant',
        content: `I mapped this to ${humanKind(result.data.kind)}. Review the brief, then choose its explicit next action.`,
        at: options.now?.().toISOString() ?? new Date().toISOString(),
      },
    ],
  };
}

export async function refineMarketingBriefDraft(brief, instruction, options = {}) {
  const current = normalizeMarketingBrief(brief);
  const text = requiredString(instruction, 'instruction');
  const fallback = deterministicRefinement(current, text);
  const llm = resolveStudioLlm({ llm: options.llm });
  const result = await llm.generate({
    messages: [
      {
        role: 'system',
        content: [
          'Revise an existing video production brief from one operator follow-up.',
          'Return JSON containing only fields the instruction explicitly changes.',
          'Allowed fields: kind, projectSlug, channel, durationSeconds, engine, title, hook, summary, cta, creativeDirection, sourceUrl, destinationUrl.',
          'Allowed kind values: faceless, brand-reel, guided-app-demo, coherent-film, podcast-short, lyric-video.',
          'Allowed channel values: instagram_reels, youtube_shorts.',
          'Never return rights, approval, quality, media, distribution, schedule, publish, or credential fields.',
          `Current brief: ${JSON.stringify(refinementContext(current))}`,
        ].join('\n'),
      },
      { role: 'user', content: text },
    ],
    maxTokens: 800,
    temperature: 0.1,
    fallback: () => fallback,
    normalize: (raw) => ({ ...fallback, ...pickRefinementFields(raw) }),
  });
  const patch = normalizeRefinementPatch(current, result.data);
  const changed = refinementChanges(current, patch);
  const at = options.now?.().toISOString() ?? new Date().toISOString();
  return {
    ...patch,
    messages: [
      ...current.messages,
      { role: 'operator', content: text, at },
      {
        role: 'assistant',
        content: changed.length
          ? `Updated ${changed.join(', ')}. Review the brief before its explicit next action.`
          : 'I preserved the brief because that follow-up did not name a safe production-field change.',
        at,
      },
    ],
  };
}

export function normalizeMarketingBrief(input = {}) {
  if (input.schema !== MARKETING_BRIEF_SCHEMA) throw new Error('unsupported marketing brief schema');
  const request = requiredString(input.request, 'request');
  const recipeId = PRODUCTION_RECIPE_IDS.includes(input.recipeId) ? input.recipeId : null;
  const recipe = recipeId ? getProductionRecipe(recipeId) : null;
  const recipeOptions = recipeId ? normalizeRecipeOptions(recipeId, input.recipeOptions) : null;
  const kind = recipe?.kind ?? (VIDEO_KINDS.includes(input.kind) ? input.kind : classifyKind(request));
  const projectSlug = normalizeProjectSlug(input.projectSlug);
  const channel = recipeOptions?.channel ?? (CHANNELS.includes(input.channel) ? input.channel : inferChannel(request));
  const lifecycle = BRIEF_LIFECYCLES.includes(input.lifecycle) ? input.lifecycle : 'planned';
  const createdAt = iso(input.createdAt, 'createdAt');
  const updatedAt = iso(input.updatedAt, 'updatedAt');
  return {
    schema: MARKETING_BRIEF_SCHEMA,
    id: requiredString(input.id, 'id'),
    revision: positiveInteger(input.revision, 'revision'),
    createdAt,
    updatedAt,
    request,
    messages: normalizeMessages(input.messages, createdAt),
    generation: {
      source: input.generation?.source === 'llm' ? 'llm' : 'template',
      provider: optionalString(input.generation?.provider),
    },
    kind,
    projectSlug,
    origin: normalizeContentOrigin(input.origin, { projectSlug }),
    ideaId: optionalString(input.ideaId) ?? null,
    recipeId,
    recipeOptions,
    channel,
    durationSeconds: recipeOptions?.durationSeconds ?? duration(input.durationSeconds ?? inferDuration(request)),
    engine: recipe?.engine ?? (ENGINES.includes(input.engine) ? input.engine : kind === 'lyric-video' ? 'lyric-canvas' : 'mock'),
    title: optionalString(input.title) ?? titleFrom(request),
    hook: optionalString(input.hook) ?? firstSentence(request),
    summary: optionalString(input.summary) ?? request,
    cta: optionalString(input.cta),
    creativeDirection: optionalString(input.creativeDirection),
    sourceEvidence: {
      canonicalUrl: optionalUrl(input.sourceEvidence?.canonicalUrl, 'sourceEvidence.canonicalUrl'),
      claim: optionalString(input.sourceEvidence?.claim),
      destinationUrl: optionalUrl(input.sourceEvidence?.destinationUrl, 'sourceEvidence.destinationUrl'),
      rightsStatus: RIGHTS_STATES.includes(input.sourceEvidence?.rightsStatus)
        ? input.sourceEvidence.rightsStatus
        : 'unknown',
    },
    lyric: kind === 'lyric-video' ? normalizeLyricDetails(input.lyric) : null,
    approval: {
      creativeStatus: CREATIVE_STATES.includes(input.approval?.creativeStatus)
        ? input.approval.creativeStatus
        : 'proposed',
      qualityAccepted: input.approval?.qualityAccepted === true,
    },
    lifecycle,
    media: normalizeMedia(input.media),
    distribution: normalizeDistribution(input.distribution),
    lastError: optionalString(input.lastError),
  };
}

export function classifyKind(request) {
  const text = String(request ?? '').toLowerCase();
  if (/\b(lyric video|timed lyrics?|lrc|karaoke video|music visuali[sz]er)\b/.test(text)) return 'lyric-video';
  if (/\b(podcast|episode|clip this|speaker footage|interview clip)\b/.test(text)) return 'podcast-short';
  if (/\b(screen ?record|app demo|walkthrough|presenter|camera|show the app)\b/.test(text)) return 'guided-app-demo';
  if (/\b(cinematic|atmosphere|generated film|film style|keyframe|ltx)\b/.test(text)) return 'coherent-film';
  if (/\b(brand reel|product reel|product demo|website reel|launch reel)\b/.test(text)) return 'brand-reel';
  return 'faceless';
}

function templateBrief(request) {
  const kind = classifyKind(request);
  return {
    kind,
    projectSlug: inferProject(request),
    channel: inferChannel(request),
    durationSeconds: inferDuration(request),
    engine: kind === 'lyric-video' ? 'lyric-canvas' : 'mock',
    title: titleFrom(request),
    hook: firstSentence(request),
    summary: request,
    cta: null,
    creativeDirection: directionFor(kind),
    sourceEvidence: {
      canonicalUrl: initialSourceUrl(request),
      destinationUrl: initialDestinationUrl(request),
      rightsStatus: 'unknown',
    },
  };
}

function pickGeneratedFields(raw = {}) {
  return Object.fromEntries([
    'kind',
    'projectSlug',
    'channel',
    'durationSeconds',
    'engine',
    'title',
    'hook',
    'summary',
    'cta',
    'creativeDirection',
  ].filter((key) => raw[key] !== undefined).map((key) => [key, raw[key]]));
}

function pickRefinementFields(raw = {}) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  return Object.fromEntries([
    'kind',
    'projectSlug',
    'channel',
    'durationSeconds',
    'engine',
    'title',
    'hook',
    'summary',
    'cta',
    'creativeDirection',
    'sourceUrl',
    'destinationUrl',
  ].filter((key) => raw[key] !== undefined).map((key) => [key, raw[key]]));
}

function deterministicRefinement(current, instruction) {
  const patch = {};
  const kind = explicitKind(instruction);
  const projectSlug = inferProject(instruction);
  const durationSeconds = explicitDuration(instruction);
  const channel = explicitChannel(instruction);
  const sourceUrl = labeledUrl(instruction, /\b(?:source|canonical|website|product)\b/i);
  const destinationUrl = labeledUrl(instruction, /\b(?:destination|landing|cta)\b/i);
  const labeled = {
    title: labeledText(instruction, /\b(?:title it|title(?:\s+is)?|name it)\b/i),
    hook: labeledText(instruction, /\bhook\b/i),
    cta: labeledText(instruction, /\b(?:cta|call to action)\b/i),
    creativeDirection: labeledText(instruction, /\b(?:creative direction|visual direction|style|tone)\b/i),
    summary: labeledText(instruction, /\b(?:summary|body|script direction)\b/i),
  };
  if (kind) patch.kind = kind;
  if (projectSlug) patch.projectSlug = projectSlug;
  if (durationSeconds) patch.durationSeconds = durationSeconds;
  if (channel) patch.channel = channel;
  if (sourceUrl) patch.sourceUrl = sourceUrl;
  if (destinationUrl) patch.destinationUrl = destinationUrl;
  for (const [field, value] of Object.entries(labeled)) {
    if (value) patch[field] = value;
  }
  synchronizeDependentBriefCopy(current, patch);
  if (!Object.keys(patch).length && instruction.trim() !== current.creativeDirection) {
    patch.creativeDirection = instruction.trim();
  }
  return patch;
}

function synchronizeDependentBriefCopy(current, patch) {
  const structureChanged = ['kind', 'projectSlug', 'channel', 'durationSeconds']
    .some((field) => patch[field] !== undefined && patch[field] !== current[field]);
  if (!structureChanged) return;

  const next = { ...current, ...patch };
  const projectName = brandConfig.brands?.[next.projectSlug]?.name ?? 'the selected product';
  const channelName = next.channel === 'instagram_reels' ? 'Instagram Reels' : 'YouTube Shorts';
  const sentence = `Create a ${next.durationSeconds}-second ${humanKind(next.kind)} for ${projectName} on ${channelName}.`;

  if (
    patch.title === undefined
    && (current.title === titleFrom(current.request) || referencesChangedStructure(current.title, current, patch))
  ) {
    patch.title = titleFrom(sentence);
  }
  if (
    patch.hook === undefined
    && (current.hook === firstSentence(current.request) || referencesChangedStructure(current.hook, current, patch))
  ) {
    patch.hook = sentence;
  }
  if (
    patch.summary === undefined
    && (current.summary === current.request || referencesChangedStructure(current.summary, current, patch))
  ) {
    patch.summary = sentence;
  }
  if (
    patch.creativeDirection === undefined
    && (
      current.creativeDirection === directionFor(current.kind)
      || referencesChangedStructure(current.creativeDirection, current, patch)
    )
    && next.kind !== current.kind
  ) {
    patch.creativeDirection = directionFor(next.kind);
  }
}

function referencesChangedStructure(value, current, patch) {
  const text = String(value ?? '');
  if (patch.durationSeconds !== undefined && patch.durationSeconds !== current.durationSeconds) {
    const durationPattern = new RegExp(`\\b${current.durationSeconds}\\s*(?:-| )?\\s*(?:seconds?|secs?|s)\\b`, 'i');
    if (durationPattern.test(text)) return true;
  }
  if (patch.channel !== undefined && patch.channel !== current.channel) {
    const channelPattern = current.channel === 'instagram_reels'
      ? /\b(?:instagram|ig reels?|reels?)\b/i
      : /\b(?:youtube|yt shorts?|shorts?)\b/i;
    if (channelPattern.test(text)) return true;
  }
  if (patch.kind !== undefined && patch.kind !== current.kind) {
    const kindPattern = {
      faceless: /\b(?:faceless|lesson|explainer)\b/i,
      'brand-reel': /\b(?:brand reel|product reel|website reel|launch reel)\b/i,
      'guided-app-demo': /\b(?:guided app demo|app demo|walkthrough|screen ?record(?:ing)?)\b/i,
      'coherent-film': /\b(?:coherent film|cinematic|generated film|film style|keyframe)\b/i,
      'podcast-short': /\b(?:podcast|episode clip|interview clip)\b/i,
      'lyric-video': /\b(?:lyric video|timed lyrics?|karaoke video|music visuali[sz]er)\b/i,
    }[current.kind];
    if (kindPattern?.test(text)) return true;
  }
  if (patch.projectSlug !== undefined && patch.projectSlug !== current.projectSlug) {
    const projectName = brandConfig.brands?.[current.projectSlug]?.name;
    if (projectName && text.toLowerCase().includes(projectName.toLowerCase())) return true;
  }
  return false;
}

function normalizeRefinementPatch(current, input = {}) {
  const patch = {};
  if (VIDEO_KINDS.includes(input.kind)) patch.kind = input.kind;
  if (input.projectSlug !== undefined) patch.projectSlug = normalizeProjectSlug(input.projectSlug);
  if (CHANNELS.includes(input.channel)) patch.channel = input.channel;
  if (input.durationSeconds !== undefined) patch.durationSeconds = duration(input.durationSeconds);
  if (ENGINES.includes(input.engine)) patch.engine = input.engine;
  for (const field of ['title', 'hook', 'summary', 'cta', 'creativeDirection']) {
    if (input[field] !== undefined) patch[field] = optionalString(input[field]);
  }
  const sourceEvidence = {};
  if (input.sourceUrl !== undefined) {
    sourceEvidence.canonicalUrl = optionalUrl(input.sourceUrl, 'sourceEvidence.canonicalUrl');
  }
  if (input.destinationUrl !== undefined) {
    sourceEvidence.destinationUrl = optionalUrl(input.destinationUrl, 'sourceEvidence.destinationUrl');
  }
  if (Object.keys(sourceEvidence).length) patch.sourceEvidence = sourceEvidence;
  return patch;
}

function refinementContext(brief) {
  return {
    kind: brief.kind,
    projectSlug: brief.projectSlug,
    channel: brief.channel,
    durationSeconds: brief.durationSeconds,
    engine: brief.engine,
    title: brief.title,
    hook: brief.hook,
    summary: brief.summary,
    cta: brief.cta,
    creativeDirection: brief.creativeDirection,
    sourceUrl: brief.sourceEvidence.canonicalUrl,
    destinationUrl: brief.sourceEvidence.destinationUrl,
  };
}

function refinementChanges(current, patch) {
  const changes = [];
  for (const field of ['kind', 'projectSlug', 'channel', 'durationSeconds', 'engine', 'title', 'hook', 'summary', 'cta', 'creativeDirection']) {
    if (patch[field] !== undefined && patch[field] !== current[field]) changes.push(humanFieldName(field));
  }
  if (
    patch.sourceEvidence?.canonicalUrl !== undefined
    && patch.sourceEvidence.canonicalUrl !== current.sourceEvidence.canonicalUrl
  ) changes.push('source URL');
  if (
    patch.sourceEvidence?.destinationUrl !== undefined
    && patch.sourceEvidence.destinationUrl !== current.sourceEvidence.destinationUrl
  ) changes.push('destination URL');
  return changes;
}

function humanFieldName(field) {
  return {
    projectSlug: 'Fleet brand',
    durationSeconds: 'duration',
    creativeDirection: 'creative direction',
  }[field] ?? field.replaceAll('_', ' ');
}

function explicitKind(value) {
  const text = String(value ?? '').toLowerCase();
  if (/\b(lyric video|timed lyrics?|karaoke video|music visuali[sz]er)\b/.test(text)) return 'lyric-video';
  if (/\b(podcast|episode clip|interview clip)\b/.test(text)) return 'podcast-short';
  if (/\b(app demo|walkthrough|screen ?record|guided demo)\b/.test(text)) return 'guided-app-demo';
  if (/\b(coherent film|cinematic|generated film|film style|keyframe)\b/.test(text)) return 'coherent-film';
  if (/\b(brand reel|product reel|website reel|launch reel)\b/.test(text)) return 'brand-reel';
  if (/\b(faceless|lesson|explainer)\b/.test(text)) return 'faceless';
  return null;
}

function explicitDuration(value) {
  const match = String(value ?? '').match(/\b(\d{1,4})\s*(?:-| )?\s*(?:seconds?|secs?|s)\b/i);
  return match ? Number(match[1]) : null;
}

function explicitChannel(value) {
  const text = String(value ?? '');
  if (/\b(instagram|ig reel|reels)\b/i.test(text)) return 'instagram_reels';
  if (/\b(youtube|yt short|shorts)\b/i.test(text)) return 'youtube_shorts';
  return null;
}

function labeledText(value, label) {
  const text = String(value ?? '').trim();
  const match = text.match(new RegExp(`${label.source}\\s*(?::|is|to)?\\s*[\"']?([^\\n]+?)[\"']?(?:\\s*$)`, 'i'));
  return match?.[1]?.trim().replace(/[.!?]$/, '') || null;
}

function labeledUrl(value, label) {
  const text = String(value ?? '');
  const labelMatch = text.match(new RegExp(`${label.source}[^\\n]*?(https?:\\/\\/[^\\s,]+)`, 'i'));
  return labelMatch?.[1]?.replace(/[.)!?]+$/, '') ?? null;
}

function initialSourceUrl(value) {
  return labeledUrl(value, /\b(?:source|canonical|website|product)\b/i) ?? firstExplicitUrl(value);
}

function initialDestinationUrl(value) {
  return labeledUrl(value, /\b(?:destination|landing|cta)\b/i);
}

function firstExplicitUrl(value) {
  const match = String(value ?? '').match(/https?:\/\/[^\s,]+/i);
  return match?.[0]?.replace(/[.)!?]+$/, '') ?? null;
}

function inferProject(request) {
  const text = String(request ?? '').toLowerCase();
  for (const [slug, brand] of Object.entries(brandConfig.brands ?? {})) {
    if (text.includes(slug) || text.includes(String(brand.name).toLowerCase())) return slug;
  }
  return null;
}

function inferChannel(request) {
  return /\b(instagram|ig|reel)\b/i.test(String(request ?? '')) ? 'instagram_reels' : 'youtube_shorts';
}

function inferDuration(request) {
  const match = String(request ?? '').match(/\b(\d{1,4})\s*(?:-| )?\s*(?:seconds?|secs?|s)\b/i);
  return match ? Number(match[1]) : 60;
}

function mergeBrief(current, patch) {
  return {
    ...current,
    ...patch,
    sourceEvidence: { ...current.sourceEvidence, ...(patch.sourceEvidence ?? {}) },
    approval: { ...current.approval, ...(patch.approval ?? {}) },
    lyric: patch.lyric === undefined
      ? current.lyric
      : patch.lyric === null ? null : {
        ...(current.lyric ?? {}),
        ...patch.lyric,
        rights: { ...(current.lyric?.rights ?? {}), ...(patch.lyric.rights ?? {}) },
      },
    generation: current.generation,
    origin: current.origin,
    media: patch.media === undefined
      ? current.media
      : patch.media === null ? null : { ...(current.media ?? {}), ...patch.media },
    distribution: patch.distribution === undefined
      ? current.distribution
      : patch.distribution === null ? null : { ...(current.distribution ?? {}), ...patch.distribution },
    messages: patch.messages ?? current.messages,
  };
}

function changesProductionSelection(current, patch) {
  if (patch.kind !== undefined && patch.kind !== current.kind) return true;
  if (patch.projectSlug !== undefined && patch.projectSlug !== current.projectSlug) return true;
  if (patch.ideaId !== undefined && patch.ideaId !== current.ideaId) return true;
  if (patch.recipeId !== undefined && patch.recipeId !== current.recipeId) return true;
  if (patch.recipeOptions !== undefined && JSON.stringify(patch.recipeOptions) !== JSON.stringify(current.recipeOptions)) return true;
  return false;
}

function normalizeProjectSlug(value) {
  const slug = optionalString(value);
  if (!slug) return null;
  if (!brandConfig.brands?.[slug]) throw new Error(`unknown Fleet brand: ${slug}`);
  return slug;
}

function normalizeMessages(messages, fallbackAt) {
  if (!Array.isArray(messages)) return [];
  return messages.slice(-20).map((message) => ({
    role: message.role === 'assistant' ? 'assistant' : 'operator',
    content: requiredString(message.content, 'messages.content'),
    at: message.at ? iso(message.at, 'messages.at') : fallbackAt,
  }));
}

function normalizeMedia(media) {
  if (!media) return null;
  return {
    artifactDir: optionalString(media.artifactDir),
    videoPath: optionalString(media.videoPath),
    previewPath: optionalString(media.previewPath),
    previewType: ['video', 'image', 'html'].includes(media.previewType) ? media.previewType : null,
    publicUrl: optionalUrl(media.publicUrl, 'media.publicUrl'),
    ideaId: optionalString(media.ideaId),
    provider: optionalString(media.provider),
    quality: media.quality && typeof media.quality === 'object' ? structuredClone(media.quality) : null,
    reviewedAt: media.reviewedAt ? iso(media.reviewedAt, 'media.reviewedAt') : null,
    captionsPath: optionalString(media.captionsPath),
    scenePlanPath: optionalString(media.scenePlanPath),
    rightsPath: optionalString(media.rightsPath),
    manifestPath: optionalString(media.manifestPath),
    blender: media.blender && typeof media.blender === 'object' ? structuredClone(media.blender) : null,
    platformAudio: media.platformAudio && typeof media.platformAudio === 'object'
      ? structuredClone(media.platformAudio)
      : null,
    uploadEvidence: media.uploadEvidence && typeof media.uploadEvidence === 'object'
      ? structuredClone(media.uploadEvidence)
      : null,
  };
}

function normalizeDistribution(distribution) {
  if (!distribution) return null;
  return {
    preparedAt: distribution.preparedAt ? iso(distribution.preparedAt, 'distribution.preparedAt') : null,
    request: distribution.request && typeof distribution.request === 'object'
      ? structuredClone(distribution.request)
      : null,
    receipt: distribution.receipt && typeof distribution.receipt === 'object'
      ? structuredClone(distribution.receipt)
      : null,
  };
}

function directionFor(kind) {
  return {
    faceless: 'Readable captions, evidence-led b-roll, and one clear teaching point.',
    'brand-reel': 'Real product proof first, concise before-and-after structure.',
    'guided-app-demo': 'Keep the real application dominant and use presenter capture only when useful.',
    'coherent-film': 'One visual metaphor, continuous spatial logic, and reproducible generated shots.',
    'podcast-short': 'Preserve the source speaker, exact timing, transcript meaning, and visual credits.',
    'lyric-video': 'Make every supplied lyric cue literal, readable, synchronized, and rights-evidenced.',
  }[kind];
}

function humanKind(kind) {
  return String(kind).replaceAll('-', ' ');
}

function titleFrom(value) {
  const text = firstSentence(value).replace(/\b(?:please|can you|could you|make|create)\b/gi, '').trim();
  return (text || 'Untitled video').slice(0, 90);
}

function firstSentence(value) {
  return String(value ?? '').trim().split(/(?<=[.!?])\s+/)[0].slice(0, 180);
}

function duration(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return 60;
  return Math.max(5, Math.min(20 * 60, Math.round(number)));
}

function positiveInteger(value, field) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) throw new Error(`${field} must be a positive integer`);
  return number;
}

function optionalUrl(value, field) {
  const text = optionalString(value);
  if (!text) return null;
  let url;
  try {
    url = new URL(text);
  } catch {
    throw new Error(`${field} must be an absolute URL`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error(`${field} must use http or https`);
  return url.toString();
}

function iso(value, field) {
  if (!Number.isFinite(Date.parse(value))) throw new Error(`${field} must be an ISO date`);
  return new Date(value).toISOString();
}

function optionalString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function requiredString(value, field) {
  const text = optionalString(value);
  if (!text) throw new Error(`${field} is required`);
  return text;
}
