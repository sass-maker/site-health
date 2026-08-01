import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import galleryConfig from '../../config/explore-gallery.json' with { type: 'json' };
import { listRecipeVariants } from './production-catalog.js';

const DEFAULT_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const POSTURES = new Set([
  'local-render',
  'specialist-proof',
  'local-model-proof',
  'baseline-local',
  'baseline-import',
  'external-continuation',
]);
const QUALITY_TIERS = new Set(['showcase', 'experiment', 'baseline']);

export async function listExploreGallery(options = {}) {
  const registry = validateExploreGallery(options.galleryConfig ?? galleryConfig, options);
  const items = await Promise.all(registry.items.map(async (item) => {
    const info = await stat(item.resolvedSource).catch(() => null);
    const playable = Boolean(info?.isFile() && info.size > 0);
    return {
      id: item.id,
      title: item.title,
      family: item.family,
      description: item.description,
      engine: item.engine,
      sourcePosture: item.sourcePosture,
      qualityTier: item.qualityTier,
      spend: item.spend,
      variantId: item.variantId,
      playable,
      bytes: playable ? info.size : null,
      mediaUrl: playable ? `/studio/explore-gallery/${encodeURIComponent(item.id)}/media` : null,
    };
  }));
  const families = [...new Set(items.map((item) => item.family))];
  return {
    schema: registry.schema,
    version: registry.version,
    count: items.length,
    playableCount: items.filter((item) => item.playable).length,
    families,
    items,
  };
}

export async function openExploreGalleryMedia(id, options = {}) {
  const registry = validateExploreGallery(options.galleryConfig ?? galleryConfig, options);
  const item = registry.items.find((entry) => entry.id === id);
  if (!item) return null;
  const info = await stat(item.resolvedSource).catch(() => null);
  if (!info?.isFile() || info.size < 1) return null;
  return {
    path: item.resolvedSource,
    size: info.size,
    filename: `${item.id}.mp4`,
    contentType: 'video/mp4',
  };
}

export function validateExploreGallery(input, options = {}) {
  if (!input || input.schema !== 'fleet.video-explore-gallery.v1' || input.version !== 1 || !Array.isArray(input.items)) {
    throw new Error('explore gallery must use fleet.video-explore-gallery.v1');
  }
  const root = path.resolve(options.galleryRoot ?? DEFAULT_ROOT);
  const knownVariants = new Set(listRecipeVariants().map((variant) => variant.id));
  const ids = new Set();
  const items = input.items.map((entry, index) => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error(`explore gallery item ${index + 1} must be an object`);
    const id = required(entry.id, `explore gallery item ${index + 1} id`);
    if (ids.has(id)) throw new Error(`duplicate explore gallery id: ${id}`);
    ids.add(id);
    if (!POSTURES.has(entry.sourcePosture)) throw new Error(`${id}: unsupported source posture`);
    if (!QUALITY_TIERS.has(entry.qualityTier)) throw new Error(`${id}: unsupported quality tier`);
    if (entry.variantId != null && !knownVariants.has(entry.variantId)) throw new Error(`${id}: unknown variant ${entry.variantId}`);
    const source = required(entry.source, `${id} source`);
    if (path.isAbsolute(source)) throw new Error(`${id}: source must be relative to the gallery root`);
    const resolvedSource = path.resolve(root, source);
    if (resolvedSource !== root && !resolvedSource.startsWith(`${root}${path.sep}`)) throw new Error(`${id}: source escapes the gallery root`);
    return {
      id,
      title: required(entry.title, `${id} title`),
      family: required(entry.family, `${id} family`),
      description: required(entry.description, `${id} description`),
      engine: required(entry.engine, `${id} engine`),
      sourcePosture: entry.sourcePosture,
      qualityTier: entry.qualityTier,
      spend: required(entry.spend, `${id} spend`),
      variantId: entry.variantId ?? null,
      resolvedSource,
    };
  });
  return { schema: input.schema, version: input.version, items };
}

function required(value, field) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${field} is required`);
  return value.trim();
}
