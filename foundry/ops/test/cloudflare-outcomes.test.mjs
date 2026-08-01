import assert from 'node:assert/strict';
import test from 'node:test';

import {
  cloudflareProviderUrls,
  collectCloudflareOutcomes,
  selectCloudflareZone,
} from '../lib/cloudflare-outcomes.mjs';

function response(body, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  };
}

test('selects the longest matching active Cloudflare zone suffix', () => {
  const zone = selectCloudflareZone('app.example.com', [
    { id: 'root', name: 'example.com' },
    { id: 'app', name: 'app.example.com' },
  ]);
  assert.deepEqual(zone, { id: 'app', name: 'app.example.com' });
  assert.equal(selectCloudflareZone('other.test', [{ id: 'root', name: 'example.com' }]), null);
});

test('builds exact provider pages for one Cloudflare zone', () => {
  assert.deepEqual(cloudflareProviderUrls('account-1', 'zone-1'), {
    traffic: 'https://dash.cloudflare.com/account-1/zone-1/analytics/traffic',
    performance: 'https://dash.cloudflare.com/account-1/zone-1/speed/observatory',
    ai: 'https://dash.cloudflare.com/account-1/zone-1/ai',
  });
});

test('collects bounded traffic, AI crawl, referral, and field-vital observations', async () => {
  const requests = [];
  const fetchImpl = async (url, options = {}) => {
    requests.push({ url, options });
    if (url.includes('/zones?')) {
      return response({
        success: true,
        result: [{ id: 'zone-1', name: 'heypace.app', status: 'active' }],
      });
    }
    const body = JSON.parse(options.body);
    if (body.query.includes('FleetCloudflareAccount')) {
      return response({ data: { viewer: { accounts: [{
        totals: [{ count: 20, sum: { visits: 12 }, dimensions: { requestHost: 'heypace.app' } }],
        pages: [
          { count: 14, dimensions: { requestHost: 'heypace.app', requestPath: '/' } },
          { count: 6, dimensions: { requestHost: 'heypace.app', requestPath: '/pricing' } },
        ],
        referrers: [
          { count: 5, sum: { visits: 3 }, dimensions: { requestHost: 'heypace.app', refererHost: 'chatgpt.com' } },
          { count: 6, sum: { visits: 4 }, dimensions: { requestHost: 'heypace.app', refererHost: 'www.google.com' } },
        ],
        vitals: [{
          count: 9,
          dimensions: { requestHost: 'heypace.app' },
          quantiles: {
            largestContentfulPaintP75: 2_400_000,
            interactionToNextPaintP75: 180_000,
            cumulativeLayoutShiftP75: 0.03,
            timeToFirstByteP75: 700_000,
          },
        }],
      }] } } });
    }
    return response({ data: { viewer: { zones: [{ requests: [
      {
        count: 3,
        dimensions: {
          clientRequestHTTPHost: 'heypace.app',
          clientRequestPath: '/robots.txt',
          edgeResponseStatus: 200,
          userAgent: 'ClaudeBot/1.0',
          verifiedBotCategory: 'AI Crawler',
        },
      },
      {
        count: 1,
        dimensions: {
          clientRequestHTTPHost: 'heypace.app',
          clientRequestPath: '/',
          edgeResponseStatus: 200,
          userAgent: 'ChatGPT-User/1.0',
          verifiedBotCategory: 'AI Assistant',
        },
      },
    ] }] } } });
  };

  const result = await collectCloudflareOutcomes({
    projects: [{ id: 'pace', domains: ['heypace.app'] }],
    token: 'test-token',
    accountId: 'account-1',
    fetchImpl,
    now: new Date('2026-08-01T12:00:00.000Z'),
  });

  assert.equal(requests.length, 3);
  assert.equal(result.projectCount, 1);
  assert.equal(result.zoneCount, 1);
  assert.deepEqual(result.period, {
    start: '2026-07-04',
    end: '2026-07-31',
    aiDay: '2026-07-31',
  });
  assert.deepEqual(result.bundle.observations.map((item) => item.family), [
    'web-traffic',
    'ai-referral',
    'web-vitals',
    'ai-crawl',
  ]);
  const traffic = result.bundle.observations[0];
  assert.deepEqual(traffic.metrics, [
    { label: 'Web visits', value: 12 },
    { label: 'Web page views', value: 20 },
    { label: 'Search referral visits', value: 4 },
  ]);
  assert.equal(traffic.breakdowns[0].values[0].label, '/');
  assert.match(traffic.providerUrl, /zone-1\/analytics\/traffic$/);

  const referral = result.bundle.observations[1];
  assert.deepEqual(referral.metrics, [
    { label: 'AI referral visits', value: 3 },
    { label: 'AI referral page views', value: 5 },
  ]);

  const vitals = result.bundle.observations[2];
  assert.match(vitals.providerUrl, /zone-1\/speed\/observatory$/);
  assert.deepEqual(vitals.metrics, [
    { label: 'Field LCP', value: 2400 },
    { label: 'Field INP', value: 180 },
    { label: 'Field CLS', value: 0.03 },
    { label: 'Field TTFB', value: 700 },
    { label: 'RUM samples', value: 9 },
  ]);

  const crawl = result.bundle.observations[3];
  assert.match(crawl.providerUrl, /zone-1\/ai$/);
  assert.deepEqual(crawl.metrics, [
    { label: 'AI crawler requests', value: 4 },
    { label: 'AI crawled URLs', value: 2 },
  ]);
  assert.deepEqual(crawl.breakdowns[0].values, [
    { label: 'ClaudeBot', value: 3 },
    { label: 'ChatGPT-User', value: 1 },
  ]);
});

test('requires read credentials before making a request', async () => {
  await assert.rejects(
    collectCloudflareOutcomes({ projects: [], token: null }),
    /Cloudflare read credentials are required/,
  );
});
