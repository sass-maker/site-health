import assert from 'node:assert/strict';
import test from 'node:test';

import {
  attachSitemapSubmissionState,
  collectSearchConsoleOutcomes,
  ensureSearchConsoleSitemaps,
  inspectSearchConsoleUrl,
  reconcileSearchConsoleSitemaps,
  searchConsoleProviderUrl,
  searchConsoleSitemapTargets,
  selectSearchConsoleProperty,
} from '../lib/search-console.mjs';

test('does not retry a timed-out URL inspection', async () => {
  let requests = 0;
  const timeout = new Error('request timed out');
  timeout.name = 'TimeoutError';

  const result = await inspectSearchConsoleUrl({
    inspectionUrl: 'https://example.com/',
    siteUrl: 'sc-domain:example.com',
    accessToken: 'not-retained',
    quotaProject: 'quota-project',
    fetchImpl: async () => {
      requests += 1;
      throw timeout;
    },
  });

  assert.equal(requests, 1);
  assert.equal(result.state, 'unavailable');
  assert.match(result.failureReason, /timed out/);
});

test('bounds concurrent URL inspections while collecting the portfolio', async () => {
  let activeInspections = 0;
  let maximumActiveInspections = 0;
  const fetchImpl = async (url, options = {}) => {
    if (url.endsWith('/sites')) {
      return Response.json({
        siteEntry: [{ siteUrl: 'sc-domain:example.com', permissionLevel: 'siteOwner' }],
      });
    }
    const body = JSON.parse(options.body);
    if (url.includes('/urlInspection/index:inspect')) {
      if (body.inspectionUrl === 'https://project-1.example.com/') {
        const timeout = new Error('request timed out');
        timeout.name = 'TimeoutError';
        throw timeout;
      }
      activeInspections += 1;
      maximumActiveInspections = Math.max(maximumActiveInspections, activeInspections);
      await new Promise((resolve) => setTimeout(resolve, 10));
      activeInspections -= 1;
      return Response.json({ inspectionResult: { indexStatusResult: {
        verdict: 'PASS',
        coverageState: 'Submitted and indexed',
      } } });
    }
    if (body.dimensions?.includes('query')) return Response.json({ rows: [] });
    return Response.json({ rows: [{ clicks: 0, impressions: 1, ctr: 0, position: 8 }] });
  };
  const projects = Array.from({ length: 8 }, (_, index) => ({
    id: `project-${index + 1}`,
    domains: [`project-${index + 1}.example.com`],
  }));

  const result = await collectSearchConsoleOutcomes({
    projects,
    accessToken: 'not-retained',
    quotaProject: 'quota-project',
    fetchImpl,
    now: new Date('2026-08-05T12:00:00.000Z'),
  });

  assert.equal(result.bundle.observations.length, 8);
  assert.equal(maximumActiveInspections, 4);
  assert.equal(result.bundle.observations[0].indexInspection.state, 'unavailable');
  assert.equal(
    result.bundle.observations[0].metrics.find((metric) => metric.label === 'Search impressions').value,
    1,
  );
});

test('builds one desired sitemap set from projects and root domains', () => {
  assert.deepEqual(
    searchConsoleSitemapTargets(
      [
        { id: 'app', domains: ['app.example.com'] },
        { id: 'root', domains: ['example.com'] },
      ],
      ['example.com', 'personal.dev'],
      { 'personal.dev': 'https://personal.dev/sitemap-index.xml' },
    ),
    [
      { id: 'app', domain: 'app.example.com', sitemapUrl: 'https://app.example.com/sitemap.xml' },
      { id: 'root', domain: 'example.com', sitemapUrl: 'https://example.com/sitemap.xml' },
      { id: 'root:personal.dev', domain: 'personal.dev', sitemapUrl: 'https://personal.dev/sitemap-index.xml' },
    ],
  );
});

test('rejects a sitemap override on another host', () => {
  assert.throws(
    () => searchConsoleSitemapTargets([], ['example.com'], {
      'example.com': 'https://other.example/sitemap.xml',
    }),
    /must stay on its canonical domain/,
  );
});

test('previews and applies exact sitemap additions and removals', async () => {
  const requests = [];
  const fetchImpl = async (url, options = {}) => {
    const method = options.method ?? 'GET';
    requests.push({ url, method });
    if (url.endsWith('/sites')) {
      return Response.json({
        siteEntry: [{ siteUrl: 'sc-domain:example.com', permissionLevel: 'siteOwner' }],
      });
    }
    if (method === 'PUT' || method === 'DELETE') return new Response(null, { status: 204 });
    return Response.json({ sitemap: [
      { path: 'https://app.example.com/sitemap.xml', errors: 0, warnings: 0 },
      { path: 'https://retired.example.com/sitemap-index.xml', errors: 1, warnings: 0 },
    ] });
  };
  const targets = searchConsoleSitemapTargets(
    [{ id: 'app', domains: ['app.example.com'] }],
    ['example.com'],
  );

  const preview = await reconcileSearchConsoleSitemaps({
    targets,
    accessToken: 'not-retained',
    quotaProject: 'quota-project',
    fetchImpl,
  });
  assert.deepEqual(preview.actions.map(({ action, state, sitemapUrl }) => [action, state, sitemapUrl]), [
    ['retain', 'unchanged', 'https://app.example.com/sitemap.xml'],
    ['add', 'planned', 'https://example.com/sitemap.xml'],
    ['remove', 'planned', 'https://retired.example.com/sitemap-index.xml'],
  ]);
  assert.equal(requests.filter(({ method }) => method === 'PUT' || method === 'DELETE').length, 0);

  const applied = await reconcileSearchConsoleSitemaps({
    targets,
    accessToken: 'not-retained',
    quotaProject: 'quota-project',
    fetchImpl,
    apply: true,
  });
  assert.deepEqual(applied.actions.map(({ action, state }) => [action, state]), [
    ['retain', 'unchanged'],
    ['add', 'submitted'],
    ['remove', 'deleted'],
  ]);
  assert.equal(requests.filter(({ method }) => method === 'PUT').length, 1);
  assert.equal(requests.filter(({ method }) => method === 'DELETE').length, 1);
});

test('fails closed for unavailable properties and listing errors', async () => {
  const fetchImpl = async (url) => {
    if (url.endsWith('/sites')) {
      return Response.json({
        siteEntry: [{ siteUrl: 'sc-domain:example.com', permissionLevel: 'siteOwner' }],
      });
    }
    return Response.json({ error: { message: 'provider unavailable' } }, { status: 503 });
  };
  const result = await reconcileSearchConsoleSitemaps({
    targets: searchConsoleSitemapTargets(
      [{ id: 'blocked', domains: ['app.example.com'] }],
      ['missing.test'],
    ),
    accessToken: 'not-retained',
    quotaProject: 'quota-project',
    fetchImpl,
    apply: true,
  });

  assert.deepEqual(result.actions.map(({ targetId, state }) => [targetId, state]), [
    ['blocked', 'blocked'],
    ['root:missing.test', 'property-unavailable'],
  ]);
});

test('keeps Google sitemap submission automatic and bounded', async () => {
  const requests = [];
  const fetchImpl = async (url, options = {}) => {
    requests.push({ url, method: options.method ?? 'GET' });
    if (url.endsWith('/sites')) {
      return Response.json({
        siteEntry: [{ siteUrl: 'sc-domain:example.com', permissionLevel: 'siteOwner' }],
      });
    }
    if (options.method === 'PUT') {
      if (url.includes(encodeURIComponent('https://blocked.example.com/sitemap.xml'))) {
        return Response.json({ error: { message: 'insufficient scope' } }, { status: 403 });
      }
      return new Response(null, { status: 204 });
    }
    return Response.json({
      sitemap: url.includes(encodeURIComponent('sc-domain:example.com'))
        ? [{
            path: 'https://ready.example.com/sitemap.xml',
            lastSubmitted: '2026-08-01T12:00:00.000Z',
          }]
        : [],
    });
  };

  const results = await ensureSearchConsoleSitemaps({
    projects: [
      { id: 'ready', domains: ['ready.example.com'] },
      { id: 'new', domains: ['new.example.com'] },
      { id: 'blocked', domains: ['blocked.example.com'] },
      { id: 'missing', domains: ['missing.test'] },
    ],
    accessToken: 'not-retained',
    quotaProject: 'quota-project',
    fetchImpl,
    now: new Date('2026-08-04T12:00:00.000Z'),
  });

  assert.deepEqual(results.map((result) => [result.projectId, result.state]), [
    ['ready', 'already-submitted'],
    ['new', 'submitted'],
    ['blocked', 'blocked'],
    ['missing', 'property-unavailable'],
  ]);
  assert.equal(requests.filter((request) => request.method === 'PUT').length, 2);
  assert.equal(results[0].submittedAt, '2026-08-01T12:00:00.000Z');
  assert.equal(results[1].submittedAt, '2026-08-04T12:00:00.000Z');
});

test('attaches successful sitemap evidence to matching Search observations', () => {
  const bundle = {
    schema: 'fleet.visibility-outcome-bundle.v1',
    observations: [
      { projectId: 'ready', indexInspection: { state: 'not-indexed' } },
      { projectId: 'blocked', indexInspection: { state: 'not-indexed' } },
    ],
  };
  const attached = attachSitemapSubmissionState(bundle, [
    { projectId: 'ready', state: 'submitted', submittedAt: '2026-08-04T12:00:00.000Z' },
    { projectId: 'blocked', state: 'blocked' },
  ]);

  assert.deepEqual(attached.observations[0].indexInspection, {
    state: 'not-indexed',
    sitemapSubmissionState: 'submitted',
    sitemapSubmittedAt: '2026-08-04T12:00:00.000Z',
  });
  assert.deepEqual(attached.observations[1].indexInspection, { state: 'not-indexed' });
});

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

test('builds one exact Search Console property link', () => {
  assert.equal(
    searchConsoleProviderUrl('sc-domain:example.com'),
    'https://search.google.com/search-console/performance/search-analytics?resource_id=sc-domain%3Aexample.com',
  );
  assert.equal(searchConsoleProviderUrl(''), null);
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
    if (url.includes('/urlInspection/index:inspect')) {
      return Response.json({ inspectionResult: { indexStatusResult: {
        verdict: 'PASS',
        coverageState: 'Submitted and indexed',
        robotsTxtState: 'ALLOWED',
        indexingState: 'INDEXING_ALLOWED',
        pageFetchState: 'SUCCESSFUL',
        lastCrawlTime: '2026-07-25T12:00:00Z',
        userCanonical: body.inspectionUrl,
        googleCanonical: body.inspectionUrl,
        sitemap: [`${body.inspectionUrl}sitemap.xml`],
      } } });
    }
    const filter = body.dimensionFilterGroups[0].filters[0].expression;
    if (body.dimensions?.includes('query')) {
      return filter === 'https://one.example.com/'
        ? Response.json({ rows: [
            { keys: ['private pace app', 'https://one.example.com/private'], clicks: 2, impressions: 10, ctr: 0.2, position: 2.5 },
            { keys: ['heypace', 'https://one.example.com/'], clicks: 0, impressions: 4, ctr: 0, position: 6 },
          ] })
        : Response.json({});
    }
    if (body.dimensions?.includes('date')) {
      return filter === 'https://one.example.com/'
        ? Response.json({ rows: [
            { keys: ['2026-07-27'], clicks: 1, impressions: 8, ctr: 0.125, position: 5 },
            { keys: ['2026-07-28'], clicks: 1, impressions: 12, ctr: 1 / 12, position: 4 },
          ] })
        : Response.json({ rows: [] });
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

  assert.equal(requests.length, 11);
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
  assert.match(result.bundle.observations[0].providerUrl, /resource_id=sc-domain%3Aexample\.com$/);
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
  assert.deepEqual(result.bundle.observations[0].indexInspection, {
    inspectedUrl: 'https://one.example.com/',
    state: 'indexed',
    verdict: 'PASS',
    coverageState: 'Submitted and indexed',
    robotsTxtState: 'ALLOWED',
    indexingState: 'INDEXING_ALLOWED',
    pageFetchState: 'SUCCESSFUL',
    lastCrawlTime: '2026-07-25T12:00:00.000Z',
    userCanonical: 'https://one.example.com/',
    googleCanonical: 'https://one.example.com/',
    sitemapUrls: ['https://one.example.com/sitemap.xml'],
  });
  const queryRequest = requests.find((request) => request.body?.dimensions?.includes('query'));
  assert.deepEqual(queryRequest.body.dimensions, ['query', 'page']);
  assert.equal(queryRequest.body.rowLimit, 25);
  assert.equal(result.bundle.observations[0].period.start, '2026-07-01T00:00:00.000Z');
  assert.equal(result.bundle.observations[0].period.end, '2026-07-28T23:59:59.999Z');
  assert.deepEqual(result.bundle.observations[0].dailySeries, [
    { date: '2026-07-27', impressions: 8, clicks: 1, ctr: 12.5, position: 5 },
    { date: '2026-07-28', impressions: 12, clicks: 1, ctr: (1 / 12) * 100, position: 4 },
  ]);
  assert.equal(result.bundle.observations[0].previousPeriod.start, '2026-06-03T00:00:00.000Z');
  assert.equal(result.bundle.observations[0].previousPeriod.end, '2026-06-30T23:59:59.999Z');
});
