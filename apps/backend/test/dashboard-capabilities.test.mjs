import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

const moduleUrl = new URL('../lib/dashboard-backend/capabilities.mjs', import.meta.url).href;

test('managed runtime resolves skill metadata beside the owner repository without changing caller environment', (context) => {
  const directory = mkdtempSync(join(tmpdir(), 'site-health-capabilities-'));
  context.after(() => rmSync(directory, { recursive: true, force: true }));
  const ownerRepository = join(directory, 'site-health');
  mkdirSync(join(ownerRepository, 'apps/backend/config'), { recursive: true });
  writeFileSync(join(ownerRepository, 'apps/backend/config/capabilities.json'), JSON.stringify({
    schema: 'site-health.capabilities.v1', skills: [{ id: 'example', label: 'Example capability' }],
  }));
  const skillPath = join(directory, 'saas-maker/tooling/skills/site-health');
  mkdirSync(skillPath, { recursive: true });
  writeFileSync(join(skillPath, 'SKILL.md'), '# Synthetic owner skill');
  const initialEnvironment = process.env.SITE_HEALTH_OWNER_REPOSITORY;
  const projection = JSON.parse(execFileSync(process.execPath, ['--input-type=module', '-e',
    `import { buildCapabilityProjection } from ${JSON.stringify(moduleUrl)};
     console.log(JSON.stringify(buildCapabilityProjection()));`,
  ], { encoding: 'utf8', env: { ...process.env, SITE_HEALTH_OWNER_REPOSITORY: ownerRepository } }));
  assert.equal(projection.sources.skills.state, 'ready');
  assert.equal(projection.skills[0].id, 'example');
  assert.equal(projection.skills[0].state, 'ready');
  assert.equal(process.env.SITE_HEALTH_OWNER_REPOSITORY, initialEnvironment);
});
