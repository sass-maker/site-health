import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { validateRootBrandContract } from '../lib/root-brand-contract.mjs';
import {
  mergeRootSearchQueriesIntoObservatory,
  validateRootSearchQueryContract,
} from '../lib/root-search-query-contract.mjs';
import {
  generateReport,
  validate,
  validateRootSearchRun,
} from '../scripts/geo-observatory-record.mjs';

const config = {
  products: [
    {
      id: 'example',
      origin: 'https://example.com',
      queries: [
        {
          qid: 'example-brand',
          kind: 'brand',
          q: 'example.com',
        },
      ],
    },
  ],
};

const validEntry = {
  date: '2026-07-31',
  product: 'example',
  qid: 'example-brand',
  query: 'example.com',
  source: 'web-search',
  class: 'A',
  top: [
    'https://example.com/',
    'https://example.org/competitor',
  ],
  notes: 'The configured origin owns the first organic result.',
};

test('accepts an exact WebSearch observation with class evidence', () => {
  assert.deepEqual(validate([validEntry], config), []);
  assert.deepEqual(validate([
    {
      ...validEntry,
      top: [
        'https://www.example.com/docs',
        'https://example.org/competitor',
      ],
    },
  ], config), []);
});

test('rejects rewritten queries, unverified sources, duplicates, and false A classes', () => {
  const errors = validate([
    {
      ...validEntry,
      query: 'rewritten query',
      source: 'bing-scrape',
      class: 'A',
      top: [
        'https://example.org/competitor',
        'https://example.net/competitor',
      ],
    },
    validEntry,
  ], config);

  assert.ok(errors.some((error) => error.includes('query must exactly match')));
  assert.ok(errors.some((error) => error.includes('source must be web-search')));
  assert.ok(errors.some((error) => error.includes('duplicate product/qid')));
  assert.ok(errors.some((error) => error.includes('class A requires')));
  assert.ok(validate([null], config).some((error) => error.includes('observation must be an object')));
});

test('rejects new observations for historical queries', () => {
  const historicalConfig = structuredClone(config);
  historicalConfig.products[0].queries[0].status = 'historical';
  assert.ok(validate([validEntry], historicalConfig).some((error) =>
    error.includes('historical query cannot receive a new observation')));
});

test('allows a factual no-results C and rejects malformed URL evidence', () => {
  const noResults = {
    ...validEntry,
    class: 'C',
    top: [],
    notes: 'The exact query returned no organic results.',
  };
  assert.deepEqual(validate([noResults], config), []);

  const errors = validate([
    {
      ...validEntry,
      class: 'C',
      top: ['not-a-url', 'https://example.org/competitor'],
    },
  ], config);
  assert.ok(errors.some((error) => error.includes('absolute HTTP(S)')));
});

test('latest report shows only the later correction for a same-day query', () => {
  const invalidEarlierEntry = {
    ...validEntry,
    class: 'C',
    top: [
      'https://dictionary.example/private',
      'https://dictionary.example/public',
    ],
    notes: 'Invalid earlier observation that should not appear.',
  };
  const report = generateReport([invalidEarlierEntry, validEntry], config);

  assert.match(report, /example \/ example-brand\*\* → A/);
  assert.doesNotMatch(report, /Invalid earlier observation/);
});

const projects = JSON.parse(readFileSync(new URL('../config/projects.json', import.meta.url))).projects;
const roots = validateRootSearchQueryContract(
  JSON.parse(readFileSync(new URL('../config/root-search-queries.json', import.meta.url))),
  validateRootBrandContract(
    JSON.parse(readFileSync(new URL('../config/root-brands.json', import.meta.url))),
    projects,
  ),
  projects,
);
const rootRunConfig = mergeRootSearchQueriesIntoObservatory(
  JSON.parse(readFileSync(new URL('../config/geo-observatory.json', import.meta.url))),
  roots,
);
const completeRootRun = [...roots.values()].flatMap((root) =>
  root.activeQueries.map((query) => ({
    date: '2026-08-05',
    product: root.projectId,
    qid: query.id,
    query: query.text,
    source: 'web-search',
    class: 'C',
    top: [
      'https://example.org/first-result',
      'https://example.net/second-result',
    ],
    notes: 'The configured origin was absent from the captured first page.',
  })),
);

test('accepts exactly one same-date observation for all 40 active root queries', () => {
  assert.equal(completeRootRun.length, 40);
  assert.deepEqual(validateRootSearchRun(completeRootRun, rootRunConfig, roots), []);
});

test('the retained ten-root baseline satisfies the repeatable weekly contract', () => {
  const baseline = readFileSync(
    new URL('../data/geo-observatory/ledger.jsonl', import.meta.url),
    'utf8',
  )
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line))
    .filter((entry) => entry.date === '2026-08-05');

  assert.equal(baseline.length, 40);
  assert.deepEqual(validateRootSearchRun(baseline, rootRunConfig, roots), []);
});

test('rejects missing, duplicate, extra, mixed-date, historical, and rewritten root batches', () => {
  const missing = completeRootRun.slice(1);
  assert.ok(validateRootSearchRun(missing, rootRunConfig, roots).some((error) =>
    error.includes('missing root search observation')));

  const duplicate = [...completeRootRun, completeRootRun[0]];
  assert.ok(validateRootSearchRun(duplicate, rootRunConfig, roots).some((error) =>
    error.includes('duplicate root search observation')));

  const extra = [...completeRootRun, {
    ...completeRootRun[0],
    product: 'anime-list',
    qid: 'anime-category',
    query: 'anime discovery multi-field filter watchlist',
  }];
  assert.ok(validateRootSearchRun(extra, rootRunConfig, roots).some((error) =>
    error.includes('unexpected root search observation')));

  const mixedDate = structuredClone(completeRootRun);
  mixedDate[0].date = '2026-08-06';
  assert.ok(validateRootSearchRun(mixedDate, rootRunConfig, roots).some((error) =>
    error.includes('must use one observation date')));

  const historical = structuredClone(completeRootRun);
  const categoryIndex = historical.findIndex((entry) => entry.qid === 'codevetter-category-2');
  historical[categoryIndex].qid = 'codevetter-category';
  historical[categoryIndex].query = 'AI code review benchmark agent-written bugs';
  const historicalErrors = validateRootSearchRun(historical, rootRunConfig, roots);
  assert.ok(historicalErrors.some((error) => error.includes('historical query cannot receive')));
  assert.ok(historicalErrors.some((error) => error.includes('missing root search observation')));

  const rewritten = structuredClone(completeRootRun);
  rewritten[0].query = 'rewritten root query';
  assert.ok(validateRootSearchRun(rewritten, rootRunConfig, roots).some((error) =>
    error.includes('root search query text mismatch')));
});

test('root-search CLI leaves the ledger unchanged when the batch is incomplete', () => {
  const scratch = mkdtempSync(resolve(tmpdir(), 'geo-root-run-'));
  const input = resolve(scratch, 'incomplete.json');
  const ledger = fileURLToPath(new URL('../data/geo-observatory/ledger.jsonl', import.meta.url));
  const recorder = fileURLToPath(new URL('../scripts/geo-observatory-record.mjs', import.meta.url));
  try {
    writeFileSync(input, `${JSON.stringify(completeRootRun.slice(1))}\n`);
    const before = readFileSync(ledger, 'utf8');
    const result = spawnSync(process.execPath, [recorder, '--root-search', input], {
      encoding: 'utf8',
    });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /root search run must contain exactly 40 observations/);
    assert.equal(readFileSync(ledger, 'utf8'), before);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
});
