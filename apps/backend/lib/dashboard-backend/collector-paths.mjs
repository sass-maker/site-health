import { resolve } from 'node:path';
import { loadDashboardProjects } from './registry.mjs';

// Archived helpers remain independently owned. Their catalog paths, not their
// former Fleet directory names, determine where the retained collectors live.
export function resolveCollectorRoot(workspaceRoot, id, projects = loadDashboardProjects()) {
  const project = projects.find((entry) => entry.id === id);
  return resolve(workspaceRoot, project?.repositories?.localPath ?? project?.sourcePath ?? project?.repo ?? id);
}
