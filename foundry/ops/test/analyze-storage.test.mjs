import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const fleetRoot = fileURLToPath(new URL('../../../', import.meta.url));
const skillRoot = path.join(fleetRoot, 'foundry/ops/skills/analyze-storage');
const script = path.join(skillRoot, 'scripts/analyze_storage.py');
const fixture = path.join(fleetRoot, 'foundry/ops/test/fixtures/storage-analysis-scan.json');

const withTempRoot = (callback) => {
  const root = mkdtempSync(path.join(tmpdir(), 'fleet-storage-analysis-'));
  try {
    callback(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
};

const runFixture = (workspace, runId = 'fixture-run') =>
  execFileSync(
    'python3',
    [
      script,
      '--workspace-root',
      workspace,
      '--scan-file',
      fixture,
      '--run-id',
      runId,
    ],
    { encoding: 'utf8' },
  );

test('fixture report stays inside the workspace and preserves conservative tiers', () => {
  withTempRoot((root) => {
    const workspace = path.join(root, 'fleet');
    mkdirSync(workspace);
    const output = JSON.parse(runFixture(workspace));
    const runDirectory = path.join(
      realpathSync(workspace),
      '.fleet-local/reports/storage/fixture-run',
    );

    assert.equal(output.runDirectory, runDirectory);
    assert.equal(output.findingCount, 4);
    for (const name of ['scan.json', 'report.json', 'report.html']) {
      assert.equal(existsSync(path.join(runDirectory, name)), true);
    }

    const report = JSON.parse(readFileSync(path.join(runDirectory, 'report.json'), 'utf8'));
    assert.equal(report.estimatedReleasableBytes, 1_048_576);
    assert.equal(report.identifiedBytes, 6_291_456);
    assert.deepEqual(
      Object.fromEntries(report.findings.map((finding) => [finding.name, finding.tier])),
      {
        browser: 'safe-cache',
        'archive.zip': 'review-required',
        chat: 'protected',
        private: 'unreadable',
      },
    );
    assert.match(
      report.findings.find((finding) => finding.name === 'private').evidence,
      /no cleanup estimate/i,
    );
  });
});

test('static report is deterministic and exposes no mutation surface', () => {
  withTempRoot((root) => {
    const workspace = path.join(root, 'fleet');
    mkdirSync(workspace);
    runFixture(workspace);
    const runDirectory = path.join(workspace, '.fleet-local/reports/storage/fixture-run');
    const firstJson = readFileSync(path.join(runDirectory, 'report.json'), 'utf8');
    const firstHtml = readFileSync(path.join(runDirectory, 'report.html'), 'utf8');

    runFixture(workspace);
    assert.equal(readFileSync(path.join(runDirectory, 'report.json'), 'utf8'), firstJson);
    assert.equal(readFileSync(path.join(runDirectory, 'report.html'), 'utf8'), firstHtml);
    assert.doesNotMatch(firstHtml, /<form|<button|fetch\(|\/action|method=["']?post/i);
    assert.match(firstHtml, /Read-only report/);
  });
});

test('invalid run ids fail before any artifact escapes the workspace', () => {
  withTempRoot((root) => {
    const workspace = path.join(root, 'fleet');
    mkdirSync(workspace);
    const result = spawnSync(
      'python3',
      [
        script,
        '--workspace-root',
        workspace,
        '--scan-file',
        fixture,
        '--run-id',
        '../escape',
      ],
      { encoding: 'utf8' },
    );

    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /run id must use/);
    assert.equal(existsSync(path.join(root, 'escape')), false);
    assert.equal(existsSync(path.join(workspace, '.fleet-local')), false);
  });
});

test('live scanner skips symlinks instead of following them', () => {
  withTempRoot((root) => {
    const workspace = path.join(root, 'fleet');
    const scanRoot = path.join(root, 'home');
    const realDirectory = path.join(scanRoot, 'Documents');
    mkdirSync(workspace);
    mkdirSync(realDirectory, { recursive: true });
    writeFileSync(path.join(realDirectory, 'note.txt'), 'fixture');
    symlinkSync(realDirectory, path.join(scanRoot, 'linked-documents'));

    execFileSync(
      'python3',
      [
        script,
        '--workspace-root',
        workspace,
        '--scan-root',
        scanRoot,
        '--min-mb',
        '0',
        '--run-id',
        'symlink-run',
      ],
      { encoding: 'utf8' },
    );

    const scan = JSON.parse(
      readFileSync(
        path.join(workspace, '.fleet-local/reports/storage/symlink-run/scan.json'),
        'utf8',
      ),
    );
    assert.equal(scan.skippedSymlinks.some((entry) => entry.endsWith('linked-documents')), true);
    assert.equal(scan.entries.some((entry) => entry.name === 'linked-documents'), false);
  });
});

test('skill metadata, exposure, and source retain the no-delete contract', () => {
  const skill = readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8');
  const metadata = readFileSync(path.join(skillRoot, 'agents/openai.yaml'), 'utf8');
  const license = readFileSync(path.join(skillRoot, 'LICENSE.upstream'), 'utf8');
  const source = readFileSync(script, 'utf8');
  const agentStack = readFileSync(path.join(fleetRoot, 'foundry/ops/scripts/agent-stack.sh'), 'utf8');
  const rootAgents = readFileSync(path.join(fleetRoot, 'AGENTS.md'), 'utf8');
  const standards = readFileSync(
    path.join(fleetRoot, 'foundry/ops/docs/fleet-agent-standards.md'),
    'utf8',
  );

  assert.match(skill, /^name: analyze-storage$/m);
  assert.match(skill, /\.fleet-local\/reports\/storage/);
  assert.match(skill, /Never delete, move to Trash, uninstall/);
  assert.match(metadata, /Use \$analyze-storage/);
  assert.match(license, /KKKKhazix\/khazix-skills/);
  assert.doesNotMatch(source, /ThreadingHTTPServer|def hard_delete|os\.remove|shutil\.rmtree/);
  assert.match(agentStack, /EXPOSED_FLEET_SKILLS=\([\s\S]*analyze-storage/);
  assert.match(rootAgents, /\| `analyze-storage` \| standalone \|/);
  assert.match(standards, /\| `analyze-storage` \| standalone \|/);
});
