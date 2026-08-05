import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

import { validateExecutionProfile } from '../lib/capability-catalog.mjs';

const fleetRoot = path.resolve(import.meta.dirname, '../../..');
const skillsRoot = path.join(fleetRoot, 'foundry/ops/skills');
const childSkills = [
  'design-inspiration',
  'component-pattern-mine',
  'web-3d-pipeline',
  'creative-web-effects',
];

test('design-engineering parent routes to every focused child', () => {
  const parent = readSkill('design-engineering');
  for (const child of childSkills) {
    assert.match(parent, new RegExp(`\\.\\./${child}/SKILL\\.md`));
  }
  assert.match(parent, /design-workflow/);
  assert.match(parent, /Impeccable/);
  assert.match(parent, /doctor\.mjs/);
});

test('DesEngs refinements keep modes and temporary probes explicit', () => {
  const effects = readSkill('creative-web-effects');
  const effectContract = readFileSync(
    path.join(skillsRoot, 'creative-web-effects/references/effect-contract.md'),
    'utf8',
  );
  const inspiration = readSkill('design-inspiration');
  const inspirationContract = readFileSync(
    path.join(skillsRoot, 'design-inspiration/references/research-contract.md'),
    'utf8',
  );
  const sourceMap = readFileSync(
    path.join(skillsRoot, 'design-engineering/references/source-map.md'),
    'utf8',
  );

  for (const mode of ['shape', 'audit', 'opportunities', 'vocabulary']) {
    assert.equal(effects.includes(`\`${mode}\``), true);
  }
  assert.match(effectContract, /Do not edit source in audit mode/);
  assert.match(effectContract, /Do not implement opportunities in this mode/);
  assert.match(effectContract, /implementation-neutral motion contract/);

  assert.match(inspiration, /temporary comparison surface or switcher/);
  assert.match(inspiration, /remove the comparison scaffold and rejected probes/);
  assert.match(inspirationContract, /cleanup evidence/);

  assert.match(sourceMap, /\[DesEngs\]\(https:\/\/desengs\.com\/\)/);
  assert.match(sourceMap, /not as evidence that a resource is[\s\S]*endorsed/);
});

test('focused skills have complete metadata, references, and execution profiles', () => {
  for (const skill of ['design-engineering', ...childSkills]) {
    const skillRoot = path.join(skillsRoot, skill);
    const contents = readSkill(skill);
    const metadata = readFileSync(path.join(skillRoot, 'agents/openai.yaml'), 'utf8');
    const profile = JSON.parse(
      readFileSync(path.join(skillRoot, 'execution-profile.json'), 'utf8'),
    );

    assert.doesNotMatch(contents, /TODO/);
    assert.match(contents, new RegExp(`name: ${skill}`));
    assert.match(metadata, new RegExp(`\\$${skill}`));
    assert.deepEqual(validateExecutionProfile(profile), []);

    for (const reference of contents.matchAll(/\]\(([^)]+\.md)\)/g)) {
      assert.equal(
        path.isAbsolute(reference[1]),
        false,
        `${skill} reference must remain relative`,
      );
      assert.equal(
        path.resolve(skillRoot, reference[1]).startsWith(skillsRoot),
        true,
        `${skill} reference must stay inside Fleet skills`,
      );
      assert.doesNotThrow(() => readFileSync(path.resolve(skillRoot, reference[1]), 'utf8'));
    }
  }
});

test('doctor reports fixture commands and declared runtimes without mutation', async () => {
  const root = mkdtempSync(path.join(tmpdir(), 'fleet-design-engineering-'));
  const projectRoot = path.join(root, 'project');
  const binRoot = path.join(root, 'bin');
  try {
    await mkdir(projectRoot, { recursive: true });
    await mkdir(binRoot, { recursive: true });
    writeFileSync(
      path.join(projectRoot, 'package.json'),
      `${JSON.stringify({
        dependencies: {
          three: '^1.0.0',
          motion: '^1.0.0',
        },
      }, null, 2)}\n`,
    );
    for (const command of ['blender', 'gltfpack']) {
      const commandPath = path.join(binRoot, command);
      writeFileSync(commandPath, '#!/bin/sh\nexit 0\n');
      chmodSync(commandPath, 0o755);
    }

    const result = spawnSync(
      process.execPath,
      [
        path.join(skillsRoot, 'design-engineering/scripts/doctor.mjs'),
        '--project',
        projectRoot,
        '--path',
        binRoot,
        '--json',
      ],
      { encoding: 'utf8' },
    );
    assert.equal(result.status, 0, result.stderr);
    const report = JSON.parse(result.stdout);
    assert.equal(report.schemaVersion, 'fleet.design-engineering-doctor.v1');
    assert.equal(report.capabilities.assetAuthoring, true);
    assert.equal(report.capabilities.assetOptimization, true);
    assert.equal(report.capabilities.web3dRuntime, true);
    assert.equal(report.capabilities.effectsRuntime, true);
    assert.equal(readFileSync(path.join(projectRoot, 'package.json'), 'utf8').includes('three'), true);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('Fleet exposes only the parent and keeps design-workflow authoritative', () => {
  const agentStack = readFileSync(
    path.join(fleetRoot, 'foundry/ops/scripts/agent-stack.sh'),
    'utf8',
  );
  const exposedBlock = agentStack.match(/EXPOSED_FLEET_SKILLS=\(([\s\S]*?)\n\)/)?.[1] ?? '';
  const designWorkflow = readSkill('design-workflow');

  assert.match(exposedBlock, /design-engineering/);
  for (const child of childSkills) assert.doesNotMatch(exposedBlock, new RegExp(child));
  assert.match(designWorkflow, /\.\.\/design-engineering\/SKILL\.md/);
  assert.match(designWorkflow, /this skill remains the completion authority/);
});

function readSkill(name) {
  return readFileSync(path.join(skillsRoot, name, 'SKILL.md'), 'utf8');
}
