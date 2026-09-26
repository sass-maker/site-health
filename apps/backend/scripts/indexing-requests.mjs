#!/usr/bin/env node
/**
 * Fleet indexing requests — the indexmysite-style loop for canonical product
 * domains: submit URLs for discovery (IndexNow + the sitemaps Google already
 * receives through --discovery-cycle), then track each URL's Google index
 * status through the URL Inspection API until indexed or day 14.
 *
 * Commands:
 *   submit --project <id> --sitemap            Record every sitemap URL + notify IndexNow
 *   submit --project <id> --url <u> [--url …]  Record explicit URLs on the project's domains
 *   submit --url <https://…> [--url …]         Resolve the owning project by host
 *   submit --file <path>                       One URL per line
 *   check  [--project <id>] [--now] [--max n]  Inspect open requests in Search Console
 *   status [--project <id>] [--format json]    Per-URL state from the local ledgers
 *
 * Ledgers live at ~/.fleet/search-indexing-requests/{ledger,results}.jsonl.
 * Google checks use `gcloud auth application-default` credentials.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  appendSearchIndexingRequest,
  readSearchIndexingRequests,
  SEARCH_INDEXING_REQUEST_SCHEMA,
} from '../lib/search-indexing-request-store.mjs';
import {
  appendSearchIndexingResult,
  readSearchIndexingResults,
  SEARCH_INDEXING_RESULT_SCHEMA,
} from '../lib/search-indexing-result-store.mjs';
import {
  inspectSearchConsoleUrl,
  listSearchConsoleProperties,
  selectSearchConsoleProperty,
} from '../lib/search-console.mjs';
import { validateRootBrandContract } from '../lib/root-brand-contract.mjs';
import { validateRootSearchQueryContract } from '../lib/root-search-query-contract.mjs';
import { searchConsoleProjects } from '../lib/visibility-projects.mjs';

const REPOSITORY_ROOT = resolve(import.meta.dirname, '../../..');
const catalog = JSON.parse(readFileSync(resolve(REPOSITORY_ROOT, 'apps/backend/config/projects.json'), 'utf8'));
const searchConsoleConfig = JSON.parse(readFileSync(resolve(REPOSITORY_ROOT, 'apps/backend/config/search-console.json'), 'utf8'));
const indexNowConfig = JSON.parse(readFileSync(resolve(REPOSITORY_ROOT, 'apps/backend/config/indexnow.json'), 'utf8'));

const FIRST_CHECK_MIN_AGE_MS = 20 * 60 * 60 * 1000;
const RECHECK_MIN_AGE_MS = 20 * 60 * 60 * 1000;
const FINAL_AGE_MS = 14 * 24 * 60 * 60 * 1000;
const INSPECTION_CONCURRENCY = 4;

const args = process.argv.slice(2);
const command = args[0];
const flag = (name) => args.includes(name);
const opt = (name) => {
  const index = args.indexOf(name);
  const value = args[index + 1];
  return index >= 0 && value && !value.startsWith('--') ? value : null;
};
const optAll = (name) => {
  const values = [];
  args.forEach((arg, index) => {
    if (arg === name && args[index + 1] && !args[index + 1].startsWith('--')) values.push(args[index + 1]);
  });
  return values;
};

const dryRun = flag('--dry-run');
const verbose = flag('--verbose') || flag('-v');
const onlyProject = opt('--project');

const rootBrands = JSON.parse(readFileSync(resolve(REPOSITORY_ROOT, 'apps/backend/config/root-brands.json'), 'utf8'));
const rootQueries = JSON.parse(readFileSync(resolve(REPOSITORY_ROOT, 'apps/backend/config/root-search-queries.json'), 'utf8'));
const brandMap = validateRootBrandContract(rootBrands, catalog.projects ?? []);
const rootsByDomain = validateRootSearchQueryContract(rootQueries, brandMap, catalog.projects ?? []);
const eligible = searchConsoleProjects(catalog, rootsByDomain);

function normalizeDomain(value) {
  return String(value ?? '').trim().toLowerCase().replace(/^www\./, '');
}

function hostBelongsToDomain(hostname, domain) {
  return hostname === domain || hostname.endsWith(`.${domain}`);
}

function projectDomains(project) {
  return (project.domains ?? []).map(normalizeDomain).filter(Boolean);
}

/** Resolve which eligible project owns a URL's host, if any. */
function projectForUrl(url) {
  let hostname;
  try {
    hostname = normalizeDomain(new URL(url).hostname);
  } catch {
    return null;
  }
  return eligible.find((project) =>
    projectDomains(project).some((domain) => hostBelongsToDomain(hostname, domain))) ?? null;
}

function keyOf(entry) {
  return `${entry.projectId}${entry.inspectedUrl}`;
}

/** Latest request per (projectId, inspectedUrl). */
function latestRequests(requests) {
  const latest = new Map();
  for (const request of requests) {
    const key = keyOf(request);
    const previous = latest.get(key);
    if (!previous || Date.parse(request.requestedAt) > Date.parse(previous.requestedAt)) {
      latest.set(key, request);
    }
  }
  return latest;
}

function resultsFor(results, request) {
  const requestedAt = Date.parse(request.requestedAt);
  return results
    .filter((result) =>
      keyOf(result) === keyOf(request) && Date.parse(result.checkedAt) >= requestedAt)
    .sort((left, right) => Date.parse(left.checkedAt) - Date.parse(right.checkedAt));
}

/**
 * indexmysite-style lifecycle: queued → checking → indexed | not-indexed.
 * A request stays open until an 'indexed' verdict or FINAL_AGE_MS elapses.
 */
function classify(request, results, now = Date.now()) {
  const seen = resultsFor(results, request);
  const last = seen[seen.length - 1] ?? null;
  const ageMs = now - Date.parse(request.requestedAt);
  const indexed = seen.some((result) => result.state === 'indexed');
  let state;
  if (indexed) state = 'indexed';
  else if (!last) state = 'queued';
  else if (last.state === 'unavailable') state = 'unavailable';
  else if (ageMs >= FINAL_AGE_MS) state = 'not-indexed';
  else state = 'checking';
  return {
    request,
    state,
    open: state === 'queued' || state === 'checking' || state === 'unavailable',
    checks: seen.length,
    lastCheck: last?.checkedAt ?? null,
    lastResult: last,
    ageMs,
  };
}

function openRequests({ projectId = null } = {}) {
  const requests = readSearchIndexingRequests();
  const results = readSearchIndexingResults();
  return [...latestRequests(requests).values()]
    .filter((request) => !projectId || request.projectId === projectId)
    .map((request) => classify(request, results))
    .filter((entry) => entry.open);
}

function accessToken() {
  const result = spawnSync(
    'gcloud',
    ['auth', 'application-default', 'print-access-token'],
    { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );
  if (result.status !== 0 || !result.stdout.trim()) {
    throw new Error('Google Application Default Credentials are unavailable');
  }
  return result.stdout.trim();
}

async function fetchText(url, { retries = 2 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), indexNowConfig.timeoutMs ?? 20000);
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': indexNowConfig.userAgent ?? 'fleet-indexnow/2.0' },
        signal: controller.signal,
      });
      clearTimeout(timer);
      if ((response.status === 429 || response.status >= 500) && attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
        continue;
      }
      return { ok: response.ok, status: response.status, text: await response.text() };
    } catch (error) {
      clearTimeout(timer);
      lastError = error;
      if (attempt < retries) await new Promise((r) => setTimeout(r, 500 * 2 ** attempt));
    }
  }
  throw lastError ?? new Error(`fetch failed: ${url}`);
}

function looksLikeHtml(text) {
  const head = text.slice(0, 200).toLowerCase();
  return head.includes('<!doctype') || head.includes('<html') || head.includes('<head');
}

function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
}

async function collectSitemapUrls(origin, max = Infinity) {
  const candidates = [`${origin}/sitemap.xml`, `${origin}/sitemap-index.xml`, `${origin}/sitemap_index.xml`];
  try {
    const robots = await fetchText(`${origin}/robots.txt`, { retries: 1 });
    if (robots.ok && !looksLikeHtml(robots.text)) {
      for (const line of robots.text.split(/\r?\n/)) {
        const match = line.match(/^\s*Sitemap:\s*(\S+)/i);
        if (match) candidates.unshift(match[1].replace(/\/$/, ''));
      }
    }
  } catch { /* robots unavailable */ }

  const seen = new Set();
  const queue = candidates.filter((candidate) => !seen.has(candidate) && seen.add(candidate));
  const urls = [];
  while (queue.length && urls.length < max) {
    const sitemapUrl = queue.shift();
    let result;
    try {
      result = await fetchText(sitemapUrl, { retries: 1 });
    } catch (error) {
      if (verbose) console.warn(`  sitemap fail ${sitemapUrl}: ${error.message}`);
      continue;
    }
    if (!result.ok || looksLikeHtml(result.text)) continue;
    const isIndex = /<sitemapindex/i.test(result.text);
    for (const loc of extractLocs(result.text)) {
      if (isIndex) {
        if (!seen.has(loc) && seen.add(loc)) queue.push(loc);
        continue;
      }
      try {
        if (new URL(loc).host !== new URL(origin).host) continue;
      } catch { continue; }
      if (!urls.includes(loc)) urls.push(loc);
      if (urls.length >= max) break;
    }
  }
  if (!urls.includes(`${origin}/`)) urls.unshift(`${origin}/`);
  return urls.slice(0, max);
}

async function indexNowKeyIsLive(domain) {
  try {
    const result = await fetchText(`https://${domain}/${indexNowConfig.key}.txt`, { retries: 1 });
    return result.ok && result.text.trim() === indexNowConfig.key;
  } catch {
    return false;
  }
}

async function indexNowNotify(host, urls) {
  if (!urls.length) return { submitted: 0, batchesOk: 0, batchesFail: 0 };
  if (!dryRun && !(await indexNowKeyIsLive(host))) {
    console.warn(`  ${host}: IndexNow key not live at https://${host}/${indexNowConfig.key}.txt — skipped`);
    return { submitted: 0, batchesOk: 0, batchesFail: 1 };
  }
  const batchSize = Number(indexNowConfig.batchSize) || 100;
  let submitted = 0;
  let batchesOk = 0;
  let batchesFail = 0;
  for (let i = 0; i < urls.length; i += batchSize) {
    const batch = urls.slice(i, i + batchSize);
    if (dryRun) {
      console.log(`  [dry-run] POST ${indexNowConfig.endpoint} host=${host} urls=${batch.length}`);
      batchesOk += 1;
      submitted += batch.length;
      continue;
    }
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), indexNowConfig.timeoutMs ?? 20000);
    try {
      const response = await fetch(indexNowConfig.endpoint, {
        method: 'POST',
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'user-agent': indexNowConfig.userAgent ?? 'fleet-indexnow/2.0',
        },
        body: JSON.stringify({
          host,
          key: indexNowConfig.key,
          keyLocation: `https://${host}/${indexNowConfig.key}.txt`,
          urlList: batch,
        }),
        signal: controller.signal,
      });
      if (response.status === 200 || response.status === 202) {
        batchesOk += 1;
        submitted += batch.length;
      } else {
        batchesFail += 1;
        const body = (await response.text()).slice(0, 200);
        console.error(`  ${host}: IndexNow batch failed status=${response.status} ${body}`);
      }
    } catch (error) {
      batchesFail += 1;
      console.error(`  ${host}: IndexNow batch failed ${error.message}`);
    } finally {
      clearTimeout(timer);
    }
    if (!dryRun) await new Promise((r) => setTimeout(r, 300));
  }
  return { submitted, batchesOk, batchesFail };
}

async function collectSubmitUrls() {
  const filePath = opt('--file');
  const explicit = [...optAll('--url')];
  if (filePath) {
    if (!existsSync(filePath)) throw new Error(`Missing URL file: ${filePath}`);
    for (const line of readFileSync(filePath, 'utf8').split(/\r?\n/)) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) explicit.push(trimmed);
    }
  }
  const sitemap = flag('--sitemap');
  const entries = [];
  for (const url of explicit) {
    let normalized;
    try {
      normalized = new URL(url).href;
      if (!normalized.startsWith('https://')) throw new Error();
    } catch {
      throw new Error(`Not an HTTPS URL: ${url}`);
    }
    const project = onlyProject
      ? eligible.find((candidate) => candidate.id === onlyProject)
      : projectForUrl(normalized);
    if (!project) {
      throw new Error(`No eligible catalog project owns ${url} — pass --project for a domain it owns`);
    }
    if (onlyProject) {
      const hostname = normalizeDomain(new URL(normalized).hostname);
      if (!projectDomains(project).some((domain) => hostBelongsToDomain(hostname, domain))) {
        throw new Error(`${url} is not on a domain owned by ${onlyProject}`);
      }
    }
    entries.push({ projectId: project.id, url: normalized });
  }
  if (sitemap) {
    if (!onlyProject) throw new Error('--sitemap requires --project <id>');
    const project = eligible.find((candidate) => candidate.id === onlyProject);
    if (!project) throw new Error(`Unknown Search Console project: ${onlyProject}`);
    const domain = projectDomains(project)[0];
    const urls = await collectSitemapUrls(`https://${domain}`);
    console.log(`Collect ${domain}… ${urls.length} urls`);
    for (const url of urls) entries.push({ projectId: project.id, url });
  }
  if (entries.length === 0) {
    throw new Error('Nothing to submit — pass --url, --file, or --project <id> --sitemap');
  }
  const deduped = new Map();
  for (const entry of entries) deduped.set(`${entry.projectId} ${entry.url}`, entry);
  return [...deduped.values()];
}

async function submit() {
  const entries = await collectSubmitUrls();
  const open = new Set(openRequests().map((entry) => keyOf(entry.request)));
  const fresh = entries.filter(
    (entry) => !open.has(`${entry.projectId} ${entry.url}`),
  );
  const skipped = entries.length - fresh.length;
  const now = new Date().toISOString();
  for (const entry of fresh) {
    if (!dryRun) {
      appendSearchIndexingRequest({
        schemaVersion: SEARCH_INDEXING_REQUEST_SCHEMA,
        projectId: entry.projectId,
        inspectedUrl: entry.url,
        requestedAt: now,
      });
    }
  }
  const byProject = new Map();
  for (const entry of fresh) {
    const list = byProject.get(entry.projectId) ?? [];
    list.push(entry.url);
    byProject.set(entry.projectId, list);
  }
  console.log(`\nJob created · ${fresh.length} URL${fresh.length === 1 ? '' : 's'} queued${skipped ? ` · ${skipped} already open` : ''}${dryRun ? ' (dry-run)' : ''}`);
  for (const [projectId, urls] of byProject) {
    console.log(`▸ ${projectId}: ${urls.length} new`);
    const byHost = new Map();
    for (const url of urls) {
      const host = new URL(url).host;
      byHost.set(host, [...(byHost.get(host) ?? []), url]);
    }
    for (const [host, hostUrls] of byHost) {
      const outcome = await indexNowNotify(host, hostUrls);
      if (outcome.submitted > 0) console.log(`  ${host}: IndexNow notified for ${outcome.submitted} url(s)`);
    }
  }
  console.log('Note: Google discovery runs through Search Console sitemaps; `check` inspects each URL after ~24h, then daily until indexed or day 14.');
}

async function check() {
  const max = flag('--max') ? Number(opt('--max')) || Infinity : Infinity;
  const checkNow = flag('--now');
  const now = Date.now();
  const due = openRequests({ projectId: onlyProject }).filter((entry) => {
    if (entry.checks > 0 && entry.ageMs >= FINAL_AGE_MS) return false;
    if (!checkNow && entry.checks === 0 && entry.ageMs < FIRST_CHECK_MIN_AGE_MS) return false;
    if (!checkNow && entry.lastCheck && now - Date.parse(entry.lastCheck) < RECHECK_MIN_AGE_MS) return false;
    return true;
  }).slice(0, max);

  if (due.length === 0) {
    console.log('No requests due for inspection.');
    return;
  }
  let token = accessToken();
  const properties = await listSearchConsoleProperties({
    accessToken: token,
    quotaProject: searchConsoleConfig.quotaProject,
  });
  async function inspect(entry, siteUrl) {
    try {
      return await inspectSearchConsoleUrl({
        inspectionUrl: entry.request.inspectedUrl,
        siteUrl,
        accessToken: token,
        quotaProject: searchConsoleConfig.quotaProject,
      });
    } catch (error) {
      if (!/\(401\)/.test(String(error?.message ?? error))) throw error;
      token = accessToken();
      return inspectSearchConsoleUrl({
        inspectionUrl: entry.request.inspectedUrl,
        siteUrl,
        accessToken: token,
        quotaProject: searchConsoleConfig.quotaProject,
      });
    }
  }
  const siteUrlByProject = new Map();
  let done = 0;
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < due.length) {
      const entry = due[nextIndex];
      nextIndex += 1;
      const project = eligible.find((candidate) => candidate.id === entry.request.projectId);
      const domain = projectDomains(project ?? {})[0]
        ?? normalizeDomain(new URL(entry.request.inspectedUrl).hostname);
      let siteUrl = siteUrlByProject.get(entry.request.projectId);
      if (siteUrl === undefined) {
        siteUrl = domain ? selectSearchConsoleProperty(domain, properties)?.siteUrl ?? null : null;
        siteUrlByProject.set(entry.request.projectId, siteUrl);
      }
      const outcome = siteUrl
        ? await inspect(entry, siteUrl)
        : {
            inspectedUrl: entry.request.inspectedUrl,
            state: 'unavailable',
            verdict: null,
            coverageState: null,
            failureReason: 'property-unavailable',
          };
      const record = {
        schemaVersion: SEARCH_INDEXING_RESULT_SCHEMA,
        projectId: entry.request.projectId,
        inspectedUrl: entry.request.inspectedUrl,
        checkedAt: new Date().toISOString(),
        state: outcome.state,
        ...(outcome.verdict ? { verdict: outcome.verdict } : {}),
        ...(outcome.coverageState ? { coverageState: outcome.coverageState } : {}),
        ...(outcome.robotsTxtState ? { robotsTxtState: outcome.robotsTxtState } : {}),
        ...(outcome.indexingState ? { indexingState: outcome.indexingState } : {}),
        ...(outcome.pageFetchState ? { pageFetchState: outcome.pageFetchState } : {}),
        ...(outcome.lastCrawlTime ? { lastCrawlTime: outcome.lastCrawlTime } : {}),
        ...(outcome.googleCanonical ? { googleCanonical: outcome.googleCanonical } : {}),
        ...(outcome.failureReason ? { failureReason: outcome.failureReason } : {}),
      };
      if (!dryRun) appendSearchIndexingResult(record);
      done += 1;
      console.log(`${outcome.state === 'indexed' ? '✓' : '·'} ${entry.request.inspectedUrl} → ${outcome.state}${outcome.coverageState ? ` (${outcome.coverageState})` : ''}`);
    }
  }
  await Promise.all(Array.from({ length: Math.min(INSPECTION_CONCURRENCY, due.length) }, worker));
  console.log(`\nInspected ${done} url(s).`);
}

async function status() {
  const format = opt('--format') ?? 'markdown';
  const requests = readSearchIndexingRequests();
  const results = readSearchIndexingResults();
  const rows = [...latestRequests(requests).values()]
    .filter((request) => !onlyProject || request.projectId === onlyProject)
    .map((request) => classify(request, results))
    .sort((left, right) => Date.parse(right.request.requestedAt) - Date.parse(left.request.requestedAt));

  if (format === 'json') {
    console.log(JSON.stringify({
      schema: 'fleet.search-indexing-status.v1',
      observedAt: new Date().toISOString(),
      entries: rows.map((entry) => ({
        projectId: entry.request.projectId,
        inspectedUrl: entry.request.inspectedUrl,
        requestedAt: entry.request.requestedAt,
        state: entry.state,
        checks: entry.checks,
        lastCheck: entry.lastCheck,
        coverageState: entry.lastResult?.coverageState ?? null,
      })),
    }, null, 2));
    return;
  }

  if (rows.length === 0) {
    console.log('No indexing requests recorded.');
    return;
  }
  const totals = {};
  for (const entry of rows) totals[entry.state] = (totals[entry.state] ?? 0) + 1;
  console.log(`# Indexing requests\n`);
  console.log(`URLs: ${rows.length} — ${Object.entries(totals).map(([state, count]) => `${state} ${count}`).join(' · ')}\n`);
  console.log('| Project | URL | Submitted | Checks | Last check | State | Coverage |');
  console.log('| --- | --- | --- | ---: | --- | --- | --- |');
  for (const entry of rows) {
    const coverage = entry.lastResult?.coverageState ?? '—';
    const lastCheck = entry.lastCheck ? entry.lastCheck.slice(0, 16).replace('T', ' ') : '—';
    console.log(`| ${entry.request.projectId} | ${entry.request.inspectedUrl} | ${entry.request.requestedAt.slice(0, 16).replace('T', ' ')} | ${entry.checks} | ${lastCheck} | ${entry.state} | ${coverage} |`);
  }
}

const commands = { submit, check, status };
if (!commands[command]) {
  console.error('Usage: indexing-requests.mjs <submit|check|status> [options]');
  process.exit(1);
}
commands[command]().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
