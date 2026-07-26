import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const moduleDirectory = dirname(fileURLToPath(import.meta.url));
const defaultRegistryPath = join(moduleDirectory, '..', '..', 'config', 'projects.json');

const canonicalNames = {
  'app-health': 'App Health',
  codevetter: 'CodeVetter',
  'fleet-workspace': 'Foundry',
  'free-ai': 'Free AI',
  'high-signal': 'High Signal',
  pace: 'HeyPace',
  posttrainllm: 'Post-train LLM',
  'psi-swarm': 'PSI Swarm',
};

function displayName(project) {
  if (project.name) return project.name;
  if (canonicalNames[project.id]) return canonicalNames[project.id];
  return project.id
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function loadFounderProjects(registryPath = defaultRegistryPath) {
  const registry = JSON.parse(readFileSync(registryPath, 'utf8'));
  return registry.projects
    .filter((project) => project.status !== 'orphan')
    .map((project) => ({
      id: project.id,
      name: displayName(project),
      family: project.family,
      attention: project.attention ?? project.tier,
      lifecycle: project.lifecycle ?? 'maintained',
      priority:
        project.priority ??
        (registry._meta?.priorities
          ? Object.entries(registry._meta.priorities).find(([, ids]) => ids.includes(project.id))?.[0] ?? null
          : null),
      status: project.status,
      repo: project.repo,
      sourcePath: project.sourcePath ?? null,
      repositoryVisibility: project.repositoryVisibility ?? 'unknown',
      domains: project.domains ?? [],
      deployKind: project.deployKind,
    }));
}
