import arsenalConfig from '../../config/studio-arsenal.json' with { type: 'json' };
import brandConfig from '../../config/brand-channels.json' with { type: 'json' };

const CHANNELS = [...arsenalConfig.channels];
const QUALITY_TIERS = [...arsenalConfig.qualityTiers];
const SPEND = Object.fromEntries(Object.entries(arsenalConfig.spendClasses).map(([id, value]) => [id, { id, ...value }]));
const RECIPE_DEFINITIONS = arsenalConfig.recipes.map((entry) => recipe(entry));

export function listProductionProjects() {
  return Object.entries(brandConfig.brands ?? {}).map(([slug, brand]) => ({
    slug,
    name: brand.name,
    domain: brand.domain,
    channels: [...brand.channels],
    palette: { ...brand.palette },
  }));
}

export function listProductionRecipes(context = {}) {
  return RECIPE_DEFINITIONS.map((definition) => decorateRecipe(definition, context));
}

export function getProductionRecipe(id, context = {}) {
  const definition = RECIPE_DEFINITIONS.find((entry) => entry.id === id);
  if (!definition) throw new Error(`unknown video recipe: ${id}`);
  return decorateRecipe(definition, context);
}

export function normalizeRecipeOptions(recipeId, input = {}) {
  const recipe = getProductionRecipe(recipeId);
  const channel = input.channel ?? recipe.defaults.channel;
  if (!recipe.channels.includes(channel)) throw new Error(`unsupported channel for ${recipeId}: ${channel}`);
  const durationSeconds = boundedInteger(input.durationSeconds ?? recipe.defaults.durationSeconds, 5, 90, 'durationSeconds');
  const qualityTier = input.qualityTier ?? recipe.defaults.qualityTier;
  if (!QUALITY_TIERS.includes(qualityTier)) throw new Error(`qualityTier must be one of ${QUALITY_TIERS.join(', ')}`);
  const variantCount = boundedInteger(input.variantCount ?? recipe.defaults.variantCount, 1, 6, 'variantCount');
  const values = {};
  for (const option of recipe.options) values[option.id] = normalizeOption(option, input.values?.[option.id] ?? input[option.id]);
  return { channel, durationSeconds, qualityTier, variantCount, values };
}

export function productionActions(brief, context = {}) {
  const recipe = brief?.recipeId ? getProductionRecipe(brief.recipeId, { ...context, brief }) : null;
  const previewPath = brief?.media?.videoPath ?? brief?.media?.previewPath ?? null;
  const build = recipe
    ? buildAction(recipe, brief)
    : { enabled: false, kind: 'blocked', label: 'Choose a video recipe', href: null, endpoint: null, blocker: 'Choose and save a video recipe first.' };
  const distributionBlockers = distributionBlockersFor(brief);
  return {
    edit: { enabled: Boolean(brief), label: 'Edit plan', target: 'advanced-brief' },
    build,
    preview: {
      enabled: Boolean(previewPath), label: 'Preview', target: 'productions', path: previewPath,
      blocker: previewPath ? null : 'Build or continue the production before previewing it.',
    },
    post: {
      enabled: distributionBlockers.length === 0,
      label: 'Prepare in Postiz', target: 'distribute',
      blocker: distributionBlockers.length ? `Add ${distributionBlockers.join(', ')} before preparing Postiz.` : null,
    },
  };
}

function decorateRecipe(definition, context) {
  const readiness = readinessFor(definition, context);
  return structuredClone({ ...definition, spend: SPEND[definition.spend], readiness });
}

function readinessFor(definition, context) {
  const brief = context.brief ?? null;
  const missing = missingBriefRequirements(definition, brief);
  if (missing.length) return { state: 'needs-input', ready: false, blocker: `Add ${missing.join(', ')} before continuing.` };
  if (definition.readiness === 'blender') {
    const capability = context.blenderCapability;
    if (!capability?.ready) return { state: 'needs-runtime', ready: false, blocker: capability?.blocker ?? 'Check Blender 5.2 readiness on this machine.' };
  }
  if (definition.readiness === 'kokoro' && context.kokoroReady !== true) {
    return {
      state: 'needs-runtime',
      ready: false,
      blocker: context.kokoroBlocker ?? 'Install the local Kokoro model and configure the b-roll source.',
    };
  }
  if (definition.readiness === 'moneyprinter' && context.moneyprinterReady !== true) {
    return { state: 'needs-runtime', ready: false, blocker: 'Start and verify the MoneyPrinterTurbo service.' };
  }
  if (definition.readiness === 'grok-asset') {
    const asset = brief?.recipeOptions?.values?.approvedAssetPath;
    if (!asset) return { state: 'needs-input', ready: false, blocker: 'Add an operator-approved local Grok MP4 path.' };
  }
  if (definition.readiness === 'lyric') {
    if (!brief?.lyric?.audioPath || !brief?.lyric?.timedLyrics) {
      return { state: 'needs-input', ready: false, blocker: 'Add local audio and operator-supplied timed lyrics in the detailed editor.' };
    }
    const rights = brief.lyric.rights ?? {};
    if (!['owned', 'licensed'].includes(rights.composition) || !['owned', 'licensed'].includes(rights.master) || !brief.lyric.attribution) {
      return { state: 'needs-input', ready: false, blocker: 'Add composition rights, master rights, and attribution. Attribution is not permission.' };
    }
  }
  if (definition.action.kind === 'continue') {
    return { state: 'external-step', ready: true, blocker: `${definition.owner} owns execution and review for this recipe.` };
  }
  return { state: 'ready', ready: true, blocker: null };
}

function buildAction(recipe, brief) {
  if (!recipe.readiness.ready) {
    return { enabled: false, kind: 'blocked', label: recipe.action.label, href: null, endpoint: null, blocker: recipe.readiness.blocker };
  }
  if (recipe.action.kind === 'continue') {
    return {
      enabled: true, kind: 'continue', label: recipe.action.label,
      href: continuationHref(recipe.action.href, brief, recipe), endpoint: null, blocker: recipe.readiness.blocker,
    };
  }
  return {
    enabled: true, kind: 'execute', label: recipe.action.label,
    href: null, endpoint: `/studio/briefs/${encodeURIComponent(brief.id)}/execute`, blocker: null,
  };
}

function continuationHref(base, brief, recipe) {
  const relative = String(base).startsWith('/');
  const url = new URL(base, 'http://studio.local');
  url.searchParams.set('studioBriefId', brief.id);
  url.searchParams.set('recipeId', recipe.id);
  if (brief.projectSlug) url.searchParams.set('projectName', brief.projectSlug);
  const source = publicHttpsUrl(brief.sourceEvidence?.canonicalUrl);
  if (source) url.searchParams.set('sourceUrl', source);
  return relative ? `${url.pathname}${url.search}${url.hash}` : url.toString();
}

function missingBriefRequirements(definition, brief) {
  if (!brief) return [];
  const missing = [];
  if (definition.requirements.includes('canonical source URL') && !brief.sourceEvidence?.canonicalUrl) missing.push('a canonical source URL');
  if (definition.requirements.includes('approved source rights') && brief.sourceEvidence?.rightsStatus !== 'approved') missing.push('approved source rights');
  return missing;
}

function distributionBlockersFor(brief) {
  if (!brief) return ['a saved production'];
  const missing = [];
  if (!brief.projectSlug) missing.push('a Fleet brand');
  if (!brief.sourceEvidence?.canonicalUrl) missing.push('a canonical source URL');
  if (!brief.sourceEvidence?.claim) missing.push('a source-backed claim');
  if (!brief.sourceEvidence?.destinationUrl) missing.push('a destination URL');
  if (brief.sourceEvidence?.rightsStatus !== 'approved') missing.push('approved source rights');
  if (brief.approval?.creativeStatus !== 'approved') missing.push('creative approval');
  if (!(brief.media?.quality?.verdict === 'pass' || brief.approval?.qualityAccepted === true)) missing.push('accepted quality evidence');
  if (!brief.cta) missing.push('a call to action');
  if (!brief.media?.videoPath) missing.push('a rendered video');
  if (!publicHttpsUrl(brief.media?.publicUrl)) missing.push('a stable public media URL');
  return missing;
}

function recipe(input) {
  return {
    channels: CHANNELS,
    requirements: [],
    readiness: null,
    action: { kind: 'execute', label: 'Build preview', href: null },
    ...structuredClone(input),
    defaults: { channel: 'youtube_shorts', ...input.defaults },
  };
}

function normalizeOption(option, value) {
  const candidate = value ?? option.default;
  if (option.type === 'boolean') return candidate === true || candidate === 'true';
  if (option.type === 'select') {
    if (!option.choices.includes(candidate)) throw new Error(`${option.id} must be one of ${option.choices.join(', ')}`);
    return candidate;
  }
  if (typeof candidate !== 'string') throw new Error(`${option.id} must be a string`);
  return candidate.trim().slice(0, 500);
}

function boundedInteger(value, min, max, field) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) throw new Error(`${field} must be an integer between ${min} and ${max}`);
  return number;
}

function publicHttpsUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || ['localhost', '127.0.0.1', '::1'].includes(url.hostname)) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export const PRODUCTION_RECIPE_IDS = RECIPE_DEFINITIONS.map((entry) => entry.id);
export const PRODUCTION_SPEND_CLASSES = Object.keys(SPEND);
