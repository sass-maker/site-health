import { createHash, randomUUID } from 'node:crypto';
import { closeSync, existsSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { inspectSearchConsoleUrl, selectSearchConsoleProperty } from './search-console.mjs';

export const LOCAL_PROPERTY_DAILY_LIMIT = 1800;
export const COVERAGE_SCHEMA = 'site-health.search-index-coverage.v1';
const DAY = 86400000;
export const defaultIndexCoveragePath = ({ home = homedir() } = {}) => join(home, '.fleet/search-index-coverage/latest.json');
export function acquireIndexCoverageLock(path, { onInterrupt = () => {} } = {}) {
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const lockPath = `${path}.lock`;
  const token = randomUUID();
  let lock;
  try { lock = openSync(lockPath, 'wx', 0o600); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    let owner = 'unknown owner';
    try {
      const { pid } = JSON.parse(readFileSync(lockPath, 'utf8'));
      try { process.kill(pid, 0); owner = `PID ${pid} is still running`; }
      catch (failure) { owner = failure.code === 'ESRCH' ? `PID ${pid} is no longer running` : `PID ${pid} cannot be verified`; }
    } catch {}
    throw new Error(`Coverage lock exists at ${lockPath} (${owner}). Preserve the checkpoint; clear this lock only after verifying its collector has stopped.`);
  }
  writeFileSync(lock, JSON.stringify({ pid: process.pid, token, createdAt: new Date().toISOString() }));
  const interrupt = signal => onInterrupt(signal);
  const sigint = () => interrupt('SIGINT');
  const sigterm = () => interrupt('SIGTERM');
  process.on('SIGINT', sigint); process.on('SIGTERM', sigterm);
  return () => {
    process.off('SIGINT', sigint); process.off('SIGTERM', sigterm);
    closeSync(lock);
    try { if (JSON.parse(readFileSync(lockPath, 'utf8')).token === token) unlinkSync(lockPath); } catch {}
  };
}
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
export function validateGoogleIndexingReport(input, target) {
  const report = input.googleReport ?? input;
  const surface = safeUrl(target.surfaceUrl);
  const sitemap = surface && safeUrl(report.sitemapUrl, surface.hostname);
  if (report.source !== 'google-search-console-page-indexing' || !surface || !sitemap
    || !urlInCoverageScope(sitemap.href, surface.href)) throw new Error('Google report requires a sitemap within the exact canonical product surface');
  if (input.projectId && input.projectId !== target.projectId) throw new Error('Google report project mismatch');
  if (input.surfaceUrl && input.surfaceUrl !== target.surfaceUrl) throw new Error('Google report surface mismatch');
  const property = String(report.property ?? '');
  if (!selectSearchConsoleProperty(surface.hostname, [{ siteUrl: property }])
    || (!property.startsWith('sc-domain:') && !urlInCoverageScope(surface.href, property))) throw new Error('Google report property does not own the product surface');
  const sourceUrl = safeUrl(report.sourceUrl, 'search.google.com');
  if (!sourceUrl || !sourceUrl.pathname.startsWith('/search-console/')
    || sourceUrl.searchParams.get('resource_id') !== property
    || sourceUrl.searchParams.get('pages') !== 'SITEMAP'
    || sourceUrl.searchParams.get('sitemap') !== sitemap.href) throw new Error('Google report source URL must identify the exact property and sitemap filter');
  const counts = ['indexedCount', 'notIndexedCount', 'totalKnownCount'];
  if (counts.some(key => !Number.isSafeInteger(report[key]) || report[key] < 0)
    || report.indexedCount + report.notIndexedCount !== report.totalKnownCount) throw new Error('Google report counts must be nonnegative integers with an exact total');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(report.reportDate ?? '') || !Number.isFinite(Date.parse(report.reportDate))
    || !Number.isFinite(Date.parse(report.observedAt)) || new Date(report.reportDate).toISOString().slice(0, 10) !== report.reportDate
    || report.reportDate > new Date(report.observedAt).toISOString().slice(0, 10)) throw new Error('Google report requires reportDate and observedAt');
  const reasons = {};
  const entries = Array.isArray(report.reasons) ? report.reasons.map(row => [row.reason, row.count]) : Object.entries(report.reasons ?? {});
  if (entries.length > 100) throw new Error('Too many Google report reasons');
  for (const [reason, count] of entries) {
    if (typeof reason !== 'string' || !reason.trim() || reason.length > 500 || !Number.isSafeInteger(count) || count < 0) throw new Error('Invalid Google report reason');
    reasons[reason] = count;
  }
  return { source: report.source, property, sitemapUrl: sitemap.href, reportDate: report.reportDate,
    observedAt: new Date(report.observedAt).toISOString(), indexedCount: report.indexedCount,
    notIndexedCount: report.notIndexedCount, totalKnownCount: report.totalKnownCount, sourceUrl: sourceUrl.href, reasons };
}
export function importGoogleIndexingReports({ catalog, previous = null, reports, projectId = null, replaceCohortProjectId = null }) {
  const suppliedRows = Array.isArray(reports) ? reports : reports?.records;
  if (!Array.isArray(suppliedRows)) throw new Error('Google report import requires records');
  if (replaceCohortProjectId && projectId && replaceCohortProjectId !== projectId) throw new Error('Cohort replacement must match the selected project');
  const selectedProjectId = projectId ?? replaceCohortProjectId;
  const rows = selectedProjectId ? suppliedRows.filter(row => row.projectId === selectedProjectId) : suppliedRows;
  if (selectedProjectId && !rows.length) throw new Error('No Google report matches the selected project');
  const targets = coverageTargets(catalog);
  // Validate every row before changing any private state.
  const validated = rows.map(row => {
    const target = targets.find(target => target.projectId === row.projectId && target.surfaceUrl === row.surfaceUrl && !target.exemption);
    if (!target) throw new Error(`Google report is not an exact current product surface: ${row.projectId}`);
    return { target, report: validateGoogleIndexingReport(row, target) };
  });
  const cohortKey = record => `${record.projectId}\n${record.surfaceUrl}`;
  const priorRecords = previous?.schema === COVERAGE_SCHEMA ? previous.records : [];
  const cohorts = new Map(priorRecords.filter(record => record.googleReport)
    .map(record => [cohortKey(record), record.googleReport.sitemapUrl]));
  const batchCohorts = new Map();
  for (const { target, report } of validated) {
    const key = cohortKey(target);
    const incoming = batchCohorts.get(key);
    if (incoming && incoming !== report.sitemapUrl) throw new Error(`Only one named sitemap per product can be imported in a batch: ${target.projectId}`);
    batchCohorts.set(key, report.sitemapUrl);
    const existing = cohorts.get(key);
    if (existing && existing !== report.sitemapUrl && replaceCohortProjectId !== target.projectId) {
      throw new Error(`Different named sitemap already recorded for ${target.projectId}; use --replace-cohort ${target.projectId} with --import-only to replace it and retain history`);
    }
  }
  const artifact = previous?.schema === COVERAGE_SCHEMA ? structuredClone(previous) : { schema: COVERAGE_SCHEMA, records: [], dailyBudget: {} };
  for (const { target, report } of validated) {
    let record = artifact.records.find(row => row.projectId === target.projectId && row.surfaceUrl === target.surfaceUrl);
    if (!record) { record = { ...target, inspections: {} }; artifact.records.push(record); }
    const history = [...(record.googleReports ?? []), ...(record.googleReport ? [record.googleReport] : []), report];
    record.googleReports = [...new Map(history.map(item => [`${item.reportDate}:${item.sitemapUrl}:${item.observedAt}`, item])).values()]
      .sort((a, b) => a.reportDate.localeCompare(b.reportDate) || a.observedAt.localeCompare(b.observedAt));
    record.googleReport = record.googleReports.filter(item => item.sitemapUrl === report.sitemapUrl).at(-1);
  }
  artifact.updatedAt = new Date().toISOString();
  return artifact;
}
export function summarizeIndexCoverage(record, { now = new Date().toISOString(), maxAgeDays = 7 } = {}) {
  if (!record) return { state: 'not-collected', total: null, indexed: null, indexedPercentage: null, checkedPercentage: null, observedAt: null };
  if (record.exemption) return { state: record.exemption, total: null, indexed: null, indexedPercentage: null, checkedPercentage: null, observedAt: null };
  let googleReport = null;
  try { if (record.googleReport) googleReport = validateGoogleIndexingReport(record.googleReport, record); } catch {}
  const googleReportStale = googleReport ? (googleReport.reportDate > now.slice(0, 10) || Date.parse(googleReport.observedAt) > Date.parse(now) + 300_000 || Date.parse(now) - Date.parse(`${googleReport.reportDate}T12:00:00Z`) > maxAgeDays * DAY) : false;
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
    const stale = !Number.isFinite(Date.parse(result.observedAt)) || Date.parse(result.observedAt) > Date.parse(now) + 300_000 || Date.parse(now) - Date.parse(result.observedAt) > maxAgeDays * DAY;
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
  const checked = total === null ? null : counts.indexed + counts['not-indexed'] + counts.unknown;
  const attempted = total === null ? null : total - counts.pending;
  const inventoryFresh = Number.isFinite(Date.parse(inventory?.observedAt)) && Date.parse(inventory.observedAt) <= Date.parse(now) + 300_000 && Date.parse(now) - Date.parse(inventory.observedAt) <= maxAgeDays * DAY;
  const complete = inventoryFresh && total > 0 && inventory.complete === true && known === total && !counts.stale && !record.failure;
  return { googleReport, googleReportStale, state: googleReport ? (googleReportStale ? 'stale-google-report' : 'google-report') : complete ? 'complete' : counts.stale || (inventory && !inventoryFresh) ? 'stale' : record.failure ? 'unavailable' : total === null ? 'inventory-unavailable' : 'partial',
    surfaceUrl: record.surfaceUrl, total, attempted, indexed: total === null ? null : counts.indexed, checked, known, counts,
    indexedPercentage: complete ? 100 * counts.indexed / total : null,
    checkedPercentage: total > 0 ? 100 * checked / total : null,
    sampleIndexedPercentage: known > 0 ? 100 * counts.indexed / known : null,
    inventoryComplete: inventory?.complete ?? false, inventoryObservedAt: inventory?.observedAt ?? null,
    observedAt: dates.sort()[0] ?? null, lastAttemptAt: record.lastAttemptAt ?? null,
    failure: record.failure ?? null, failures: record.inventoryAttempt?.failures ?? inventory?.failures ?? [], truncated: record.inventoryAttempt?.truncated ?? inventory?.truncated ?? false,
    canonicalMismatch, reasons, lastCrawlTime: crawlDates.sort().at(-1) ?? null, provenance: 'Google URL Inspection of discovered sitemap URLs',
  };
}
const decodeXml = value => value.replace(/&(?:amp|lt|gt|quot|apos);/g, token => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" })[token]);
export async function inventorySitemap(target, { fetchImpl = fetch, sitemapUrl, maxRequests = 40, maxUrls = 10000, maxBytes = 2000000, maxDepth = 5, signal, now = new Date().toISOString() } = {}) {
  const host = target.domain;
  const failures = [];
  const urls = new Set();
  const seen = new Set();
  const queue = [];
  let truncated = false;
  async function document(url) {
    const safe = safeUrl(url, host);
    if (!safe) throw new Error('Sitemap URL is outside canonical HTTPS host');
    const response = await fetchImpl(safe.href, { method: 'GET', redirect: 'error', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(15000)]) : AbortSignal.timeout(15000) });
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
  while (queue.length && !signal?.aborted) {
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
  return { urls: sorted, observedAt: now, complete: failures.length === 0 && !truncated && !signal?.aborted && seen.size > 0,
    truncated: truncated || Boolean(signal?.aborted), failures, sitemaps: [...seen], fingerprint: createHash('sha256').update(JSON.stringify(sorted)).digest('hex') };
}

export async function collectIndexCoverage({ catalog, previous = null, inventoryOnly = false, maxInspections = 0,
  properties = [], accessToken, quotaProject, fetchImpl = fetch, inspect = inspectSearchConsoleUrl,
  sitemapOverrides = {}, now, clock = () => now ?? new Date().toISOString(), onProgress = () => {}, projectId = null, maxAgeDays = 7, signal } = {}) {
  if (!Number.isInteger(maxInspections) || maxInspections < 0 || maxInspections > 2000) throw new Error('max-inspections must be an integer from 0 to 2000');
  const artifact = previous?.schema === COVERAGE_SCHEMA ? structuredClone(previous) : { schema: COVERAGE_SCHEMA, records: [], dailyBudget: {} };
  artifact.dailyBudget ??= {};
  const readClock = () => {
    const value = clock();
    if (!Number.isFinite(new Date(value).getTime())) throw new Error('Coverage clock must return a valid timestamp');
    return typeof value === 'string' ? value : new Date(value).toISOString();
  };
  const quotaDay = value => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
  const startedAt = readClock();
  artifact.dailyBudget = Object.fromEntries(Object.entries(artifact.dailyBudget).filter(([key]) => key >= quotaDay(startedAt)));
  const budgetAt = value => artifact.dailyBudget[quotaDay(value)] ??= { total: 0, properties: {} };
  budgetAt(startedAt);
  let remaining = maxInspections;
  let blocked = false;
  artifact.budgetPolicy = { localPropertyDailyLimit: LOCAL_PROPERTY_DAILY_LIMIT, quotaDayTimeZone: 'America/Los_Angeles', scope: 'This checkpoint only; other collectors and manual probes are not counted' };
  const targets = coverageTargets(catalog).filter(target => !projectId || target.projectId === projectId);
  if (!targets.length) throw new Error('Unknown current project');
  const candidates = [];
  for (const target of targets) {
    if (signal?.aborted) break;
    const old = artifact.records.find(row => row.projectId === target.projectId && row.surfaceUrl === target.surfaceUrl);
    const record = { ...target, ...(old?.googleReport ? { googleReport: old.googleReport, googleReports: old.googleReports ?? [old.googleReport] } : {}), inspections: { ...(old?.inspections ?? {}) }, lastAttemptAt: readClock() };
    if (!target.exemption) {
      const inventory = await inventorySitemap(target, { fetchImpl, sitemapUrl: sitemapOverrides[target.domain], now: record.lastAttemptAt, signal });
      if (signal?.aborted) break;
      // A failed discovery cannot erase a retained denominator or its exact observations.
      if (!inventory.complete && old?.inventory?.complete === true) { record.inventory = old.inventory; record.failure = 'Sitemap refresh incomplete; retained previous inventory'; record.inventoryAttempt = inventory; }
      else { record.inventory = inventory; if (!inventory.complete) record.failure = 'Sitemap inventory incomplete'; }
      const selected = selectSearchConsoleProperty(target.domain, properties.filter(p => p.siteUrl?.startsWith('sc-domain:') || urlInCoverageScope(target.surfaceUrl, p.siteUrl)));
      record.property = selected?.siteUrl ?? null;
      if (!inventoryOnly && !selected) record.failure = 'No accessible Google Search Console property';
      const urls = record.inventory.urls.filter(url => {
        const retained = record.inspections[url];
        return !(['indexed', 'not-indexed', 'unknown'].includes(retained?.state) && Date.parse(readClock()) - Date.parse(retained.observedAt) < maxAgeDays * DAY);
      });
      if (selected && !inventoryOnly) candidates.push({ record, selected, urls });
    }
    const index = artifact.records.findIndex(row => row.projectId === target.projectId && row.surfaceUrl === target.surfaceUrl);
    if (index >= 0) artifact.records[index] = record; else artifact.records.push(record);
    artifact.updatedAt = readClock(); await onProgress(artifact);
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
    while (!signal?.aborted && !blocked && remaining > 0 && next < jobs.length) {
      const { record, selected, url } = jobs[next++];
      const reservedAt = readClock();
      const budget = budgetAt(reservedAt);
      if ((budget.properties[selected.siteUrl] ?? 0) >= LOCAL_PROPERTY_DAILY_LIMIT) continue;
      remaining--; budget.total++; budget.properties[selected.siteUrl] = (budget.properties[selected.siteUrl] ?? 0) + 1;
      artifact.updatedAt = reservedAt;
      // Persist the reservation before the provider call, so interruption cannot refund quota.
      await persist();
      if (blocked || signal?.aborted) continue;
      const retained = record.inspections[url];
      let result;
      try { result = await inspect({ inspectionUrl: url, siteUrl: selected.siteUrl, accessToken, quotaProject, fetchImpl: signal ? (requestUrl, requestOptions) => fetchImpl(requestUrl, { ...requestOptions, signal: AbortSignal.any([signal, ...(requestOptions.signal ? [requestOptions.signal] : [])]) }) : fetchImpl, maxAttempts: 1 }); }
      catch (error) { result = { state: 'unavailable', inspectedUrl: url, failureReason: error.message }; }
      const observation = { ...result, observedAt: readClock() };
      artifact.updatedAt = observation.observedAt;
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
