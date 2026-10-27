import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createWeeklyReview } from '../lib/dashboard-backend/weekly-review.mjs';

test('weekly review keeps a fixed prior-week baseline across repeated current-week collections', () => {
  const path = join(mkdtempSync(join(tmpdir(), 'site-health-weekly-')), 'weekly.json');
  const projects = [{ id: 'one', name: 'One', lifecycle: { status: 'active' }, status: 'active' }];
  const store = { rebuildProjections: () => ({ projects, readiness: {} }) };
  const first = createWeeklyReview({ store, path, now: '2026-10-20T00:00:00Z' });
  assert.equal(first.baseline, null);
  const second = createWeeklyReview({ store, path, now: '2026-10-27T00:00:00Z' });
  assert.equal(second.week, '2026-10-26'); assert.equal(second.baseline[0].id, 'one');
  const third = createWeeklyReview({ store, path, now: '2026-10-28T00:00:00Z' });
  assert.deepEqual(third.baseline, second.baseline);
  assert.equal(JSON.parse(readFileSync(path)).counts.currentProducts, 1);
});
