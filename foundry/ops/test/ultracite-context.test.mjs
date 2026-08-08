import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  contextsMatch,
  renderTrackedContext,
} from '../scripts/sync-ultracite-context.mjs';

test('wraps upstream guidance with Fleet ownership notice deterministically', () => {
  const generated = '# Ultracite Code Standards\n\nUse the resolved rules.\n';
  const first = renderTrackedContext(generated);
  const second = renderTrackedContext(generated);

  assert.equal(first, second);
  assert.match(first, /nearest\nAGENTS\.md remains authoritative/);
  assert.match(first, /# Ultracite Code Standards/);
  assert.equal(contextsMatch(first, generated), true);
  assert.equal(contextsMatch(`${first}\n`, generated), false);
});

test('pilot AGENTS keeps product guidance and references generated context', async () => {
  const agents = await readFile('foundry/helpers/drank/AGENTS.md', 'utf8');

  assert.match(agents, /private, local-first Next\.js dashboard/);
  assert.match(agents, /ULTRACITE\.md/);
});
