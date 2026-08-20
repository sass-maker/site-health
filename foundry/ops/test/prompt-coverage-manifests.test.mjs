import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import test from 'node:test';

import { buildMissingPromptCoverageManifests } from '../lib/prompt-coverage-manifests.mjs';

const load = (path) => JSON.parse(readFileSync(resolve(import.meta.dirname, path), 'utf8'));

test('prepares one complete fail-closed manifest for every unmapped prompt', () => {
  const manifests = buildMissingPromptCoverageManifests({
    marketingProgram: load('../config/marketing-program.json'),
    catalog: load('../config/projects.json'),
    agentRegistry: load('../config/agent-surfaces-registry.json'),
    createdAt: '2026-08-07T00:00:00.000Z',
  });
  // One comparison prompt remains unmapped per non-focus product. Focus-set
  // buyer prompts are published with owned pages in marketing-program.json.
  assert.equal(manifests.length, 23);
  assert.equal(new Set(manifests.map((entry) => entry.projectId)).size, 23);
  for (const { manifest, manifestHash } of manifests) {
    assert.match(manifestHash, /^[a-f0-9]{64}$/u);
    assert.equal(manifest.items[0].execution.mode, 'blocked');
    assert.equal(manifest.permissions.repositoryWrites.length, 0);
    assert.match(manifest.items[0].content.body, /makes no feature, privacy, pricing, or performance claim/u);
    assert.ok(manifest.items[0].content.fields.claimLedger.length > 0);
  }
});
