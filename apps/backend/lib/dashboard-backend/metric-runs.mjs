import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import { existsSync, realpathSync } from 'node:fs';
import { resolve } from 'node:path';
import { PERFORMANCE_TARGET } from './performance-policy.mjs';
import { PSI_NODE_VERSION } from './psi-runtime.mjs';
import { resolveCollectorRoot } from './collector-paths.mjs';

import {
  domainStrengthRoots,
  isCurrentPortfolioProject,
  externalPerformanceTargets,
  performanceTargetUrl,
  normalizedDomain,
  registrableDomain,
} from './domain-scope.mjs';

const FAMILIES = new Set([
  'psi',
  'drank',
  'search',
  'seo',
  'ai',
]);

const PORTFOLIO_ONLY_FAMILIES = Object.freeze({
  search: 'Google Search',
  seo: 'Technical SEO',
});
const MAX_CAPTURE_CHARACTERS = 12_000;

function existingRealPath(path) {
  return existsSync(path) ? realpathSync(path) : path;
}

function fail(code, message) {
  throw Object.assign(new Error(message), { code });
}

function projectRoot(workspaceRoot, repositoryRoot, project) {
  if (project.id === 'site-health') {
    return resolve(repositoryRoot, 'apps/web');
  }
  const path = project.sourcePath ?? project.repo;
  return path ? resolve(workspaceRoot, path) : null;
}

function collectorScript(workspaceRoot, id, file, projects) {
  const root = resolveCollectorRoot(workspaceRoot, id, projects);
  const path = resolve(root, file);
  if (!existsSync(path)) {
    fail('METRIC_RUNNER_UNAVAILABLE', `${id} collector is unavailable at its cataloged checkout`);
  }
  return { root, path: existingRealPath(path) };
}

function commandFor({ family, project, workspaceRoot, repositoryRoot, projects }) {
  if (PORTFOLIO_ONLY_FAMILIES[family]) {
    fail('METRIC_SCOPE_INVALID', `${PORTFOLIO_ONLY_FAMILIES[family]} updates are portfolio-only`);
  }
  const domain = project.domains?.[0] ?? null;
  if (['psi', 'drank'].includes(family) && !domain) {
    fail('METRIC_DOMAIN_MISSING', `${project.name} has no canonical domain`);
  }
  if (family === 'psi') {
    const { root, path: cli } = collectorScript(workspaceRoot, 'psi-swarm', 'cli/dist/cli.js', projects);
    return {
      cwd: root,
      command: 'mise',
      args: [
        'exec',
        `node@${PSI_NODE_VERSION}`,
        '--',
        'node',
        cli,
        'run',
        performanceTargetUrl(project),
        '--runs',
        String(PERFORMANCE_TARGET.samplesPerPreset),
        '--parallel',
        String(PERFORMANCE_TARGET.parallel),
        '--presets',
        PERFORMANCE_TARGET.presets.join(','),
        '--tag',
        `console-manual-${randomUUID()}`,
        '--output',
        'html',
        '--no-suggest',
        '--no-crux',
        '--no-ahrefs',
      ],
      label: 'PSI Swarm',
    };
  }
  if (family === 'drank') {
    const allowedRoots = new Set(domainStrengthRoots(projects));
    const root = (project.domains ?? [])
      .map(normalizedDomain)
      .filter(Boolean)
      .map(registrableDomain)
      .find((candidate) => allowedRoots.has(candidate));
    if (!root) {
      return {
        unavailable: true,
        code: 'METRIC_DOMAIN_INVALID',
        label: 'Ahrefs Domain Rating',
        summary: 'No in-scope public-provider root is configured for this project; cached evidence was not changed.',
      };
    }
    const script = resolve(import.meta.dirname, '../../scripts/domain-rating-collect.mjs');
    return {
      cwd: resolve(import.meta.dirname, '../../../..'),
      command: process.execPath,
      args: [script, '--target', root],
      label: 'Ahrefs Domain Rating',
    };
  }
  if (family === 'ai') {
    return {
      unavailable: true,
      code: 'AI_PROVIDER_CONNECTION_REQUIRED',
      label: 'AI Awareness',
      summary: 'No approved provider-backed AI connection is configured; cached evidence was not changed.',
    };
  }
  fail('METRIC_FAMILY_INVALID', 'Unsupported project metric family');
}

function portfolioCommandFor({ family, workspaceRoot, repositoryRoot, projects }) {
  const currentProjects = projects.filter(isCurrentPortfolioProject);
  if (family === 'drank') {
    const targets = domainStrengthRoots(currentProjects);
    if (targets.length === 0) {
      fail('METRIC_DOMAIN_MISSING', 'No domain-strength targets are configured');
    }
    const script = resolve(import.meta.dirname, '../../scripts/domain-rating-collect.mjs');
    return {
      cwd: resolve(import.meta.dirname, '../../../..'),
      command: process.execPath,
      args: [script, ...targets.flatMap((domain) => ['--target', domain])],
      label: 'Portfolio Ahrefs Domain Rating',
    };
  }
  if (family === 'psi') {
    const targets = externalPerformanceTargets(currentProjects);
    if (targets.length === 0) {
      fail('METRIC_DOMAIN_MISSING', 'No public performance targets are configured');
    }
    return {
      command: process.execPath,
      args: [
        resolve(import.meta.dirname, '../../scripts/run-performance-portfolio.mjs'),
        ...targets.flatMap(({ projectId, url }) => [
          '--target',
          `${projectId}=${url}`,
        ]),
      ],
      label: 'Portfolio PSI',
    };
  }
  if (family === 'search') {
    return {
      command: process.execPath,
      args: [
        resolve(import.meta.dirname, '../../scripts/search-console-collect.mjs'),
      ],
      label: 'Portfolio Search Console evidence',
    };
  }
  if (family === 'seo') {
    return {
      command: process.execPath,
      cwd: workspaceRoot,
      args: [resolve(workspaceRoot, 'saas-maker/tooling/skills/seo-audit/scripts/seo-audit-fleet.mjs'),
        '--all', '--artifact', resolve(repositoryRoot, 'apps/backend/data/seo-audit/latest.json')],
      label: 'Portfolio technical SEO audit',
    };
  }
  fail('METRIC_SCOPE_INVALID', 'Unsupported portfolio metric family');
}

function boundedStatusText(value) {
  return String(value)
    .replace(/\u001b\[[0-9;]*m/g, '')
    .replace(/(?:\/Users|\/home|\/private|\/tmp)\/[^\s"'`<>]+/g, '[private path]')
    .slice(-MAX_CAPTURE_CHARACTERS);
}

function failureSummary(output, fallback) {
  const lines = boundedStatusText(output).split(/\r?\n/).filter((line) => line.trim());
  return lines.findLast((line) => /^[A-Za-z]*Error(?: \[[^\]]+\])?:/.test(line.trim()))?.trim()
    ?? lines.filter((line) => !/^\s+at\s|^Node\.js v\d/.test(line)).at(-1)
    ?? fallback;
}

function publicRun(run, { duplicate = false } = {}) {
  return {
    runId: run.runId,
    family: run.family,
    projectId: run.projectId,
    scope: run.scope,
    label: run.label,
    state: run.state,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    exitCode: run.exitCode,
    summary: run.summary,
    code: run.code ?? null,
    resultCount: run.resultCount ?? null,
    progress: run.progress ?? null,
    duplicate,
  };
}

export function createMetricRunController({
  projects,
  projectsProvider,
  repositoryRoot = process.env.SITE_HEALTH_OWNER_REPOSITORY ?? resolve(import.meta.dirname, '../../../..'),
  workspaceRoot = resolve(repositoryRoot, '..'),
  spawnProcess = spawn,
  now = () => new Date().toISOString(),
  onRunChange = () => {},
} = {}) {
  const runs = new Map();
  const active = new Map();

  return {
    start({ family, projectId, scope = 'project' } = {}) {
      const currentProjects = projectsProvider ? projectsProvider() : projects ?? [];
      const projectsById = new Map(currentProjects.map((project) => [project.id, project]));
      if (!FAMILIES.has(family)) fail('METRIC_FAMILY_INVALID', 'Unsupported metric family');
      if (!['project', 'portfolio'].includes(scope)) {
        fail('METRIC_SCOPE_INVALID', 'Unsupported metric scope');
      }
      const project = scope === 'project' ? projectsById.get(projectId) : null;
      if (scope === 'project' && !project) fail('METRIC_PROJECT_INVALID', 'Unknown Site Health project');
      if (scope === 'project' && !isCurrentPortfolioProject(project)) {
        fail('METRIC_PROJECT_INACTIVE', 'Inactive Site Health projects cannot start metric runs');
      }
      const key = `${family}:${scope === 'portfolio' ? 'portfolio' : projectId}`;
      const existingId = active.get(key);
      if (existingId) return publicRun(runs.get(existingId), { duplicate: true });
      if (family === 'psi' && [...active.keys()].some(key => key.startsWith('psi:'))) fail('PERFORMANCE_BUSY', 'Another performance measurement is running. Wait for it to finish before starting a different scope.');

      const plan = scope === 'portfolio'
        ? portfolioCommandFor({
            family,
            workspaceRoot,
            repositoryRoot,
            projects: [...projectsById.values()],
          })
        : commandFor({ family, project, workspaceRoot, repositoryRoot, projects: currentProjects });
      const run = {
        runId: `metric_${randomUUID().replaceAll('-', '')}`,
        family,
        projectId: scope === 'project' ? projectId : null,
        scope,
        label: plan.label,
        state: plan.unavailable ? 'unavailable' : 'running',
        startedAt: now(),
        finishedAt: plan.unavailable ? now() : null,
        exitCode: null,
        summary: plan.summary ?? `${plan.label} is running.`,
        code: plan.code ?? null,
        resultCount: null,
        capture: '',
      };
      runs.set(run.runId, run);
      if (plan.unavailable) {
        onRunChange(publicRun(run));
        return publicRun(run);
      }
      active.set(key, run.runId);
      onRunChange(publicRun(run));

      const child = spawnProcess(plan.command, plan.args, {
        cwd: plan.cwd ?? projectRoot(workspaceRoot, repositoryRoot, project ?? { id: 'site-health' }),
        env: process.env,
        shell: false,
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      const capture = (chunk) => {
        run.capture = boundedStatusText(`${run.capture}${chunk}`);
        if (family === 'psi' && scope === 'portfolio') {
          const match = [...run.capture.matchAll(/^Checked (\d+)\/(\d+) ([a-z0-9-]+) (ok|failed)\r?\n/gm)].at(-1);
          if (match && Number(match[1]) <= Number(match[2]) && run.progress?.completed !== Number(match[1])) {
            run.progress = { completed: Number(match[1]), total: Number(match[2]), projectId: match[3], outcome: match[4] };
            run.summary = `Checked ${match[1]}/${match[2]} external products · ${match[3]} ${match[4] === 'ok' ? 'measured' : 'incomplete'}`;
            onRunChange(publicRun(run));
          }
        }
      };
      child.stdout?.on('data', capture);
      child.stderr?.on('data', capture);
      child.once('error', (error) => {
        if (run.state !== 'running') return;
        run.state = 'failed';
        run.finishedAt = now();
        run.summary = boundedStatusText(error.message) || `${plan.label} failed to start.`;
        active.delete(key);
        onRunChange(publicRun(run));
      });
      child.once('close', (code) => {
        if (run.state !== 'running') return;
        run.exitCode = Number.isInteger(code) ? code : null;
        run.state = code === 0 ? 'succeeded' : 'failed';
        run.finishedAt = now();
        run.summary = code === 0
          ? `${plan.label} completed.`
          : failureSummary(run.capture, `${plan.label} failed.`);
        if (code !== 0 && family === 'drank' && /(?:^|\n)AHREFS_PARTIAL_RESPONSE:/.test(run.capture)) {
          run.code = 'AHREFS_PARTIAL_RESPONSE';
        }
        run.capture = '';
        active.delete(key);
        onRunChange(publicRun(run));
      });
      return publicRun(run);
    },

    get(runId) {
      const run = runs.get(runId);
      return run ? publicRun(run) : null;
    },

    /**
     * Mark every in-flight run failed. The child processes outlive nothing —
     * when this process stops, no `close` handler will ever fire for them, so
     * without this their receipts stay `running` forever and the dashboard
     * reports a refresh that is not happening. Idempotent.
     */
    abandonActiveRuns({
      code = 'REFRESH_INTERRUPTED',
      summary = 'The backend stopped before this refresh reported a result.',
    } = {}) {
      const abandoned = [];
      for (const [key, runId] of [...active.entries()]) {
        active.delete(key);
        const run = runs.get(runId);
        if (!run || run.state !== 'running') continue;
        run.state = 'failed';
        run.finishedAt = now();
        run.code = code;
        run.summary = summary;
        run.capture = '';
        onRunChange(publicRun(run));
        abandoned.push(publicRun(run));
      }
      return abandoned;
    },
  };
}
