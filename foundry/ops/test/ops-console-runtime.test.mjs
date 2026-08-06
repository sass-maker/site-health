import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const publisher = readFileSync(
  new URL('../scripts/agent-bin/ops-console', import.meta.url),
  'utf8',
);

test('Ops Console publishes every top-level runtime library', () => {
  assert.match(
    publisher,
    /cp "\$FLEET_OPS_DIR"\/lib\/\*\.mjs "\$RUNTIME_DIR\/lib\/"/,
  );
});
