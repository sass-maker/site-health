export const PODCAST_EDIT_SCHEMA = 'fleet.podcast-edit.v1';

export const PODCAST_SCORE_TERMS = Object.freeze([
  'relevance',
  'context_completeness',
  'non_repetition',
  'progression',
  'escalation',
  'callback',
  'duration_fit',
  'source_diversity',
]);

const APPROVAL_STATES = new Set(['proposed', 'approved', 'rejected']);
const VISUAL_MODES = new Set(['still', 'motion']);
const PROCEDURAL_VISUAL_KINDS = new Set([
  'ascii-signal',
  'cel-world',
  'kinetic-quote',
  'diagram',
]);

export function normalizePodcastEdit(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('podcast edit must be an object');
  }
  if (input.schema !== PODCAST_EDIT_SCHEMA) {
    throw new Error(`unsupported podcast edit schema: ${input.schema ?? 'missing'}`);
  }

  const approvalStatus = requiredString(input.approval?.status, 'approval.status');
  if (!APPROVAL_STATES.has(approvalStatus)) {
    throw new Error(`unsupported approval status: ${approvalStatus}`);
  }
  const approvedAt = optionalIso(input.approval?.approvedAt, 'approval.approvedAt');
  const approvedBy = optionalString(input.approval?.approvedBy);
  if (approvalStatus === 'approved' && (!approvedAt || !approvedBy)) {
    throw new Error('approved podcast edits require approval.approvedAt and approval.approvedBy');
  }

  const sources = requiredArray(input.sources, 'sources').map(normalizeSource);
  if (!sources.length) throw new Error('sources must not be empty');
  assertUnique(sources.map((source) => source.id), 'source id');
  assertUnique(sources.map((source) => source.path), 'source path');
  const sourcesById = new Map(sources.map((source) => [source.id, source]));

  const editorial = normalizeEditorial(input.editorial, sourcesById);
  const revision = Number(input.revision);
  if (!Number.isInteger(revision) || revision < 1) {
    throw new Error('revision must be a positive integer');
  }

  return {
    schema: PODCAST_EDIT_SCHEMA,
    id: requiredString(input.id, 'id'),
    revision,
    createdAt: isoString(input.createdAt, 'createdAt'),
    approval: { status: approvalStatus, approvedAt, approvedBy: approvedBy ?? null },
    presentation: normalizePresentation(input.presentation),
    sources,
    visualCues: optionalArray(input.visualCues, 'visualCues').map(normalizeVisualCue),
    editorial,
  };
}

function normalizeSource(input, index) {
  const sha256 = optionalString(input?.sha256);
  if (sha256 && !/^[a-f0-9]{64}$/.test(sha256)) {
    throw new Error(`sources[${index}].sha256 must be a lowercase SHA-256 digest`);
  }
  return {
    id: requiredString(input?.id, `sources[${index}].id`),
    title: requiredString(input?.title, `sources[${index}].title`),
    path: requiredString(input?.path, `sources[${index}].path`),
    creator: requiredString(input?.creator, `sources[${index}].creator`),
    sourceUrl: absoluteUrl(input?.sourceUrl, `sources[${index}].sourceUrl`),
    collectionUrl: absoluteUrl(input?.collectionUrl, `sources[${index}].collectionUrl`),
    license: requiredString(input?.license, `sources[${index}].license`),
    licenseUrl: absoluteUrl(input?.licenseUrl, `sources[${index}].licenseUrl`),
    ...(sha256 ? { sha256 } : {}),
  };
}

function normalizeEditorial(input, sourcesById) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('editorial must be an object');
  }
  const clips = requiredArray(input.clips, 'editorial.clips')
    .map((clip, index) => normalizeClip(clip, index, sourcesById));
  if (!clips.length) throw new Error('editorial.clips must not be empty');
  assertUniquePodcastContent(clips);
  const terms = normalizeScoreMap(input.terms, 'editorial.terms');
  const weights = normalizeScoreMap(input.weights, 'editorial.weights', false);
  const targetDuration = finiteNumber(input.target_duration, 'editorial.target_duration');
  if (targetDuration <= 0) throw new Error('editorial.target_duration must be positive');

  return {
    version: positiveInteger(input.version, 'editorial.version'),
    strategy: requiredString(input.strategy, 'editorial.strategy'),
    prompt: requiredString(input.prompt, 'editorial.prompt'),
    target_duration: targetDuration,
    generated_at: isoString(input.generated_at, 'editorial.generated_at'),
    clips,
    score: boundedNumber(input.score, 'editorial.score'),
    terms,
    weights,
    calibration: plainObject(input.calibration, 'editorial.calibration'),
    rationale: optionalArray(input.rationale, 'editorial.rationale')
      .map((value, index) => requiredString(value, `editorial.rationale[${index}]`)),
  };
}

function normalizeClip(input, index, sourcesById) {
  const prefix = `editorial.clips[${index}]`;
  const sourceId = requiredString(input?.source_id, `${prefix}.source_id`);
  const source = sourcesById.get(sourceId);
  if (!source) throw new Error(`${prefix} references unknown source ${sourceId}`);
  const sourcePath = requiredString(input?.source_path, `${prefix}.source_path`);
  if (sourcePath !== source.path) {
    throw new Error(`${prefix}.source_path does not match sources entry ${sourceId}`);
  }
  const start = nonNegativeNumber(input?.start, `${prefix}.start`);
  const end = finiteNumber(input?.end, `${prefix}.end`);
  const renderStart = nonNegativeNumber(input?.render_start, `${prefix}.render_start`);
  const renderEnd = finiteNumber(input?.render_end, `${prefix}.render_end`);
  if (end <= start) throw new Error(`${prefix} source range must have end greater than start`);
  if (renderEnd <= renderStart) {
    throw new Error(`${prefix} render range must have end greater than start`);
  }
  const visuals = optionalArray(input?.visuals, `${prefix}.visuals`)
    .map((visual, visualIndex) => normalizeVisual(visual, `${prefix}.visuals[${visualIndex}]`));
  return {
    index: nonNegativeInteger(input?.index, `${prefix}.index`),
    segment_id: requiredString(input?.segment_id, `${prefix}.segment_id`),
    segment_ids: optionalArray(input?.segment_ids, `${prefix}.segment_ids`)
      .map((value, segmentIndex) => requiredString(value, `${prefix}.segment_ids[${segmentIndex}]`)),
    source_id: sourceId,
    source_title: requiredString(input?.source_title || source.title, `${prefix}.source_title`),
    source_path: sourcePath,
    start,
    end,
    render_start: renderStart,
    render_end: renderEnd,
    text: requiredString(input?.text, `${prefix}.text`),
    summary: requiredString(input?.summary, `${prefix}.summary`),
    role: requiredString(input?.role, `${prefix}.role`),
    energy: boundedNumber(input?.energy, `${prefix}.energy`),
    topics: optionalArray(input?.topics, `${prefix}.topics`)
      .map((value, topicIndex) => requiredString(value, `${prefix}.topics[${topicIndex}]`)),
    visuals,
    transition: input?.transition === 'crossfade' ? 'crossfade' : 'cut',
    edited: input?.edited === true,
    note: optionalString(input?.note) ?? null,
  };
}

function normalizeVisual(input, prefix) {
  const mode = requiredString(input?.mode, `${prefix}.mode`);
  if (!VISUAL_MODES.has(mode)) throw new Error(`${prefix}.mode must be still or motion`);
  const start = nonNegativeNumber(input?.start, `${prefix}.start`);
  const end = finiteNumber(input?.end, `${prefix}.end`);
  if (end <= start) throw new Error(`${prefix} range must have end greater than start`);
  return {
    mode,
    start,
    end,
    source_path: requiredString(input?.source_path, `${prefix}.source_path`),
    source_time: nonNegativeNumber(input?.source_time, `${prefix}.source_time`),
    source_title: requiredString(input?.source_title, `${prefix}.source_title`),
    source_url: absoluteUrl(input?.source_url, `${prefix}.source_url`),
  };
}

function assertUniquePodcastContent(clips) {
  const materialOwners = new Map();
  for (const clip of clips) {
    if (new Set(clip.segment_ids).size !== clip.segment_ids.length) {
      throw new Error(`editorial.clips[${clip.index}] repeats a material id internally`);
    }
    for (const materialId of new Set([clip.segment_id, ...clip.segment_ids])) {
      const previous = materialOwners.get(materialId);
      if (previous !== undefined) {
        throw new Error(
          `editorial clips ${previous} and ${clip.index} repeat material id ${materialId}`,
        );
      }
      materialOwners.set(materialId, clip.index);
    }
  }
  assertNoSourceRangeOverlap(clips, 'start', 'end', 'planned');
  assertNoSourceRangeOverlap(clips, 'render_start', 'render_end', 'rendered');
}

function assertNoSourceRangeOverlap(clips, startField, endField, label) {
  const bySource = new Map();
  for (const clip of clips) {
    const sourceClips = bySource.get(clip.source_id) ?? [];
    sourceClips.push(clip);
    bySource.set(clip.source_id, sourceClips);
  }
  for (const [sourceId, sourceClips] of bySource) {
    const ordered = [...sourceClips].sort((left, right) => left[startField] - right[startField]);
    let furthest = null;
    let furthestEnd = Number.NEGATIVE_INFINITY;
    for (const clip of ordered) {
      if (furthest && clip[startField] < furthestEnd - 1e-6) {
        throw new Error(
          `editorial clips ${furthest.index} and ${clip.index} replay overlapping `
          + `${label} audio from source ${sourceId}`,
        );
      }
      if (clip[endField] > furthestEnd) {
        furthest = clip;
        furthestEnd = clip[endField];
      }
    }
  }
}

function normalizeVisualCue(input, index) {
  const prefix = `visualCues[${index}]`;
  const kind = requiredString(input?.kind, `${prefix}.kind`);
  if (!PROCEDURAL_VISUAL_KINDS.has(kind)) {
    throw new Error(`${prefix}.kind is unsupported: ${kind}`);
  }
  const start = nonNegativeNumber(input?.start, `${prefix}.start`);
  const end = finiteNumber(input?.end, `${prefix}.end`);
  if (end <= start) throw new Error(`${prefix} range must have end greater than start`);
  return {
    kind,
    start,
    end,
    text: requiredString(input?.text, `${prefix}.text`),
    style: optionalString(input?.style) ?? 'default',
  };
}

function normalizePresentation(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    throw new Error('presentation must be an object');
  }
  const subtitles = requiredString(input.subtitles, 'presentation.subtitles');
  if (!['none', 'sidecar', 'burn'].includes(subtitles)) {
    throw new Error('presentation.subtitles must be none, sidecar, or burn');
  }
  return {
    sourceHeading: input.sourceHeading !== false,
    watermark: input.watermark !== false,
    watermarkText: requiredString(input.watermarkText, 'presentation.watermarkText'),
    subtitles,
  };
}

function normalizeScoreMap(input, field, bounded = true) {
  const value = plainObject(input, field);
  const actual = Object.keys(value).sort();
  const expected = [...PODCAST_SCORE_TERMS].sort();
  if (actual.join('|') !== expected.join('|')) {
    throw new Error(`${field} must surface exactly the eight podcast score terms`);
  }
  return Object.fromEntries(PODCAST_SCORE_TERMS.map((term) => [
    term,
    bounded ? boundedNumber(value[term], `${field}.${term}`) : finiteNumber(value[term], `${field}.${term}`),
  ]));
}

function absoluteUrl(value, field) {
  const text = requiredString(value, field);
  let url;
  try {
    url = new URL(text);
  } catch {
    throw new Error(`${field} must be an absolute URL`);
  }
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new Error(`${field} must use http or https`);
  }
  return url.toString();
}

function isoString(value, field) {
  const text = requiredString(value, field);
  if (!Number.isFinite(Date.parse(text))) throw new Error(`${field} must be an ISO date`);
  return new Date(text).toISOString();
}

function optionalIso(value, field) {
  if (value === undefined || value === null) return null;
  return isoString(value, field);
}

function boundedNumber(value, field) {
  const number = finiteNumber(value, field);
  if (number < 0 || number > 1) throw new Error(`${field} must be between 0 and 1`);
  return number;
}

function nonNegativeNumber(value, field) {
  const number = finiteNumber(value, field);
  if (number < 0) throw new Error(`${field} must not be negative`);
  return number;
}

function finiteNumber(value, field) {
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`${field} must be finite`);
  return number;
}

function positiveInteger(value, field) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) throw new Error(`${field} must be a positive integer`);
  return number;
}

function nonNegativeInteger(value, field) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 0) throw new Error(`${field} must be a non-negative integer`);
  return number;
}

function requiredArray(value, field) {
  if (!Array.isArray(value)) throw new Error(`${field} must be an array`);
  return value;
}

function optionalArray(value, field) {
  if (value === undefined || value === null) return [];
  return requiredArray(value, field);
}

function plainObject(value, field) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`${field} must be an object`);
  }
  return structuredClone(value);
}

function requiredString(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} is required`);
  return value.trim();
}

function optionalString(value) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function assertUnique(values, label) {
  if (new Set(values).size !== values.length) throw new Error(`${label}s must be unique`);
}
