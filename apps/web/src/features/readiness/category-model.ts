import type { ScoreProject } from './scoreboard';
export type CurrentProduct = { id: string; name: string; domains: string[]; lifecycle?: { status?: string } };
export type CategoryProduct = CurrentProduct & { assessment?: ScoreProject };
export function categoryProducts(inventory: CurrentProduct[] | null, assessed: ScoreProject[]): CategoryProduct[] {
  const byId = new Map(assessed.map((project) => [project.id, project]));
  // Offline assessment rows stay useful, but are never labelled the current inventory.
  const source = inventory === null ? assessed : inventory.filter((project) => ['primary', 'active'].includes(project.lifecycle?.status ?? ''));
  return source.map((project) => ({ ...project, assessment: byId.get(project.id) }));
}
