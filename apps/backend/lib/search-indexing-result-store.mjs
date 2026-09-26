import {
  appendFileSync,
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

export const SEARCH_INDEXING_RESULT_SCHEMA = 'fleet.search-indexing-result.v1';

const IDENTIFIER = /^[a-z0-9][a-z0-9._:-]{0,159}$/;
const RESULT_STATES = new Set(['indexed', 'not-indexed', 'unknown', 'unavailable']);

function normalizeTimestamp(value, path) {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) {
    throw new Error(`${path} must be ISO-8601`);
  }
  return new Date(value).toISOString();
}

function normalizeHttpsUrl(value, path) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error();
    return url.href;
  } catch {
    throw new Error(`${path} must be an HTTPS URL`);
  }
}

function normalizeBoundedText(value, path, maximum = 300) {
  if (value == null) return null;
  const normalized = String(value).replace(/\s+/g, ' ').trim();
  if (!normalized) return null;
  if (normalized.length > maximum) throw new Error(`${path} exceeds ${maximum} characters`);
  return normalized;
}

function normalizeSearchIndexingResult(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('indexing result must be an object');
  }
  const allowed = new Set([
    'schemaVersion',
    'projectId',
    'inspectedUrl',
    'checkedAt',
    'state',
    'verdict',
    'coverageState',
    'robotsTxtState',
    'indexingState',
    'pageFetchState',
    'lastCrawlTime',
    'googleCanonical',
    'failureReason',
  ]);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) throw new Error(`indexing result.${key} is not allowed`);
  }
  if (value.schemaVersion !== SEARCH_INDEXING_RESULT_SCHEMA) {
    throw new Error('unsupported indexing result schema');
  }
  if (typeof value.projectId !== 'string' || !IDENTIFIER.test(value.projectId)) {
    throw new Error('indexing result.projectId is invalid');
  }
  if (!RESULT_STATES.has(value.state)) {
    throw new Error('indexing result.state is invalid');
  }
  const result = {
    schemaVersion: SEARCH_INDEXING_RESULT_SCHEMA,
    projectId: value.projectId,
    inspectedUrl: normalizeHttpsUrl(value.inspectedUrl, 'indexing result.inspectedUrl'),
    checkedAt: normalizeTimestamp(value.checkedAt, 'indexing result.checkedAt'),
    state: value.state,
  };
  for (const [key, maximum] of [
    ['verdict', 40],
    ['coverageState', 300],
    ['robotsTxtState', 80],
    ['indexingState', 80],
    ['pageFetchState', 80],
    ['failureReason', 300],
  ]) {
    const normalized = normalizeBoundedText(value[key], `indexing result.${key}`, maximum);
    if (normalized) result[key] = normalized;
  }
  if (value.lastCrawlTime != null) {
    result.lastCrawlTime = normalizeTimestamp(value.lastCrawlTime, 'indexing result.lastCrawlTime');
  }
  if (value.googleCanonical != null) {
    result.googleCanonical = normalizeHttpsUrl(value.googleCanonical, 'indexing result.googleCanonical');
  }
  return result;
}

export function defaultSearchIndexingResultPath({ home = process.env.HOME ?? '' } = {}) {
  return join(home, '.fleet', 'search-indexing-requests', 'results.jsonl');
}

export function readSearchIndexingResults({ path = defaultSearchIndexingResultPath() } = {}) {
  if (!existsSync(path)) return [];
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [normalizeSearchIndexingResult(JSON.parse(line))];
      } catch {
        return [];
      }
    })
    .sort((left, right) => Date.parse(left.checkedAt) - Date.parse(right.checkedAt));
}

export function appendSearchIndexingResult(result, {
  path = defaultSearchIndexingResultPath(),
} = {}) {
  const normalized = normalizeSearchIndexingResult(result);
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  appendFileSync(path, `${JSON.stringify(normalized)}\n`, { encoding: 'utf8', mode: 0o600 });
  chmodSync(path, 0o600);
  return normalized;
}
