import assert from 'node:assert/strict';
import test from 'node:test';

import {
  checkGeoIdentityLinks,
  collectGeoIdentityLinks,
} from '../lib/geo-identity-links.mjs';

const catalog = {
  geoIdentities: [
    {
      id: 'public-product',
      origin: 'https://product.example',
      source: { state: 'public', url: 'https://github.com/example/product' },
      docs: { state: 'public', url: 'https://product.example/docs' },
      officialProfiles: ['https://github.com/example/product'],
      availability: { primary: 'web', appStore: 'not-applicable' },
      pricing: { state: 'published', url: 'https://product.example/pricing' },
    },
    {
      id: 'internal-product',
      origin: 'https://internal.example',
      source: { state: 'internal', path: 'foundry/helpers/internal' },
      docs: { state: 'landing-only', url: 'https://internal.example' },
      officialProfiles: ['https://github.com/example'],
      availability: { primary: 'web', appStore: 'not-applicable' },
      pricing: { state: 'not-applicable' },
    },
  ],
};

test('collects only applicable declared public destinations', () => {
  const links = collectGeoIdentityLinks(catalog);
  assert.equal(links.some((entry) => entry.kind === 'app-store'), false);
  assert.equal(
    links.some(
      (entry) => entry.projectId === 'internal-product' && entry.kind === 'source',
    ),
    false,
  );
  assert.equal(
    links.some(
      (entry) => entry.projectId === 'public-product' && entry.kind === 'source',
    ),
    true,
  );
});

test('reports HTTP and network failures without converting them to passes', async () => {
  const audit = await checkGeoIdentityLinks(catalog, {
    observedAt: '2026-08-07T00:00:00.000Z',
    concurrency: 2,
    fetcher: async (url) => {
      if (url.endsWith('/docs')) {
        return new Response('', { status: 404 });
      }
      if (url.includes('/pricing')) throw new Error('connection refused');
      return new Response('', { status: 200 });
    },
  });

  assert.equal(audit.schema, 'fleet.geo-identity-link-audit.v1');
  assert.equal(audit.projectCount, 2);
  assert.equal(audit.failed, 2);
  assert.deepEqual(
    audit.results.filter((result) => result.status === 'fail').map((result) => result.reason),
    ['HTTP 404', 'connection refused'],
  );
});

test('rejects unsafe concurrency and timeout values', async () => {
  await assert.rejects(
    checkGeoIdentityLinks(catalog, { concurrency: 0 }),
    /concurrency must be an integer from 1 to 12/,
  );
  await assert.rejects(
    checkGeoIdentityLinks(catalog, { timeoutMs: 50 }),
    /timeout must be an integer from 100 to 30000 ms/,
  );
});
