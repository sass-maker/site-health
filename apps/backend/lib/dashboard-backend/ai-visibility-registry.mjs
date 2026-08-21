import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const defaultConfigPath = join(moduleDirectory, '..', '..', 'config', 'ai-visibility.json');

function normalizeIdentity(value) {
  return String(value ?? '').trim().toLowerCase().replaceAll('_', '-');
}

export function resolveAiVisibilityPortfolio({ config, reactivatedProjectIds = [] }) {
  if (config?.schemaVersion !== 1 || !Array.isArray(config.projects)) {
    throw new Error('AI Visibility configuration is invalid');
  }

  const reactivated = new Set(reactivatedProjectIds.map(normalizeIdentity));
  const eligible = [];
  const excluded = [];

  for (const project of config.projects) {
    const slug = normalizeIdentity(project.slug);
    if (project.attention === 'ignored' && !reactivated.has(slug)) {
      excluded.push({ projectId: slug, reason: 'ignored' });
      continue;
    }
    eligible.push({
      ...structuredClone(project),
      slug,
      attention:
        project.attention === 'my-work'
          ? 'focus'
          : project.attention === 'toolbox'
            ? 'secondary'
            : project.attention === 'foundry'
              ? 'active'
              : project.attention,
      reactivated: project.attention === 'ignored',
    });
  }

  return {
    version: config.version,
    scheduleIntent: structuredClone(config.scheduleIntent),
    eligible,
    excluded,
  };
}

export function loadAiVisibilityPortfolio({
  configPath = defaultConfigPath,
  reactivatedProjectIds = [],
} = {}) {
  return resolveAiVisibilityPortfolio({
    config: JSON.parse(readFileSync(configPath, 'utf8')),
    reactivatedProjectIds,
  });
}

export function findAiVisibilityProject(portfolio, projectId) {
  const normalized = normalizeIdentity(projectId);
  const project = portfolio.eligible.find(
    (entry) =>
      entry.slug === normalized ||
      entry.aliases.some((alias) => normalizeIdentity(alias) === normalized),
  );
  if (project) return project;
  const exclusion = portfolio.excluded.find((entry) => entry.projectId === normalized);
  if (exclusion?.reason === 'ignored') {
    throw new Error(`AI visibility is disabled for ignored project ${normalized}; explicit reactivation is required`);
  }
  throw new Error(`AI visibility is not configured for project ${normalized}`);
}

export function evaluateAiVisibilityScheduleActivation({
  scheduleIntent,
  designatedHost = false,
  hostVerified = false,
  approvedCanaryRunId = null,
} = {}) {
  const blockers = [];
  if (scheduleIntent?.enabled !== true) blockers.push('schedule-intent-disabled');
  if (scheduleIntent?.activation?.requiresDesignatedHost && !designatedHost) {
    blockers.push('designated-host-required');
  }
  if (scheduleIntent?.activation?.requiresHostVerification && !hostVerified) {
    blockers.push('host-verification-required');
  }
  if (scheduleIntent?.activation?.requiresApprovedCanary && !approvedCanaryRunId) {
    blockers.push('approved-canary-required');
  }
  return {
    allowed: blockers.length === 0,
    enabled: scheduleIntent?.enabled === true,
    blockers,
  };
}

export function assertAiVisibilityScheduleCanRun(input) {
  const result = evaluateAiVisibilityScheduleActivation(input);
  if (!result.allowed) {
    throw new Error(`AI visibility schedule cannot run: ${result.blockers.join(', ')}`);
  }
  return result;
}
