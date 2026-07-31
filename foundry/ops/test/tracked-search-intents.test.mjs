import assert from 'node:assert/strict';
import test from 'node:test';

import { buildTrackedSearchIntentMap } from '../lib/tracked-search-intents.mjs';

const products = [
  { id: 'example', url: 'https://example.com' },
  { id: 'second', url: 'https://second.example.com' },
];

const observatory = {
  products: [
    {
      id: 'example',
      origin: 'https://example.com/',
      queries: [
        { qid: 'example-brand', kind: 'brand', q: 'Example' },
        { qid: 'example-answer', kind: 'answer', q: 'How does it work?' },
      ],
    },
    {
      id: 'second',
      origin: 'https://second.example.com',
      queries: [
        { qid: 'second-category', kind: 'category', q: 'Example category' },
      ],
    },
  ],
};

test('joins stable brand and category intents to every canonical project', () => {
  const result = buildTrackedSearchIntentMap({ products, observatory });

  assert.deepEqual(result.get('example'), [
    { id: 'example-brand', kind: 'brand', query: 'Example' },
  ]);
  assert.deepEqual(result.get('second'), [
    {
      id: 'second-category',
      kind: 'category',
      query: 'Example category',
    },
  ]);
});

test('rejects missing projects, mismatched origins, and duplicate query ids', () => {
  assert.throws(
    () =>
      buildTrackedSearchIntentMap({
        products,
        observatory: { products: observatory.products.slice(0, 1) },
      }),
    /missing canonical products: second/,
  );
  assert.throws(
    () =>
      buildTrackedSearchIntentMap({
        products,
        observatory: {
          products: observatory.products.map((product) =>
            product.id === 'second'
              ? { ...product, origin: 'https://wrong.example.com' }
              : product,
          ),
        },
      }),
    /origin mismatch for second/,
  );
  assert.throws(
    () =>
      buildTrackedSearchIntentMap({
        products,
        observatory: {
          products: observatory.products.map((product) =>
            product.id === 'second'
              ? {
                  ...product,
                  queries: [
                    {
                      qid: 'example-brand',
                      kind: 'category',
                      q: 'Duplicate',
                    },
                  ],
                }
              : product,
          ),
        },
      }),
    /id is duplicated: example-brand/,
  );
});

test('rejects products without a stable brand or category intent', () => {
  assert.throws(
    () =>
      buildTrackedSearchIntentMap({
        products,
        observatory: {
          products: observatory.products.map((product) =>
            product.id === 'second'
              ? {
                  ...product,
                  queries: [
                    {
                      qid: 'second-answer',
                      kind: 'answer',
                      q: 'What does it do?',
                    },
                  ],
                }
              : product,
          ),
        },
      }),
    /missing a brand or category query for second/,
  );
});
