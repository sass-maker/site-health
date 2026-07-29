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
  const materia = join(root, 'materia');
  const knowledge = join(root, 'knowledge-base');
  const sha = await initRepo(knowledge);
  await mkdir(join(knowledge, '.github/workflows'), { recursive: true });
  await writeFile(join(knowledge, '.github/workflows/ci.yml'), 'name: CI\n');
  await writeFile(
    join(knowledge, 'package.json'),
    '{"scripts":{"deploy":"wrangler deploy --tag \\"$(git rev-parse HEAD)\\""}}\n'
  );
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
  printf '[{"id":"deployment-1","created_on":"2026-07-26T00:00:00Z","versions":[{"version_id":"worker-1","percentage":100}]}]\\n'
  exit 0
fi
if [[ "$1 $2" == "versions list" ]]; then
  printf '[{"id":"worker-1","annotations":{"workers/tag":"${sha}"}}]\\n'
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
        id: 'materia',
        tier: 'parked',
        repo: 'materia',
        deployKind: 'pages',
        cfProject: 'materia',
        status: 'live',
      },
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
  await writeFile(join(root, 'foundry/ops/config/automation-registry.json'), JSON.stringify({
    entries: [
      {
        id: 'materia',
        repository: 'materia',
        attention: 'ignored',
        actionPolicy: 'excluded',
      },
    ],
  }));

  const standards = run('bash', [deployHealth, '--root', root, '--no-github', '--no-cloudflare']);
  assert.equal(standards.status, 0, standards.stdout + standards.stderr);
  assert.match(standards.stdout, /mashup is local-only; deploy standard not required/);
  assert.doesNotMatch(standards.stdout, /mashup has no deploy entrypoint/);

  await initRepo(materia);
  await writeFile(join(materia, 'README.md'), 'retired fixture\n');
  run('git', ['add', '.'], { cwd: materia });
  run('git', ['commit', '-m', 'retired fixture'], { cwd: materia });
  run('git', ['update-ref', 'refs/remotes/origin/main', 'HEAD'], { cwd: materia });

  const cloudflare = run('bash', [deployHealth, '--root', root, '--no-github', '--no-standards'], {
    env: { ...process.env, PATH: `${join(root, 'fake-bin')}:${process.env.PATH}` },
  });
  assert.equal(cloudflare.status, 0, cloudflare.stdout + cloudflare.stderr);
  assert.match(cloudflare.stdout, /materia Cloudflare parity skipped: ignored\/inactive/);
  assert.doesNotMatch(cloudflare.stdout, /Pages materia/);
  assert.match(cloudflare.stdout, /Pages knowledgebase-app deployed/);
  assert.match(cloudflare.stdout, new RegExp(`Worker knowledgebase deployed ${sha.slice(0, 7)} from main at 100%`));
  assert.doesNotMatch(cloudflare.stdout, /mixed Worker\+Pages/);

  await writeFile(join(knowledge, 'package.json'), '{"scripts":{"deploy":"wrangler deploy"}}\n');
  const untaggedStandards = run('bash', [
    deployHealth,
    '--root',
    root,
    '--no-github',
    '--no-cloudflare',
  ]);
  assert.equal(untaggedStandards.status, 1, untaggedStandards.stdout + untaggedStandards.stderr);
  assert.match(untaggedStandards.stdout, /Worker deploys do not record the Git SHA with --tag/);
});

test('deploy health fails a behind Worker and warns for an untagged legacy Worker', async () => {
  const root = await mkdtemp(join(tmpdir(), 'fleet-worker-parity-'));
  const behind = join(root, 'behind-worker');
  const legacy = join(root, 'legacy-worker');
  const behindHead = await initRepo(behind);
  await initRepo(legacy);
  const deployedSha = '0'.repeat(40);

  await mkdir(join(root, 'fake-bin'));
  const wrangler = join(root, 'fake-bin/wrangler');
  await writeFile(wrangler, `#!/usr/bin/env bash
if [[ "$1" == "whoami" ]]; then exit 0; fi
if [[ "$1 $2" == "deployments list" ]]; then
  printf '[{"id":"deployment-1","created_on":"2026-07-26T00:00:00Z","versions":[{"version_id":"%s-version","percentage":100}]}]\\n' "$4"
  exit 0
fi
if [[ "$1 $2" == "versions list" ]]; then
  if [[ "$4" == "behind-worker" ]]; then
    printf '[{"id":"behind-worker-version","annotations":{"workers/tag":"${deployedSha}"}}]\\n'
  else
    printf '[{"id":"legacy-worker-version","annotations":{"workers/triggered_by":"version_upload"}}]\\n'
  fi
  exit 0
fi
exit 1
`);
  await chmod(wrangler, 0o755);
  await mkdir(join(root, 'foundry/ops/config'), { recursive: true });
  await writeFile(join(root, 'foundry/ops/config/projects.json'), JSON.stringify({
    projects: [
      {
        id: 'behind-worker',
        tier: 'active',
        repo: 'behind-worker',
        deployKind: 'worker',
        cfProject: 'behind-worker',
        status: 'live',
      },
      {
        id: 'legacy-worker',
        tier: 'active',
        repo: 'legacy-worker',
        deployKind: 'worker',
        cfProject: 'legacy-worker',
        status: 'live',
      },
    ],
  }));

  const result = run('bash', [deployHealth, '--root', root, '--no-github', '--no-standards'], {
    env: { ...process.env, PATH: `${join(root, 'fake-bin')}:${process.env.PATH}` },
  });

  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(
    result.stdout,
    new RegExp(`behind-worker is not at origin/main ${behindHead.slice(0, 7)}; active version deploys 0000000`)
  );
  assert.match(result.stdout, /legacy-worker is active at 100% but version legacy-worker-version has no full Git SHA tag/);
  assert.match(result.stdout, /Failures: 1/);
  assert.match(result.stdout, /Warnings: 1/);
});

test('deploy guard does not reconstruct blockers from PROJECT_STATUS.md', async () => {
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
  assert.match(claim.stdout, /Work queue\s+✓ GitHub Issues are authoritative/);

  await writeFile(join(project, 'PROJECT_STATUS.md'), `## Blocked
- Production cutover cannot launch pending owner approval.
`);
  run('git', ['add', '.'], { cwd: project });
  run('git', ['commit', '-m', 'blocking status'], { cwd: project });
  run('git', ['update-ref', 'refs/remotes/origin/main', 'HEAD'], { cwd: project });
  const blocker = run('bash', [deployGuard, 'codevetter', '--force'], {
    env: { ...process.env, FLEET_ROOT_OVERRIDE: root },
  });
  assert.equal(blocker.status, 0, blocker.stdout + blocker.stderr);
  assert.match(blocker.stdout, /Work queue\s+✓ GitHub Issues are authoritative/);
});

test('deploy guard supports a registered project inside the Fleet monorepo', async () => {
  const root = await mkdtemp(join(tmpdir(), 'fleet-monorepo-deploy-guard-'));
  await initRepo(root);
  run('git', ['remote', 'add', 'origin', root], { cwd: root });
  run('git', ['branch', '--set-upstream-to=origin/main', 'main'], { cwd: root });

  const project = join(root, 'foundry/apps/setline');
  await mkdir(project, { recursive: true });
  await writeFile(join(project, 'wrangler.jsonc'), '{"name":"setline"}\n');
  await writeFile(join(project, 'PROJECT_STATUS.md'), '## Blocked\n- None.\n');
  await mkdir(join(root, 'foundry/ops/config'), { recursive: true });
  await writeFile(
    join(root, 'foundry/ops/config/projects.json'),
    JSON.stringify({
      projects: [
        {
          id: 'setline',
          repo: 'foundry/apps/setline',
          deployKind: 'worker',
          cfProject: 'setline',
          status: 'live',
        },
      ],
    }),
  );
  run('git', ['add', '.'], { cwd: root });
  run('git', ['commit', '-m', 'add monorepo project'], { cwd: root });
  run('git', ['update-ref', 'refs/remotes/origin/main', 'HEAD'], { cwd: root });

  const result = run('bash', [deployGuard, 'setline', '--force'], {
    env: { ...process.env, FLEET_ROOT_OVERRIDE: root },
  });

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /Git\s+✓ clean/);
  assert.match(result.stdout, /CF target\s+✓ setline/);
  assert.match(result.stdout, /READY TO DEPLOY/);
});

test('deploy guard supports a registered project inside the Fleet monorepo', async () => {
  const root = await mkdtemp(join(tmpdir(), 'fleet-monorepo-deploy-guard-'));
  await initRepo(root);
  run('git', ['remote', 'add', 'origin', root], { cwd: root });
  run('git', ['branch', '--set-upstream-to=origin/main', 'main'], { cwd: root });

  const project = join(root, 'foundry/apps/setline');
  await mkdir(project, { recursive: true });
  await writeFile(join(project, 'wrangler.jsonc'), '{"name":"setline"}\n');
  await writeFile(join(project, 'PROJECT_STATUS.md'), '## Blocked\n- None.\n');
  await mkdir(join(root, 'foundry/ops/config'), { recursive: true });
  await writeFile(
    join(root, 'foundry/ops/config/projects.json'),
    JSON.stringify({
      projects: [
        {
          id: 'setline',
          repo: 'foundry/apps/setline',
          deployKind: 'worker',
          cfProject: 'setline',
          status: 'live',
        },
      ],
    }),
  );
  run('git', ['add', '.'], { cwd: root });
  run('git', ['commit', '-m', 'add monorepo project'], { cwd: root });
  run('git', ['update-ref', 'refs/remotes/origin/main', 'HEAD'], { cwd: root });

  const result = run('bash', [deployGuard, 'setline', '--force'], {
    env: { ...process.env, FLEET_ROOT_OVERRIDE: root },
  });

  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.match(result.stdout, /Git\s+✓ clean/);
  assert.match(result.stdout, /CF target\s+✓ setline/);
  assert.match(result.stdout, /READY TO DEPLOY/);
});

test('Chess deploy target is available through the canonical registry', async () => {
  const projects = JSON.parse(await readFile(join(fleetRoot, 'foundry/ops/config/projects.json'), 'utf8'));
  const chess = projects.projects.find((project) => project.id === 'chess');
  assert.equal(chess.status, 'live');
  assert.equal(chess.cfProject, 'chess-9a0');
});
