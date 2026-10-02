import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import test from 'node:test';
import { clarityTokenProbeCommand } from '../../../scripts/clarity-schedule.mjs';

const script = resolve(import.meta.dirname, '../../../scripts/clarity-schedule.mjs');

test('token preflight rejects empty success and never emits the resolved value', () => {
  const command = clarityTokenProbeCommand('ph-catalog');
  assert.match(command, /CLARITY_API_TOKEN_PH_CATALOG/);
  for (const [mock, status] of [
    ['infisical() { return 0; }; ', 1],
    ['infisical() { printf %s synthetic-test-value; }; ', 0],
    ['infisical() { printf %s synthetic-test-value; return 1; }; ', 1],
  ]) {
    const result = spawnSync('/bin/sh', ['-c', mock + command], { encoding: 'utf8' });
    assert.equal(result.status, status);
    assert.equal(result.stdout, '');
    assert.equal(result.stderr, '');
  }
});
for (const [cadence, onLoad] of [['every-3-days', 'true'], ['weekly', 'false']]) {
  test(`${cadence} preview preserves its cadence and uses RunAtLoad=${onLoad}`, () => {
    const result = spawnSync(process.execPath, [script, 'print', '--cadence', cadence], { encoding: 'utf8' });
    assert.equal(result.status, 0);
    assert.match(result.stdout, new RegExp(`<key>RunAtLoad</key>\\s*<${onLoad}/>`));
    assert.match(result.stdout, /fetch-all --days 3/);
    assert.match(result.stdout, cadence === 'every-3-days'
      ? /<key>StartInterval<\/key>\s*<integer>259200<\/integer>/
      : /<key>StartCalendarInterval<\/key>/);
  });
}
