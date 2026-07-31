import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import {
  appendVisibilityOutcomeBundle,
  readVisibilityOutcomes,
  VISIBILITY_OUTCOME_BUNDLE_SCHEMA,
} from '../lib/visibility-outcome-store.mjs';

const FLEET_ROOT = resolve(import.meta.dirname, '../../..');

function searchObservation(overrides = {}) {
  return {
    id: 'search-pace-2026-07-30',
    projectId: 'pace',
    family: 'search',
    provider: 'google-search-console',
    scope: 'sc-domain:heypace.app',
    observedAt: '2026-07-31T12:00:00.000Z',
    period: {
      start: '2026-07-01T00:00:00.000Z',
      end: '2026-07-30T23:59:59.000Z',
    },
    metrics: [
      { label: 'Search impressions', value: 120 },
      { label: 'Search clicks', value: 8 },
      { label: 'Search CTR', value: 6.67 },
      { label: 'Search average position', value: 14.2 },
    ],
    searchTerms: [
      { query: 'private pace app', impressions: 40, clicks: 5, ctr: 12.5, position: 3.2 },
    ],
    ...overrides,
  };
}

function bundle(observations) {
  return { schema: VISIBILITY_OUTCOME_BUNDLE_SCHEMA, observations };
}

test('records normalized provider aggregates idempotently', (context) => {
  const directory = mkdtempSync(join(tmpdir(), 'fleet-visibility-outcomes-'));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const path = join(directory, 'ledger.jsonl');
  const options = { path, allowedProjectIds: new Set(['pace']) };

  const first = appendVisibilityOutcomeBundle(bundle([searchObservation()]), options);
  const second = appendVisibilityOutcomeBundle(bundle([searchObservation()]), options);

  assert.equal(first.recorded, 1);
  assert.equal(second.recorded, 0);
  assert.equal(second.duplicates, 1);
  assert.deepEqual(readVisibilityOutcomes({ path })[0].metrics[0], {
    label: 'Search impressions',
    value: 120,
    unit: 'impressions',
    direction: 'higher-is-better',
  });
  assert.deepEqual(readVisibilityOutcomes({ path })[0].searchTerms, [
    { query: 'private pace app', impressions: 40, clicks: 5, ctr: 12.5, position: 3.2 },
  ]);
});

test('rejects the complete bundle before writing any partial observation', (context) => {
  const directory = mkdtempSync(join(tmpdir(), 'fleet-visibility-outcomes-'));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const path = join(directory, 'ledger.jsonl');

  assert.throws(
    () => appendVisibilityOutcomeBundle(bundle([
      searchObservation(),
      searchObservation({
        id: 'cloudflare-pace-2026-07-30',
        family: 'ai-crawl',
        provider: 'cloudflare-ai-crawl-control',
        rawResponse: 'must never be retained',
      }),
    ]), { path, allowedProjectIds: new Set(['pace']) }),
    /rawResponse is not allowed/,
  );
  assert.equal(readVisibilityOutcomes({ path }).length, 0);
});

test('fails closed when an existing observation id is reused with new values', (context) => {
  const directory = mkdtempSync(join(tmpdir(), 'fleet-visibility-outcomes-'));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const path = join(directory, 'ledger.jsonl');
  const options = { path, allowedProjectIds: new Set(['pace']) };
  appendVisibilityOutcomeBundle(bundle([searchObservation()]), options);

  assert.throws(
    () => appendVisibilityOutcomeBundle(bundle([searchObservation({
      metrics: [{ label: 'Search impressions', value: 121 }],
    })]), options),
    /observation id conflict/,
  );
  assert.equal(readVisibilityOutcomes({ path }).length, 1);
});

test('rejects zero as a Search Console average position', () => {
  assert.throws(
    () => appendVisibilityOutcomeBundle(bundle([searchObservation({
      metrics: [{ label: 'Search average position', value: 0 }],
    })]), { allowedProjectIds: new Set(['pace']) }),
    /must exceed 0/,
  );
});

test('ignores malformed records already present in the private ledger', (context) => {
  const directory = mkdtempSync(join(tmpdir(), 'fleet-visibility-outcomes-'));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const path = join(directory, 'ledger.jsonl');
  writeFileSync(path, `${JSON.stringify({
    schemaVersion: 'fleet.visibility-outcome.v1',
    ...searchObservation({ observedAt: '2026-06-01T00:00:00.000Z' }),
  })}\n`, 'utf8');

  assert.deepEqual(readVisibilityOutcomes({ path }), []);
});

test('the CLI ingests an approved bundle without provider access', (context) => {
  const directory = mkdtempSync(join(tmpdir(), 'fleet-visibility-outcomes-cli-'));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const inputPath = join(directory, 'bundle.json');
  const ledgerPath = join(directory, 'ledger.jsonl');
  writeFileSync(inputPath, JSON.stringify(bundle([searchObservation()])), 'utf8');

  const result = spawnSync(process.execPath, [
    resolve(FLEET_ROOT, 'foundry/ops/scripts/visibility-outcomes-ingest.mjs'),
    '--input',
    inputPath,
    '--ledger',
    ledgerPath,
  ], { cwd: FLEET_ROOT, encoding: 'utf8' });

  assert.equal(result.status, 0, result.stderr);
  const receipt = JSON.parse(result.stdout);
  assert.equal(receipt.recorded, 1);
  assert.deepEqual(receipt.acceptedProjects, ['pace']);
  assert.equal(readFileSync(ledgerPath, 'utf8').trim().split('\n').length, 1);
});
