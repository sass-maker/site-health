import assert from 'node:assert/strict';
import { existsSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { acquireIndexCoverageLock, collectIndexCoverage, coverageTargets, inventorySitemap, importGoogleIndexingReports, summarizeIndexCoverage, urlInCoverageScope } from '../lib/search-index-coverage.mjs';
const now = '2026-10-29T12:00:00Z';
const target = { projectId: 'app', domain: 'example.com', surfaceUrl: 'https://example.com/app/' };
const catalog = { projects: [{ id: 'app', name: 'App', portfolio: { status: 'active' }, domains: ['old.example.com'] }], publicDirectory: { projects: { app: { publicDestinationUrl: target.surfaceUrl } } } };
const xml = urls => `<urlset>${urls.map(url => `<url><loc>${url}</loc></url>`).join('')}</urlset>`;
const fixtureFetch = documents => async (url, options) => { assert.equal(options.method, 'GET'); assert.equal(options.redirect, 'error'); return new Response(documents[url] ?? '', { status: Object.hasOwn(documents, url) ? 200 : 404 }); };
const sitemapUrl = 'https://example.com/sitemap.xml';
const docs = { [sitemapUrl]: xml(['https://example.com/app/', 'https://example.com/app/page?x=1', 'https://example.com/other/']) };
const fetchImpl = fixtureFetch(docs);
test('current roster uses explicit marketing destination, private surfaces exempt, legacy aliases not duplicated', () => {
  const targets = coverageTargets({ ...catalog, projects: [...catalog.projects, { id: 'private', portfolio: { status: 'active' }, authModel: 'private-authenticated', domains: ['mail.example.com'] }, { id: 'retired', portfolio: { status: 'archived' } }] });
  assert.equal(targets.length, 2); assert.equal(targets[0].surfaceUrl, target.surfaceUrl); assert.equal(targets[1].exemption, 'no-public-surface');
});
test('path and query scope are exact, hostname cannot escape', () => {
  assert.equal(urlInCoverageScope('https://example.com/app?x=1', target.surfaceUrl), true);
  for (const url of ['https://example.com/application/', 'https://evil.example/app/', 'https://example.com.evil.test/app/', 'https://localhost/app/', 'http://example.com/app/']) assert.equal(urlInCoverageScope(url, target.surfaceUrl), false);
});
test('nested sitemap inventory deduplicates, retains failures and truncation', async () => {
  const result = await inventorySitemap(target, { now, fetchImpl: fixtureFetch({ [sitemapUrl]: '<sitemapindex><sitemap><loc>https://example.com/child.xml</loc></sitemap><sitemap><loc>https://evil.test/map.xml</loc></sitemap></sitemapindex>', 'https://example.com/child.xml': xml(['https://example.com/app/', 'https://example.com/app/', 'https://example.com/app/a', 'https://example.com/other']) }), maxUrls: 1 });
  assert.deepEqual(result.urls, ['https://example.com/app/']); assert.equal(result.complete, false); assert.equal(result.truncated, true); assert.equal(result.failures.length, 1);
});
test('complete percentage requires fresh known outcomes for entire complete inventory', () => {
  const record = { ...target, inventory: { urls: ['a', 'b'], complete: true, observedAt: now }, inspections: { a: { state: 'indexed', observedAt: now }, b: { state: 'not-indexed', observedAt: now } } };
  assert.equal(summarizeIndexCoverage(record, { now }).indexedPercentage, 50);
  record.inspections.b.state = 'unknown'; assert.equal(summarizeIndexCoverage(record, { now }).indexedPercentage, null);
  assert.equal(summarizeIndexCoverage(record, { now }).sampleIndexedPercentage, 100);
  record.inspections = {}; assert.equal(summarizeIndexCoverage(record, { now }).checkedPercentage, 0);
  assert.equal(summarizeIndexCoverage(null).indexed, null);
  record.inventory.urls = []; assert.equal(summarizeIndexCoverage(record, { now }).indexedPercentage, null);
});
test('daily quota reservations, resumable fresh inspection and exact URL provider calls', async () => {
  const calls = []; let checkpoints = 0;
  const inspect = async args => { calls.push(args); return { state: 'indexed', inspectedUrl: args.inspectionUrl }; };
  let result = await collectIndexCoverage({ catalog, now, fetchImpl, maxInspections: 1, properties: [{ siteUrl: 'sc-domain:example.com' }], inspect, onProgress: () => { checkpoints++; } });
  assert.equal(result.dailyBudget['2026-10-29'].total, 1); assert.ok(checkpoints >= 2); assert.equal(calls.length, 1);
  result = await collectIndexCoverage({ catalog, now, fetchImpl, maxInspections: 2, properties: [{ siteUrl: 'sc-domain:example.com' }], inspect, previous: result });
  assert.equal(calls.length, 2); assert.equal(new Set(calls.map(call => call.inspectionUrl)).size, 2);
  assert.equal(summarizeIndexCoverage(result.records[0], { now }).indexedPercentage, 100);
  result.dailyBudget['2026-10-29'].properties['sc-domain:example.com'] = 1800;
  await collectIndexCoverage({ catalog, now: '2026-10-29T23:00:00Z', fetchImpl, maxInspections: 5, maxAgeDays: 0, properties: [{ siteUrl: 'sc-domain:example.com' }], inspect, previous: result });
  assert.equal(calls.length, 2);
});
test('failed refresh preserves old exact cohort and inspections; auth quota stops calls', async () => {
  const previous = await collectIndexCoverage({ catalog, now, fetchImpl, maxInspections: 0, inventoryOnly: true });
  const first = previous.records[0].inventory.urls[0]; previous.records[0].inspections[first] = { state: 'indexed', observedAt: '2026-09-01T00:00:00Z' };
  let calls = 0;
  const result = await collectIndexCoverage({ catalog, previous, now, fetchImpl: fixtureFetch({}), maxInspections: 10, properties: [{ siteUrl: 'sc-domain:example.com' }], inspect: async () => { calls++; return { state: 'unavailable', failureReason: 'Google 429 quota exceeded' }; } });
  assert.equal(calls, 1); assert.equal(result.records[0].inspections[first].state, 'indexed'); assert.equal(result.records[0].inspections[first].lastFailure.state, 'unavailable');
  assert.equal(result.records[0].inventory.urls.length, 2); assert.ok(result.records[0].inventoryAttempt.failures.length); assert.equal(summarizeIndexCoverage(result.records[0], { now }).state, 'stale');
});

test('fresh retained outcomes cannot claim complete after an inventory refresh failure', () => {
  const summary = summarizeIndexCoverage({ inventory: { urls: ['a'], complete: true, observedAt: now }, failure: 'Refresh failed', inspections: { a: { state: 'indexed', observedAt: now } } }, { now });
  assert.equal(summary.indexed, 1); assert.equal(summary.indexedPercentage, null); assert.equal(summary.state, 'unavailable');
  assert.equal(summarizeIndexCoverage({ inventory: { urls: [], complete: false }, inspections: {} }, { now }).total, null);
});

test('one reserved quota unit is one actual provider HTTP request even for transient failure', async () => {
  let requests = 0;
  const result = await collectIndexCoverage({ catalog, now, maxInspections: 1, properties: [{ siteUrl: 'sc-domain:example.com' }], accessToken: 'fixture-token', quotaProject: 'fixture-project', fetchImpl: async (url, options) => {
    if (url.startsWith('https://searchconsole.googleapis.com/')) {
      requests++; assert.equal(options.method, 'POST'); assert.equal(JSON.parse(options.body).inspectionUrl, target.surfaceUrl);
      return new Response(JSON.stringify({ error: { message: 'Temporary failure' } }), { status: 500 });
    }
    return fetchImpl(url, options);
  } });
  assert.equal(requests, 1); assert.equal(result.dailyBudget['2026-10-29'].total, 1);
});

test('fair budget observes every product before large cohorts and respects four concurrent requests', async () => {
  const projects = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'].map(id => ({ id, portfolio: { status: 'active' }, domains: [`${id}.example.com`] }));
  const calls = []; let active = 0; let maximum = 0;
  const result = await collectIndexCoverage({ catalog: { projects }, now, maxInspections: 6, properties: [{ siteUrl: 'sc-domain:example.com' }],
    fetchImpl: async (url, options) => { assert.equal(options.method, 'GET'); return new Response(url.endsWith('/robots.txt') ? '' : xml(Array.from({ length: 50 }, (_, i) => `${new URL(url).origin}/page/${i}`))); },
    inspect: async args => { calls.push(new URL(args.inspectionUrl).hostname); active++; maximum = Math.max(maximum, active); await new Promise(resolve => setTimeout(resolve, 1)); active--; return { state: 'indexed' }; },
  });
  assert.equal(new Set(calls.slice(0, 5)).size, 5); assert.equal(calls.length, 6); assert.ok(maximum <= 4);
  assert.equal(result.dailyBudget['2026-10-29'].properties['sc-domain:example.com'], 6);
});

const googleReport = { ...target, source: 'google-search-console-page-indexing', property: 'sc-domain:example.com', sitemapUrl: 'https://example.com/app/sitemap.xml', reportDate: '2026-10-23', observedAt: now, indexedCount: 3, notIndexedCount: 1, totalKnownCount: 4, sourceUrl: 'https://search.google.com/search-console/index?resource_id=sc-domain%3Aexample.com&pages=SITEMAP&sitemap=https%3A%2F%2Fexample.com%2Fapp%2Fsitemap.xml', reasons: { 'Discovered - currently not indexed': 1 } };
test('exact sitemap report has its own denominator, dates, zero values and retained history', () => {
  let artifact = importGoogleIndexingReports({ catalog, reports: [googleReport] });
  let summary = summarizeIndexCoverage(artifact.records[0], { now });
  assert.equal(summary.googleReport.indexedCount, 3); assert.equal(summary.googleReport.totalKnownCount, 4); assert.equal(summary.total, null);
  assert.equal(summary.googleReportStale, false);
  artifact = importGoogleIndexingReports({ catalog, previous: artifact, reports: [{ ...googleReport, reportDate: '2026-10-24', indexedCount: 0, notIndexedCount: 4 }] });
  summary = summarizeIndexCoverage(artifact.records[0], { now });
  assert.equal(summary.googleReport.indexedCount, 0); assert.equal(artifact.records[0].googleReports.length, 2);
  assert.equal(summarizeIndexCoverage(artifact.records[0], { now: '2026-11-10T12:00:00Z' }).googleReportStale, true);
});
test('report imports reject mixed projects, shared root path totals and wrong denominator before mutation', () => {
  for (const report of [{ ...googleReport, sourceUrl: 'https://search.google.com/search-console/index?resource_id=sc-domain%3Aexample.com&pages=ALL' }, { ...googleReport, projectId: 'wrong' }, { ...googleReport, surfaceUrl: 'https://other.example.com/' }, { ...googleReport, sitemapUrl: 'https://example.com/sitemap.xml' }, { ...googleReport, totalKnownCount: 5 }, { ...googleReport, property: 'sc-domain:evil.test' }, { ...googleReport, reportDate: '2026-02-31' }]) {
    assert.throws(() => importGoogleIndexingReports({ catalog, reports: [googleReport, report] }));
  }
});
test('inventory refresh retains Google report evidence independently', async () => {
  const previous = importGoogleIndexingReports({ catalog, reports: [googleReport] });
  const artifact = await collectIndexCoverage({ catalog, previous, now, fetchImpl, inventoryOnly: true });
  const summary = summarizeIndexCoverage(artifact.records[0], { now });
  assert.equal(summary.total, 2); assert.equal(summary.googleReport.totalKnownCount, 4); assert.equal(summary.googleReport.indexedCount, 3);
});

test('project-scoped report import cannot mutate another product', () => {
  const artifact = importGoogleIndexingReports({ catalog, projectId: 'app', reports: [googleReport, { ...googleReport, projectId: 'unselected' }] });
  assert.equal(artifact.records.length, 1); assert.equal(artifact.records[0].projectId, 'app');
  assert.throws(() => importGoogleIndexingReports({ catalog, projectId: 'missing', reports: [googleReport] }));
});

test('later incomplete inventory replaces an earlier incomplete attempt with its own date and URLs', async () => {
  const documents = urls => ({ [sitemapUrl]: '<sitemapindex><sitemap><loc>https://example.com/child.xml</loc></sitemap><sitemap><loc>https://example.com/missing.xml</loc></sitemap></sitemapindex>', 'https://example.com/child.xml': xml(urls) });
  const previous = await collectIndexCoverage({ catalog, now, inventoryOnly: true, fetchImpl: fixtureFetch(documents(['https://example.com/app/'])) });
  const nextDate = '2026-10-30T12:00:00Z';
  const result = await collectIndexCoverage({ catalog, previous, now: nextDate, inventoryOnly: true, fetchImpl: fixtureFetch(documents(['https://example.com/app/', 'https://example.com/app/later'])) });
  assert.equal(result.records[0].inventory.complete, false); assert.equal(result.records[0].inventory.urls.length, 2);
  assert.equal(result.records[0].inventory.observedAt, nextDate); assert.equal(result.records[0].inventory.failures[0].reason, 'HTTP 404');
});
test('local property budget leaves Google quota headroom for existing collectors', async () => {
  const previous = await collectIndexCoverage({ catalog, now, inventoryOnly: true, fetchImpl });
  previous.dailyBudget['2026-10-29'].properties['sc-domain:example.com'] = 1799;
  let requests = 0;
  const result = await collectIndexCoverage({ catalog, previous, now, fetchImpl, maxInspections: 20, properties: [{ siteUrl: 'sc-domain:example.com' }], inspect: async () => { requests++; return { state: 'indexed' }; } });
  assert.equal(requests, 1); assert.equal(result.dailyBudget['2026-10-29'].properties['sc-domain:example.com'], 1800);
  assert.equal(result.budgetPolicy.localPropertyDailyLimit, 1800);
});
test('abort stops queued provider requests, preserves progress, and failures are attempted rather than checked', async () => {
  const controller = new AbortController(); let requests = 0; let progress;
  const result = await collectIndexCoverage({ catalog, now, signal: controller.signal, maxInspections: 10, accessToken: 'fixture', quotaProject: 'fixture', properties: [{ siteUrl: 'sc-domain:example.com' }], onProgress: artifact => { progress = structuredClone(artifact); },
    fetchImpl: async (url, options) => {
      if (!url.startsWith('https://searchconsole.googleapis.com/')) return fetchImpl(url, options);
      requests++;
      return new Promise((resolve, reject) => { options.signal.addEventListener('abort', () => reject(new Error('Interrupted provider request')), { once: true }); setImmediate(() => controller.abort()); });
    } });
  assert.ok(requests > 0 && requests <= 4); assert.equal(progress.records.length, 1);
  const summary = summarizeIndexCoverage(result.records[0], { now });
  assert.equal(summary.checked, 0); assert.equal(summary.attempted, requests); assert.equal(summary.counts.unavailable, requests);
});
test('cooperative lock records its PID, reports active ownership, handles signals and releases only its own lock', () => {
  const output = join(mkdtempSync(join(tmpdir(), 'index-coverage-lock-')), 'latest.json');
  const signals = []; const release = acquireIndexCoverageLock(output, { onInterrupt: signal => signals.push(signal) });
  try {
    assert.equal(JSON.parse(readFileSync(`${output}.lock`, 'utf8')).pid, process.pid);
    assert.throws(() => acquireIndexCoverageLock(output), /still running/);
    process.emit('SIGTERM'); assert.deepEqual(signals, ['SIGTERM']);
  } finally { release(); }
  assert.equal(existsSync(`${output}.lock`), false);
  const resume = acquireIndexCoverageLock(output); resume();
});

test('aborting inventory discovery preserves the entire previous partial record', async () => {
  const previous = await collectIndexCoverage({ catalog, now, inventoryOnly: true, fetchImpl: fixtureFetch({ [sitemapUrl]: '<sitemapindex><sitemap><loc>https://example.com/child.xml</loc></sitemap><sitemap><loc>https://example.com/missing.xml</loc></sitemap></sitemapindex>', 'https://example.com/child.xml': xml(['https://example.com/app/a', 'https://example.com/app/b']) }) });
  const retained = structuredClone(previous.records[0]);
  const controller = new AbortController();
  const result = await collectIndexCoverage({ catalog, previous, now: '2026-10-30T12:00:00Z', inventoryOnly: true, signal: controller.signal,
    fetchImpl: async url => {
      if (url.endsWith('/robots.txt')) return new Response('', { status: 404 });
      controller.abort();
      return new Response(xml(['https://example.com/app/a']));
    } });
  assert.deepEqual(result.records[0], retained);
});

test('reservations use their current Pacific day and observations use the provider response clock', async () => {
  let time = '2026-10-30T06:59:59Z';
  const afterMidnight = '2026-10-30T07:00:01Z';
  const documents = count => fixtureFetch({ [sitemapUrl]: xml(Array.from({ length: count }, (_, i) => `https://example.com/app/${i}`)) });
  let requests = 0;
  let result = await collectIndexCoverage({ catalog, clock: () => time, fetchImpl: documents(6), maxInspections: 6, properties: [{ siteUrl: 'sc-domain:example.com' }], inspect: async () => { requests++; time = afterMidnight; return { state: 'indexed' }; } });
  assert.equal(requests, 6);
  assert.equal(result.dailyBudget['2026-10-29'].properties['sc-domain:example.com'], 4);
  assert.equal(result.dailyBudget['2026-10-30'].properties['sc-domain:example.com'], 2);
  assert.ok(Object.values(result.records[0].inspections).every(row => row.observedAt === afterMidnight));
  time = '2026-10-30T07:10:00Z';
  result = await collectIndexCoverage({ catalog, previous: result, clock: () => time, fetchImpl: documents(7), maxInspections: 1, properties: [{ siteUrl: 'sc-domain:example.com' }], inspect: async () => ({ state: 'indexed' }) });
  assert.equal(result.dailyBudget['2026-10-30'].properties['sc-domain:example.com'], 3);
  assert.equal(result.records[0].inspections['https://example.com/app/6'].observedAt, time);
});

test('a different named sitemap is rejected atomically for an existing project or the same batch', () => {
  const previous = importGoogleIndexingReports({ catalog, reports: [googleReport] });
  const snapshot = JSON.stringify(previous);
  const second = { ...googleReport, sitemapUrl: 'https://example.com/app/blog-sitemap.xml' };
  const source = new URL(second.sourceUrl); source.searchParams.set('sitemap', second.sitemapUrl); second.sourceUrl = source.href;
  assert.throws(() => importGoogleIndexingReports({ catalog, previous, reports: [second] }), /Different named sitemap.*explicit cohort migration/);
  assert.equal(JSON.stringify(previous), snapshot);
  assert.throws(() => importGoogleIndexingReports({ catalog, reports: [googleReport, second] }), /Different named sitemap.*explicit cohort migration/);
});
