import assert from 'node:assert/strict';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import {
  buildDesignReviewSnapshot,
  DESIGN_REVIEW_SNAPSHOT_SCHEMA,
  sha256,
  writeDesignReviewSnapshot,
} from '../lib/design-review-snapshot.mjs';
import { buildFleetConnections } from '../lib/founder-control/connections.mjs';

function writeJson(filePath, value) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function policy() {
  return {
    $schema: 'fleet.design-workflow.v1',
    version: 1,
    impeccableVersion: '4.0.2',
    impeccablePackageVersion: '3.3.1',
    lanes: {
      preserve: { requireBeforeEvidence: true },
      overhaul: {
        minimumReferences: 2,
        maximumReferences: 3,
        minimumDirectionProbes: 2,
        maximumDirectionProbes: 3,
        acceptedDirectionDecisions: ['approved', 'delegated'],
      },
    },
    qualityGate: {
      minimumCritiqueScore: 32,
      critiqueMaximum: 40,
      minimumAuditScore: 16,
      auditMaximum: 20,
      maximumUnresolved: { p0: 0, p1: 0 },
      requiredViewportWidths: [390, 768, 1440],
      acceptedOwnerDecisions: ['keep', 'delegated'],
      detectorPosture: 'advisory',
      requirePassingProjectCheck: true,
    },
  };
}

function catalog(projects = [{
  id: 'pace',
  name: 'Pace',
  repo: 'pace',
  lifecycle: 'maintained',
  tier: 'primary',
  domains: ['heypace.app'],
  public: { id: 'pace', listing: 'maintained' },
}]) {
  return { _meta: { updated: '2026-07-31' }, projects };
}

function receipt({ critique = 34, audit = 18 } = {}) {
  return {
    $schema: 'fleet.design-review.v1',
    version: 1,
    project: 'pace',
    target: 'Private local target copy must not enter the snapshot',
    mode: 'preserve',
    register: 'product',
    context: { product: 'PRODUCT.md', design: 'DESIGN.md' },
    direction: {
      references: [],
      probes: [],
      selected: 'existing-design',
      approval: 'not-required',
      before: 'artifacts/design/before.png',
    },
    evidence: {
      screenshots: [
        { width: 390, path: 'artifacts/design/after-390.png' },
        { width: 768, path: 'artifacts/design/after-768.png' },
        { width: 1440, path: 'artifacts/design/after-1440.png' },
      ],
      projectCheck: { command: 'pnpm test', status: 'pass' },
      critique: { score: critique, maximum: 40 },
      audit: { score: audit, maximum: 20 },
      unresolved: { p0: 0, p1: 0 },
      detector: { posture: 'advisory', findings: [] },
    },
    ownerFeedback: {
      decision: 'keep',
      note: 'Free-form owner feedback must remain project-owned.',
    },
  };
}

function writeReceipt(projectRoot, value = receipt()) {
  for (const relativePath of [
    'PRODUCT.md',
    'DESIGN.md',
    'artifacts/design/before.png',
    'artifacts/design/after-390.png',
    'artifacts/design/after-768.png',
    'artifacts/design/after-1440.png',
  ]) {
    const filePath = join(projectRoot, relativePath);
    mkdirSync(dirname(filePath), { recursive: true });
    writeFileSync(filePath, `fixture:${relativePath}\n`, 'utf8');
  }
  writeJson(join(projectRoot, '.fleet/design-review.json'), value);
}

function snapshotFixture() {
  const root = mkdtempSync(join(tmpdir(), 'fleet-design-snapshot-'));
  const fleetRoot = join(root, 'fleet');
  const projectWorkspaceRoot = join(root, 'projects');
  mkdirSync(fleetRoot, { recursive: true });
  mkdirSync(projectWorkspaceRoot, { recursive: true });
  writeJson(
    join(fleetRoot, 'foundry/ops/config/projects.json'),
    catalog([
      {
        id: 'pace',
        name: 'Pace',
        repo: 'pace',
        lifecycle: 'maintained',
        tier: 'primary',
        domains: ['heypace.app'],
        public: { id: 'pace', listing: 'maintained' },
      },
      {
        id: 'missing-review',
        name: 'Missing review',
        repo: 'missing-review',
        lifecycle: 'maintained',
        tier: 'secondary',
        domains: ['missing.example'],
        metrics: { publicSite: true },
        public: { id: 'missing-review', listing: 'hidden' },
      },
      {
        id: 'past',
        name: 'Past',
        repo: 'past',
        lifecycle: 'past',
        tier: 'past',
        domains: ['past.example'],
        public: { id: 'past', listing: 'past' },
      },
    ]),
  );
  writeJson(
    join(fleetRoot, 'foundry/ops/config/design-workflow.json'),
    policy(),
  );
  writeJson(
    join(fleetRoot, 'foundry/ops/config/marketing-program.json'),
    {
      focusSet: [],
      projects: [
        { slug: 'pace', mode: 'evergreen' },
        { slug: 'missing-review', mode: 'private' },
      ],
    },
  );
  writeReceipt(join(projectWorkspaceRoot, 'pace'));
  return { fleetRoot, projectWorkspaceRoot };
}

test('builds a deterministic sanitized snapshot from canonical valid receipts', () => {
  const { fleetRoot, projectWorkspaceRoot } = snapshotFixture();
  const first = buildDesignReviewSnapshot({ fleetRoot, projectWorkspaceRoot });
  const second = buildDesignReviewSnapshot({ fleetRoot, projectWorkspaceRoot });

  assert.deepEqual(first, second);
  assert.equal(first.$schema, DESIGN_REVIEW_SNAPSHOT_SCHEMA);
  assert.deepEqual(first.catalogProjectIds, ['missing-review', 'pace']);
  assert.deepEqual(first.projects.map((project) => project.projectId), ['pace']);
  assert.equal(first.projects[0].evidenceFiles.length, 6);
  assert.equal(
    first.projects[0].receiptSha256,
    sha256(readFileSync(join(projectWorkspaceRoot, 'pace/.fleet/design-review.json'))),
  );
  const serialized = JSON.stringify(first);
  assert.doesNotMatch(serialized, new RegExp(projectWorkspaceRoot));
  assert.doesNotMatch(serialized, /Private local target copy/);
  assert.doesNotMatch(serialized, /Free-form owner feedback/);
});

test('omits and records an existing invalid receipt without copying its scores', () => {
  const { fleetRoot, projectWorkspaceRoot } = snapshotFixture();
  writeJson(
    join(projectWorkspaceRoot, 'pace/.fleet/design-review.json'),
    { ...receipt(), ownerFeedback: { decision: 'pending' } },
  );
  const outputPath = join(fleetRoot, 'foundry/ops/data/design-reviews/latest.json');

  const result = writeDesignReviewSnapshot({
    fleetRoot,
    projectWorkspaceRoot,
    outputPath,
  });
  assert.deepEqual(result.snapshot.projects, []);
  assert.deepEqual(result.snapshot.rejectedProjects, [{
    projectId: 'pace',
    reason: 'validation-failed',
  }]);
  assert.equal(existsSync(outputPath), true);

  const connections = buildFleetConnections({
    fleetRoot,
    home: join(fleetRoot, 'empty-home'),
    now: '2026-07-31T12:00:00.000Z',
    marketing: { aiVisibility: { projects: [] } },
  });
  assert.equal(
    connections.outputs.projects.find((project) => project.projectId === 'pace')
      .designReview,
    null,
  );
});

test('uses a validated snapshot when the project checkout is absent', () => {
  const { fleetRoot, projectWorkspaceRoot } = snapshotFixture();
  writeDesignReviewSnapshot({ fleetRoot, projectWorkspaceRoot });

  const result = buildFleetConnections({
    fleetRoot,
    home: join(fleetRoot, 'empty-home'),
    now: '2026-07-31T12:00:00.000Z',
    marketing: { aiVisibility: { projects: [] } },
  });
  const pace = result.outputs.projects.find((project) => project.projectId === 'pace');

  assert.equal(pace.designReview.critique, 34);
  assert.equal(pace.designReview.audit, 18);
  assert.equal(pace.designReview.evidenceSource, 'snapshot');
  assert.match(pace.designReview.receiptSha256, /^[a-f0-9]{64}$/);
});

test('prefers a directly validated receipt over the portable snapshot', () => {
  const { fleetRoot, projectWorkspaceRoot } = snapshotFixture();
  writeDesignReviewSnapshot({ fleetRoot, projectWorkspaceRoot });
  writeReceipt(join(fleetRoot, 'pace'), receipt({ critique: 39, audit: 19 }));

  const result = buildFleetConnections({
    fleetRoot,
    home: join(fleetRoot, 'empty-home'),
    now: '2026-07-31T12:00:00.000Z',
    marketing: { aiVisibility: { projects: [] } },
  });
  const pace = result.outputs.projects.find((project) => project.projectId === 'pace');

  assert.equal(pace.designReview.critique, 39);
  assert.equal(pace.designReview.audit, 19);
  assert.equal(pace.designReview.evidenceSource, 'direct');
});

test('fails closed when a local receipt exists but is invalid', () => {
  const { fleetRoot, projectWorkspaceRoot } = snapshotFixture();
  writeDesignReviewSnapshot({ fleetRoot, projectWorkspaceRoot });
  writeReceipt(join(fleetRoot, 'pace'), {
    ...receipt({ critique: 39, audit: 19 }),
    ownerFeedback: { decision: 'pending' },
  });

  const result = buildFleetConnections({
    fleetRoot,
    home: join(fleetRoot, 'empty-home'),
    now: '2026-07-31T12:00:00.000Z',
    marketing: { aiVisibility: { projects: [] } },
  });
  const pace = result.outputs.projects.find((project) => project.projectId === 'pace');

  assert.equal(pace.designReview, null);
});
