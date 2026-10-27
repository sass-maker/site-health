import type { Lever, ScoreCategory, ScoreProject, ScoreWorkspace } from './scoreboard';
import { isReadyLever } from './portfolio-presentation';
export type CurrentProduct = { id: string; name: string; domains: string[]; lifecycle?: { status?: string } };
export type CategoryProduct = CurrentProduct & { assessment?: ScoreProject };
export function categoryProducts(inventory: CurrentProduct[] | null, assessed: ScoreProject[]): CategoryProduct[] {
  const byId = new Map(assessed.map((project) => [project.id, project]));
  // Offline assessment rows stay useful, but are never labelled the current inventory.
  const source = inventory === null ? assessed : inventory.filter((project) => ['primary', 'active'].includes(project.lifecycle?.status ?? ''));
  return source.map((project) => ({ ...project, assessment: byId.get(project.id) }));
}

/** Current membership limits new work; an already-active lever is never hidden. */
export function categoryQueue(ordered: Lever[], workspace: ScoreWorkspace, category: ScoreCategory, inventory: CurrentProduct[] | null): Lever | undefined {
  const active = ordered.find((lever) => lever.category === category && workspace.progress[lever.id]?.status === 'active');
  if (active) return active;
  if (inventory === null) return undefined;
  const current = new Set(inventory.filter((product) => ['primary', 'active'].includes(product.lifecycle?.status ?? '')).map((product) => product.id));
  return ordered.find((lever) => lever.category === category && current.has(lever.projectId) && isReadyLever(workspace, lever));
}
