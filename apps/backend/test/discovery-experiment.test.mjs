import test from 'node:test';
import assert from 'node:assert/strict';
import { reviewDiscoveryExperiment, reviewDiscoveryRecrawl } from '../lib/discovery-experiment.mjs';

const experiment = {
  id: 'anime-discovery-20261007', projectId: 'anime-list', scope: 'anime-host',
  hypothesis: 'Route-specific initial HTML improves discovery.', reportingLagDays: 3,
  publication: { status: 'live-verified', publishedAt: '2026-10-07T08:00:00Z' },
};
const observation = {
  id: 'provider-receipt', provider: 'google-search-console', projectId: 'anime-list', scope: 'anime-host',
  observedAt: '2026-10-14T12:00:00Z', period: { start: '2026-09-14', end: '2026-10-11' },
  dailySeries: [
    { date: '2026-09-24', clicks: 1, impressions: 10 },
    { date: '2026-09-27', clicks: 0, impressions: 2 },
    { date: '2026-10-01', clicks: 1, impressions: 10 },
    { date: '2026-10-04', clicks: 0, impressions: 2 },
    { date: '2026-10-07', clicks: 99, impressions: 1000 },
    { date: '2026-10-08', clicks: 2, impressions: 20 },
    { date: '2026-10-11', clicks: 1, impressions: 3 },
  ],
};

test('next-week checkpoint excludes deployment day and compares the same complete weekdays', () => {
  const report = reviewDiscoveryExperiment(experiment, observation, '2026-10-14T12:00:00Z');
  assert.equal(report.days, 4);
  assert.equal(report.fullWeek, false);
  assert.equal(report.before.start, '2026-09-24');
  assert.equal(report.before.end, '2026-09-27');
  assert.equal(report.before.clicks, 1);
  assert.equal(report.before.impressions, 12);
  assert.ok(Math.abs(report.before.ctrPercent - 100 / 12) < 1e-10);
  assert.equal(report.after.start, '2026-10-08');
  assert.equal(report.after.end, '2026-10-11');
  assert.equal(report.after.clicks, 3);
  assert.equal(report.clickDelta, 2);
});

test('local edits cannot receive credit for provider movement', () => {
  const report = reviewDiscoveryExperiment({ ...experiment, publication: { status: 'local-checked' } }, observation);
  assert.equal(report.status, 'awaiting-publication');
  assert.equal(report.after, undefined);
});

test('missing daily coverage and different page filters remain unavailable', () => {
  for (const changed of [
    { ...observation, scope: 'another-host' },
    { ...observation, period: { start: '2026-10-05', end: '2026-10-11' } },
    { ...observation, dailySeries: undefined },
  ]) assert.equal(reviewDiscoveryExperiment(experiment, changed, '2026-10-14T12:00:00Z').status, 'unavailable');
});

test('stale records cannot create zero treatment traffic', () => {
  const report = reviewDiscoveryExperiment(experiment, { ...observation, period: { start: '2026-09-07', end: '2026-10-04' } }, '2026-10-14T12:00:00Z');
  assert.equal(report.status, 'awaiting-final-data');
  assert.equal(report.after, undefined);
});

test('a full week is available only with seven final treatment days', () => {
  const report = reviewDiscoveryExperiment(experiment, { ...observation, period: { start: '2026-09-17', end: '2026-10-14' } }, '2026-10-17T12:00:00Z');
  assert.equal(report.fullWeek, true);
  assert.equal(report.days, 7);
  assert.equal(report.after.end, '2026-10-14');
  assert.equal(report.before.end, '2026-09-30');
});

test('deployment and review timestamps use Pacific provider dates across UTC midnight', () => {
  const report = reviewDiscoveryExperiment({
    ...experiment, publication: { status: 'live-verified', publishedAt: '2026-10-08T01:00:00Z' },
  }, observation, '2026-10-14T01:00:00Z');
  assert.equal(report.after.start, '2026-10-08');
  assert.equal(report.after.end, '2026-10-10');
  assert.equal(report.days, 3);
  assert.equal(report.reportingTimezone, 'America/Los_Angeles');
});

const crawlExperiment = { ...experiment, liveChecks: [{ url: 'https://anime.example/search' }, { url: 'https://anime.example/manga' }] };
test('pre-release crawls and undiscovered pages cannot reject the traffic hypothesis', () => {
  const result = reviewDiscoveryRecrawl(crawlExperiment, [
    { inspectedUrl: 'https://anime.example/search', state: 'not-indexed', lastCrawlTime: '2026-08-20T19:37:43Z' },
    { inspectedUrl: 'https://anime.example/manga', state: 'not-indexed', coverageState: 'URL is unknown to Google' },
  ]);
  assert.equal(result.status, 'awaiting-recrawl-evidence');
  assert.equal(result.routes[0].recrawledSincePublication, false);
  assert.equal(result.routes[1].recrawledSincePublication, null);
});
test('recrawl evidence requires every changed URL and preserves indexing as a separate fact', () => {
  const rows = crawlExperiment.liveChecks.map(({ url }) => ({ inspectedUrl: url, state: 'not-indexed', lastCrawlTime: '2026-10-09T12:00:00Z' }));
  assert.equal(reviewDiscoveryRecrawl(crawlExperiment, rows.slice(0, 1)).status, 'awaiting-recrawl-evidence');
  const result = reviewDiscoveryRecrawl(crawlExperiment, rows);
  assert.equal(result.status, 'recrawl-recorded');
  assert.equal(result.routes[0].indexState, 'not-indexed');
});
test('unavailable inspections and unverified publication remain unknown', () => {
  const rows = [{ inspectedUrl: 'https://anime.example/search', state: 'unavailable', lastCrawlTime: '2026-10-09T12:00:00Z' }];
  assert.equal(reviewDiscoveryRecrawl(crawlExperiment, rows).routes[0].recrawledSincePublication, null);
  assert.equal(reviewDiscoveryRecrawl({ ...crawlExperiment, publication: { status: 'local-checked' } }, rows).status, 'awaiting-publication');
});
