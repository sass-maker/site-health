#!/usr/bin/env node
/**
 * Fleet IndexNow submitter — notifies Bing and other IndexNow engines about
 * canonical URLs for every Search Console-eligible project domain.
 *
 * Google is not covered; `search-console-collect.mjs --discovery-cycle` runs
 * this script first and then submits sitemaps to Google.
 *
 * The shared key is served by the `fleet-indexnow-key` worker
 * (apps/backend/indexnow-worker) on /{key}.txt for every domain.
 *
 * Usage:
 *   node scripts/indexnow-submit.mjs [--dry-run] [--force]
 *   node scripts/indexnow-submit.mjs --id storagedaddy | --host example.com | --url https://x/
 *   node scripts/indexnow-submit.mjs --check-keys
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';

import { searchConsoleProjects } from '../lib/visibility-projects.mjs';
import { validateRootBrandContract } from '../lib/root-brand-contract.mjs';
import { validateRootSearchQueryContract } from '../lib/root-search-query-contract.mjs';

const REPOSITORY_ROOT = resolve(import.meta.dirname, '../../..');
const CONFIG_PATH = resolve(REPOSITORY_ROOT, 'apps/backend/config/indexnow.json');
const STATE_PATH = process.env.FLEET_INDEXNOW_STATE_PATH
  ? resolve(process.env.FLEET_INDEXNOW_STATE_PATH)
  : join(homedir(), '.fleet', 'indexnow-state.json');

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => {
  const index = args.indexOf(name);
  const value = args[index + 1];
  return index >= 0 && value && !value.startsWith('-') ? value : null;
};
const dryRun = flag('--dry-run');
const forceAll = flag('--force');
const checkKeys = flag('--check-keys');
const verbose = flag('--verbose') || flag('-v');
const onlyId = opt('--id');
const onlyHost = opt('--host');
const singleUrl = opt('--url');
const maxUrls = flag('--max') ? Number(opt('--max')) || Infinity : Infinity;

const config = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'));
if (!config.key) throw new Error(`Missing IndexNow key in ${CONFIG_PATH}`);

const catalog = JSON.parse(readFileSync(resolve(REPOSITORY_ROOT, 'apps/backend/config/projects.json'), 'utf8'));
const rootBrands = JSON.parse(readFileSync(resolve(REPOSITORY_ROOT, 'apps/backend/config/root-brands.json'), 'utf8'));
const rootQueries = JSON.parse(readFileSync(resolve(REPOSITORY_ROOT, 'apps/backend/config/root-search-queries.json'), 'utf8'));
const brandMap = validateRootBrandContract(rootBrands, catalog.projects ?? []);
const rootsByDomain = validateRootSearchQueryContract(rootQueries, brandMap, catalog.projects ?? []);
const eligible = searchConsoleProjects(catalog, rootsByDomain);
const domains = [...new Set(eligible.map((project) => project.domains?.[0]).filter(Boolean))];

function loadState() {
  if (!existsSync(STATE_PATH)) return { version: 1, submitted: {} };
  try {
    return JSON.parse(readFileSync(STATE_PATH, 'utf8'));
  } catch {
    return { version: 1, submitted: {} };
  }
}

function saveState(state) {
  mkdirSync(dirname(STATE_PATH), { recursive: true });
  writeFileSync(STATE_PATH, `${JSON.stringify(state, null, 2)}\n`, 'utf8');
}

async function fetchText(url, { retries = config.retries ?? 2 } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), config.timeoutMs ?? 20000);
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': config.userAgent ?? 'fleet-indexnow/2.0' },
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

async function collectSitemapUrls(origin) {
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
  while (queue.length && urls.length < maxUrls) {
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
      if (urls.length >= maxUrls) break;
    }
  }
  if (!urls.includes(`${origin}/`)) urls.unshift(`${origin}/`);
  return urls.slice(0, maxUrls);
}

async function keyIsLive(domain) {
  try {
    const result = await fetchText(`https://${domain}/${config.key}.txt`, { retries: 1 });
    return result.ok && result.text.trim() === config.key;
  } catch {
    return false;
  }
}

async function submitBatch(host, urlList) {
  const payload = {
    host,
    key: config.key,
    keyLocation: `https://${host}/${config.key}.txt`,
    urlList,
  };
  if (dryRun) {
    console.log(`  [dry-run] POST ${config.endpoint} host=${host} urls=${urlList.length}`);
    return true;
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), config.timeoutMs ?? 20000);
  try {
    const response = await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'user-agent': config.userAgent ?? 'fleet-indexnow/2.0',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    const body = (await response.text()).slice(0, 200);
    console.log(`  batch: status=${response.status} n=${urlList.length}${body ? ` ${body}` : ''}`);
    return response.status === 200 || response.status === 202;
  } finally {
    clearTimeout(timer);
  }
}

const chunk = (arr, size) => Array.from({ length: Math.ceil(arr.length / size) }, (_, i) => arr.slice(i * size, i * size + size));

if (checkKeys) {
  let live = 0;
  for (const domain of domains) {
    const ok = await keyIsLive(domain);
    if (ok) live += 1;
    console.log(`${ok ? '✓' : '✗'} https://${domain}/${config.key}.txt`);
  }
  console.log(`\n${live}/${domains.length} key files live.`);
  process.exit(live === domains.length ? 0 : 1);
}

const state = loadState();
const work = new Map();
if (singleUrl) {
  const host = new URL(singleUrl).host;
  work.set(host, [singleUrl]);
} else {
  const targets = domains.filter((domain) => (!onlyHost || domain === onlyHost));
  const projects = onlyId ? eligible.filter((p) => p.id === onlyId) : eligible;
  const projectDomains = new Set(projects.map((p) => p.domains?.[0]).filter(Boolean));
  for (const domain of targets.filter((d) => projectDomains.has(d))) {
    try {
      const urls = await collectSitemapUrls(`https://${domain}`);
      console.log(`Collect ${domain}… ${urls.length} urls`);
      work.set(domain, urls);
    } catch (error) {
      console.log(`Collect ${domain}… FAIL: ${error.message}`);
    }
  }
}

let submitted = 0;
let skipped = 0;
let batchesOk = 0;
let batchesFail = 0;

for (const [host, urls] of work) {
  const previous = state.submitted[host]?.urls ?? {};
  const fresh = forceAll ? urls : urls.filter((url) => !previous[url]);
  skipped += urls.length - fresh.length;
  if (fresh.length === 0) {
    console.log(`▸ ${host}: ${urls.length} urls, nothing new`);
    continue;
  }
  if (!dryRun && !(await keyIsLive(host))) {
    console.warn(`▸ ${host}: key not live at https://${host}/${config.key}.txt — skipped`);
    batchesFail += 1;
    continue;
  }
  console.log(`▸ ${host}: ${fresh.length} new urls`);
  for (const batch of chunk(fresh, Number(config.batchSize) || 100)) {
    if (await submitBatch(host, batch)) {
      batchesOk += 1;
      submitted += batch.length;
      if (!dryRun) {
        const now = new Date().toISOString();
        state.submitted[host] = state.submitted[host] ?? { urls: {} };
        state.submitted[host].lastOkAt = now;
        for (const url of batch) state.submitted[host].urls[url] = now;
      }
    } else {
      batchesFail += 1;
    }
    if (!dryRun) await new Promise((r) => setTimeout(r, 300));
  }
}

if (!dryRun && batchesOk > 0) saveState(state);
console.log(`\nDone. urls=${submitted} skipped_already=${skipped} batches_ok=${batchesOk} batches_fail=${batchesFail}${dryRun ? ' (dry-run)' : ''}`);
if (batchesFail > 0) process.exit(1);
