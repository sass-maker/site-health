import { listRecipeVariants } from './production-catalog.js';

export const VIDEO_EXECUTION_SCHEMA = 'fleet.marketing-video-execution.v1';

const TEXT = 'text';
const TEXTAREA = 'textarea';

const ADAPTERS = {
  'image-slideshow': adapter('studio-html', 'Marketing Studio'),
  'web-motion': adapter('studio-html', 'Marketing Studio'),
  'ascii-story': adapter('studio-ascii', 'Marketing Studio'),
  'product-proof': adapter('brand-reel', 'Brand Reel', [
    field('canonicalUrl', 'Product URL', TEXT, 'Public HTTPS page used as product evidence.'),
  ]),
  'local-voice-film': adapter('studio-kokoro', 'Marketing Studio'),
  'grok-asset-film': adapter('studio-grok-import', 'Marketing Studio', [
    field('approvedAssetPath', 'Approved local MP4 path', TEXT, 'Absolute path beneath an approved artifact root.'),
  ]),
  'blender-film': adapter('studio-blender', 'Marketing Studio'),
  'threejs-scene': adapter('forge-threejs', 'Forge'),
  'guided-app-demo': adapter('forge-guided-demo', 'Forge', [
    field('canonicalUrl', 'Application URL', TEXT, 'Public HTTPS application being demonstrated.'),
    field('capturePath', 'Approved capture path', TEXT, 'Local screen recording beneath an approved artifact root.'),
    field('rightsEvidence', 'Capture rights evidence', TEXTAREA, 'Operator-supplied evidence for the capture and presenter.'),
  ]),
  'coherent-local-film': adapter('forge-coherent-film', 'Forge', [
    field('approvedManifestPath', 'Approved film manifest path', TEXT, 'Owner-reviewed Forge manifest beneath an approved artifact root.'),
    field('rightsEvidence', 'Source rights evidence', TEXTAREA, 'Evidence covering every source asset in the manifest.'),
  ]),
  'podcast-short': adapter('editorial-podcast', 'Editorial', [
    field('editManifestPath', 'Approved edit manifest path', TEXT, 'fleet.podcast-edit.v1 manifest beneath an approved artifact root.'),
    field('rightsEvidence', 'Source rights evidence', TEXTAREA, 'Evidence covering the source recording and excerpt.'),
  ]),
  'literal-lyric-video': adapter('studio-lyric', 'Marketing Studio', [
    field('audioPath', 'Cleared local audio path', TEXT, 'Local recording beneath an approved artifact root.'),
    field('timedLyrics', 'Timed lyrics', TEXTAREA, 'Operator-supplied LRC, SRT, or structured timed cues.'),
    field('attribution', 'Attribution', TEXT, 'Composition, recording, and performer attribution.'),
    field('compositionRightsEvidence', 'Composition and lyrics rights', TEXTAREA, 'Owned or licensed evidence; attribution alone is insufficient.'),
    field('masterRightsEvidence', 'Master recording rights', TEXTAREA, 'Owned or licensed evidence for this recording.'),
  ]),
};

export function listExecutionAdapters() {
  return Object.entries(ADAPTERS).map(([recipeId, definition]) => ({ recipeId, ...structuredClone(definition) }));
}

export function getExecutionAdapter(recipeId) {
  const definition = ADAPTERS[recipeId];
  if (!definition) throw new Error(`no video execution adapter registered for ${recipeId}`);
  return { recipeId, ...structuredClone(definition) };
}

export function describeVariantExecution(variant) {
  const adapterDefinition = getExecutionAdapter(variant.recipeId);
  const realReady = variant.executionReady === true;
  return {
    ...variant,
    execution: {
      schema: VIDEO_EXECUTION_SCHEMA,
      adapter: adapterDefinition.id,
      owner: adapterDefinition.owner,
      fixture: { ready: true, label: 'Make fixture demo', blocker: null },
      real: {
        ready: realReady,
        label: 'Make real video',
        blocker: realReady ? null : variant.readiness.blocker ?? `${variant.runtime} requires real production inputs.`,
      },
      inputs: adapterDefinition.inputs,
      ownerReviewHref: variant.action?.href ?? null,
    },
  };
}

export function validateExecutionRegistry(options = {}) {
  const variants = options.variants ?? listRecipeVariants();
  const recipeIds = new Set(variants.map((variant) => variant.recipeId));
  const adapterIds = new Set(Object.keys(ADAPTERS));
  const missingAdapters = [...recipeIds].filter((id) => !adapterIds.has(id));
  const staleAdapters = [...adapterIds].filter((id) => !recipeIds.has(id));
  if (missingAdapters.length) throw new Error(`missing video execution adapters: ${missingAdapters.join(', ')}`);
  if (staleAdapters.length) throw new Error(`stale video execution adapters: ${staleAdapters.join(', ')}`);
  for (const [recipeId, definition] of Object.entries(ADAPTERS)) {
    const ids = new Set();
    for (const input of definition.inputs) {
      if (ids.has(input.id)) throw new Error(`${recipeId}: duplicate execution input ${input.id}`);
      ids.add(input.id);
    }
  }
  return { recipes: recipeIds.size, variants: variants.length, adapters: adapterIds.size };
}

export function missingExecutionInputs(recipeId, input = {}) {
  return getExecutionAdapter(recipeId).inputs
    .filter((definition) => definition.required && !String(input[definition.id] ?? '').trim())
    .map((definition) => definition.label);
}

function adapter(id, owner, inputs = []) {
  return { id, owner, inputs };
}

function field(id, label, type, help) {
  return { id, label, type, help, required: true };
}
