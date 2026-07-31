import assert from 'node:assert/strict';
import test from 'node:test';

import {
  collectSearchConsoleOutcomes,
  selectSearchConsoleProperty,
} from '../lib/search-console.mjs';

test('selects the closest accessible property for a canonical domain', () => {
  const properties = [
    { siteUrl: 'sc-domain:example.com', permissionLevel: 'siteOwner' },
    { siteUrl: 'sc-domain:app.example.com', permissionLevel: 'siteOwner' },
    { siteUrl: 'https://app.example.com/', permissionLevel: 'siteFullUser' },
  ];
  assert.deepEqual(selectSearchConsoleProperty('app.example.com', properties), {
    siteUrl: 'https://app.example.com/',
    permissionLevel: 'siteFullUser',
    pageFilter: null,
  });
  assert.deepEqual(selectSearchConsoleProperty('other.example.com', properties), {
    siteUrl: 'sc-domain:example.com',
    permissionLevel: 'siteOwner',
    pageFilter: 'https://other.example.com/',
  });
});

test('collects project-scoped aggregates and keeps unavailable properties out of the ledger bundle', async () => {
  const requests = [];
  const fetchImpl = async (url, options = {}) => {
    requests.push({ url, body: options.body ? JSON.parse(options.body) : null });
    if (url.endsWith('/sites')) {
      return Response.json({
        siteEntry: [{ siteUrl: 'sc-domain:example.com', permissionLevel: 'siteOwner' }],
      });
    }
    const body = JSON.parse(options.body);
    const filter = body.dimensionFilterGroups[0].filters[0].expression;
    if (body.dimensions?.includes('query')) {
      return filter === 'https://one.example.com/'
        ? Response.json({ rows: [
            { keys: ['private pace app', 'https://one.example.com/private'], clicks: 2, impressions: 10, ctr: 0.2, position: 2.5 },
            { keys: ['heypace', 'https://one.example.com/'], clicks: 0, impressions: 4, ctr: 0, position: 6 },
          ] })
        : Response.json({});
    }
    return filter === 'https://one.example.com/'
      ? Response.json({ rows: [{ clicks: 2, impressions: 20, ctr: 0.1, position: 4.5 }] })
      : Response.json({});
  };
  const result = await collectSearchConsoleOutcomes({
    projects: [
      { id: 'one', domains: ['one.example.com'] },
      { id: 'two', domains: ['two.example.com'] },
      { id: 'missing', domains: ['missing.test'] },
    ],
    accessToken: 'not-retained',
    quotaProject: 'quota-project',
    fetchImpl,
    now: new Date('2026-07-31T12:00:00.000Z'),
    reportingWindowDays: 28,
    reportingLagDays: 3,
  });

  assert.equal(requests.length, 5);
  assert.equal(result.bundle.observations.length, 2);
  assert.deepEqual(result.unavailable, [{
    projectId: 'missing',
    domain: 'missing.test',
    reason: 'property-unavailable',
  }]);
  assert.deepEqual(result.bundle.observations[0].metrics, [
    { label: 'Search impressions', value: 20 },
    { label: 'Search clicks', value: 2 },
    { label: 'Search CTR', value: 10 },
    { label: 'Search average position', value: 4.5 },
  ]);
  assert.deepEqual(result.bundle.observations[1].metrics, [
    { label: 'Search impressions', value: 0 },
    { label: 'Search clicks', value: 0 },
    { label: 'Search CTR', value: 0 },
  ]);
  assert.deepEqual(result.bundle.observations[0].searchTerms, [
    { query: 'private pace app', landingPage: 'https://one.example.com/private', impressions: 10, clicks: 2, ctr: 20, position: 2.5 },
    { query: 'heypace', landingPage: 'https://one.example.com/', impressions: 4, clicks: 0, ctr: 0, position: 6 },
  ]);
  assert.deepEqual(result.bundle.observations[1].searchTerms, []);
  assert.deepEqual(requests[2].body.dimensions, ['query', 'page']);
  assert.equal(requests[2].body.rowLimit, 25);
  assert.equal(result.bundle.observations[0].period.start, '2026-07-01T00:00:00.000Z');
  assert.equal(result.bundle.observations[0].period.end, '2026-07-28T23:59:59.999Z');
});
