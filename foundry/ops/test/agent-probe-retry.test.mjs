import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  configuredProbeConcurrency,
  parseRetryAfterMs,
  withTransientRetries,
} from '../lib/agent-probe-retry.mjs';

describe('agent readiness probe retry policy', () => {
  it('recovers from a transient 429 using the bounded fallback schedule', async () => {
    const responses = [
      { status: 429, retryAfter: null },
      { status: 429, retryAfter: null },
      { status: 200, retryAfter: null },
    ];
    const delays = [];

    const result = await withTransientRetries(() => responses.shift(), {
      delaysMs: [1_000, 3_000, 7_000],
      sleep: async (durationMs) => delays.push(durationMs),
    });

    assert.equal(result.status, 200);
    assert.deepEqual(delays, [1_000, 3_000]);
  });

  it('respects Retry-After without exceeding the ten-second bound', async () => {
    const responses = [
      { status: 429, retryAfter: '30' },
      { status: 200, retryAfter: null },
    ];
    const delays = [];

    await withTransientRetries(() => responses.shift(), {
      delaysMs: [1_000],
      sleep: async (durationMs) => delays.push(durationMs),
    });

    assert.deepEqual(delays, [10_000]);
    assert.equal(parseRetryAfterMs('2'), 2_000);
  });

  it('keeps probe concurrency conservative and bounded', () => {
    assert.equal(configuredProbeConcurrency(undefined), 4);
    assert.equal(configuredProbeConcurrency('8'), 8);
    assert.equal(configuredProbeConcurrency('0'), 4);
    assert.equal(configuredProbeConcurrency('99'), 16);
  });
});
