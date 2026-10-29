import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { inspectSearchConsoleUrl, selectSearchConsoleProperty } from './search-console.mjs';

export const COVERAGE_SCHEMA = 'site-health.search-index-coverage.v1';
const DAY = 86400000;
export const defaultIndexCoveragePath = ({ home = homedir() } = {}) => join(home, '.fleet/search-index-coverage/latest.json');
export function currentCoverageProjects(catalog) {
  return (catalog.projects ?? []).filter(p => (p.lifecycle?.portfolioStatus ?? p.portfolio?.status) === 'active');
}
function safeUrl(value, host = null) {
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' || url.username || url.password || url.port || (host && url.hostname !== host)
      || !url.hostname.includes('.') || /(?:^|\.)(?:localhost|local|internal)$/.test(url.hostname)
      || /^[\d.]+$/.test(url.hostname) || url.hostname.includes(':')) return null;
    url.hash = '';
    return url;
  } catch { return null; }
}
export function urlInCoverageScope(value, surfaceUrl) {
  const surface = safeUrl(surfaceUrl);
  const url = surface && safeUrl(value, surface.hostname);
  if (!url) return false;
  const prefix = surface.pathname.replace(/\/+$/, '');
  return !prefix || url.pathname === prefix || url.pathname.startsWith(`${prefix}/`);
}
export function coverageTargets(catalog) {
  return currentCoverageProjects(catalog).map(project => {
    const directory = project.presentation?.directory ?? catalog.publicDirectory?.projects?.[project.id];
    const explicit = directory && Object.hasOwn(directory, 'publicDestinationUrl');
    const domains = project.deployment?.domains ?? project.domains ?? [];
    const candidate = explicit ? directory.publicDestinationUrl : project.systems?.site?.url ?? (domains[0] ? `https://${domains[0]}/` : null);
    const privateOnly = (project.authModel ?? project.deployment?.authModel) === 'private-authenticated' && !project.systems?.site?.url;
    const surface = !privateOnly && safeUrl(candidate);
    return { projectId: project.id, name: project.name ?? project.id,
      surfaceUrl: surface?.href ?? null, domain: surface?.hostname ?? null,
      pathPrefix: surface?.pathname ?? null,
      ...(surface ? {} : { exemption: 'no-public-surface' }) };
  });
}
export function readIndexCoverage({ path = defaultIndexCoveragePath() } = {}) {
  if (!existsSync(path)) return null;
  try { const value = JSON.parse(readFileSync(path, 'utf8')); return value.schema === COVERAGE_SCHEMA && Array.isArray(value.records) ? value : null; } catch { return null; }
}
export function saveIndexCoverage(path, artifact) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const temporary = `${path}.${process.pid}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(artifact, null, 2)}\n`, { mode: 0o600 });
  renameSync(temporary, path);
}
export function summarizeIndexCoverage(record, { now = new Date().toISOString(), maxAgeDays = 7 } = {}) {
  if (!record) return { state: 'not-collected', total: null, indexed: null, indexedPercentage: null, checkedPercentage: null, observedAt: null };
  if (record.exemption) return { state: record.exemption, total: null, indexed: null, indexedPercentage: null, checkedPercentage: null, observedAt: null };
  const inventory = record.inventory;
  const urls = Array.isArray(inventory?.urls) ? inventory.urls : null;
  const counts = { indexed: 0, 'not-indexed': 0, unknown: 0, unavailable: 0, pending: 0, stale: 0 };
  const reasons = {};
  let canonicalMismatch = 0;
  const dates = [];
  const crawlDates = [];
  for (const url of urls ?? []) {
    const result = record.inspections?.[url];
    if (!result) { counts.pending++; continue; }
    const stale = !Number.isFinite(Date.parse(result.observedAt)) || Date.parse(now) - Date.parse(result.observedAt) > maxAgeDays * DAY;
    if (stale) counts.stale++;
    const state = Object.hasOwn(counts, result.state) ? result.state : 'unknown';
    counts[state]++;
    if (result.observedAt) dates.push(result.observedAt);
    if (result.lastCrawlTime) crawlDates.push(result.lastCrawlTime);
    if (result.coverageState) reasons[result.coverageState] = (reasons[result.coverageState] ?? 0) + 1;
    if (result.googleCanonical && result.googleCanonical !== url) canonicalMismatch++;
  }
  const total = urls && (inventory.complete || urls.length > 0) ? urls.length : null;
  const known = counts.indexed + counts['not-indexed'];
  const checked = total === null ? null : total - counts.pending;
  const inventoryFresh = Number.isFinite(Date.parse(inventory?.observedAt)) && Date.parse(now) - Date.parse(inventory.observedAt) <= maxAgeDays * DAY;
  const complete = inventoryFresh && total > 0 && inventory.complete === true && known === total && !counts.stale && !record.failure;
  return { state: complete ? 'complete' : counts.stale || (inventory && !inventoryFresh) ? 'stale' : record.failure ? 'unavailable' : total === null ? 'inventory-unavailable' : 'partial',
    surfaceUrl: record.surfaceUrl, total, indexed: total === null ? null : counts.indexed, checked, known, counts,
    indexedPercentage: complete ? 100 * counts.indexed / total : null,
    checkedPercentage: total > 0 ? 100 * checked / total : null,
    sampleIndexedPercentage: known > 0 ? 100 * counts.indexed / known : null,
    inventoryComplete: inventory?.complete ?? false, inventoryObservedAt: inventory?.observedAt ?? null,
    observedAt: dates.sort()[0] ?? null, lastAttemptAt: record.lastAttemptAt ?? null,
    failure: record.failure ?? null, failures: inventory?.failures ?? [], truncated: inventory?.truncated ?? false,
    canonicalMismatch, reasons, lastCrawlTime: crawlDates.sort().at(-1) ?? null, provenance: 'Google URL Inspection of discovered sitemap URLs',
  };
}
const decodeXml = value => value.replace(/&(?:amp|lt|gt|quot|apos);/g, token => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" })[token]);
export async function inventorySitemap(target, { fetchImpl = fetch, sitemapUrl, maxRequests = 40, maxUrls = 10000, maxBytes = 2000000, maxDepth = 5, now = new Date().toISOString() } = {}) {
  const host = target.domain;
  const failures = [];
  const urls = new Set();
  const seen = new Set();
  const queue = [];
  let truncated = false;
  async function document(url) {
    const safe = safeUrl(url, host);
    if (!safe) throw new Error('Sitemap URL is outside canonical HTTPS host');
    const response = await fetchImpl(safe.href, { method: 'GET', redirect: 'error', signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    if (Number(response.headers?.get?.('content-length')) > maxBytes) throw new Error('Response exceeds byte limit');
    let value = '';
    let bytes = 0;
    if (response.body?.getReader) {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      try { while (true) { const chunk = await reader.read(); if (chunk.done) break; bytes += chunk.value.byteLength; if (bytes > maxBytes) throw new Error('Response exceeds byte limit'); value += decoder.decode(chunk.value, { stream: true }); } value += decoder.decode(); } finally { await reader.cancel(); }
    } else { value = await response.text(); if (Buffer.byteLength(value) > maxBytes) throw new Error('Response exceeds byte limit'); }
    return value;
  }
  if (sitemapUrl) queue.push({ url: sitemapUrl, depth: 0 });
  else {
    try {
      const robots = await document(`https://${host}/robots.txt`);
      for (const line of robots.split(/\r?\n/)) {
        const match = line.match(/^\s*Sitemap:\s*(\S+)/i);
        if (match && safeUrl(match[1], host)) queue.push({ url: match[1], depth: 0 });
      }
    } catch { /* robots is optional; the bounded conventional sitemap is next. */ }
    if (!queue.length) queue.push({ url: `https://${host}/sitemap.xml`, depth: 0 });
  }
  while (queue.length) {
    const entry = queue.shift();
    const url = safeUrl(entry.url, host)?.href;
    if (!url) { failures.push({ url: entry.url, reason: 'Outside canonical sitemap host' }); continue; }
    if (seen.has(url)) continue;
    if (seen.size >= maxRequests || entry.depth > maxDepth) { truncated = true; continue; }
    seen.add(url);
    try {
      const xml = await document(url);
      const isIndex = /<(?:\w+:)?sitemapindex(?:\s|>)/i.test(xml);
      if (!isIndex && !/<(?:\w+:)?urlset(?:\s|>)/i.test(xml)) throw new Error('Expected sitemap XML');
      for (const match of xml.matchAll(/<(?:\w+:)?loc(?:\s[^>]*)?>([\s\S]*?)<\/(?:\w+:)?loc\s*>/gi)) {
        const location = decodeXml(match[1].trim().replace(/^<!\[CDATA\[([\s\S]*)\]\]>$/, '$1'));
        const safe = safeUrl(location, host);
        if (isIndex) {
          if (safe) queue.push({ url: safe.href, depth: entry.depth + 1 });
          else failures.push({ url: location.slice(0, 500), reason: 'Outside canonical sitemap host' });
        } else if (safe && urlInCoverageScope(safe.href, target.surfaceUrl)) {
          if (urls.size >= maxUrls && !urls.has(safe.href)) truncated = true;
          else urls.add(safe.href);
        }
      }
    } catch (error) { failures.push({ url, reason: error.message }); }
  }
  const sorted = [...urls].sort();
  return { urls: sorted, observedAt: now, complete: failures.length === 0 && !truncated && seen.size > 0,
    truncated, failures, sitemaps: [...seen], fingerprint: createHash('sha256').update(JSON.stringify(sorted)).digest('hex') };
}

export async function collectIndexCoverage({ catalog, previous = null, inventoryOnly = false, maxInspections = 0,
  properties = [], accessToken, quotaProject, fetchImpl = fetch, inspect = inspectSearchConsoleUrl,
  sitemapOverrides = {}, now = new Date().toISOString(), onProgress = () => {}, projectId = null, maxAgeDays = 7 } = {}) {
  if (!Number.isInteger(maxInspections) || maxInspections < 0 || maxInspections > 2000) throw new Error('max-inspections must be an integer from 0 to 2000');
  const artifact = previous?.schema === COVERAGE_SCHEMA ? structuredClone(previous) : { schema: COVERAGE_SCHEMA, records: [], dailyBudget: {} };
  artifact.dailyBudget ??= {};
  const day = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(now));
  artifact.dailyBudget = Object.fromEntries(Object.entries(artifact.dailyBudget).filter(([key]) => key >= day));
  const budget = artifact.dailyBudget[day] ??= { total: 0, properties: {} };
  let remaining = maxInspections;
  let blocked = false;
  const targets = coverageTargets(catalog).filter(target => !projectId || target.projectId === projectId);
  if (!targets.length) throw new Error('Unknown current project');
  const candidates = [];
  for (const target of targets) {
    const old = artifact.records.find(row => row.projectId === target.projectId && row.surfaceUrl === target.surfaceUrl);
    const record = { ...target, inspections: { ...(old?.inspections ?? {}) }, lastAttemptAt: now };
    if (!target.exemption) {
      const inventory = await inventorySitemap(target, { fetchImpl, sitemapUrl: sitemapOverrides[target.domain], now });
      // A failed discovery cannot erase a retained denominator or its exact observations.
      if (!inventory.complete && old?.inventory) { record.inventory = old.inventory; record.failure = 'Sitemap refresh incomplete; retained previous inventory'; record.inventoryAttempt = inventory; }
      else { record.inventory = inventory; if (!inventory.complete) record.failure = 'Sitemap inventory incomplete'; }
      const selected = selectSearchConsoleProperty(target.domain, properties.filter(p => p.siteUrl?.startsWith('sc-domain:') || urlInCoverageScope(target.surfaceUrl, p.siteUrl)));
      record.property = selected?.siteUrl ?? null;
      if (!inventoryOnly && !selected) record.failure = 'No accessible Google Search Console property';
      const urls = record.inventory.urls.filter(url => {
        const retained = record.inspections[url];
        return !(['indexed', 'not-indexed', 'unknown'].includes(retained?.state) && Date.parse(now) - Date.parse(retained.observedAt) < maxAgeDays * DAY);
      });
      if (selected && !inventoryOnly) candidates.push({ record, selected, urls });
    }
    const index = artifact.records.findIndex(row => row.projectId === target.projectId && row.surfaceUrl === target.surfaceUrl);
    if (index >= 0) artifact.records[index] = record; else artifact.records.push(record);
    artifact.updatedAt = now; await onProgress(artifact);
  }
  // First observe every applicable product; finish small cohorts, then rotate the
  // remaining URLs so one large sitemap cannot exhaust the portfolio budget.
  const jobs = [];
  candidates.sort((a, b) => a.urls.length - b.urls.length);
  for (const candidate of candidates) if (candidate.urls.length) jobs.push({ ...candidate, url: candidate.urls.shift() });
  for (const candidate of candidates.filter(candidate => candidate.urls.length < 20)) {
    for (const url of candidate.urls.splice(0)) jobs.push({ ...candidate, url });
  }
  while (candidates.some(candidate => candidate.urls.length)) {
    for (const candidate of candidates) if (candidate.urls.length) jobs.push({ ...candidate, url: candidate.urls.shift() });
  }
  let next = 0;
  // Progress callbacks are serialized even though provider requests may overlap.
  let progress = Promise.resolve();
  const persist = () => { progress = progress.then(() => onProgress(artifact)); return progress; };
  async function worker() {
    while (!blocked && remaining > 0 && next < jobs.length) {
      const { record, selected, url } = jobs[next++];
      if ((budget.properties[selected.siteUrl] ?? 0) >= 2000) continue;
      remaining--; budget.total++; budget.properties[selected.siteUrl] = (budget.properties[selected.siteUrl] ?? 0) + 1;
      // Persist the reservation before the provider call, so interruption cannot refund quota.
      await persist();
      if (blocked) continue;
      const retained = record.inspections[url];
      let result;
      try { result = await inspect({ inspectionUrl: url, siteUrl: selected.siteUrl, accessToken, quotaProject, fetchImpl, maxAttempts: 1 }); }
      catch (error) { result = { state: 'unavailable', inspectedUrl: url, failureReason: error.message }; }
      const observation = { ...result, observedAt: now };
      if (result.state === 'unavailable' && retained) record.inspections[url] = { ...retained, lastFailure: observation };
      else record.inspections[url] = observation;
      if (result.state === 'unavailable') { record.failure = result.failureReason ?? 'URL Inspection unavailable'; blocked = /(?:401|403|429|quota|credential|permission|auth)/i.test(record.failure); }
      await persist();
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, jobs.length) }, () => worker()));
  await persist();
  return artifact;
}
