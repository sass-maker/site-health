import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { appHealthCredential, collectUsageEvidence, importUsageExport, readUsageEvidence, usageObservations, writeUsageEvidence } from '../lib/dashboard-backend/usage-evidence.mjs';
const projects = [{ id: 'one', name: 'One', lifecycle: { status: 'active' }, status: 'active' }];

test('import filters archived/foreign records, preserves zero, never promotes events to qualified use', () => {
  const snapshot = importUsageExport({ kind: 'portfolio-usage', schemaVersion: 1, usage: { updatedAt: '2026-10-27T00:00:00Z', records: {
    one: { checkedAt: '2026-10-27T00:00:00Z', proxy: { count: 0, unit: 'browsers' }, events: [{ count: 3 }] }, foreign: { proxy: { count: 99 } },
  } } }, projects);
  assert.deepEqual(Object.keys(snapshot.records), ['one']);
  const rows = usageObservations(projects, snapshot);
  assert.equal(rows[0].value, 0); assert.equal(rows[0].qualification, 'proxy');
  assert.equal(rows[1].value, 3); assert.equal(rows[1].qualification, 'proxy');
  assert.equal(usageObservations(projects, null)[0].value, null);
});

test('collector rejects ambiguous mapping and redirects; only fixed-origin GET aggregate reads are made', async () => {
  const calls = [];
  const fetcher = async (url, options) => {
    calls.push({ url, options });
    const body = url.endsWith('/v1/apps') ? { apps: [{ app: { id: 'app', name: 'One' }, environments: [{ id: 'prod', name: 'production' }] }] }
      : { from: 1, to: 2, sampled: false, source: 'analytics-engine', sessions: 3, audience: { visitors: 0 }, events: [{ count: 2 }] };
    return { ok: true, json: async () => body };
  };
  const snapshot = await collectUsageEvidence({ projects, credential: 'fixture', fetcher });
  assert.equal(snapshot.records.one.count, 0);
  assert.equal(calls.length, 2);
  for (const call of calls) {
    assert.equal(new URL(call.url).origin, 'https://health.sassmaker.com');
    assert.equal(call.options.method, 'GET'); assert.equal(call.options.redirect, 'error');
  }
  assert.ok(!JSON.stringify(snapshot).includes('fixture'));
  const ambiguous = await collectUsageEvidence({ projects, credential: 'fixture', fetcher: async () => ({ ok: true, json: async () => ({ apps: [
    { app: { name: 'One' }, environments: [{ name: 'production' }] }, { app: { name: 'One' }, environments: [{ name: 'production' }] },
  ] }) }) });
  assert.equal(ambiguous.records.one.count, null);
  assert.equal(ambiguous.records.one.observedAt, null);
});

test('failed refresh retains the original good value and observation date', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'usage-retain-')), 'usage.json');
  writeUsageEvidence({ observedAt: '2026-10-26T00:00:00Z', records: { one: { count: 7, observedAt: '2026-10-26T00:00:00Z', unit: 'browsers' } } }, path);
  writeUsageEvidence({ observedAt: '2026-10-27T00:00:00Z', records: { one: { count: null, observedAt: null, gap: 'HTTP failure' } } }, path);
  const snapshot = readUsageEvidence(path);
  assert.equal(snapshot.records.one.count, 7);
  assert.equal(snapshot.records.one.observedAt, '2026-10-26T00:00:00Z');
  assert.match(snapshot.records.one.gap, /retained observation/);
});

test('credential resolution is asynchronous and never enters aggregate evidence', async () => {
  let resolve;
  const pending = appHealthCredential({ env: {}, readSecret: () => new Promise(done => { resolve = done; }) });
  assert.ok(pending instanceof Promise);
  resolve({ stdout: 'fixture\n' }); assert.equal(await pending, 'fixture');
});


test('approved scoped Keychain token wins over broad owner credentials without command-line secrets', async () => {
  const calls = [];
  const token = await appHealthCredential({ env: { APP_HEALTH_OWNER_TOKEN: 'broad-fixture' }, readSecret: async (...args) => {
    calls.push(args); return { stdout: 'scoped-fixture\n' };
  } });
  assert.equal(token, 'scoped-fixture');
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], '/usr/bin/security');
  assert.deepEqual(calls[0][1], ['find-generic-password', '-s', 'com.sassmaker.site-health.app-health-read', '-a', 'owner', '-w']);
  assert.ok(!JSON.stringify(calls).includes('scoped-fixture'));
  const fallback = await appHealthCredential({ env: { APP_HEALTH_OWNER_TOKEN: 'owner-fixture' }, readSecret: async () => { throw new Error('missing'); } });
  assert.equal(fallback, 'owner-fixture');
});
