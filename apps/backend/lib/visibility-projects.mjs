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

export function searchConsoleTarget(project) {
  const policy = project?.systems?.searchConsole;
  const explicit = policy !== undefined && policy !== null;
  const value = explicit ? policy.surfaceUrl : `https://${project.domains?.[0]}/`;
  if (!explicit && !project.domains?.[0]) return null;
  let url;
  try { url = new URL(value); } catch { /* Report policy errors at this boundary. */ }
  if (typeof value !== 'string' || /[\s?#]/.test(value) || !url || url.protocol !== 'https:' || url.username || url.password ||
      !url.hostname.includes('.') || /(?:^|\.)(?:localhost|local|internal)$/.test(url.hostname) ||
      /^[\d.]+$/.test(url.hostname) || url.hostname.includes(':') || url.port) {
    throw new Error(`Invalid Search Console surface URL for ${project.id}: expected a public HTTPS URL without credentials, query or fragment`);
  }
  url.pathname = `${url.pathname.replace(/\/+$/, '')}/`;
  return { surfaceUrl: url.href, domain: url.hostname, explicit };
}

export function searchObservationSurface(observation) {
  const scope = String(observation?.scope ?? '');
  const value = observation?.indexInspection?.inspectedUrl
    ?? (scope.includes(' · page:') ? scope.split(' · page:')[1] : scope);
  if (String(value).startsWith('sc-domain:')) return `https://${normalizedDomain(String(value).slice(10))}/`;
  try {
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol)) return null;
    url.pathname = `${url.pathname.replace(/\/+$/, '')}/`;
    return url.href;
  } catch { return null; }
}

export function searchConsoleProjects(catalog, rootsByDomain = new Map(), { includeExplicitSurfaces = true } = {}) {
  const catalogProjects = catalog?.projects ?? [];
  const catalogById = new Map(catalogProjects.map((project) => [project.id, project]));
  const selected = visibilityProjects(catalog);
  const targets = new Set(selected.map((project) => `${project.id}:${searchConsoleTarget(project).surfaceUrl}`));

  // Search eligibility is explicit and independent of directory listing.
  // A hidden public workbench can opt into search without changing its listing.
  for (const project of includeExplicitSurfaces ? catalogProjects : []) {
    const status = typeof project.lifecycle === 'object' ? project.lifecycle?.status : project.lifecycle;
    if (!['primary', 'active'].includes(status) || !project.domains?.length ||
        project.systems?.searchConsole == null) continue;
    const key = `${project.id}:${searchConsoleTarget(project).surfaceUrl}`;
    if (targets.has(key)) continue;
    selected.push(project);
    targets.add(key);
  }

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

    const key = `${projectId}:https://${rootDomain}/`;
    if (targets.has(key)) continue;
    selected.push({ ...project, domains: [rootDomain], systems: { ...project.systems, searchConsole: undefined } });
    targets.add(key);
  }

  return selected;
}

// A Search Console opt-in does not authorize IndexNow discovery or key checks.
export function indexNowProjects(catalog, rootsByDomain = new Map()) {
  return searchConsoleProjects(catalog, rootsByDomain, { includeExplicitSurfaces: false });
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
