import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import test from 'node:test';

import {
  ERROR_CODES,
  buildCatalog,
  diagnoseCatalog,
  errorEnvelope,
  generateContext,
  getCapability,
  listCapabilities,
  searchCapabilities,
  successEnvelope,
} from '../lib/capability-catalog.mjs';

const cli = resolve(import.meta.dirname, '../scripts/fleet-capabilities.mjs');

function write(path, content) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

function createCatalogFixture(t) {
  const root = mkdtempSync(resolve(tmpdir(), 'fleet-capabilities-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const opsRoot = resolve(root, 'foundry/ops');

  for (const directory of [
    'skills',
    'teammates/skills',
    'scripts',
    'templates',
    'docs',
  ]) {
    mkdirSync(resolve(opsRoot, directory), { recursive: true });
  }

  write(
    resolve(opsRoot, 'skills/deploy-guard/SKILL.md'),
    `---
name: deploy-guard
description: >
  Check deploy readiness and protect
  production releases.
---

# Deploy guard
`,
  );
  write(
    resolve(opsRoot, 'teammates/skills/reviewer/SKILL.md'),
    `---
name: reviewer
description: Review a bounded code change.
---

# Reviewer
`,
  );
  write(
    resolve(opsRoot, 'scripts/deploy-health.sh'),
    '#!/usr/bin/env bash\n# Check deployment targets without changing them.\n',
  );
  write(
    resolve(opsRoot, 'scripts/agent-bin/fleet-status'),
    '#!/usr/bin/env bash\n',
  );
  write(
    resolve(opsRoot, 'scripts/ignored.test.mjs'),
    'throw new Error("not a capability");\n',
  );
  write(
    resolve(opsRoot, 'templates/forms/settings.md'),
    '# Settings form\n\nReusable settings form structure.\n',
  );
  write(
    resolve(opsRoot, 'docs/deploy-guide.md'),
    '# Deployment guide\n\nOperating guidance for deploy readiness and safe releases.\n',
  );
  write(
    resolve(opsRoot, 'docs/archive/old-guide.md'),
    '# Old guide\n\nHistorical instructions.\n',
  );
  write(
    resolve(opsRoot, 'docs/site-report.md'),
    '# Site report\n\nGenerated 2026-07-25 by a fixture.\n',
  );

  return { root, opsRoot };
}

function runCli(args) {
  return spawnSync(process.execPath, [cli, ...args], {
    cwd: resolve(import.meta.dirname, '../../..'),
    encoding: 'utf8',
  });
}

test('catalog derives stable entries from canonical roots and excludes non-capabilities', (t) => {
  const fixture = createCatalogFixture(t);
  const catalog = buildCatalog(fixture.opsRoot);
  const ids = listCapabilities(catalog).map((item) => item.id);

  assert.deepEqual(ids, [
    'doc:deploy-guide',
    'script:agent-bin/fleet-status',
    'script:deploy-health',
    'skill:deploy-guard',
    'skill:reviewer',
    'template:forms/settings',
  ]);
  assert.equal(getCapability(catalog, 'skill:deploy-guard').summary, (
    'Check deploy readiness and protect production releases.'
  ));
  assert.equal(
    getCapability(catalog, 'skill:deploy-guard').path,
    'foundry/ops/skills/deploy-guard/SKILL.md',
  );
  assert.equal(ids.includes('script:ignored.test'), false);
  assert.equal(ids.includes('doc:archive/old-guide'), false);
  assert.equal(ids.includes('doc:site-report'), false);
});

test('search ranking, lookup, and generated context use one catalog contract', (t) => {
  const fixture = createCatalogFixture(t);
  const catalog = buildCatalog(fixture.opsRoot);
  const results = searchCapabilities(catalog, 'deploy readiness');

  assert.equal(results[0].id, 'skill:deploy-guard');
  assert.ok(results[0].score > results[1].score);
  assert.equal(getCapability(catalog, 'skill:missing'), null);

  const context = generateContext(catalog, {
    query: 'deploy readiness',
    dense: true,
  });
  assert.match(context, /^skill:deploy-guard\tdeploy-guard\t/);
  assert.doesNotMatch(context, /reviewer/);
});

test('doctor reports healthy and missing-root catalogs deterministically', (t) => {
  const fixture = createCatalogFixture(t);
  const healthy = diagnoseCatalog(buildCatalog(fixture.opsRoot));
  assert.equal(healthy.healthy, true);
  assert.deepEqual(healthy.counts, {
    items: 6,
    roots: 5,
    errors: 0,
    warnings: 0,
  });

  const incompleteRoot = resolve(fixture.root, 'incomplete/foundry/ops');
  mkdirSync(resolve(incompleteRoot, 'skills'), { recursive: true });
  const unhealthy = diagnoseCatalog(buildCatalog(incompleteRoot));
  assert.equal(unhealthy.healthy, false);
  assert.equal(unhealthy.counts.errors, 4);
  assert.ok(unhealthy.issues.every((issue) => issue.code === 'MISSING_ROOT'));
});

test('success and error envelopes keep stable machine-readable fields', () => {
  assert.deepEqual(successEnvelope('list', { items: [] }, { count: 0 }), {
    schemaVersion: 1,
    ok: true,
    command: 'list',
    data: { items: [] },
    meta: { count: 0 },
  });
  assert.deepEqual(errorEnvelope(
    'get',
    ERROR_CODES.notFound,
    'Capability not found.',
    ['skill:fleet-ops'],
  ), {
    schemaVersion: 1,
    ok: false,
    command: 'get',
    error: {
      code: 'ERR_NOT_FOUND',
      message: 'Capability not found.',
      suggestions: ['skill:fleet-ops'],
    },
    meta: {},
  });
});

test('CLI exposes search, lookup failures, and catalog doctor as JSON', () => {
  const search = runCli(['search', 'deploy readiness', '--type', 'skill', '--json']);
  assert.equal(search.status, 0, search.stderr);
  const searchJson = JSON.parse(search.stdout);
  assert.equal(searchJson.schemaVersion, 1);
  assert.equal(searchJson.ok, true);
  assert.equal(searchJson.command, 'search');
  assert.equal(searchJson.data.items[0].id, 'skill:fleet-deploy-guard');

  const parentSkill = runCli(['search', 'site health', '--json']);
  assert.equal(parentSkill.status, 0, parentSkill.stderr);
  assert.equal(JSON.parse(parentSkill.stdout).data.items[0].id, 'skill:site-health');

  const missing = runCli(['get', 'skill:does-not-exist', '--json']);
  assert.equal(missing.status, 2);
  const missingJson = JSON.parse(missing.stderr);
  assert.equal(missingJson.error.code, 'ERR_NOT_FOUND');
  assert.ok(Array.isArray(missingJson.error.suggestions));

  const unknown = runCli(['serch', '--json']);
  assert.equal(unknown.status, 2);
  const unknownJson = JSON.parse(unknown.stderr);
  assert.equal(unknownJson.error.code, 'ERR_UNKNOWN_COMMAND');
  assert.ok(unknownJson.error.suggestions.includes('search'));

  const doctor = runCli(['doctor', '--json']);
  assert.equal(doctor.status, 0, doctor.stderr);
  const doctorJson = JSON.parse(doctor.stdout);
  assert.equal(doctorJson.ok, true);
  assert.equal(doctorJson.data.healthy, true);
  assert.equal(doctorJson.data.counts.errors, 0);
});
