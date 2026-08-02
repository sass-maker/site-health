import assert from 'node:assert/strict';
import test from 'node:test';

import {
  domainRatingPercentile,
  validateDomainRatingBenchmark,
} from '../lib/domain-authority-percentile.mjs';

const benchmark = {
  schema: 'fleet.domain-rating-benchmark.v1',
  metric: 'Ahrefs Domain Rating',
  cohort: {
    provider: 'Ahrefs',
    description: 'External benchmark',
    sourceUrl: 'https://ahrefs.com/example',
    publishedAt: '2026-06-23',
    observedAt: '2026-07-31',
    total: 100,
    bins: [
      { minInclusive: 0, maxExclusive: 50, count: 90 },
      { minInclusive: 50, maxExclusive: 100, count: 10 },
    ],
  },
};
const options = { now: new Date('2026-08-01T00:00:00Z') };

test('reports raw DR and a conservative external percentile lower bound', () => {
  assert.deepEqual(domainRatingPercentile(49, benchmark, options), {
    raw: 49,
    percentileLowerBound: 0,
    benchmarkProvider: 'Ahrefs',
    benchmarkSourceUrl: 'https://ahrefs.com/example',
    benchmarkObservedAt: '2026-07-31',
    cohortSize: 100,
  });
  assert.equal(
    domainRatingPercentile(50, benchmark, options).percentileLowerBound,
    90,
  );
  assert.equal(
    domainRatingPercentile(100, benchmark, options).percentileLowerBound,
    100,
  );
  assert.equal(domainRatingPercentile(null, benchmark, options), null);
});

test('fails closed for stale, unattributed, self-referential, or malformed cohorts', () => {
  assert.throws(
    () =>
      validateDomainRatingBenchmark(benchmark, {
        now: new Date('2027-01-01T00:00:00Z'),
      }),
    /stale or future-dated/,
  );
  assert.throws(
    () =>
      validateDomainRatingBenchmark(
        {
          ...benchmark,
          cohort: { ...benchmark.cohort, sourceUrl: '' },
        },
        options,
      ),
    /external source URL/,
  );
  assert.throws(
    () =>
      validateDomainRatingBenchmark(
        {
          ...benchmark,
          cohort: {
            ...benchmark.cohort,
            sourceUrl: 'https://sassmaker.com/domain-rating',
          },
        },
        options,
      ),
    /Fleet-owned cohort/,
  );
  assert.throws(
    () =>
      validateDomainRatingBenchmark(
        {
          ...benchmark,
          cohort: { ...benchmark.cohort, total: 99 },
        },
        options,
      ),
    /total mismatch/,
  );
});
