// Priority applicability comes from the canonical catalog, independently of sharing.
export function projectPriorityValue(project) {
  return project.priorityApplicable === false ? 'none' : project.priority || 'unranked';
}

export function projectPrioritySortValue(project) {
  if (project.priorityApplicable === false) return 6;
  const rank = /^P([1-4])$/.exec(project.priority ?? '');
  return rank ? Number(rank[1]) : 5;
}

export function projectPriorityLabel(project) {
  return project.priorityApplicable === false ? 'No priority' : project.priority || 'Awaiting review';
}

export function projectGrowthFocusLabel(project) {
  return project.growthFocus?.level === 'high' ? 'SEO/GEO focus' : null;
}

export function projectAudiencePriorityLabel(project) {
  return [project.audience === 'internal' ? 'Internal' : null, projectPriorityLabel(project), projectGrowthFocusLabel(project)].filter(Boolean).join(' · ');
}

export function isCurrentProject(project) {
  return ['primary', 'active'].includes(project.lifecycle?.status);
}

export function partitionProjects(projects) {
  const current = projects
    .filter(isCurrentProject)
    .sort((left, right) =>
      projectPrioritySortValue(left) - projectPrioritySortValue(right)
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

export function matchesProjectFilters(project, { query = "", priority = "", health = "", sharing = "", lifecycle = "", resume = "" } = {}) {
  const normalizedQuery = query.trim().toLowerCase();
  const searchText = [
    project.name,
    project.description,
    project.familyName,
    projectGrowthFocusLabel(project),
    ...(project.domains ?? []),
  ].filter(Boolean).join(" ").toLowerCase();

  return (!normalizedQuery || searchText.includes(normalizedQuery))
    && (!priority || projectPriorityValue(project) === priority)
    && (!health || project.health === health)
    && (!lifecycle || project.lifecycle?.status === lifecycle)
    && (!resume || (resume === "defined" ? project.lifecycle?.resumeCondition != null : project.lifecycle?.resumeCondition == null))
    && (!sharing || (sharing === "shareable" ? project.lifecycle?.shareable === true : project.lifecycle?.shareable !== true));
}

export function projectSharingLabel(project) {
  return project.lifecycle?.shareable === true ? "Shareable" : "Not shareable";
}

// Shared domain rows can belong to several identities. Current scope keeps only
// current owners in both the row and its displayed owner count.
export function scopeOutcomeRows(rows, projects, includeInactive = false) {
  if (includeInactive) return rows;
  const currentIds = new Set(projects.filter(isCurrentProject).map((project) => project.id));
  return rows.flatMap((row) => {
    if (row.projectId) return currentIds.has(row.projectId) ? [row] : [];
    const owners = (row.projects ?? []).filter((owner) => currentIds.has(owner.projectId));
    return owners.length ? [{ ...row, projects: owners }] : [];
  });
}
