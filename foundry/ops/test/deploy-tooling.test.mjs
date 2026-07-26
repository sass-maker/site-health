import assert from 'node:assert/strict';
import { chmod, mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import test from 'node:test';

const fleetRoot = resolve(import.meta.dirname, '../../..');
const deployHealth = join(fleetRoot, 'foundry/ops/scripts/deploy-health.sh');
const deployGuard = join(fleetRoot, 'foundry/ops/scripts/fleet-deploy-guard.sh');

function run(command, args, options = {}) {
  return spawnSync(command, args, { encoding: 'utf8', ...options });
}

async function initRepo(path) {
  await mkdir(path, { recursive: true });
  run('git', ['init', '-b', 'main'], { cwd: path });
  run('git', ['config', 'user.name', 'Fleet Test'], { cwd: path });
  run('git', ['config', 'user.email', 'fleet@example.test'], { cwd: path });
  await writeFile(join(path, 'README.md'), 'fixture\n');
  run('git', ['add', '.'], { cwd: path });
  run('git', ['commit', '-m', 'fixture'], { cwd: path });
  run('git', ['update-ref', 'refs/remotes/origin/main', 'HEAD'], { cwd: path });
  return run('git', ['rev-parse', 'HEAD'], { cwd: path }).stdout.trim();
}

test('deploy health honors registry local-only state and structured mixed targets', async () => {
  const root = await mkdtemp(join(tmpdir(), 'fleet-deploy-health-'));
  const mashup = join(root, 'mashup');
  const knowledge = join(root, 'knowledge-base');
  const sha = await initRepo(knowledge);
  await mkdir(join(knowledge, '.github/workflows'), { recursive: true });
  await writeFile(join(knowledge, '.github/workflows/ci.yml'), 'name: CI\n');
  await writeFile(join(knowledge, 'package.json'), '{"scripts":{"deploy":"wrangler deploy"}}\n');
  await mkdir(join(mashup, '.git'), { recursive: true });
  await writeFile(join(mashup, 'README.md'), 'local tool\n');
  await mkdir(join(root, 'fake-bin'));
  const wrangler = join(root, 'fake-bin/wrangler');
  await writeFile(wrangler, `#!/usr/bin/env bash
if [[ "$1" == "whoami" ]]; then exit 0; fi
if [[ "$1 $2 $3" == "pages deployment list" ]]; then
  printf '[{"Source":"${sha}","Branch":"main","Deployment":"https://example.test"}]\\n'
  exit 0
fi
if [[ "$1 $2" == "deployments list" ]]; then
  printf '[{"id":"worker-1","created_on":"2026-07-26T00:00:00Z","versions":[{"percentage":100}]}]\\n'
  exit 0
fi
exit 1
`);
  await chmod(wrangler, 0o755);
  await mkdir(join(root, 'foundry/ops/config'), { recursive: true });
  await writeFile(join(root, 'foundry/ops/config/projects.json'), JSON.stringify({
    projects: [
      { id: 'mashup', repo: 'mashup', deployKind: 'none', status: 'undeployed' },
      {
        id: 'knowledge-base',
        tier: 'active',
        repo: 'knowledge-base',
        deployKind: 'worker+pages',
        status: 'live',
        deployTargets: [
          { id: 'app', kind: 'pages', name: 'knowledgebase-app' },
          { id: 'service', kind: 'worker', name: 'knowledgebase' },
        ],
      },
    ],
  }));

  const standards = run('bash', [deployHealth, '--root', root, '--no-github', '--no-cloudflare']);
  assert.equal(standards.status, 0, standards.stdout + standards.stderr);
  assert.match(standards.stdout, /mashup is local-only; deploy standard not required/);
  assert.doesNotMatch(standards.stdout, /mashup has no deploy entrypoint/);

  const cloudflare = run('bash', [deployHealth, '--root', root, '--no-github', '--no-standards'], {
    env: { ...process.env, PATH: `${join(root, 'fake-bin')}:${process.env.PATH}` },
  });
  assert.equal(cloudflare.status, 0, cloudflare.stdout + cloudflare.stderr);
  assert.match(cloudflare.stdout, /Pages knowledgebase-app deployed/);
  assert.match(cloudflare.stdout, /Worker knowledgebase has active deployment/);
  assert.doesNotMatch(cloudflare.stdout, /mixed Worker\+Pages/);
});

test('deploy guard ignores evidence claims but blocks an actual production cutover', async () => {
  const root = await mkdtemp(join(tmpdir(), 'fleet-deploy-guard-'));
  const project = join(root, 'codevetter');
  await initRepo(project);
  run('git', ['remote', 'add', 'origin', project], { cwd: project });
  run('git', ['branch', '--set-upstream-to=origin/main', 'main'], { cwd: project });
  await writeFile(join(project, 'wrangler.json'), '{"name":"codevetter"}\n');
  await writeFile(join(project, 'PROJECT_STATUS.md'), `## Blocked
- The production-pipeline claim is externally blocked on an adjudicated corpus.
`);
  run('git', ['add', '.'], { cwd: project });
  run('git', ['commit', '-m', 'status'], { cwd: project });
  run('git', ['update-ref', 'refs/remotes/origin/main', 'HEAD'], { cwd: project });

  const claim = run('bash', [deployGuard, 'codevetter', '--force'], {
    env: { ...process.env, FLEET_ROOT_OVERRIDE: root },
  });
  assert.equal(claim.status, 0, claim.stdout + claim.stderr);
  assert.match(claim.stdout, /Blockers\s+✓ none flagged/);

  await writeFile(join(project, 'PROJECT_STATUS.md'), `## Blocked
- Production cutover cannot launch pending owner approval.
`);
  run('git', ['add', '.'], { cwd: project });
  run('git', ['commit', '-m', 'blocking status'], { cwd: project });
  run('git', ['update-ref', 'refs/remotes/origin/main', 'HEAD'], { cwd: project });
  const blocker = run('bash', [deployGuard, 'codevetter', '--force'], {
    env: { ...process.env, FLEET_ROOT_OVERRIDE: root },
  });
  assert.equal(blocker.status, 1, blocker.stdout + blocker.stderr);
  assert.match(blocker.stdout, /Blockers\s+✗ see PROJECT_STATUS.md/);
});

test('Chess deploy target is available through the canonical registry', async () => {
  const projects = JSON.parse(await readFile(join(fleetRoot, 'foundry/ops/config/projects.json'), 'utf8'));
  const chess = projects.projects.find((project) => project.id === 'chess');
  assert.equal(chess.status, 'live');
  assert.equal(chess.cfProject, 'chess-9a0');
});
