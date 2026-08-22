export function isCurrentProject(project) {
  return project.status !== "orphan"
    && !["past", "non-product"].includes(project.lifecycle ?? "")
    && project.attention !== "ignored"
    && project.tier !== "out-of-fleet"
    && project.priority !== "P4"
    && project.portfolioStatus !== "archived";
}

export function partitionProjects(projects) {
  const current = projects
    .filter(isCurrentProject)
    .sort((left, right) =>
      String(left.priority ?? "P9").localeCompare(String(right.priority ?? "P9"))
      || left.name.localeCompare(right.name));
  const inactive = projects.filter((project) => !isCurrentProject(project));
  return { current, inactive };
}

export function inactiveProjectState(project) {
  if (project.status === "retained-resources") return "retained-resources";
  if (project.lifecycle === "non-product") return "non-product";
  if (project.tier === "out-of-fleet") return "outside-fleet";
  if (project.portfolioStatus === "archived") return "archived";
  if (project.lifecycle === "past") return "past";
  return "inactive";
}

export function matchesProjectFilters(project, { query = "", priority = "", health = "" } = {}) {
  const normalizedQuery = query.trim().toLowerCase();
  const searchText = [
    project.name,
    project.description,
    project.familyName,
    ...(project.domains ?? []),
  ].filter(Boolean).join(" ").toLowerCase();

  return (!normalizedQuery || searchText.includes(normalizedQuery))
    && (!priority || project.priority === priority)
    && (!health || project.health === health);
}
