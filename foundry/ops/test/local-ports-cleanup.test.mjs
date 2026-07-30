import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const fleetRoot = fileURLToPath(new URL('../../../', import.meta.url));
const skillDir = path.join(fleetRoot, 'foundry/ops/skills/local-ports-cleanup');

test('local ports cleanup skill is exposed with safety-first guidance', async () => {
  const [skill, metadata, profile, agentStack, rootAgents, standards] = await Promise.all([
    readFile(path.join(skillDir, 'SKILL.md'), 'utf8'),
    readFile(path.join(skillDir, 'agents/openai.yaml'), 'utf8'),
    readFile(path.join(skillDir, 'execution-profile.json'), 'utf8'),
    readFile(path.join(fleetRoot, 'foundry/ops/scripts/agent-stack.sh'), 'utf8'),
    readFile(path.join(fleetRoot, 'AGENTS.md'), 'utf8'),
    readFile(path.join(fleetRoot, 'foundry/ops/docs/fleet-agent-standards.md'), 'utf8'),
  ]);

  assert.match(skill, /^name: local-ports-cleanup$/m);
  assert.match(skill, /rtk ports json/);
  assert.match(skill, /rtk ports clean/);
  assert.match(skill, /rtk ports kill-project <exact-project>/);
  assert.match(skill, /Do not pass `--force`/);
  assert.match(skill, /Do not use `ports nuke` unless the operator explicitly asks/);
  assert.match(skill, /Keep a listener running when it is healthy/);
  assert.match(skill, /Re-run the filtered inventory after every mutation/);

  assert.match(metadata, /display_name: "Local Ports Cleanup"/);
  assert.match(metadata, /Use \$local-ports-cleanup/);
  assert.deepEqual(JSON.parse(profile), {
    schema: 'fleet.skill-execution-profile.v1',
    recommended: { intelligence: 'balanced', reasoning: 'high' },
    minimum: { intelligence: 'balanced', reasoning: 'high' },
    degradation: 'deny',
    rationale: 'Local process termination is bounded but requires careful ownership and scope judgment.',
  });
  assert.match(agentStack, /EXPOSED_FLEET_SKILLS=\([\s\S]*local-ports-cleanup/);
  assert.match(rootAgents, /\| `local-ports-cleanup` \| standalone \|/);
  assert.match(standards, /\| `local-ports-cleanup` \| standalone \|/);
});
