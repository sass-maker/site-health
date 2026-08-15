import { isStale } from './accreditation-state.mjs';

export const ARTIFACT_TYPES = ['article', 'product', 'major-feature'];

const ARTIFACT_TYPE_SET = new Set(ARTIFACT_TYPES);
const MATCHABLE_STATES = new Set(['accredited', 'seed']);

function fits(platform, artifact) {
  return Array.isArray(platform.artifactFit) && platform.artifactFit.includes(artifact);
}

/**
 * Deterministic routing for one artifact:
 * - article -> protected channels + article-syndication platforms
 * - product / major-feature -> protected channels + curated directories +
 *   long-tail seeds, plus article-syndication platforms only when the launch
 *   carries a canonical article (`includeCanonicalArticle`).
 *
 * Only `accredited` and `seed` platforms are matched. `rejected` platforms are
 * excluded unless the owner passes an explicit override with a reason.
 */
export function matchPlatforms(state, options) {
  const {
    artifact,
    productId = null,
    includeCanonicalArticle = false,
    overrides = [],
    now = new Date(),
  } = options;

  if (!ARTIFACT_TYPE_SET.has(artifact)) {
    throw new Error(`artifact must be one of ${ARTIFACT_TYPES.join(', ')}`);
  }
  const overrideById = new Map(
    overrides.map((entry) =>
      typeof entry === 'string' ? [entry, 'owner override'] : [entry.platformId, entry.reason],
    ),
  );
  const stalenessDays = state.stalenessDays;

  const accredited = [];
  const seed = [];
  const blocked = [];
  const rejected = [];
  const overridden = [];
  const articleComponent = [];

  for (const platform of state.platforms) {
    const matchesArtifact = fits(platform, artifact);
    const matchesArticleComponent =
      includeCanonicalArticle &&
      artifact !== 'article' &&
      !matchesArtifact &&
      fits(platform, 'article');
    if (!(matchesArtifact || matchesArticleComponent)) continue;

    const entry = {
      id: platform.id,
      name: platform.name,
      source: platform.source,
      submitUrl: platform.submitUrl,
      home: platform.home,
      qualityGate: platform.qualityGate,
      currentState: platform.currentState,
      verifiedAt: platform.verifiedAt,
      stale: isStale(platform, { stalenessDays, now }),
      blocker: platform.blocker,
      productId,
    };

    if (platform.currentState === 'rejected') {
      if (overrideById.has(platform.id)) {
        overridden.push({ ...entry, overrideReason: overrideById.get(platform.id) });
      } else {
        rejected.push({ ...entry, rejectionReason: platform.rejectionReason });
      }
      continue;
    }
    if (platform.currentState === 'blocked') {
      blocked.push(entry);
      continue;
    }
    if (!MATCHABLE_STATES.has(platform.currentState)) continue;

    if (matchesArticleComponent) {
      articleComponent.push({ ...entry, component: 'article' });
      continue;
    }
    if (platform.currentState === 'accredited') accredited.push(entry);
    else seed.push(entry);
  }

  const matched = [...accredited, ...seed, ...articleComponent, ...overridden];
  return {
    artifact,
    productId,
    matched,
    accredited,
    seed,
    blocked,
    rejected,
    overridden,
    articleComponent,
    // Stale accredited platforms re-enter verification instead of going straight
    // into a manifest. Protected channels are individually planned and never
    // enter the broad verification queue.
    verificationQueue: [...seed, ...blocked, ...accredited.filter((entry) => entry.stale)].filter(
      (entry) => entry.qualityGate !== 'protected',
    ),
    counts: {
      matched: matched.length,
      accredited: accredited.length,
      seed: seed.length,
      blocked: blocked.length,
      rejected: rejected.length,
      overridden: overridden.length,
    },
  };
}
