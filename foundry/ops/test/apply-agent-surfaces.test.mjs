import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';

const script = new URL('../scripts/apply-agent-surfaces.mjs', import.meta.url);

function dryRun(projectId) {
  return execFileSync(process.execPath, [script.pathname, '--id', projectId, '--dry-run'], {
    encoding: 'utf8',
  });
}

function dryRunAtRoot(projectId, fleetRoot) {
  return execFileSync(
    process.execPath,
    [script.pathname, '--id', projectId, '--fleet-root', fleetRoot, '--dry-run'],
    { encoding: 'utf8' },
  );
}

function runAtRoot(projectId, fleetRoot) {
  return execFileSync(
    process.execPath,
    [
      script.pathname,
      '--id',
      projectId,
      '--fleet-root',
      fleetRoot,
      '--no-config',
    ],
    { encoding: 'utf8' },
  );
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
  const fleetRoot = mkdtempSync(join(tmpdir(), 'fleet-agent-surfaces-'));
  const publicDir = join(fleetRoot, 'motion/landing');
  for (const relativePath of [
    'llms.txt',
    'index.md',
    'api/ai.json',
    'robots.txt',
    'sitemap.xml',
  ]) {
    const path = join(publicDir, relativePath);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, `preserved ${relativePath}\n`);
  }
  const output = dryRunAtRoot('motion', fleetRoot);

  assert.match(output, /llms\.txt preserved/);
  assert.match(output, /index\.md preserved/);
  assert.match(output, /api\/ai\.json preserved/);
  assert.match(output, /robots preserved/);
  assert.match(output, /sitemap\.xml preserved/);
  assert.match(output, /llms-full\.txt/);
  assert.match(output, /changelog\.md/);
});

test('writes tracked search intents into the catalog and full agent brief', () => {
  const fleetRoot = mkdtempSync(join(tmpdir(), 'fleet-agent-surfaces-'));
  const publicDir = join(fleetRoot, 'research-papers/web/public');
  mkdirSync(publicDir, { recursive: true });

  runAtRoot('research-papers', fleetRoot);

  const catalog = JSON.parse(
    readFileSync(join(publicDir, 'api-ai.json'), 'utf8'),
  );
  const fullBrief = readFileSync(join(publicDir, 'llms-full.txt'), 'utf8');
  assert.deepEqual(catalog.searchIntents, [
    {
      id: 'research-papers-brand',
      kind: 'brand',
      query: 'papers.highsignal.app',
    },
    {
      id: 'research-papers-category',
      kind: 'category',
      query:
        'semantic academic paper search arXiv OpenReview bioRxiv medRxiv',
    },
  ]);
  assert.match(fullBrief, /## Tracked search intents/);
  assert.match(
    fullBrief,
    /\[category\] research-papers-category: semantic academic paper search/,
  );
});

test('preserves custom runtime handlers while retaining worker wiring checks', () => {
  const fleetRoot = mkdtempSync(join(tmpdir(), 'fleet-agent-surfaces-'));
  const publicDir = join(fleetRoot, 'email-manager/public');
  const sourceDir = join(fleetRoot, 'email-manager/src');
  mkdirSync(publicDir, { recursive: true });
  mkdirSync(sourceDir, { recursive: true });
  writeFileSync(join(sourceDir, 'agent-edge.mjs'), 'export function handleAgentEdge() {}\n');
  writeFileSync(
    join(sourceDir, 'agent-edge.d.mts'),
    'export declare function handleAgentEdge(request: Request): Response | null;\n',
  );
  writeFileSync(
    join(sourceDir, 'worker.ts'),
    [
      "import { handleAgentEdge } from './agent-edge.mjs';",
      'export default {',
      '  fetch(request: Request) {',
      '    return handleAgentEdge(request) ?? new Response(null);',
      '  },',
      '};',
      '',
    ].join('\n'),
  );

  const output = dryRunAtRoot('email-manager', fleetRoot);

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
