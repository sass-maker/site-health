import assert from 'node:assert/strict';
import { chmod, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';

const execFileAsync = promisify(execFile);
const fleetRoot = resolve(import.meta.dirname, '../../..');
const installer = resolve(
  fleetRoot,
  'foundry/ops/scripts/agent-bin/setup-openclaw-support-agents',
);

test('support-agent installer repairs migrated monorepo workspaces', async () => {
  const fixtureRoot = await mkdtemp(join(tmpdir(), 'fleet-openclaw-agents-'));
  const binDir = join(fixtureRoot, 'bin');
  const workspaceRoot = join(fixtureRoot, 'fleet');
  const fakeOpenClaw = join(binDir, 'openclaw');

  try {
    await Promise.all([
      mkdir(join(workspaceRoot, 'foundry/ops/agents/research'), {
        recursive: true,
      }),
      mkdir(join(workspaceRoot, 'foundry/marketing/reel-pipeline'), {
        recursive: true,
      }),
      mkdir(join(workspaceRoot, 'foundry/helpers/drank'), { recursive: true }),
      mkdir(binDir, { recursive: true }),
    ]);
    await writeFile(
      fakeOpenClaw,
      `#!/usr/bin/env bash
set -euo pipefail
if [[ "\${1:-} \${2:-} \${3:-}" == "agents list --json" ]]; then
  printf '[{"id":"fleet-ops","workspace":"%s/fleet-ops"},{"id":"research","workspace":"%s/research-agent"},{"id":"reel-pipeline","workspace":"%s/reel-pipeline"},{"id":"drank","workspace":"%s/drank"}]\\n' "$FAKE_FLEET_ROOT" "$FAKE_FLEET_ROOT" "$FAKE_FLEET_ROOT" "$FAKE_FLEET_ROOT"
  exit 0
fi
printf 'unexpected fake OpenClaw invocation: %s\\n' "$*" >&2
exit 1
`,
      'utf8',
    );
    await chmod(fakeOpenClaw, 0o755);

    const { stdout } = await execFileAsync(
      installer,
      ['--dry-run', 'fleet-ops', 'research', 'reel-pipeline', 'drank'],
      {
        env: {
          ...process.env,
          FAKE_FLEET_ROOT: workspaceRoot,
          FLEET_ROOT: workspaceRoot,
          PATH: `${binDir}:${process.env.PATH}`,
        },
      },
    );

    assert.match(stdout, /update: OpenClaw agent fleet-ops .*foundry\/ops/);
    assert.match(
      stdout,
      /update: OpenClaw agent research .*foundry\/ops\/agents\/research/,
    );
    assert.match(
      stdout,
      /update: OpenClaw agent reel-pipeline .*foundry\/marketing\/reel-pipeline/,
    );
    assert.match(
      stdout,
      /update: OpenClaw agent drank .*foundry\/helpers\/drank/,
    );
    assert.doesNotMatch(stdout, /foundry\/ops\/aliveville/);
  } finally {
    await rm(fixtureRoot, { recursive: true, force: true });
  }
});
