import assert from 'node:assert/strict';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';

import {
  adoptionSequence,
  buildCodeHealthReport,
  CAPABILITY_IDS,
  discoverCodeHealthCapabilities,
  POLICY_SCHEMA_VERSION,
  PROFILE_IDS,
  reportExitCode,
  validateCodeHealthPolicy,
} from '../lib/code-health.mjs';
import {
  formatCodeHealthReport,
  parseCodeHealthArgs,
} from '../scripts/code-health.mjs';

const targets = {
  cognitiveComplexity: 20,
  changedLineCoveragePercent: 80,
  newProjectLineCoveragePercent: 80,
  newProjectFunctionCoveragePercent: 80,
  newProjectStatementCoveragePercent: 80,
  newProjectBranchCoveragePercent: 70,
  newDependencyCycles: 0,
  criticalVulnerabilities: 0,
  highVulnerabilities: 0,
  duplicationRegressionPercent: 0,
};

function write(filePath, content = '') {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, content);
}

function basePolicy(projectPolicies, exceptions = []) {
  return {
    $schema: POLICY_SCHEMA_VERSION,
    targets,
    capabilities: [...CAPABILITY_IDS],
    profiles: Object.fromEntries(PROFILE_IDS.map((profile) => [
      profile,
      profile === 'content-config'
        ? {
            required: [
              'format',
              'lint',
              'tests',
              'dependency-risk',
              'suppressions',
              'repository-hygiene',
            ],
            advisory: [],
          }
        : { required: [...CAPABILITY_IDS], advisory: [] },
    ])),
    projects: projectPolicies,
    exceptions,
    trendMetrics: ['complexity-max'],
  };
}

const equivalentCoverage = () => Object.fromEntries(CAPABILITY_IDS.map((capability) => [
  capability,
  `Fixture-native ${capability} evidence`,
]));

function fixtureRoot(t) {
  const root = mkdtempSync(path.join(tmpdir(), 'fleet-code-health-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  return root;
}

test('validates exact maintained profile coverage and every ecosystem profile', () => {
  const projects = PROFILE_IDS.map((profile, index) => ({
    id: `project-${index}`,
    lifecycle: 'maintained',
    repo: `project-${index}`,
    tier: index === 0 ? 'focus' : 'active',
  }));
  const policy = basePolicy(Object.fromEntries(projects.map((project, index) => [
    project.id,
    { profile: PROFILE_IDS[index], equivalents: equivalentCoverage() },
  ])));

  assert.deepEqual(validateCodeHealthPolicy({
    policy,
    projects,
    today: '2026-08-11',
  }), { ok: true, errors: [] });

  delete policy.projects['project-0'];
  const invalid = validateCodeHealthPolicy({ policy, projects, today: '2026-08-11' });
  assert.equal(invalid.ok, false);
  assert.match(invalid.errors.join('\n'), /missing maintained projects: project-0/u);
});

test('discovers JavaScript and language-native capability evidence', async (t) => {
  const root = fixtureRoot(t);
  write(path.join(root, '.git'), 'gitdir: fixture\n');
  write(path.join(root, 'package.json'), JSON.stringify({
    scripts: {
      'format:check': 'biome format .',
      lint: 'biome lint .',
      typecheck: 'tsc --noEmit',
      test: 'vitest',
      'test:coverage': 'vitest --coverage',
      'knip:strict': 'knip',
      cycles: 'madge src',
      duplication: 'jscpd src',
    },
    devDependencies: { knip: '1.0.0', jscpd: '1.0.0', madge: '1.0.0' },
  }));
  write(path.join(root, 'biome.json'), JSON.stringify({
    extends: ['ultracite/biome/core'],
  }));
  write(path.join(root, 'native/Cargo.toml'), '[package]\nname="fixture"\n');
  write(path.join(root, 'swift/Package.swift'), '// swift-tools-version: 6.0\n');
  write(path.join(root, 'go/go.mod'), 'module example.test/fixture\n');
  write(path.join(root, 'python/pyproject.toml'), '[tool.ruff]\nselect=["C90"]\n');

  const evidence = await discoverCodeHealthCapabilities({ repositoryRoot: root });
  for (const capability of CAPABILITY_IDS) {
    assert.ok(evidence[capability].length > 0, `${capability} should be discoverable`);
  }
});

test('discovers repository-native complexity and cycle quality scripts', async (t) => {
  const root = fixtureRoot(t);
  write(path.join(root, '.git'), 'gitdir: fixture\n');
  write(path.join(root, 'package.json'), JSON.stringify({
    scripts: {
      'quality:complexity': 'node scripts/check-complexity.mjs',
      'quality:cycles': 'node scripts/check-cycles.mjs',
    },
  }));

  const evidence = await discoverCodeHealthCapabilities({ repositoryRoot: root });
  assert.deepEqual(evidence.complexity, ['package.json package scripts']);
  assert.deepEqual(evidence.cycles, ['package.json package scripts']);
});

test('classifies pass, unavailable, not-applicable, excluded, and explicit equivalents', async (t) => {
  const root = fixtureRoot(t);
  mkdirSync(path.join(root, 'healthy'), { recursive: true });
  mkdirSync(path.join(root, 'content'), { recursive: true });
  mkdirSync(path.join(root, 'missing-evidence'), { recursive: true });
  write(path.join(root, '.git'), 'gitdir: fixture\n');
  write(path.join(root, 'content/package.json'), JSON.stringify({
    scripts: { 'format:check': 'prettier --check .', lint: 'eslint .', test: 'node --test' },
  }));
  const projects = [
    { id: 'healthy', lifecycle: 'maintained', repo: 'healthy', tier: 'focus' },
    { id: 'content', lifecycle: 'maintained', repo: 'content', tier: 'active' },
    { id: 'missing-evidence', lifecycle: 'maintained', repo: 'missing-evidence', tier: 'secondary' },
    { id: 'missing-checkout', lifecycle: 'maintained', repo: 'missing-checkout', tier: 'secondary' },
    { id: 'past', lifecycle: 'past', repo: 'past', tier: 'active' },
  ];
  const policy = basePolicy({
    healthy: { profile: 'mixed', equivalents: equivalentCoverage() },
    content: {
      profile: 'content-config',
      equivalents: {
        'dependency-risk': 'Fixture manifest review',
        suppressions: 'Fixture suppression review',
        'repository-hygiene': 'Fixture repository check',
      },
    },
    'missing-evidence': { profile: 'javascript-typescript' },
    'missing-checkout': { profile: 'swift-native', equivalents: equivalentCoverage() },
  });
  const report = await buildCodeHealthReport({
    policy,
    projects,
    workspaceRoot: root,
    today: '2026-08-11',
  });
  const byId = Object.fromEntries(report.projects.map((project) => [project.id, project]));

  assert.equal(byId.healthy.status, 'pass');
  assert.equal(byId.content.status, 'pass');
  assert.equal(
    byId.content.capabilities.find((item) => item.capability === 'complexity').status,
    'not-applicable',
  );
  assert.equal(byId['missing-evidence'].status, 'unavailable');
  assert.equal(byId['missing-checkout'].status, 'unavailable');
  assert.equal(byId.past.status, 'excluded');
  assert.equal(report.ok, false);
  assert.equal(reportExitCode(report, { strict: false }), 0);
  assert.equal(reportExitCode(report, { strict: true }), 1);
});

test('valid exceptions warn and expired exceptions fail policy validation', async (t) => {
  const root = fixtureRoot(t);
  mkdirSync(path.join(root, 'legacy'), { recursive: true });
  const projects = [
    { id: 'legacy', lifecycle: 'maintained', repo: 'legacy', tier: 'active' },
  ];
  const exception = {
    id: 'legacy-duplication',
    projectId: 'legacy',
    capability: 'duplication',
    accepted: 'no configured clone detector',
    reason: 'Legacy source needs a measured duplication baseline before enforcement.',
    owner: 'Sarthak',
    issue: 'https://github.com/example/legacy/issues/1',
    reviewDate: '2026-09-01',
  };
  const policy = basePolicy({
    legacy: {
      profile: 'javascript-typescript',
      equivalents: Object.fromEntries(
        Object.entries(equivalentCoverage()).filter(([capability]) => capability !== 'duplication'),
      ),
    },
  }, [exception]);
  const report = await buildCodeHealthReport({
    policy,
    projects,
    workspaceRoot: root,
    today: '2026-08-11',
  });
  assert.equal(report.projects[0].status, 'warning');

  const expired = validateCodeHealthPolicy({
    policy,
    projects,
    today: '2026-09-02',
  });
  assert.equal(expired.ok, false);
  assert.match(expired.errors.join('\n'), /expired on 2026-09-01/u);
});

test('reports and adoption order are deterministic and decision-first without a score', async (t) => {
  const root = fixtureRoot(t);
  for (const id of ['focus', 'active', 'secondary']) mkdirSync(path.join(root, id), { recursive: true });
  const projects = [
    { id: 'secondary', lifecycle: 'maintained', repo: 'secondary', tier: 'secondary' },
    { id: 'active', lifecycle: 'maintained', repo: 'active', tier: 'active' },
    { id: 'focus', lifecycle: 'maintained', repo: 'focus', tier: 'focus' },
  ];
  const policy = basePolicy(Object.fromEntries(projects.map((project) => [
    project.id,
    { profile: 'mixed', equivalents: equivalentCoverage() },
  ])));
  const input = { policy, projects, workspaceRoot: root, today: '2026-08-11' };
  const first = await buildCodeHealthReport(input);
  const second = await buildCodeHealthReport(input);

  assert.equal(JSON.stringify(first), JSON.stringify(second));
  assert.deepEqual(adoptionSequence(projects), ['focus', 'active', 'secondary']);
  assert.deepEqual(first.adoptionSequence, ['focus', 'active', 'secondary']);
  assert.doesNotMatch(formatCodeHealthReport(first), /score/iu);
});

test('parses project filtering and rejects unknown options', () => {
  assert.deepEqual(
    parseCodeHealthArgs(['--json', '--strict', '--project', 'one', '--project', 'two']),
    { json: true, strict: true, projectIds: ['one', 'two'] },
  );
  assert.throws(() => parseCodeHealthArgs(['--write']), /Unknown option/u);
});
