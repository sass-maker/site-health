import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

import {
  renderSeoGeoPublishing,
  validateSeoGeoPublishing,
} from '../lib/seo-geo-publishing.mjs';
import {
  buildSeoGeoDestinations,
  renderSeoGeoDestinations,
} from '../lib/seo-geo-destinations.mjs';

const [program, catalog] = await Promise.all([
  readJson(new URL('../config/seo-geo-publishing.json', import.meta.url)),
  readJson(new URL('../config/projects.json', import.meta.url)),
]);

const [directories, probe, supplements] = await Promise.all([
  readJson(new URL('../config/directory-submissions/directories.json', import.meta.url)),
  readJson(new URL('../config/directory-submissions/research-probe.json', import.meta.url)),
  readJson(new URL('../config/seo-geo-destination-supplements.json', import.meta.url)),
]);

test('publishing program covers all P1, all P2, and every eligible P4 project', () => {
  assert.deepEqual(validateSeoGeoPublishing(program, catalog), {
    projectCount: 33,
    p1Count: 4,
    p2Count: 19,
    p4Count: 10,
    channelCount: 27,
  });
});

test('generated guide is deterministic and exposes execution boundaries and exclusions', () => {
  const rendered = renderSeoGeoPublishing(program, catalog);
  assert.equal(rendered, renderSeoGeoPublishing(program, catalog));
  assert.match(rendered, /all P1 \(4\), all P2 \(19\), all eligible finished P4 \(10\)/);
  assert.match(rendered, /### Office OS — Publishable/);
  assert.match(rendered, /### Mashup — Preparation only/);
  assert.match(rendered, /Future candidates after re-verification:\*\* None in the current campaign\./);
  assert.match(rendered, /### RolePatch — Publishable/);
  assert.match(rendered, /AlternativeTo explicitly disallows résumé\/CV builders/);
  assert.match(rendered, /## Eligible finished P4 — 10/);
  assert.match(rendered, /### India Standards — Publishable/);
  assert.match(rendered, /### Sarthak Agrawal — Publishable/);
  assert.match(rendered, /Agent with unblock \| The agent still owns execution/);
  assert.match(rendered, /Relevant Reddit communities.*Agent with unblock.*Owner/);
  assert.match(rendered, /Do not record mutable completion state here/);
});

test('coverage fails closed when a P2 project plan is absent or an extra project appears', () => {
  const missing = structuredClone(program);
  missing.projects = missing.projects.filter((plan) => plan.projectId !== 'motion');
  assert.throws(
    () => validateSeoGeoPublishing(missing, catalog),
    /project plans missing: motion/,
  );

  const extra = structuredClone(program);
  extra.projects.push({
    projectId: 'materia',
    state: 'publish',
    narrative: 'Extra.',
    sourceAsset: 'Extra.',
    placements: [],
    exclusions: [],
  });
  assert.throws(
    () => validateSeoGeoPublishing(extra, catalog),
    /materia: not in P1, P2, or eligible P4 scope/,
  );
});

test('selectedP4 stays an exhaustive ordering of active, deployed, share-ready P4 projects', () => {
  const missing = structuredClone(program);
  missing.selectedP4 = missing.selectedP4.filter((id) => id !== 'chess');
  assert.throws(
    () => validateSeoGeoPublishing(missing, catalog),
    /eligible P4 projects missing from selectedP4: chess/,
  );

  const invalid = structuredClone(program);
  invalid.selectedP4[0] = 'reddit-insights';
  assert.throws(
    () => validateSeoGeoPublishing(invalid, catalog),
    /selected P4 reddit-insights: must be P4, active, deployed, and ready to be shared/,
  );
});

test('catalog readiness controls whether a plan can contain executable placements', () => {
  const executableBlocked = structuredClone(program);
  const mashup = executableBlocked.projects.find((plan) => plan.projectId === 'mashup');
  mashup.state = 'publish';
  mashup.placements = [{
    channelId: 'dev',
    rank: 'primary',
    format: 'Launch',
    actor: 'agent',
    fit: 'Premature.',
  }];
  assert.throws(
    () => validateSeoGeoPublishing(executableBlocked, catalog),
    /mashup: state publish must match catalog readiness prepare/,
  );

  const preparedReady = structuredClone(program);
  const codevetter = preparedReady.projects.find((plan) => plan.projectId === 'codevetter');
  codevetter.state = 'prepare';
  codevetter.placements = [];
  codevetter.prerequisites = ['Wait.'];
  assert.throws(
    () => validateSeoGeoPublishing(preparedReady, catalog),
    /codevetter: state prepare must match catalog readiness publish/,
  );
});

test('unknown and contradictory channel references are rejected', () => {
  const unknown = structuredClone(program);
  unknown.projects.find((plan) => plan.projectId === 'codevetter').placements[0].channelId = 'made-up';
  assert.throws(
    () => validateSeoGeoPublishing(unknown, catalog),
    /codevetter: unknown placement channel made-up/,
  );

  const contradictory = structuredClone(program);
  contradictory.projects.find((plan) => plan.projectId === 'codevetter').exclusions.push({
    channelId: 'dev',
    reason: 'Contradiction.',
  });
  assert.throws(
    () => validateSeoGeoPublishing(contradictory, catalog),
    /codevetter: channel dev cannot be placed and excluded/,
  );
});

test('every channel has an explicit execution boundary', () => {
  const missing = structuredClone(program);
  delete missing.channelExecution.medium;
  assert.throws(
    () => validateSeoGeoPublishing(missing, catalog),
    /medium: invalid or missing channel execution mode missing/,
  );

  const unknown = structuredClone(program);
  unknown.channelExecution['made-up'] = 'agent-direct';
  assert.throws(
    () => validateSeoGeoPublishing(unknown, catalog),
    /made-up: execution mode references unknown channel/,
  );
});

test('destination inventory accounts for the maintained and long-tail source universe', () => {
  const inventory = buildSeoGeoDestinations({ program, directories, probe, supplements });
  assert.deepEqual({
    destinationCount: inventory.destinationCount,
    actionableCount: inventory.actionableCount,
    researchOnlyCount: inventory.researchOnlyCount,
    channelCount: inventory.channelCount,
  }, {
    destinationCount: 167,
    actionableCount: 67,
    researchOnlyCount: 100,
    channelCount: 27,
  });
  const rendered = renderSeoGeoDestinations(inventory);
  assert.match(rendered, /Maintained candidates — 67/);
  assert.match(rendered, /Research-only long tail — 100/);
  assert.match(rendered, /r\/LocalLLaMA/);
  assert.match(rendered, /awesome-wpo/);
});

async function readJson(url) {
  return JSON.parse(await readFile(url, 'utf8'));
}
