import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function readConfig(repositoryRoot) {
  const path = resolve(repositoryRoot, 'apps/backend/config/capabilities.json');
  const value = JSON.parse(readFileSync(path, 'utf8'));
  if (value.schema !== 'site-health.capabilities.v1') throw new Error('unsupported Site Health capability schema');
  return value;
}

export function buildCapabilityProjection({
  repositoryRoot = resolve(import.meta.dirname, '../../../..'),
  workspaceRoot = resolve(repositoryRoot, '..'),
  now = new Date().toISOString(),
} = {}) {
  const config = readConfig(repositoryRoot);
  const skillSourceAvailable = existsSync(resolve(workspaceRoot, 'saas-maker/tooling/skills/site-health/SKILL.md'));
  return {
    schemaVersion: 'site-health.capability-projection.v1',
    generatedAt: now,
    sources: {
      skills: {
        state: skillSourceAvailable ? 'ready' : 'unavailable',
        sourceAvailable: skillSourceAvailable,
        reason: skillSourceAvailable
          ? 'Canonical skill metadata is read from SaaS Maker tooling.'
          : 'SaaS Maker tooling checkout is missing.',
      },
    },
    skills: config.skills.map((capability) => ({
      ...capability,
      state: skillSourceAvailable ? 'ready' : 'unavailable',
      lastRun: null,
    })),
  };
}
