import { isStale } from './accreditation-state.mjs';

const ARTIFACT_TYPES = ['article', 'product', 'major-feature'];

const ARTIFACT_TYPE_SET = new Set(ARTIFACT_TYPES);
const MATCHABLE_STATES = new Set(['accredited', 'seed']);

function fits(platform, artifact) {
  return Array.isArray(platform.artifactFit) && platform.artifactFit.includes(artifact);
}

function overrideIndex(overrides) {
  return new Map(
    overrides.map((entry) =>
      typeof entry === 'string'
        ? [entry, 'owner override']
        : [entry.platformId, entry.reason || 'owner override'],
    ),
  );
}

/**
 * How one platform is reached by this artifact: `direct` when its artifactFit
 * covers the artifact itself, `articleComponent` when it only qualifies for the
 * launch's canonical article.
 */
function routeFor(platform, artifact, includeCanonicalArticle) {
  const direct = fits(platform, artifact);
  if (direct) return 'direct';
  const carriesArticle = includeCanonicalArticle && artifact !== 'article';
  if (carriesArticle && fits(platform, 'article')) return 'articleComponent';
  return null;
}

function entryFor(platform, { productId, stalenessDays, now }) {
  return {
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
  const overrideById = overrideIndex(overrides);
  const context = { productId, stalenessDays: state.stalenessDays, now };

  const accredited = [];
  const seed = [];
  const blocked = [];
  const rejected = [];
  const overridden = [];
  const articleComponent = [];

  for (const platform of state.platforms) {
    const route = routeFor(platform, artifact, includeCanonicalArticle);
    if (!route) continue;
    const entry = entryFor(platform, context);

    if (platform.currentState === 'rejected') {
      const reason = overrideById.get(platform.id);
      if (reason) overridden.push({ ...entry, overrideReason: reason });
      else rejected.push({ ...entry, rejectionReason: platform.rejectionReason });
      continue;
    }
    if (platform.currentState === 'blocked') {
      blocked.push(entry);
      continue;
    }
    if (!MATCHABLE_STATES.has(platform.currentState)) continue;

    if (route === 'articleComponent') articleComponent.push({ ...entry, component: 'article' });
    else if (platform.currentState === 'accredited') accredited.push(entry);
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
