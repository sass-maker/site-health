import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

const script = new URL('../scripts/apply-agent-surfaces.mjs', import.meta.url);

function dryRun(projectId) {
  return execFileSync(process.execPath, [script.pathname, '--id', projectId, '--dry-run'], {
    encoding: 'utf8',
  });
}

test('preserves product-specific discovery files unless explicitly forced', () => {
  const output = dryRun('motion');

  assert.match(output, /llms\.txt preserved/);
  assert.match(output, /index\.md preserved/);
  assert.match(output, /api\/ai\.json preserved/);
  assert.match(output, /robots preserved/);
  assert.match(output, /sitemap\.xml preserved/);
  assert.match(output, /llms-full\.txt/);
  assert.match(output, /changelog\.md/);
});

test('preserves custom runtime handlers while retaining worker wiring checks', () => {
  const output = dryRun('email-manager');

  assert.match(output, /agent-edge\.mjs preserved/);
  assert.match(output, /agent-edge\.d\.mts preserved/);
  assert.match(output, /worker already wired/);
});
