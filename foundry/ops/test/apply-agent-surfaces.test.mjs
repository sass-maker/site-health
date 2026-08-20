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
const agentRegistry = JSON.parse(
  readFileSync(new URL('../config/agent-surfaces-registry.json', import.meta.url), 'utf8'),
);

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

function runWithConfigAtRoot(projectId, fleetRoot) {
  return execFileSync(
    process.execPath,
    [script.pathname, '--id', projectId, '--fleet-root', fleetRoot],
    { encoding: 'utf8' },
  );
}

function runJsonLdAtRoot(projectId, fleetRoot) {
  return execFileSync(
    process.execPath,
    [
      script.pathname,
      '--jsonld',
      '--id',
      projectId,
      '--fleet-root',
      fleetRoot,
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

test('writes the canonical owner identity into generated product JSON-LD', () => {
  const fleetRoot = mkdtempSync(join(tmpdir(), 'fleet-agent-surfaces-'));
  const headPath = join(
    fleetRoot,
    'saas-maker/apps/showcase/src/layouts/Layout.astro',
  );
  mkdirSync(dirname(headPath), { recursive: true });
  writeFileSync(headPath, '<html><head></head><body></body></html>\n');

  runJsonLdAtRoot('saas-maker', fleetRoot);

  const head = readFileSync(headPath, 'utf8');
  assert.match(head, /"@id":"https:\/\/sarthakagrawal\.dev\/#person"/);
  assert.match(head, /"image":"https:\/\/avatars\.githubusercontent\.com\/u\/43884471\?v=4"/);
  assert.match(head, /"https:\/\/www\.linkedin\.com\/in\/sarthakagrawal927"/);
  assert.match(head, /"https:\/\/huggingface\.co\/sarthakagrawal927"/);
  assert.match(head, /"name":"SaaS Maker"/);
  assert.match(head, /"alternateName":\["SassMaker","sassmaker\.com"\]/);
  assert.match(head, /"https:\/\/github\.com\/sass-maker"/);
  assert.doesNotMatch(head, /github\.com\/sass-maker\/fleet-workspace/);
});

test('does not advertise site search when a website has no search template', () => {
  const fleetRoot = mkdtempSync(join(tmpdir(), 'fleet-agent-surfaces-'));
  const headPath = join(
    fleetRoot,
    'codevetter/apps/landing-page-astro/src/layouts/Layout.astro',
  );
  mkdirSync(dirname(headPath), { recursive: true });
  writeFileSync(headPath, '<html><head></head><body></body></html>\n');

  runJsonLdAtRoot('codevetter', fleetRoot);

  const head = readFileSync(headPath, 'utf8');
  assert.match(head, /"@type":"WebSite"/);
  assert.doesNotMatch(head, /SearchAction/);
  assert.doesNotMatch(head, /search_term_string/);
});

test('keeps a subdomain product name instead of inheriting the root brand', () => {
  const fleetRoot = mkdtempSync(join(tmpdir(), 'fleet-agent-surfaces-'));
  const headPath = join(fleetRoot, 'agent-office/site/index.html');
  mkdirSync(dirname(headPath), { recursive: true });
  writeFileSync(headPath, '<html><head></head><body></body></html>\n');

  runJsonLdAtRoot('agent-office', fleetRoot);

  const head = readFileSync(headPath, 'utf8');
  assert.match(head, /"name":"Office OS"/);
  assert.doesNotMatch(head, /"alternateName":\["SassMaker"/);
});

test('writes the API alias for dependency-free static HTML sites', () => {
  const fleetRoot = mkdtempSync(join(tmpdir(), 'fleet-agent-surfaces-'));
  const publicDir = join(fleetRoot, 'local-ai-video-studio/site');
  mkdirSync(publicDir, { recursive: true });
  writeFileSync(join(publicDir, 'index.html'), '<html><head></head><body></body></html>\n');

  runWithConfigAtRoot('local-ai-video-studio', fleetRoot);

  assert.equal(readFileSync(join(publicDir, '_redirects'), 'utf8'), '/api/ai /api-ai.json 200\n');
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
  for (const id of ['drank', 'psi-swarm']) {
    const preserved = new Set(
      agentRegistry.products.find((product) => product.id === id)?.preserveFiles,
    );
    assert.ok(preserved.has('llms.txt'), `${id}: llms.txt`);
    assert.ok(preserved.has('llms-full.txt'), `${id}: llms-full.txt`);
    assert.ok(preserved.has('robots.txt'), `${id}: robots.txt`);
  }
});

test('does not create a static catalog when the product build owns that route', () => {
  const output = dryRun('pace');

  assert.match(output, /api-ai\.json build-owned/);
});
