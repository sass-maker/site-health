export function isVisibilityProject(project) {
  const hasCanonicalDomain =
    Array.isArray(project?.domains) && project.domains.length > 0;
  const publicMetricSurface =
    project?.public?.listing === 'maintained' ||
    project?.metrics?.publicSite === true;

  const lc =
    project?.lifecycle && typeof project.lifecycle === 'object'
      ? project.lifecycle.status
      : project?.lifecycle;

  return (
    (lc === 'primary' || lc === 'active') &&
    hasCanonicalDomain &&
    publicMetricSurface
  );
}

export function visibilityProjects(catalog) {
  return (catalog?.projects ?? []).filter(isVisibilityProject);
}

function normalizedDomain(value) {
  return String(value ?? '').trim().toLowerCase().replace(/^www\./, '');
}

export function searchConsoleProjects(catalog, rootsByDomain = new Map()) {
  const catalogProjects = catalog?.projects ?? [];
  const catalogById = new Map(catalogProjects.map((project) => [project.id, project]));
  const selected = visibilityProjects(catalog);
  const targets = new Set(selected.map((project) => `${project.id}:${normalizedDomain(project.domains?.[0])}`));

  for (const root of rootsByDomain.values()) {
    const rootDomain = normalizedDomain(root?.rootDomain);
    const projectId = String(root?.projectId ?? '').trim();
    const project = catalogById.get(projectId);
    if (!project) throw new Error(`Unknown Search Console root project: ${projectId || '(empty)'}`);

    const ownedDomains = (project.domains ?? []).map(normalizedDomain);
    // Keep measuring still-owned inactive domains. A historical identity that
    // gave up this root must not be revived as a collector or IndexNow target.
    if (project.lifecycle?.status === 'inactive' && !ownedDomains.includes(rootDomain)) continue;
    if (!rootDomain || !ownedDomains.includes(rootDomain)) {
      throw new Error(`Search Console root project domain mismatch: ${projectId} does not own ${rootDomain || '(empty)'}`);
    }

    const key = `${projectId}:${rootDomain}`;
    if (targets.has(key)) continue;
    selected.push({ ...project, domains: [rootDomain] });
    targets.add(key);
  }

  return selected;
}

// Old ledger rows retain their inspected URL/property scope, so domain separation
// works without rewriting provider evidence or changing the ledger schema.
export function searchObservationDomain(observation) {
  const scope = String(observation?.scope ?? '');
  const value = observation?.indexInspection?.inspectedUrl
    ?? (scope.includes(' · page:') ? scope.split(' · page:')[1] : scope);
  if (String(value).startsWith('sc-domain:')) return normalizedDomain(String(value).slice(10));
  try {
    return normalizedDomain(new URL(value).hostname);
  } catch {
    return null;
  }
}
