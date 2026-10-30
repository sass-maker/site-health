// Priority applicability comes from the canonical catalog, independently of sharing.
export function projectPriorityValue(project) {
  return project.priorityApplicable === false ? 'none' : project.priority || 'unranked';
}

export function projectPrioritySortValue(project) {
  if (project.priorityApplicable === false) return 6;
  const rank = /^P([0-4])$/.exec(project.priority ?? '');
  return rank ? Number(rank[1]) : 5;
}

export function projectPriorityLabel(project) {
  return project.priorityApplicable === false ? 'No priority' : project.priority || 'Awaiting review';
}

export function projectGrowthFocusLabel(project) {
  return project.growthFocus?.level === 'high' ? 'SEO/GEO focus' : null;
}

// Describe the product itself: a native app's landing page is not its type.
export function projectTypeLabel(project) {
  const platforms = new Set((project.platforms ?? []).map(platform => platform.toLowerCase()));
  const devices = [
    platforms.has('macos') ? 'Mac' : null,
    platforms.has('ios') ? 'iPhone' : null,
    platforms.has('ipados') ? 'iPad' : null,
    platforms.has('watchos') ? 'Apple Watch' : null,
  ].filter(Boolean);
  if (devices.length) {
    const last = devices.pop();
    return `${devices.length ? `${devices.join(', ')} & ` : ''}${last} app`;
  }
  if (/api gateway/i.test(project.form ?? '')) return 'API/tool';
  if (platforms.has('web')) return 'Website';
  return project.form || 'Type not recorded';
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

export function matchesProjectFilters(project, { query = "", priority = "", health = "", sharing = "", lifecycle = "", resume = "", aiRole = "" } = {}) {
  const normalizedQuery = query.trim().toLowerCase();
  const searchText = [
    project.name,
    project.description,
    project.familyName,
    projectTypeLabel(project),
    projectGrowthFocusLabel(project),
    ...(project.aiProduct?.roles ?? []),
    project.aiProduct?.workflow,
    ...(project.domains ?? []),
  ].filter(Boolean).join(" ").toLowerCase();

  return (!normalizedQuery || searchText.includes(normalizedQuery))
    && (!aiRole || (aiRole === 'none'
      ? project.aiProduct != null && project.aiProduct.roles.length === 0
      : project.aiProduct?.roles.includes(aiRole)))
    && (!priority || projectPriorityValue(project) === priority)
    && (!health || project.health === health)
    && (!lifecycle || project.lifecycle?.status === lifecycle)
    && (!resume || (resume === "defined" ? project.lifecycle?.resumeCondition != null : project.lifecycle?.resumeCondition == null))
    && (!sharing || (sharing === "shareable" ? project.lifecycle?.shareable === true : project.lifecycle?.shareable !== true));
}

export async function loadProjectDirectory(api) {
  const optionalCollections = Promise.resolve().then(() => api('/v1/project-collections'))
    .then(collections => {
      if (!Array.isArray(collections)) throw new Error('Invalid app collections response');
      return { collections, collectionsUnavailable: false };
    })
    .catch(() => ({ collections: [], collectionsUnavailable: true }));
  const [projects, collectionResult] = await Promise.all([api('/v1/projects'), optionalCollections]);
  return { projects, ...collectionResult };
}

export function groupProjectCollections(projects, collections = [], filters = {}) {
  const current = [...new Map(projects.map(project => [project.id, project])).values()];
  const collectionByProject = new Map(collections.flatMap(collection =>
    collection.projectIds.map(id => [id, collection])));
  const visible = current.filter(project => {
    const collection = collectionByProject.get(project.id);
    return matchesProjectFilters(collection ? {
      ...project,
      familyName: [project.familyName, collection.name, collection.description, collection.rootDomain].filter(Boolean).join(' '),
    } : project, filters);
  });
  return {
    total: current.length,
    visible,
    collections: collections.map(collection => ({
      ...collection,
      projects: visible.filter(project => collection.projectIds.includes(project.id)),
    })).filter(collection => collection.projects.length),
    ungrouped: visible.filter(project => !collectionByProject.has(project.id)),
  };
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
