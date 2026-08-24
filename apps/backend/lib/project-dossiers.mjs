import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const TOOLING_RULES = [
  ['Astro', (path) => /(^|\/)astro\.config\.[^/]+$/.test(path)],
  ['Biome', (path) => /(^|\/)biome\.jsonc?$/.test(path)],
  ['Bun', (path) => /(^|\/)bun\.lockb?$/.test(path)],
  ['Cloudflare Wrangler', (path) => /(^|\/)wrangler\.(toml|jsonc?|ya?ml)$/.test(path)],
  ['CocoaPods', (path) => /(^|\/)Podfile$/.test(path)],
  ['Docker', (path) => /(^|\/)(Dockerfile|compose\.ya?ml|docker-compose\.ya?ml)$/.test(path)],
  ['Drizzle', (path) => /(^|\/)drizzle\.config\.[^/]+$/.test(path)],
  ['ESLint', (path) => /(^|\/)(eslint\.config\.[^/]+|\.eslintrc(\.[^/]+)?)$/.test(path)],
  ['Go modules', (path) => /(^|\/)go\.mod$/.test(path)],
  ['Next.js', (path) => /(^|\/)next\.config\.[^/]+$/.test(path)],
  ['npm', (path) => /(^|\/)package-lock\.json$/.test(path)],
  ['Playwright', (path) => /(^|\/)playwright\.config\.[^/]+$/.test(path)],
  ['pnpm', (path) => /(^|\/)pnpm-lock\.yaml$/.test(path)],
  ['Python pyproject', (path) => /(^|\/)pyproject\.toml$/.test(path)],
  ['Rust Cargo', (path) => /(^|\/)Cargo\.toml$/.test(path)],
  ['Swift Package Manager', (path) => /(^|\/)Package\.swift$/.test(path)],
  ['Tailwind CSS', (path) => /(^|\/)tailwind\.config\.[^/]+$/.test(path)],
  ['Tauri', (path) => /(^|\/)tauri\.conf\.json$/.test(path)],
  ['Terraform', (path) => /(^|\/)[^/]+\.tf$/.test(path)],
  ['Turborepo', (path) => /(^|\/)turbo\.json$/.test(path)],
  ['uv', (path) => /(^|\/)uv\.lock$/.test(path)],
  ['Vite', (path) => /(^|\/)vite\.config\.[^/]+$/.test(path)],
  ['Vitest', (path) => /(^|\/)vitest\.config\.[^/]+$/.test(path)],
  ['Xcode', (path) => /\.xcodeproj\/project\.pbxproj$/.test(path)],
  ['Yarn', (path) => /(^|\/)yarn\.lock$/.test(path)],
];

const WORKFLOW_PATH = /^\.github\/workflows\/[^/]+\.ya?ml$/;

export function githubRepositorySlug(remoteUrl) {
  const match = remoteUrl?.trim().match(
    /(?:github\.com[/:])([^/\s]+)\/([^/\s]+?)(?:\.git)?$/,
  );
  return match ? `${match[1]}/${match[2]}` : null;
}

function cleanYamlScalar(value) {
  return value.trim().replace(/^['"]|['"]$/g, '');
}

function cleanCronScalar(value) {
  const quoted = value.trim().match(/^(['"])(.*?)\1/);
  return quoted ? quoted[2] : value.split(/\s+#/)[0].trim();
}

export function parseWorkflow(source, file) {
  const lines = source.split(/\r?\n/);
  const nameLine = lines.find((line) => /^name:\s*\S/.test(line));
  const name = nameLine ? cleanYamlScalar(nameLine.replace(/^name:\s*/, '')) : basename(file);
  const onIndex = lines.findIndex((line) => /^(?:on|['"]on['"]):(?:\s|$)/.test(line));
  const triggers = [];
  const schedules = [];

  if (onIndex >= 0) {
    const inline = lines[onIndex].replace(/^(?:on|['"]on['"]):\s*/, '').trim();
    if (inline.startsWith('[') && inline.endsWith(']')) {
      triggers.push(...inline.slice(1, -1).split(',').map(cleanYamlScalar).filter(Boolean));
    } else if (inline) {
      triggers.push(cleanYamlScalar(inline));
    } else {
      for (const line of lines.slice(onIndex + 1)) {
        if (/^\S/.test(line)) break;
        const match = line.match(/^\s{2}([A-Za-z0-9_-]+):(?:\s|$)/);
        if (match) triggers.push(match[1]);
      }
    }
  }

  if (triggers.includes('schedule')) {
    for (const line of lines.slice(onIndex + 1)) {
      if (/^\S/.test(line)) break;
      const match = line.match(/^\s+-?\s*cron:\s*(.+?)\s*$/);
      if (match) schedules.push(cleanCronScalar(match[1]));
    }
  }

  return {
    name,
    file,
    triggers: [...new Set(triggers)].sort(),
    schedules: [...new Set(schedules)],
  };
}

export function observeTrackedRepository({
  projectId,
  sourcePath,
  revision,
  repositorySlug = null,
  worktree = null,
  trackedFiles,
  readText,
}) {
  const files = [...trackedFiles].sort();
  const githubActions = files
    .filter((file) => WORKFLOW_PATH.test(file))
    .map((file) => parseWorkflow(readText(file), file))
    .sort((left, right) => left.file.localeCompare(right.file));
  const toolingSignals = TOOLING_RULES.flatMap(([name, matches]) => {
    const evidence = files.filter(matches).slice(0, 8);
    return evidence.length > 0 ? [{ name, evidence }] : [];
  });
  let packageManager = null;
  let rootPackageScripts = [];

  if (files.includes('package.json')) {
    try {
      const packageManifest = JSON.parse(readText('package.json'));
      packageManager = packageManifest.packageManager ?? null;
      rootPackageScripts = Object.keys(packageManifest.scripts ?? {}).sort();
    } catch {
      // A malformed root package manifest is reported by the owning repository's own checks.
    }
  }

  return {
    source: {
      state: 'available',
      path: sourcePath,
      revision,
      repositorySlug,
      worktree,
    },
    githubActions,
    toolingSignals,
    packageManager,
    rootPackageScripts,
    projectId,
  };
}

export function scanFleetRepositories(projects, { fleetRoot, observedAt }) {
  const observations = {};

  for (const project of projects) {
    const sourcePath = project.repo;
    const repositoryPath = sourcePath ? resolve(fleetRoot, sourcePath) : null;
    if (!sourcePath || !repositoryPath || !existsSync(repositoryPath)) {
      observations[project.id] = {
        projectId: project.id,
        source: {
          state: 'unavailable',
          path: sourcePath ?? null,
          revision: null,
          repositorySlug: null,
          worktree: null,
        },
        githubActions: [],
        toolingSignals: [],
        packageManager: null,
        rootPackageScripts: [],
      };
      continue;
    }

    try {
      const trackedFiles = execFileSync('git', ['-C', repositoryPath, 'ls-files', '-z'], {
        encoding: 'utf8',
      })
        .split('\0')
        .filter(Boolean)
        .filter((file) => existsSync(resolve(repositoryPath, file)));
      const revision = execFileSync('git', ['-C', repositoryPath, 'rev-parse', 'HEAD'], {
        encoding: 'utf8',
      }).trim();
      const worktreeLines = execFileSync(
        'git',
        ['-C', repositoryPath, 'status', '--porcelain=v1', '--untracked-files=no'],
        { encoding: 'utf8' },
      )
        .split('\n')
        .filter(Boolean);
      const deletedWorkflowFiles = worktreeLines
        .filter((line) => line.slice(0, 2).includes('D'))
        .map((line) => line.slice(3).trim())
        .filter((file) => WORKFLOW_PATH.test(file));
      const remoteUrl = execFileSync(
        'git',
        ['-C', repositoryPath, 'remote', 'get-url', 'origin'],
        { encoding: 'utf8' },
      ).trim();
      observations[project.id] = observeTrackedRepository({
        projectId: project.id,
        sourcePath,
        revision,
        repositorySlug: githubRepositorySlug(remoteUrl),
        worktree: {
          state: worktreeLines.length > 0 ? 'dirty' : 'clean',
          trackedChangeCount: worktreeLines.length,
          deletedWorkflowFiles,
        },
        trackedFiles,
        readText: (file) => readFileSync(resolve(repositoryPath, file), 'utf8'),
      });
    } catch (error) {
      observations[project.id] = {
        projectId: project.id,
        source: {
          state: 'unavailable',
          path: sourcePath,
          revision: null,
          repositorySlug: null,
          worktree: null,
          reason: error instanceof Error ? error.message.split('\n')[0] : 'repository scan failed',
        },
        githubActions: [],
        toolingSignals: [],
        packageManager: null,
        rootPackageScripts: [],
      };
    }
  }

  return {
    schemaVersion: 1,
    observedAt,
    observationSemantics:
      'Read-only snapshot of tracked workflow and toolchain files in the Fleet workspace. It reads workflow names, triggers, cron expressions, tracked-worktree state, root package script keys, and package-manager declarations only; environment files, credential-bearing configuration, secrets, and command values are not retained.',
    projects: observations,
  };
}

function normalizeProjectLabel(value) {
  return value
    .replace(/\s*\(`[^`]+`\)\s*$/, '')
    .replace(/[`*_]/g, '')
    .trim()
    .toLocaleLowerCase('en-US');
}

export function parsePortfolioIntents(markdown, projects) {
  const projectByLabel = new Map();
  for (const project of projects) {
    for (const label of [
      project.id,
      project.name,
      project.repo,
      project.public?.id,
      project.public?.name,
      ...(project.aliases ?? []),
    ].filter(Boolean)) {
      projectByLabel.set(normalizeProjectLabel(label), project);
    }
  }

  const intents = {};
  const extras = [];
  for (const line of markdown.split(/\r?\n/)) {
    if (!line.startsWith('|') || line.startsWith('| ---')) continue;
    const cells = line.split('|').slice(1, -1).map((cell) => cell.trim());
    if (cells.length !== 5 || cells[0] === 'Project') continue;
    const explicitId = cells[0].match(/`([^`]+)`/)?.[1];
    const project = projectByLabel.get(normalizeProjectLabel(explicitId ?? cells[0]));
    if (!project) {
      extras.push(cells[0]);
      continue;
    }
    if (intents[project.id]) throw new Error(`duplicate portfolio intent for ${project.id}`);
    intents[project.id] = {
      classification: cells[1],
      why: cells[2],
      currentState: cells[3],
      nextDecision: cells[4],
    };
  }

  return { intents, extras };
}

export function validateDossierInputs({ catalog, operations, intents, extras = [] }) {
  const projectIds = catalog.projects.map((project) => project.id).sort();
  const operationIds = Object.keys(operations.projects ?? {}).sort();
  const intentIds = Object.keys(intents ?? {}).sort();

  if (new Set(projectIds).size !== projectIds.length) {
    throw new Error('canonical project ids must be unique');
  }
  if (JSON.stringify(operationIds) !== JSON.stringify(projectIds)) {
    throw new Error('repository observations must cover every canonical project exactly once');
  }
  if (JSON.stringify(intentIds) !== JSON.stringify(projectIds)) {
    throw new Error('portfolio intents must cover every canonical project exactly once');
  }
  if (extras.length > 0) {
    throw new Error(`portfolio intent contains non-canonical projects: ${extras.join(', ')}`);
  }
  if (operations.schemaVersion !== 1) throw new Error('unsupported project operations schema');
  const unattributedCloudflare = (catalog.infrastructure.unownedResources ?? []).filter(
    (resource) => resource.provider === 'cloudflare',
  );
  if (unattributedCloudflare.length > 0) {
    throw new Error(
      `Cloudflare resources must have a project or shared operational owner: ${unattributedCloudflare
        .map((resource) => `${resource.kind}:${resource.name}`)
        .join(', ')}`,
    );
  }
}
