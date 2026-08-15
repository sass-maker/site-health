import { isStale } from './accreditation-state.mjs';
import { audienceFitFor, compareAudienceFit } from './audience-fit.mjs';

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
function emptyBuckets() {
  return {
    accredited: [],
    seed: [],
    blocked: [],
    rejected: [],
    overridden: [],
    articleComponent: [],
    unclassified: [],
  };
}

function bucketFor(platform, route, overrideReason) {
  if (platform.currentState === 'rejected') return overrideReason ? 'overridden' : 'rejected';
  if (platform.currentState === 'blocked') return 'blocked';
  if (!MATCHABLE_STATES.has(platform.currentState)) return null;
  if (route === 'articleComponent') return 'articleComponent';
  return platform.currentState === 'accredited' ? 'accredited' : 'seed';
}

function decorate(entry, bucket, platform, overrideReason) {
  if (bucket === 'overridden') return { ...entry, overrideReason };
  if (bucket === 'rejected') return { ...entry, rejectionReason: platform.rejectionReason };
  if (bucket === 'articleComponent') return { ...entry, component: 'article' };
  return entry;
}

function sorted(entries) {
  return entries.sort(compareAudienceFit);
}

// Stale accredited platforms re-enter verification instead of going straight
// into a manifest. Protected channels are individually planned and never enter
// the broad verification queue.
function verificationQueueFor({ seed, blocked, accredited }) {
  return sorted(
    [...seed, ...blocked, ...accredited.filter((entry) => entry.stale)].filter(
      (entry) => entry.qualityGate !== 'protected' && entry.fitScore > 0,
    ),
  );
}

function countsFor(buckets, matched) {
  return {
    matched: matched.length,
    accredited: buckets.accredited.length,
    seed: buckets.seed.length,
    blocked: buckets.blocked.length,
    rejected: buckets.rejected.length,
    overridden: buckets.overridden.length,
    unclassified: buckets.unclassified.length,
  };
}

export function matchPlatforms(state, options) {
  const {
    artifact,
    productId = null,
    includeCanonicalArticle = false,
    overrides = [],
    audienceFit = null,
    now = new Date(),
  } = options;

  if (!ARTIFACT_TYPE_SET.has(artifact)) {
    throw new Error(`artifact must be one of ${ARTIFACT_TYPES.join(', ')}`);
  }
  const overrideById = overrideIndex(overrides);
  const context = { productId, stalenessDays: state.stalenessDays, now };
  const buckets = emptyBuckets();

  for (const platform of state.platforms) {
    const route = routeFor(platform, artifact, includeCanonicalArticle);
    if (!route) continue;
    const overrideReason = overrideById.get(platform.id);
    const bucket = bucketFor(platform, route, overrideReason);
    if (!bucket) continue;
    const fit = audienceFitFor(audienceFit, productId, platform.id);
    const entry = { ...entryFor(platform, context), ...fit };
    if (MATCHABLE_STATES.has(platform.currentState) || bucket === 'overridden') {
      if (fit.fitScore === 0) {
        buckets.unclassified.push({ ...entry, candidateRoute: route });
        continue;
      }
    }
    buckets[bucket].push(decorate(entry, bucket, platform, overrideReason));
  }


  for (const entries of Object.values(buckets)) sorted(entries);

  const matched = sorted([
    ...buckets.accredited,
    ...buckets.seed,
    ...buckets.articleComponent,
    ...buckets.overridden,
  ]);
  return {
    artifact,
    productId,
    matched,
    ...buckets,
    verificationQueue: verificationQueueFor(buckets),
    counts: countsFor(buckets, matched),
  };
}
