import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import {
  chmod,
  mkdir,
  open,
  readFile,
  rename,
  unlink,
} from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { defaultDatabasePath } from './dashboard-backend/store.mjs';
import { normalizedDomain, registrableDomain } from './dashboard-backend/domain-scope.mjs';

export const DOMAIN_RATING_PROVIDER = 'ahrefs';
export const DOMAIN_RATING_METRIC = 'domain-rating';
export const DOMAIN_RATING_VERSION = 'dr3';
export const DOMAIN_RATING_SCHEMA = 'site-health.domain-ratings.v1';
export const AHREFS_DOMAIN_RATING_URL = 'https://api.ahrefs.com/v3/public/domain-rating-free?output=json';

const KEYCHAIN_SERVICE = 'com.sassmaker.site-health.ahrefs-public';
const KEYCHAIN_ACCOUNT = 'owner';
const LOCK_WAIT_MS = 5_000;
const MAX_RESPONSE_BYTES = 256_000;

export class DomainRatingCollectionError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'DomainRatingCollectionError';
    this.code = code;
  }
}

export function defaultDomainRatingHistoryPath({ home = process.env.HOME } = {}) {
  return join(dirname(defaultDatabasePath({ home })), 'domain-ratings.json');
}

function fail(code, message) {
  throw new DomainRatingCollectionError(code, message);
}

function domainRoot(value) {
  const hostname = normalizedDomain(value);
  return hostname ? registrableDomain(hostname) : null;
}

function validRating(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0 && value <= 100;
}

function validTimestamp(value) {
  return typeof value === 'number' && Number.isFinite(value) && Number.isFinite(new Date(value).getTime());
}

function validHistoryEntry(entry) {
  return entry && typeof entry === 'object' && validTimestamp(entry.ts) && validRating(entry.dr);
}

export function emptyDomainRatingHistory() {
  return {
    schemaVersion: DOMAIN_RATING_SCHEMA,
    provider: DOMAIN_RATING_PROVIDER,
    metric: DOMAIN_RATING_METRIC,
    version: DOMAIN_RATING_VERSION,
    updatedAt: null,
    domains: {},
  };
}

export function parseDomainRatingHistory(value, { strict = true } = {}) {
  if (!value || typeof value !== 'object' || Array.isArray(value)
    || value.schemaVersion !== DOMAIN_RATING_SCHEMA
    || value.provider !== DOMAIN_RATING_PROVIDER
    || value.metric !== DOMAIN_RATING_METRIC
    || value.version !== DOMAIN_RATING_VERSION
    || !value.domains || typeof value.domains !== 'object' || Array.isArray(value.domains)) {
    fail('DOMAIN_RATING_HISTORY_INVALID', 'Local domain-rating history has an unsupported format.');
  }

  const domains = {};
  for (const [domain, record] of Object.entries(value.domains)) {
    const root = domainRoot(domain);
    if (!root || !record || typeof record !== 'object' || Array.isArray(record)
      || !Array.isArray(record.history)) {
      if (!strict && root) {
        domains[root] = { history: [] };
        continue;
      }
      fail('DOMAIN_RATING_HISTORY_INVALID', 'Local domain-rating history has an unsupported format.');
    }
    const history = record.history.flatMap((entry) => {
      if (!validHistoryEntry(entry)) {
        if (!strict) return [];
        fail('DOMAIN_RATING_HISTORY_INVALID', 'Local domain-rating history contains an invalid observation.');
      }
      return [{ ts: entry.ts, dr: entry.dr }];
    }).sort((left, right) => left.ts - right.ts);
    if (domains[root]) {
      fail('DOMAIN_RATING_HISTORY_INVALID', 'Local domain-rating history repeats a domain root.');
    }
    domains[root] = { history };
  }
  const updatedAt = value.updatedAt === null
    ? null
    : typeof value.updatedAt === 'string' && Number.isFinite(Date.parse(value.updatedAt))
      ? new Date(value.updatedAt).toISOString()
      : fail('DOMAIN_RATING_HISTORY_INVALID', 'Local domain-rating history has an invalid update time.');

  return {
    schemaVersion: DOMAIN_RATING_SCHEMA,
    provider: DOMAIN_RATING_PROVIDER,
    metric: DOMAIN_RATING_METRIC,
    version: DOMAIN_RATING_VERSION,
    updatedAt,
    domains,
  };
}

export async function readDomainRatingHistory(path) {
  try {
    return parseDomainRatingHistory(JSON.parse(await readFile(path, 'utf8')));
  } catch (error) {
    if (error?.code === 'ENOENT') return emptyDomainRatingHistory();
    if (error instanceof DomainRatingCollectionError) throw error;
    fail('DOMAIN_RATING_HISTORY_INVALID', 'Local domain-rating history is unreadable.');
  }
}

export function readAhrefsPublicKey({ platform = process.platform, readKeychain = execFileSync } = {}) {
  if (platform !== 'darwin') return null;
  try {
    return String(readKeychain('/usr/bin/security', [
      'find-generic-password',
      '-s', KEYCHAIN_SERVICE,
      '-a', KEYCHAIN_ACCOUNT,
      '-w',
    ], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], timeout: 5_000 })).trim() || null;
  } catch {
    return null;
  }
}

async function acquireHistoryLock(path, {
  waitMs = LOCK_WAIT_MS,
  pause = (duration) => new Promise((resolve) => setTimeout(resolve, duration)),
  now = Date.now,
} = {}) {
  const lockPath = `${path}.lock`;
  const deadline = now() + waitMs;
  const owner = { pid: process.pid, token: randomUUID(), createdAt: new Date(now()).toISOString() };
  while (now() <= deadline) {
    let handle;
    let created = false;
    try {
      handle = await open(lockPath, 'wx', 0o600);
      created = true;
      await handle.writeFile(JSON.stringify(owner));
      await handle.sync();
      await handle.close();
      return async () => {
        try {
          const current = JSON.parse(await readFile(lockPath, 'utf8'));
          if (current.token === owner.token) await unlink(lockPath);
        } catch (error) {
          if (error?.code !== 'ENOENT') throw error;
        }
      };
    } catch (error) {
      await handle?.close().catch(() => {});
      if (created) await unlink(lockPath).catch(() => {});
      if (error?.code !== 'EEXIST') {
        if (error?.code === 'EACCES' || error?.code === 'EPERM') {
          fail('DOMAIN_RATING_STORAGE_UNAVAILABLE', 'Local domain-rating history cannot be written.');
        }
        throw error;
      }
      await pause(Math.min(100, Math.max(10, deadline - now())));
    }
  }
  let ownerDetail = 'owner details unavailable';
  try {
    const recorded = JSON.parse(await readFile(lockPath, 'utf8'));
    const pid = Number.isInteger(recorded.pid) && recorded.pid > 0 ? recorded.pid : 'unknown';
    const createdAt = typeof recorded.createdAt === 'string' && Number.isFinite(Date.parse(recorded.createdAt))
      ? new Date(recorded.createdAt).toISOString() : 'unknown';
    ownerDetail = `recorded PID ${pid}, created ${createdAt}`;
  } catch { /* A lock can disappear or be unreadable while reporting contention. */ }
  fail('DOMAIN_RATING_STORAGE_BUSY', `Domain-rating history lock exists at ${lockPath} (${ownerDetail}). It may be active or abandoned. Retry, or follow the documented recovery after confirming its owner has stopped.`);
}

async function writeHistoryAtomically(path, history) {
  const tempPath = `${path}.${process.pid}.${randomUUID()}.tmp`;
  let handle;
  try {
    handle = await open(tempPath, 'wx', 0o600);
    await handle.writeFile(`${JSON.stringify(history, null, 2)}\n`);
    await handle.sync();
    await handle.close();
    handle = null;
    await rename(tempPath, path);
    await chmod(path, 0o600);
    const directory = await open(dirname(path), 'r');
    try { await directory.sync(); } finally { await directory.close(); }
  } catch {
    fail('DOMAIN_RATING_STORAGE_UNAVAILABLE', 'Local domain-rating history could not be saved safely.');
  } finally {
    await handle?.close().catch(() => {});
    await unlink(tempPath).catch(() => {});
  }
}

function parseProviderResponse(payload, targets) {
  const rows = payload?.domain_rating?.targets;
  if (!Array.isArray(rows)) {
    fail('AHREFS_RESPONSE_INVALID', 'Ahrefs returned an unsupported Domain Rating response.');
  }
  const requested = new Set(targets);
  const ratings = new Map();
  const invalid = new Set();
  for (const row of rows) {
    const root = domainRoot(row?.target);
    if (!root || !requested.has(root)) continue;
    if (ratings.has(root) || invalid.has(root) || !validRating(row.domain_rating)) {
      ratings.delete(root);
      invalid.add(root);
      continue;
    }
    ratings.set(root, row.domain_rating);
  }
  return { ratings, invalid };
}

function mergeRatings(history, ratings, observedAt) {
  const timestamp = Date.parse(observedAt);
  if (!Number.isFinite(timestamp)) fail('DOMAIN_RATING_TIME_INVALID', 'Domain Rating observation time is invalid.');
  const day = new Date(timestamp).toISOString().slice(0, 10);
  const domains = structuredClone(history.domains);
  for (const [domain, rating] of ratings) {
    const record = domains[domain] ?? { history: [] };
    const observations = record.history.filter((entry) => new Date(entry.ts).toISOString().slice(0, 10) !== day);
    observations.push({ ts: timestamp, dr: rating });
    observations.sort((left, right) => left.ts - right.ts);
    domains[domain] = { history: observations };
  }
  return { ...history, updatedAt: new Date(timestamp).toISOString(), domains };
}

export async function collectDomainRatings({
  targets,
  historyPath = defaultDomainRatingHistoryPath(),
  fetchImpl = fetch,
  readKeychain = execFileSync,
  platform = process.platform,
  now = () => new Date().toISOString(),
  lockWaitMs = LOCK_WAIT_MS,
} = {}) {
  const normalizedTargets = [...new Set((targets ?? []).map(domainRoot).filter(Boolean))].sort();
  if (normalizedTargets.length === 0) fail('METRIC_DOMAIN_MISSING', 'No domain-rating targets are configured.');

  await mkdir(dirname(historyPath), { recursive: true, mode: 0o700 });
  await readDomainRatingHistory(historyPath);
  const token = readAhrefsPublicKey({ platform, readKeychain });
  if (!token) fail('AHREFS_KEY_UNAVAILABLE', 'Ahrefs public API key is unavailable in macOS Keychain.');

  let response;
  try {
    response = await fetchImpl(AHREFS_DOMAIN_RATING_URL, {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ targets: normalizedTargets, version: DOMAIN_RATING_VERSION }),
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    fail('AHREFS_REQUEST_FAILED', 'Ahrefs Domain Rating request failed. Local history was retained.');
  }
  if (!response.ok) {
    fail('AHREFS_REQUEST_FAILED', `Ahrefs Domain Rating request failed with HTTP ${response.status}. Local history was retained.`);
  }

  let payload;
  try {
    const body = await response.text();
    if (Buffer.byteLength(body) > MAX_RESPONSE_BYTES) throw new Error('response too large');
    payload = JSON.parse(body);
  } catch {
    fail('AHREFS_RESPONSE_INVALID', 'Ahrefs returned an unreadable Domain Rating response. Local history was retained.');
  }
  const { ratings } = parseProviderResponse(payload, normalizedTargets);
  if (ratings.size === 0) {
    fail('AHREFS_NO_RATINGS', 'Ahrefs returned no valid Domain Ratings. Local history was retained.');
  }

  const observedAt = now();
  const release = await acquireHistoryLock(historyPath, { waitMs: lockWaitMs });
  let updated;
  try {
    const existing = await readDomainRatingHistory(historyPath);
    updated = mergeRatings(existing, ratings, observedAt);
    await writeHistoryAtomically(historyPath, updated);
  } finally {
    await release();
  }

  const missing = normalizedTargets.filter((domain) => !ratings.has(domain));
  if (missing.length > 0) {
    fail(
      'AHREFS_PARTIAL_RESPONSE',
      `Ahrefs returned valid ratings for ${ratings.size} of ${normalizedTargets.length} domains. Missing or invalid targets kept their previous values.`,
    );
  }
  return { provider: DOMAIN_RATING_PROVIDER, version: DOMAIN_RATING_VERSION, resultCount: ratings.size, updatedAt: updated.updatedAt };
}
