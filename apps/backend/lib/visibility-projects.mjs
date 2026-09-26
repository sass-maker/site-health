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

export function githubRepositoryUrl(project) {
  const url = project?.repositoryUrl ?? project?.public?.repositoryUrl;
  return typeof url === 'string' && url.trim() ? url.trim() : null;
}

export function githubRepositorySlug(project) {
  const url = githubRepositoryUrl(project);
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== 'github.com') return null;
    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length < 2) return null;
    return `${segments[0]}/${segments[1].replace(/\.git$/, '')}`;
  } catch {
    return null;
  }
}

// Public repositories are growth surfaces even when the product itself is not a
// maintained listing: a hidden or past listing still accrues stars and traffic.
export function githubProjects(catalog) {
  return (catalog?.projects ?? []).filter(
    (project) => project?.repositoryVisibility === 'public' && githubRepositorySlug(project),
  );
}

function normalizedDomain(value) {
  return String(value ?? '').trim().toLowerCase().replace(/^www\./, '');
}

export function searchConsoleProjects(catalog, rootsByDomain = new Map()) {
  const catalogProjects = catalog?.projects ?? [];
  const catalogById = new Map(catalogProjects.map((project) => [project.id, project]));
  const selected = visibilityProjects(catalog);
  const selectedById = new Map(selected.map((project) => [project.id, project]));

  for (const root of rootsByDomain.values()) {
    const rootDomain = normalizedDomain(root?.rootDomain);
    const projectId = String(root?.projectId ?? '').trim();
    const project = catalogById.get(projectId);
    if (!project) throw new Error(`Unknown Search Console root project: ${projectId || '(empty)'}`);

    const ownedDomains = (project.domains ?? []).map(normalizedDomain);
    if (!rootDomain || !ownedDomains.includes(rootDomain)) {
      throw new Error(`Search Console root project domain mismatch: ${projectId} does not own ${rootDomain || '(empty)'}`);
    }

    const existing = selectedById.get(projectId);
    if (existing) {
      const primaryDomain = normalizedDomain(existing.domains?.[0]);
      if (primaryDomain !== rootDomain) {
        throw new Error(
          `Search Console root conflicts with the public metric target: ${projectId} measures ${primaryDomain || '(empty)'}, not ${rootDomain}`,
        );
      }
      continue;
    }

    const target = { ...project, domains: [rootDomain] };
    selected.push(target);
    selectedById.set(projectId, target);
  }

  return selected;
}
