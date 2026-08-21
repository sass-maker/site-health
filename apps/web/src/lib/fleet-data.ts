import { readFileSync } from "node:fs";
import { resolve } from "node:path";

type RegistryProject = {
  id: string;
  name?: string;
  lifecycle?: string;
  status?: string;
};

export type DashboardProject = {
  slug: string;
  title: string;
};

function titleize(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getFleetProjects(): DashboardProject[] {
  const registryPath = resolve(process.cwd(), "../backend/config/projects.json");
  const registry = JSON.parse(readFileSync(registryPath, "utf8")) as {
    projects?: RegistryProject[];
  };

  return (registry.projects ?? [])
    .filter((project) => project.status !== "orphan")
    .map((project) => ({
      slug: project.id,
      title: project.name ?? titleize(project.id),
    }));
}
