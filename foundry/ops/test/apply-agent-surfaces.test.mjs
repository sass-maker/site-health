import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';

const script = new URL('../scripts/apply-agent-surfaces.mjs', import.meta.url);

function dryRun(projectId) {
  return execFileSync(process.execPath, [script.pathname, '--id', projectId, '--dry-run'], {
    encoding: 'utf8',
  });
}

test('prints help without applying registered products', () => {
  const output = execFileSync(process.execPath, [script.pathname, '--help'], {
    encoding: 'utf8',
  });

  assert.match(output, /Usage:/);
  assert.match(output, /--force-preserved/);
  assert.doesNotMatch(output, /Done\. files=/);
});

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

test('preserves curated helper discovery copy', () => {
  const drank = dryRun('drank');
  const psi = dryRun('psi-swarm');

  assert.match(drank, /llms\.txt preserved/);
  assert.match(drank, /llms-full\.txt preserved/);
  assert.match(drank, /robots preserved/);
  assert.match(psi, /llms\.txt preserved/);
  assert.match(psi, /llms-full\.txt preserved/);
  assert.match(psi, /robots preserved/);
});

test('does not create a static catalog when the product build owns that route', () => {
  const output = dryRun('pace');

  assert.match(output, /api-ai\.json build-owned/);
});
