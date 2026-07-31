export function isVisibilityProject(project) {
  const hasCanonicalDomain =
    Array.isArray(project?.domains) && project.domains.length > 0;
  const publicMetricSurface =
    project?.public?.listing === 'maintained' ||
    project?.metrics?.publicSite === true;

  return (
    project?.lifecycle === 'maintained' &&
    project?.tier !== 'non-product' &&
    hasCanonicalDomain &&
    publicMetricSurface
  );
}

export function visibilityProjects(catalog) {
  return (catalog?.projects ?? []).filter(isVisibilityProject);
}
