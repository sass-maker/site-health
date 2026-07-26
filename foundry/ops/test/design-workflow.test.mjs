import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  validateDesignReview,
  validateDesignWorkflowPolicy,
  validateInstalledImpeccable,
} from '../lib/design-workflow.mjs';

const fleetRoot = fileURLToPath(new URL('../../../', import.meta.url));
const policy = JSON.parse(
  await readFile(new URL('../config/design-workflow.json', import.meta.url), 'utf8'),
);

test('canonical policy validates and pins objective quality floors', () => {
  const validated = validateDesignWorkflowPolicy(policy);
  assert.equal(validated.impeccableVersion, '3.9.1');
  assert.equal(validated.qualityGate.minimumCritiqueScore, 32);
  assert.equal(validated.qualityGate.minimumAuditScore, 16);
  assert.deepEqual(validated.qualityGate.requiredViewportWidths, [390, 768, 1440]);
  assert.equal(validated.qualityGate.detectorPosture, 'advisory');
});

test('preserve review passes with complete evidence and advisory detector findings', () => {
  withProject((projectRoot) => {
    const receipt = validReceipt('preserve');
    receipt.evidence.detector.findings = [
      { id: 'single-font', note: 'Intentional DESIGN.md decision' },
    ];
    const result = validateDesignReview(receipt, policy, { projectRoot });
    assert.equal(result.ok, true);
    assert.equal(result.advisoryFindings, 1);
  });
});

test('overhaul requires references, probes, a selected direction, and approval', () => {
  withProject((projectRoot) => {
    const receipt = validReceipt('overhaul');
    assert.equal(validateDesignReview(receipt, policy, { projectRoot }).ok, true);

    receipt.direction.references = [];
    receipt.direction.approval = 'pending';
    assert.throws(
      () => validateDesignReview(receipt, policy, { projectRoot }),
      /overhaul requires 2-3 named references[\s\S]*approval must be approved or delegated/,
    );
  });
});

test('missing viewport, low scores, and unresolved P1 findings fail closed', () => {
  withProject((projectRoot) => {
    const receipt = validReceipt('preserve');
    receipt.evidence.screenshots = receipt.evidence.screenshots.filter(({ width }) => width !== 768);
    receipt.evidence.critique.score = 31;
    receipt.evidence.audit.score = 15;
    receipt.evidence.unresolved.p1 = 1;
    assert.throws(
      () => validateDesignReview(receipt, policy, { projectRoot }),
      /missing required viewport 768[\s\S]*critique score[\s\S]*audit score[\s\S]*unresolved P1/,
    );
  });
});

test('owner close and wrong-lane feedback keep the review open', () => {
  withProject((projectRoot) => {
    for (const decision of ['close', 'wrong-lane', 'pending']) {
      const receipt = validReceipt('preserve');
      receipt.ownerFeedback.decision = decision;
      assert.throws(
        () => validateDesignReview(receipt, policy, { projectRoot }),
        /owner feedback must be keep or explicitly delegated/,
      );
    }
  });
});

test('context and evidence paths cannot escape the project', () => {
  withProject((projectRoot) => {
    const receipt = validReceipt('preserve');
    receipt.direction.before = '../outside.png';
    assert.throws(
      () => validateDesignReview(receipt, policy, { projectRoot }),
      /direction.before must stay inside the project/,
    );
  });
});

test('installed Impeccable version must exactly match Fleet policy', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'fleet-impeccable-version-'));
  try {
    const skillFile = path.join(dir, 'SKILL.md');
    writeFileSync(skillFile, '---\nname: impeccable\nversion: 3.9.1\n---\n');
    assert.equal(validateInstalledImpeccable(policy, skillFile).ok, true);
    writeFileSync(skillFile, '---\nname: impeccable\nversion: 3.9.0\n---\n');
    assert.throws(
      () => validateInstalledImpeccable(policy, skillFile),
      /expected 3.9.1, found 3.9.0/,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('Fleet skill exposure and standards use the wrapper rather than a generic house style', () => {
  const agentStack = readFileSync(path.join(fleetRoot, 'foundry/ops/scripts/agent-stack.sh'), 'utf8');
  const rootAgents = readFileSync(path.join(fleetRoot, 'AGENTS.md'), 'utf8');
  const standards = readFileSync(
    path.join(fleetRoot, 'foundry/ops/docs/fleet-agent-standards.md'),
    'utf8',
  );
  const landing = readFileSync(path.join(fleetRoot, 'foundry/LANDING_STANDARD.md'), 'utf8');

  assert.match(agentStack, /EXPOSED_FLEET_SKILLS=\([\s\S]*design-workflow/);
  assert.match(agentStack, /config\/design-workflow\.json/);
  assert.match(agentStack, /impeccable@\$expected_version/);
  assert.doesNotMatch(agentStack, /impeccable@3\.2\.1/);
  assert.match(rootAgents, /\$design-workflow/);
  assert.match(standards, /owner `keep` or explicit `delegated` feedback/);
  assert.doesNotMatch(standards, /Aceternity|Magic UI|Origin UI|shadcn-compatible/);
  assert.doesNotMatch(landing, /Restrained palette/);
});

test('CLI creates an incomplete receipt and self-checks the installed version', () => {
  const dir = mkdtempSync(path.join(tmpdir(), 'fleet-design-cli-'));
  try {
    const script = path.join(fleetRoot, 'foundry/ops/scripts/design-workflow.mjs');
    const created = spawnSync(
      process.execPath,
      [script, 'create', '--project', dir, '--mode', 'overhaul', '--register', 'brand', '--target', 'landing'],
      { encoding: 'utf8' },
    );
    assert.equal(created.status, 0, created.stderr);
    const receipt = JSON.parse(readFileSync(path.join(dir, '.fleet/design-review.json'), 'utf8'));
    assert.equal(receipt.mode, 'overhaul');
    assert.equal(receipt.direction.approval, 'pending');

    const duplicate = spawnSync(
      process.execPath,
      [script, 'create', '--project', dir, '--mode', 'preserve', '--register', 'product', '--target', 'other'],
      { encoding: 'utf8' },
    );
    assert.notEqual(duplicate.status, 0);
    assert.match(duplicate.stderr, /already exists|EEXIST/);
    assert.equal(
      JSON.parse(readFileSync(path.join(dir, '.fleet/design-review.json'), 'utf8')).mode,
      'overhaul',
    );

    const selfCheck = spawnSync(process.execPath, [script, 'self-check', '--json'], {
      cwd: fleetRoot,
      encoding: 'utf8',
    });
    assert.equal(selfCheck.status, 0, selfCheck.stderr);
    assert.equal(JSON.parse(selfCheck.stdout).impeccableVersion, policy.impeccableVersion);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

function withProject(run) {
  const projectRoot = mkdtempSync(path.join(tmpdir(), 'fleet-design-review-'));
  try {
    for (const file of [
      'PRODUCT.md',
      'DESIGN.md',
      'artifacts/design/before.png',
      'artifacts/design/after-390.png',
      'artifacts/design/after-768.png',
      'artifacts/design/after-1440.png',
      'artifacts/design/probe-a.png',
      'artifacts/design/probe-b.png',
    ]) {
      const target = path.join(projectRoot, file);
      mkdirSync(path.dirname(target), { recursive: true });
      writeFileSync(target, 'fixture\n');
    }
    run(projectRoot);
  } finally {
    rmSync(projectRoot, { recursive: true, force: true });
  }
}

function validReceipt(mode) {
  return {
    $schema: 'fleet.design-review.v1',
    version: 1,
    project: 'fixture',
    target: 'primary surface',
    mode,
    register: 'product',
    context: {
      product: 'PRODUCT.md',
      design: 'DESIGN.md',
    },
    direction: mode === 'overhaul'
      ? {
          references: ['Linear', 'Stripe'],
          probes: [
            { id: 'a', path: 'artifacts/design/probe-a.png' },
            { id: 'b', path: 'artifacts/design/probe-b.png' },
          ],
          selected: 'a',
          approval: 'approved',
          before: '',
        }
      : {
          references: [],
          probes: [],
          selected: 'existing-design',
          approval: 'not-required',
          before: 'artifacts/design/before.png',
        },
    evidence: {
      screenshots: [390, 768, 1440].map((width) => ({
        width,
        path: `artifacts/design/after-${width}.png`,
      })),
      projectCheck: {
        command: 'npm run check',
        status: 'pass',
      },
      critique: {
        score: 32,
        maximum: 40,
      },
      audit: {
        score: 16,
        maximum: 20,
      },
      unresolved: {
        p0: 0,
        p1: 0,
      },
      detector: {
        posture: 'advisory',
        findings: [],
      },
    },
    ownerFeedback: {
      decision: 'keep',
      note: 'Direction accepted.',
    },
  };
}
