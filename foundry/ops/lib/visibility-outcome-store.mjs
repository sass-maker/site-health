import {
  appendFileSync,
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

export const VISIBILITY_OUTCOME_BUNDLE_SCHEMA = 'fleet.visibility-outcome-bundle.v1';
export const VISIBILITY_OUTCOME_SCHEMA = 'fleet.visibility-outcome.v1';

const IDENTIFIER = /^[a-z0-9][a-z0-9._:-]{0,159}$/;
const FAMILY_CONTRACTS = {
  search: {
    provider: 'google-search-console',
    metrics: {
      'Search impressions': { unit: 'impressions', direction: 'higher-is-better' },
      'Search clicks': { unit: 'clicks', direction: 'higher-is-better' },
      'Search CTR': { unit: 'percent', direction: 'higher-is-better', maximum: 100 },
      'Search average position': {
        unit: 'rank',
        direction: 'lower-is-better',
        exclusiveMinimum: 0,
      },
    },
  },
  'ai-crawl': {
    provider: 'cloudflare-ai-crawl-control',
    metrics: {
      'AI crawler requests': { unit: 'requests', direction: 'higher-is-better' },
      'AI crawled URLs': { unit: 'urls', direction: 'higher-is-better' },
    },
  },
  'ai-referral': {
    provider: 'cloudflare-web-analytics',
    metrics: {
      'AI referral visits': { unit: 'visits', direction: 'higher-is-better' },
      'AI referral page views': { unit: 'page views', direction: 'higher-is-better' },
    },
  },
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function assertKnownKeys(value, keys, path) {
  assert(value && typeof value === 'object' && !Array.isArray(value), `${path} must be an object`);
  for (const key of Object.keys(value)) {
    assert(keys.has(key), `${path}.${key} is not allowed`);
  }
}

function stableJson(value) {
  if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableJson(value[key])}`)
      .join(',')}}`;
  }
  return JSON.stringify(value);
}

function normalizeTimestamp(value, path) {
  assert(typeof value === 'string' && Number.isFinite(Date.parse(value)), `${path} must be ISO-8601`);
  return new Date(value).toISOString();
}

function normalizeMetric(metric, contract, path) {
  assertKnownKeys(metric, new Set(['label', 'value']), path);
  const definition = contract.metrics[metric.label];
  assert(definition, `${path}.label is not supported for ${contract.provider}`);
  const value = Number(metric.value);
  assert(Number.isFinite(value) && value >= 0, `${path}.value must be a non-negative finite number`);
  if (definition.maximum !== undefined) {
    assert(value <= definition.maximum, `${path}.value exceeds ${definition.maximum}`);
  }
  if (definition.exclusiveMinimum !== undefined) {
    assert(value > definition.exclusiveMinimum, `${path}.value must exceed ${definition.exclusiveMinimum}`);
  }
  return {
    label: metric.label,
    value,
    unit: definition.unit,
    direction: definition.direction,
  };
}

function normalizeSearchTerms(searchTerms, family) {
  if (searchTerms === undefined) return [];
  assert(family === 'search', 'searchTerms is only supported for Search Console outcomes');
  assert(Array.isArray(searchTerms), 'observation.searchTerms must be an array');
  assert(searchTerms.length <= 50, 'observation.searchTerms exceeds 50 entries');
  const normalized = searchTerms.map((term, index) => {
    const path = `observation.searchTerms[${index}]`;
    assertKnownKeys(term, new Set(['query', 'landingPage', 'impressions', 'clicks', 'ctr', 'position']), path);
    const query = String(term.query ?? '').replace(/\s+/g, ' ').trim();
    assert(query.length > 0 && query.length <= 300, `${path}.query must be 1-300 characters`);
    let landingPage = null;
    if (term.landingPage !== undefined && term.landingPage !== null) {
      assert(typeof term.landingPage === 'string', `${path}.landingPage must be a URL`);
      assert(term.landingPage.length <= 2048, `${path}.landingPage is too long`);
      try {
        const url = new URL(term.landingPage);
        assert(['http:', 'https:'].includes(url.protocol), `${path}.landingPage must use HTTP or HTTPS`);
        assert(!url.username && !url.password, `${path}.landingPage must not contain credentials`);
        landingPage = url.href;
      } catch (error) {
        if (error?.message?.startsWith(`${path}.landingPage`)) throw error;
        throw new Error(`${path}.landingPage must be a URL`);
      }
    }
    const impressions = Number(term.impressions);
    const clicks = Number(term.clicks);
    const ctr = Number(term.ctr);
    const position = Number(term.position);
    assert(Number.isFinite(impressions) && impressions >= 0, `${path}.impressions is invalid`);
    assert(Number.isFinite(clicks) && clicks >= 0, `${path}.clicks is invalid`);
    assert(Number.isFinite(ctr) && ctr >= 0 && ctr <= 100, `${path}.ctr is invalid`);
    assert(Number.isFinite(position) && position > 0, `${path}.position is invalid`);
    return {
      query,
      ...(landingPage ? { landingPage } : {}),
      impressions,
      clicks,
      ctr,
      position,
    };
  });
  assert(
    new Set(normalized.map((term) => `${term.query}\n${term.landingPage ?? ''}`)).size === normalized.length,
    'observation.searchTerms contains duplicate query-page rows',
  );
  return normalized;
}

export function normalizeVisibilityOutcome(observation, { allowedProjectIds } = {}) {
  assertKnownKeys(
    observation,
    new Set(['id', 'projectId', 'family', 'provider', 'scope', 'observedAt', 'period', 'metrics', 'searchTerms']),
    'observation',
  );
  assert(typeof observation.id === 'string' && IDENTIFIER.test(observation.id), 'observation.id is invalid');
  assert(
    typeof observation.projectId === 'string' && IDENTIFIER.test(observation.projectId),
    'observation.projectId is invalid',
  );
  if (allowedProjectIds) {
    assert(allowedProjectIds.has(observation.projectId), `unknown visibility project: ${observation.projectId}`);
  }
  const contract = FAMILY_CONTRACTS[observation.family];
  assert(contract, `unsupported visibility outcome family: ${observation.family}`);
  assert(observation.provider === contract.provider, `${observation.family} requires provider ${contract.provider}`);
  assert(
    typeof observation.scope === 'string' && observation.scope.length > 0 && observation.scope.length <= 300,
    'observation.scope must be 1-300 characters',
  );
  assertKnownKeys(observation.period, new Set(['start', 'end']), 'observation.period');
  const periodStart = normalizeTimestamp(observation.period.start, 'observation.period.start');
  const periodEnd = normalizeTimestamp(observation.period.end, 'observation.period.end');
  assert(Date.parse(periodStart) <= Date.parse(periodEnd), 'observation period must not end before it starts');
  const observedAt = normalizeTimestamp(observation.observedAt, 'observation.observedAt');
  assert(Date.parse(observedAt) >= Date.parse(periodEnd), 'observation must not precede its reporting period');
  assert(Array.isArray(observation.metrics) && observation.metrics.length > 0, 'observation.metrics is required');
  assert(observation.metrics.length <= Object.keys(contract.metrics).length, 'observation.metrics has too many entries');
  const metrics = observation.metrics.map((metric, index) =>
    normalizeMetric(metric, contract, `observation.metrics[${index}]`));
  assert(new Set(metrics.map((metric) => metric.label)).size === metrics.length, 'observation.metrics contains duplicates');
  const searchTerms = normalizeSearchTerms(observation.searchTerms, observation.family);
  return {
    schemaVersion: VISIBILITY_OUTCOME_SCHEMA,
    id: observation.id,
    projectId: observation.projectId,
    family: observation.family,
    provider: observation.provider,
    scope: observation.scope,
    observedAt,
    period: { start: periodStart, end: periodEnd },
    metrics,
    ...(observation.family === 'search' ? { searchTerms } : {}),
  };
}

export function prepareVisibilityOutcomeBundle(bundle, { allowedProjectIds } = {}) {
  assertKnownKeys(bundle, new Set(['schema', 'observations']), 'bundle');
  assert(bundle.schema === VISIBILITY_OUTCOME_BUNDLE_SCHEMA, 'unsupported visibility outcome bundle schema');
  assert(Array.isArray(bundle.observations) && bundle.observations.length > 0, 'bundle.observations is required');
  assert(bundle.observations.length <= 500, 'bundle.observations exceeds 500 entries');
  const observations = bundle.observations.map((observation) =>
    normalizeVisibilityOutcome(observation, { allowedProjectIds }));
  assert(new Set(observations.map((observation) => observation.id)).size === observations.length, 'bundle reuses an observation id');
  return observations;
}

export function defaultVisibilityOutcomePath({ home = process.env.HOME ?? '' } = {}) {
  return join(home, '.fleet', 'visibility-outcomes', 'ledger.jsonl');
}

export function readVisibilityOutcomes({ path = defaultVisibilityOutcomePath() } = {}) {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .flatMap((line) => {
      try {
        const value = JSON.parse(line);
        if (value?.schemaVersion !== VISIBILITY_OUTCOME_SCHEMA) return [];
        return [normalizeVisibilityOutcome({
          id: value.id,
          projectId: value.projectId,
          family: value.family,
          provider: value.provider,
          scope: value.scope,
          observedAt: value.observedAt,
          period: value.period,
          metrics: Array.isArray(value.metrics)
            ? value.metrics.map((metric) => ({ label: metric?.label, value: metric?.value }))
            : value.metrics,
          searchTerms: value.searchTerms,
        })];
      } catch {
        return [];
      }
    })
    .sort((left, right) => Date.parse(left.observedAt) - Date.parse(right.observedAt));
}

export function appendVisibilityOutcomeBundle(
  bundle,
  { path = defaultVisibilityOutcomePath(), allowedProjectIds } = {},
) {
  const observations = prepareVisibilityOutcomeBundle(bundle, { allowedProjectIds });
  const existing = readVisibilityOutcomes({ path });
  const byId = new Map(existing.map((observation) => [observation.id, observation]));
  const pending = [];
  let duplicates = 0;
  for (const observation of observations) {
    const previous = byId.get(observation.id);
    if (!previous) {
      pending.push(observation);
      continue;
    }
    assert(stableJson(previous) === stableJson(observation), `observation id conflict: ${observation.id}`);
    duplicates += 1;
  }
  if (pending.length > 0) {
    mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
    appendFileSync(path, `${pending.map((observation) => JSON.stringify(observation)).join('\n')}\n`, {
      encoding: 'utf8',
      mode: 0o600,
    });
    chmodSync(path, 0o600);
  }
  return {
    schema: 'fleet.visibility-outcome-ingest-receipt.v1',
    recorded: pending.length,
    duplicates,
    observations,
  };
}
