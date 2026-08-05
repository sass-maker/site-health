import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const testDir = dirname(fileURLToPath(import.meta.url));
const wrapperSource = resolve(
  testDir,
  '../scripts/agent-bin/run-clean-main-codex-cron',
);

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    ...options,
  });
  assert.equal(
    result.status,
    0,
    `${command} ${args.join(' ')} failed\nstdout: ${result.stdout}\nstderr: ${result.stderr}`,
  );
  return result.stdout.trim();
}

function git(cwd, ...args) {
  return run('git', args, { cwd });
}

function writeExecutable(path, contents) {
  writeFileSync(path, contents);
  chmodSync(path, 0o755);
}

function createFixture() {
  const root = mkdtempSync(join(tmpdir(), 'fleet-clean-main-cron-'));
  const remote = join(root, 'remote.git');
  const seed = join(root, 'seed');
  const checkout = join(root, 'checkout');
  const receipt = join(root, 'worker-receipt.txt');

  run('git', ['init', '--bare', '--initial-branch=main', remote]);
  mkdirSync(seed);
  git(seed, 'init', '--initial-branch=main');
  git(seed, 'config', 'user.name', 'Fleet Cron Test');
  git(seed, 'config', 'user.email', 'fleet-cron-test@example.invalid');

  const binDir = join(seed, 'foundry/ops/scripts/agent-bin');
  const cronDir = join(seed, 'foundry/ops/automation/codex-cron');
  mkdirSync(binDir, { recursive: true });
  mkdirSync(cronDir, { recursive: true });
  copyFileSync(wrapperSource, join(binDir, 'run-clean-main-codex-cron'));
  chmodSync(join(binDir, 'run-clean-main-codex-cron'), 0o755);
  writeExecutable(
    join(binDir, 'run-codex-cron'),
    `#!/usr/bin/env bash
set -euo pipefail
script_dir="$(cd "$(dirname "\${BASH_SOURCE[0]}")" && pwd)"
fleet_root="$(cd "$script_dir/../../../.." && pwd)"
{
  printf 'args=%s\\n' "$*"
  printf 'sha=%s\\n' "$(git -C "$fleet_root" rev-parse HEAD)"
  printf 'source_sha=%s\\n' "\${FLEET_CRON_SOURCE_SHA:-}"
  printf 'clean_main_verified=%s\\n' "\${FLEET_CRON_CLEAN_MAIN_VERIFIED:-}"
  printf 'workspace_root=%s\\n' "\${FLEET_CRON_WORKSPACE_ROOT:-}"
} > "$FLEET_CRON_TEST_RECEIPT"
`,
  );
  writeExecutable(join(binDir, 'fleet-notify'), '#!/usr/bin/env bash\nexit 0\n');
  writeFileSync(join(cronDir, '.gitignore'), 'logs/\nlocks/\n');
  writeFileSync(join(seed, 'tracked.txt'), 'base\n');
  git(seed, 'add', '.');
  git(seed, 'commit', '-m', 'fixture: seed scheduler checkout');
  git(seed, 'remote', 'add', 'origin', remote);
  git(seed, 'push', '-u', 'origin', 'main');

  run('git', ['clone', remote, checkout]);
  git(checkout, 'config', 'user.name', 'Fleet Cron Test');
  git(checkout, 'config', 'user.email', 'fleet-cron-test@example.invalid');

  return {
    root,
    remote,
    seed,
    checkout,
    receipt,
    wrapper: join(checkout, 'foundry/ops/scripts/agent-bin/run-clean-main-codex-cron'),
  };
}

function invoke(fixture) {
  return spawnSync(
    fixture.wrapper,
    ['weekly-geo-observatory', '--dry-run'],
    {
      cwd: fixture.checkout,
      encoding: 'utf8',
      env: {
        ...process.env,
        FLEET_CRON_TEST_RECEIPT: fixture.receipt,
      },
    },
  );
}

function advanceRemote(fixture, marker) {
  writeFileSync(join(fixture.seed, `${marker}.txt`), `${marker}\n`);
  git(fixture.seed, 'add', `${marker}.txt`);
  git(fixture.seed, 'commit', '-m', `fixture: ${marker}`);
  git(fixture.seed, 'push', 'origin', 'main');
  return git(fixture.seed, 'rev-parse', 'HEAD');
}

function withFixture(name, body) {
  test(name, () => {
    const fixture = createFixture();
    try {
      body(fixture);
    } finally {
      rmSync(fixture.root, { recursive: true, force: true });
    }
  });
}

withFixture('clean-main cron runs from an exact clean main checkout', (fixture) => {
  const expectedSha = git(fixture.checkout, 'rev-parse', 'HEAD');
  const result = invoke(fixture);

  assert.equal(result.status, 0, result.stderr);
  assert.match(readFileSync(fixture.receipt, 'utf8'), /args=weekly-geo-observatory --dry-run/);
  assert.match(readFileSync(fixture.receipt, 'utf8'), new RegExp(`sha=${expectedSha}`));
  assert.match(readFileSync(fixture.receipt, 'utf8'), new RegExp(`source_sha=${expectedSha}`));
  assert.match(readFileSync(fixture.receipt, 'utf8'), /clean_main_verified=1/);
  assert.match(readFileSync(fixture.receipt, 'utf8'), new RegExp(`workspace_root=${fixture.checkout}`));
  assert.equal(git(fixture.checkout, 'status', '--porcelain'), '');
});

withFixture('clean-main cron fast-forwards a clean behind checkout before handoff', (fixture) => {
  const expectedSha = advanceRemote(fixture, 'remote-advance');
  const result = invoke(fixture);

  assert.equal(result.status, 0, result.stderr);
  assert.equal(git(fixture.checkout, 'rev-parse', 'HEAD'), expectedSha);
  assert.match(readFileSync(fixture.receipt, 'utf8'), new RegExp(`sha=${expectedSha}`));
  assert.match(readFileSync(fixture.receipt, 'utf8'), new RegExp(`source_sha=${expectedSha}`));
});

withFixture('clean-main cron refuses a dirty checkout', (fixture) => {
  writeFileSync(join(fixture.checkout, 'tracked.txt'), 'dirty\n');
  const result = invoke(fixture);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /scheduler checkout is dirty/);
  assert.equal(existsSync(fixture.receipt), false);
});

withFixture('clean-main cron refuses a non-main checkout', (fixture) => {
  git(fixture.checkout, 'switch', '-c', 'feature/test');
  const result = invoke(fixture);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /must be on main, found feature\/test/);
  assert.equal(existsSync(fixture.receipt), false);
});

withFixture('clean-main cron refuses a checkout ahead of origin/main', (fixture) => {
  writeFileSync(join(fixture.checkout, 'local-only.txt'), 'ahead\n');
  git(fixture.checkout, 'add', 'local-only.txt');
  git(fixture.checkout, 'commit', '-m', 'fixture: local ahead');
  const result = invoke(fixture);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /scheduler checkout is ahead of origin\/main/);
  assert.equal(existsSync(fixture.receipt), false);
});

withFixture('clean-main cron refuses a checkout diverged from origin/main', (fixture) => {
  writeFileSync(join(fixture.checkout, 'local-only.txt'), 'diverged\n');
  git(fixture.checkout, 'add', 'local-only.txt');
  git(fixture.checkout, 'commit', '-m', 'fixture: local divergence');
  advanceRemote(fixture, 'remote-divergence');
  const result = invoke(fixture);

  assert.equal(result.status, 1);
  assert.match(result.stderr, /has diverged from origin\/main/);
  assert.equal(existsSync(fixture.receipt), false);
});
