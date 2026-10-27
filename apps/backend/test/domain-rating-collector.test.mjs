import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  AHREFS_DOMAIN_RATING_URL,
  collectDomainRatings,
  defaultDomainRatingHistoryPath,
  DOMAIN_RATING_SCHEMA,
  readAhrefsPublicKey,
} from '../lib/domain-rating-collector.mjs';

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'site-health-domain-ratings-'));
  const path = join(root, 'domain-ratings.json');
  return { root, path };
}

function response(payload, { ok = true, status = 200 } = {}) {
  return { ok, status, async text() { return JSON.stringify(payload); } };
}

function payload(targets) {
  return { domain_rating: { license: 'https://ahrefs.com/legal/domain-rating-license', targets } };
}

const auth = { platform: 'darwin', readKeychain: () => 'test-secret-value' };

test('resolves the native history beside the default Dashboard database', () => {
  assert.equal(
    defaultDomainRatingHistoryPath({ home: '/private/home' }),
    '/private/home/Library/Application Support/Fleet Ops/founder-control/domain-ratings.json',
  );
});

test('reads only the configured macOS Keychain item and never uses Keychain elsewhere', () => {
  let invocation;
  assert.equal(readAhrefsPublicKey({
    platform: 'darwin',
    readKeychain(command, args, options) {
      invocation = { command, args, options };
      return 'key-value';
    },
  }), 'key-value');
  assert.equal(invocation.command, '/usr/bin/security');
  assert.deepEqual(invocation.args, [
    'find-generic-password', '-s', 'com.sassmaker.site-health.ahrefs-public', '-a', 'owner', '-w',
  ]);
  assert.deepEqual(invocation.options.stdio, ['ignore', 'pipe', 'ignore']);
  assert.equal(readAhrefsPublicKey({ platform: 'linux', readKeychain() { throw new Error('must not run'); } }), null);
});

test('collects, validates, attributes and atomically persists a complete Ahrefs batch', async (t) => {
  const { root, path } = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  mkdirSync(root, { recursive: true });
  let request;
  const result = await collectDomainRatings({
    targets: ['www.example.com', 'docs.example.co.uk'],
    historyPath: path,
    ...auth,
    now: () => '2026-10-27T12:00:00.000Z',
    async fetchImpl(url, options) {
      request = { url, options };
      return response(payload([
        { target: 'example.com', domain_rating: 0 },
        { target: 'example.co.uk', domain_rating: 100 },
      ]));
    },
  });

  assert.equal(request.url, AHREFS_DOMAIN_RATING_URL);
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers.authorization, 'Bearer test-secret-value');
  assert.deepEqual(JSON.parse(request.options.body), { targets: ['example.co.uk', 'example.com'], version: 'dr3' });
  assert.deepEqual(result, {
    provider: 'ahrefs', version: 'dr3', resultCount: 2, updatedAt: '2026-10-27T12:00:00.000Z',
  });
  const savedText = readFileSync(path, 'utf8');
  const saved = JSON.parse(savedText);
  assert.equal(saved.schemaVersion, DOMAIN_RATING_SCHEMA);
  assert.equal(saved.provider, 'ahrefs');
  assert.equal(saved.metric, 'domain-rating');
  assert.equal(saved.version, 'dr3');
  assert.deepEqual(saved.domains['example.com'].history, [{ ts: Date.parse('2026-10-27T12:00:00.000Z'), dr: 0 }]);
  assert.deepEqual(saved.domains['example.co.uk'].history, [{ ts: Date.parse('2026-10-27T12:00:00.000Z'), dr: 100 }]);
  assert.equal(savedText.includes('test-secret-value'), false);
  assert.equal(statSync(path).mode & 0o777, 0o600);
});

test('upserts one observation per UTC day while retaining history from earlier days', async (t) => {
  const { root, path } = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const ratings = [21, 23, 24];
  const times = [
    '2026-10-27T01:00:00.000Z',
    '2026-10-27T23:30:00.000Z',
    '2026-10-28T00:01:00.000Z',
  ];
  for (let index = 0; index < ratings.length; index += 1) {
    await collectDomainRatings({
      targets: ['example.com'], historyPath: path, ...auth,
      now: () => times[index],
      async fetchImpl() { return response(payload([{ target: 'example.com', domain_rating: ratings[index] }])); },
    });
  }
  const saved = JSON.parse(readFileSync(path, 'utf8'));
  assert.deepEqual(saved.domains['example.com'].history, [
    { ts: Date.parse(times[1]), dr: 23 },
    { ts: Date.parse(times[2]), dr: 24 },
  ]);
});

test('stores valid partial ratings, retains missing domains, and fails the run receipt', async (t) => {
  const { root, path } = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  writeFileSync(path, JSON.stringify({
    schemaVersion: DOMAIN_RATING_SCHEMA,
    provider: 'ahrefs',
    metric: 'domain-rating',
    version: 'dr3',
    updatedAt: '2026-10-20T12:00:00.000Z',
    domains: { 'old.example': { history: [{ ts: Date.parse('2026-10-20T12:00:00.000Z'), dr: 42 }] } },
  }));

  await assert.rejects(collectDomainRatings({
    targets: ['new.example', 'old.example'],
    historyPath: path,
    ...auth,
    now: () => '2026-10-27T12:00:00.000Z',
    async fetchImpl() { return response(payload([{ target: 'new.example', domain_rating: 0 }])); },
  }), (error) => {
    assert.equal(error.code, 'AHREFS_PARTIAL_RESPONSE');
    assert.match(error.message, /1 of 2 domains/);
    assert.equal(error.message.includes('test-secret-value'), false);
    return true;
  });

  const saved = JSON.parse(readFileSync(path, 'utf8'));
  assert.deepEqual(saved.domains['new.example'].history, [{ ts: Date.parse('2026-10-27T12:00:00.000Z'), dr: 0 }]);
  assert.deepEqual(saved.domains['old.example'].history, [{ ts: Date.parse('2026-10-20T12:00:00.000Z'), dr: 42 }]);
});

test('does not change existing history on total failure, malformed local data, or a busy writer', async (t) => {
  const { root, path } = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const initial = '{"preserve":"exact bytes"}\n';
  writeFileSync(path, initial);
  await assert.rejects(collectDomainRatings({
    targets: ['example.com'], historyPath: path, ...auth,
    async fetchImpl() { return response(payload([{ target: 'example.com', domain_rating: null }])); },
  }), { code: 'DOMAIN_RATING_HISTORY_INVALID' });
  assert.equal(readFileSync(path, 'utf8'), initial);

  rmSync(path);
  await assert.rejects(collectDomainRatings({
    targets: ['example.com'], historyPath: path, ...auth,
    async fetchImpl() { return response(payload([{ target: 'example.com', domain_rating: null }])); },
  }), { code: 'AHREFS_NO_RATINGS' });
  assert.equal(statSync(root).isDirectory(), true);

  writeFileSync(path, JSON.stringify({
    schemaVersion: DOMAIN_RATING_SCHEMA,
    provider: 'ahrefs', metric: 'domain-rating', version: 'dr3', updatedAt: null, domains: {},
  }));
  const lockedPath = `${path}.lock`;
  writeFileSync(lockedPath, JSON.stringify({ pid: 2_147_483_647, token: 'other-writer', createdAt: '2000-01-01T00:00:00.000Z' }));
  const before = readFileSync(path, 'utf8');
  await assert.rejects(collectDomainRatings({
    targets: ['example.com'], historyPath: path, ...auth, lockWaitMs: 20,
    async fetchImpl() { return response(payload([{ target: 'example.com', domain_rating: 16 }])); },
  }), { code: 'DOMAIN_RATING_STORAGE_BUSY' });
  assert.equal(readFileSync(path, 'utf8'), before);
  assert.equal(JSON.parse(readFileSync(lockedPath, 'utf8')).token, 'other-writer');
});

test('rejects bad provider status and keeps credentials and response body out of errors', async (t) => {
  const { root, path } = fixture();
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const secret = 'never-print-this-key';
  await assert.rejects(collectDomainRatings({
    targets: ['example.com'], historyPath: path,
    platform: 'darwin', readKeychain: () => secret,
    async fetchImpl() { return { ok: false, status: 403, async text() { return secret; } }; },
  }), (error) => {
    assert.equal(error.code, 'AHREFS_REQUEST_FAILED');
    assert.equal(error.message.includes(secret), false);
    return true;
  });
  assert.throws(() => readFileSync(path), { code: 'ENOENT' });
});
