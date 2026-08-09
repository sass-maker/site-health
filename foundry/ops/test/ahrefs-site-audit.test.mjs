import assert from 'node:assert/strict';
import test from 'node:test';

import {
  AhrefsSiteAuditError,
  collectAhrefsSiteAuditHealth,
  renderAhrefsSiteAuditErrorMarkdown,
  renderAhrefsSiteAuditMarkdown,
} from '../lib/ahrefs-site-audit.mjs';

const now = new Date('2026-08-09T00:00:00Z');
const brands = [
  { rootDomain: 'alpha.test', canonicalName: 'Alpha' },
  { rootDomain: 'beta.test', canonicalName: 'Beta' },
];

test('maps fresh projects and preserves zero and null Site Audit metrics', async () => {
  const result = await collectAhrefsSiteAuditHealth({
    apiKey: 'not-printed',
    brands,
    now,
    fetchImpl: response(200, {
      healthscores: [
        project('1', 'https://www.alpha.test/', { health_score: 0 }),
        project('2', 'https://beta.test', { urls_with_notices: null }),
      ],
    }),
  });
  assert.equal(result.status, 'complete');
  assert.equal(result.observations[0].siteAudit.healthScore, 0);
  assert.equal(result.observations[1].siteAudit.urlsWithNotices, null);
  assert.equal(result.summary.fresh, 2);
  const markdown = renderAhrefsSiteAuditMarkdown(result);
  assert.match(markdown, /Ahrefs Health Score/);
  assert.doesNotMatch(markdown, /not-printed/);
});

test('fails closed for 401 and 403 entitlement responses', async () => {
  for (const status of [401, 403]) {
    await assert.rejects(
      collectAhrefsSiteAuditHealth({
        apiKey: 'secret',
        brands,
        now,
        fetchImpl: response(status, {}),
      }),
      (error) => error instanceof AhrefsSiteAuditError
        && error.code === 'auth-entitlement-error'
        && error.httpStatus === status,
    );
  }
});

test('reports missing and stale projects as partial without zero filling', async () => {
  const result = await collectAhrefsSiteAuditHealth({
    apiKey: 'secret',
    brands,
    now,
    maxAgeDays: 14,
    fetchImpl: response(200, {
      healthscores: [project('1', 'https://alpha.test', { date: '2026-07-01T00:00:00Z' })],
    }),
  });
  assert.equal(result.status, 'partial');
  assert.equal(result.observations[0].status, 'stale-crawl');
  assert.equal(result.observations[1].status, 'missing-project');
  assert.equal(result.observations[1].siteAudit.healthScore, null);
});

test('keeps incomplete crawls explicit', async () => {
  const result = await collectAhrefsSiteAuditHealth({
    apiKey: 'secret',
    brands: [brands[0]],
    now,
    fetchImpl: response(200, {
      healthscores: [project('1', 'https://alpha.test', { date: null, status: null })],
    }),
  });
  assert.equal(result.status, 'partial');
  assert.equal(result.observations[0].status, 'no-completed-crawl');
  assert.equal(result.observations[0].siteAudit.crawlDate, null);
});

test('selects the newest duplicate target and reports ambiguity', async () => {
  const result = await collectAhrefsSiteAuditHealth({
    apiKey: 'secret',
    brands: [brands[0]],
    now,
    fetchImpl: response(200, {
      healthscores: [
        project('older', 'https://alpha.test', { date: '2026-08-01T00:00:00Z', health_score: 80 }),
        project('newer', 'https://www.alpha.test', { date: '2026-08-08T00:00:00Z', health_score: 95 }),
      ],
    }),
  });
  assert.equal(result.status, 'partial');
  assert.equal(result.observations[0].status, 'ambiguous-project');
  assert.equal(result.observations[0].project.id, 'newer');
  assert.equal(result.observations[0].siteAudit.healthScore, 95);
});

test('rejects malformed responses and invalid numeric fields', async () => {
  await assert.rejects(
    collectAhrefsSiteAuditHealth({
      apiKey: 'secret', brands, now, fetchImpl: response(200, {}),
    }),
    /healthscores array/,
  );
  await assert.rejects(
    collectAhrefsSiteAuditHealth({
      apiKey: 'secret',
      brands: [brands[0]],
      now,
      fetchImpl: response(200, {
        healthscores: [project('1', 'https://alpha.test', { total: 'unknown' })],
      }),
    }),
    /must be a number or null/,
  );
});

test('requires a runtime key and renders a secret-free blocked report', async () => {
  let error;
  try {
    await collectAhrefsSiteAuditHealth({ brands, now });
  } catch (caught) {
    error = caught;
  }
  assert.equal(error.code, 'missing-api-key');
  const markdown = renderAhrefsSiteAuditErrorMarkdown(error, { now });
  assert.match(markdown, /Status: blocked — missing-api-key/);
  assert.match(markdown, /No Site Audit metric is reported as zero/);
});

test('transport errors cannot echo credential-shaped fetch details', async () => {
  await assert.rejects(
    collectAhrefsSiteAuditHealth({
      apiKey: 'private-value',
      brands,
      now,
      fetchImpl: async () => {
        throw new Error('request failed with Bearer private-value');
      },
    }),
    (error) => error.code === 'request-failed'
      && !error.message.includes('private-value')
      && !error.message.includes('Bearer'),
  );
});

function project(id, targetUrl, overrides = {}) {
  return {
    project_id: id,
    project_name: `Project ${id}`,
    target_protocol: 'https',
    target_url: targetUrl,
    target_mode: 'domain',
    date: '2026-08-08T00:00:00Z',
    status: 'Completed',
    health_score: 91,
    urls_with_errors: 2,
    urls_with_warnings: 3,
    urls_with_notices: 4,
    total: 100,
    ...overrides,
  };
}

function response(status, body) {
  return async (_url, options) => {
    assert.match(options.headers.Authorization, /^Bearer /);
    return {
      ok: status >= 200 && status < 300,
      status,
      statusText: status === 401 ? 'Unauthorized' : status === 403 ? 'Forbidden' : '',
      json: async () => body,
    };
  };
}
