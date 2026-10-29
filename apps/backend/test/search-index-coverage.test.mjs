import assert from 'node:assert/strict';
import { test } from 'node:test';
import { collectIndexCoverage, coverageTargets, inventorySitemap, summarizeIndexCoverage, urlInCoverageScope } from '../lib/search-index-coverage.mjs';
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
  result.dailyBudget['2026-10-29'].properties['sc-domain:example.com'] = 2000;
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
