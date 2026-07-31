import assert from 'node:assert/strict';
import test from 'node:test';

import {
  generateReport,
  validate,
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
