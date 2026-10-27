import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  collectProviderRevenueEvidence,
  providerRevenueObservations,
  readProviderRevenueEvidence,
  writeProviderRevenueEvidence,
} from '../lib/dashboard-backend/provider-revenue-evidence.mjs';

const projects = [{ id: 'one', name: 'One', lifecycle: { status: 'active' }, status: 'active' }];
const total = (overrides = {}) => ({ provider: 'stripe', account_id: 'acct-one', mode: 'live', currency: 'USD',
  gross_minor: 1200, refunds_minor: 200, net_minor: 1000, payments: 2, refunds: 1,
  attributed_payments: 1, pending_refunds: 0, pending_refunds_minor: 0, ...overrides });
const report = (totals) => ({ schema_version: 1, from: 1_790_000_000_000, to: 1_792_592_000_000,
  source: 'd1', basis: 'provider_object_created', coverage_note: 'Provider-created records only.', totals,
  breakdown: 'source', dimensions: [], diagnostics_truncated: false, unresolved: [] });
const fetchFixture = (body) => async (url, options) => ({ ok: true, json: async () => url.endsWith('/v1/apps')
  ? { apps: [{ app: { id: 'one', name: 'One' }, environments: [{ id: 'prod', name: 'production' }] }] }
  : body });

test('keeps provider, account, live/test mode, and currency namespaces separate with explicit minor units', () => {
  const snapshot = { observedAt: '2026-10-27T00:00:00.000Z', records: { one: { observedAt: '2026-10-27T00:00:00.000Z', window: 'window', totals: [
    total(), total({ provider: 'polar', account_id: 'acct-two', mode: 'test', currency: 'EUR', net_minor: 250 }),
    total({ provider: 'custom', account_id: 'acct-three', currency: 'CAD', net_minor: 350 }),
  ] } } };
  const rows = providerRevenueObservations(projects, snapshot);
  assert.equal(rows.length, 3);
  assert.deepEqual(rows.map(({ provider, accountId, mode, currency, value, unit }) => ({ provider, accountId, mode, currency, value, unit })), [
    { provider: 'stripe', accountId: 'acct-one', mode: 'live', currency: 'USD', value: 1000, unit: 'USD minor units' },
    { provider: 'polar', accountId: 'acct-two', mode: 'test', currency: 'EUR', value: 250, unit: 'EUR minor units' },
    { provider: 'custom', accountId: 'acct-three', mode: 'live', currency: 'CAD', value: 350, unit: 'CAD minor units' },
  ]);
  assert.ok(rows.every((row) => row.qualification === 'proxy' && /no qualified financial score/.test(row.gap)));
  assert.match(rows[1].label, /polar · acct-two · test/);
});

test('empty provider result stays unknown rather than becoming zero', async () => {
  const snapshot = await collectProviderRevenueEvidence({ projects, credential: 'fixture', fetcher: fetchFixture(report([])), now: () => 1_792_592_000_000 });
  assert.equal(snapshot.records.one.status, 'empty');
  assert.equal(snapshot.records.one.totals, null);
  assert.equal(providerRevenueObservations(projects, snapshot)[0].value, null);
  assert.match(snapshot.records.one.gap, /does not establish that no connected sources or revenue exist/);
});

test('collector validates provider report and makes only fixed-origin GET requests', async () => {
  const calls = [];
  const fetcher = async (url, options) => { calls.push({ url, options }); return fetchFixture(report([total()]))(url, options); };
  const snapshot = await collectProviderRevenueEvidence({ projects, credential: 'fixture', fetcher, now: () => 1_792_592_000_000 });
  assert.equal(snapshot.records.one.totals[0].net_minor, 1000);
  assert.equal(calls.length, 2);
  for (const { url, options } of calls) {
    assert.equal(new URL(url).origin, 'https://health.sassmaker.com');
    assert.equal(options.method, 'GET'); assert.equal(options.redirect, 'error');
  }
  assert.ok(!JSON.stringify(snapshot).includes('fixture'));
  const invalid = await collectProviderRevenueEvidence({ projects, credential: 'fixture', fetcher: fetchFixture(report([total({ currency: 'usd' })])), now: () => 1_792_592_000_000 });
  assert.equal(invalid.records.one.status, 'failed');
  assert.equal(invalid.records.one.totals, null);
  assert.equal(invalid.records.one.observedAt, null);
  const staleWindow = await collectProviderRevenueEvidence({ projects, credential: 'fixture', fetcher: fetchFixture({ ...report([total()]), from: 1_789_000_000_000 }), now: () => 1_792_592_000_000 });
  assert.equal(staleWindow.records.one.totals, null);
});

test('failed refresh keeps prior totals and observed date in private snapshot and history', () => {
  const dir = mkdtempSync(join(tmpdir(), 'provider-revenue-'));
  const path = join(dir, 'app-health-provider-revenue.json');
  writeProviderRevenueEvidence({ observedAt: '2026-10-26T00:00:00.000Z', records: { one: {
    status: 'available', totals: [total()], observedAt: '2026-10-26T00:00:00.000Z', window: 'old window',
  } } }, path);
  writeProviderRevenueEvidence({ observedAt: '2026-10-27T00:00:00.000Z', records: { one: {
    status: 'failed', totals: null, observedAt: null, lastAttemptAt: '2026-10-27T00:00:00.000Z', gap: 'Invalid response',
  } } }, path);
  const snapshot = readProviderRevenueEvidence(path);
  assert.equal(snapshot.records.one.status, 'retained');
  assert.equal(snapshot.records.one.totals[0].net_minor, 1000);
  assert.equal(snapshot.records.one.observedAt, '2026-10-26T00:00:00.000Z');
  assert.match(snapshot.records.one.gap, /retained observation/);
  assert.match(providerRevenueObservations(projects, snapshot)[0].gap, /retained observation/);
  assert.equal(statSync(path).mode & 0o777, 0o600);
  const history = readFileSync(join(dir, 'provider-revenue-history', '2026-10-27.json'), 'utf8');
  assert.ok(history.includes('1000'));
});

test('successful empty and unmapped results replace old totals with unknown evidence', () => {
  for (const status of ['empty', 'unmapped']) {
    const dir = mkdtempSync(join(tmpdir(), `provider-revenue-${status}-`));
    const path = join(dir, 'app-health-provider-revenue.json');
    writeProviderRevenueEvidence({ observedAt: '2026-10-26T00:00:00.000Z', records: { one: {
      status: 'available', totals: [total()], observedAt: '2026-10-26T00:00:00.000Z', window: 'old window',
    } } }, path);
    writeProviderRevenueEvidence({ observedAt: '2026-10-27T00:00:00.000Z', records: { one: {
      status, totals: null, observedAt: null, gap: status === 'empty' ? 'No provider totals returned.' : 'Mapping is ambiguous.',
    } } }, path);
    const snapshot = readProviderRevenueEvidence(path);
    assert.equal(snapshot.records.one.status, status);
    assert.equal(snapshot.records.one.totals, null);
    assert.equal(providerRevenueObservations(projects, snapshot)[0].value, null);
    assert.doesNotMatch(snapshot.records.one.gap, /Refresh unavailable/);
  }
});
