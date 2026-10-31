import { assertKnownProject, resolveCheckSource } from './runner.mjs';
import { GrowthCycleStore } from './growth-cycle.mjs';

// Brand evidence is private local state. These routes are served only by the
// loopback-bound Site Health backend; mutations sit behind the same owner
// token / trusted-loopback gate as every other mutation. Every read and write
// is scoped to one Site Health project id that must exist in the catalog.

const PROJECT_ROUTE = /^\/v1\/projects\/([^/]+)\/brand-evidence(?:\/(.*))?$/;

function projectMatch(url) {
  const match = url.pathname.match(PROJECT_ROUTE);
  if (!match) return null;
  return { projectId: decodeURIComponent(match[1]), rest: match[2] ?? '' };
}

export function createBrandEvidenceRoutes({
  store,
  env = process.env,
  fetchImpl = fetch,
  collectorFactory,
  refreshBrandEvidence,
  prepareCommunityBrief,
  checkReadiness = (profile) => resolveCheckSource(profile, env),
  scheduleDescription = 'Runs while the Site Health backend is open.',
  now = () => new Date().toISOString(),
}) {
  const growth = store ? new GrowthCycleStore(store) : null;
  const unavailable = (json, response) => json(response, 503, { error: 'brand evidence store unavailable' });

  function read(url, projects, response, json) {
    if (url.pathname === '/v1/brand-evidence/projects') {
      if (!store) return unavailable(json, response);
      const known = new Set(projects.map((project) => project.id));
      return json(response, 200, {
        schemaVersion: 'site-health.brand-evidence-projects.v1',
        generatedAt: now(),
        profiles: store.listProfiles().filter((profile) => known.has(profile.projectId)),
        projects: projects.filter((project) => project.identityKind !== 'repository').map((project) => ({
          projectId: project.id, name: project.name, websiteUrl: project.websiteUrl,
          active: ['active', 'primary'].includes(project.lifecycle?.status ?? project.status),
        })),
      });
    }
    const match = projectMatch(url);
    if (!match || !['', 'growth'].includes(match.rest)) return false;
    if (!store) return unavailable(json, response);
    assertKnownProject(match.projectId, projects);
    if (match.rest === 'growth') return json(response, 200, growth.view(match.projectId));
    const limit = Number(url.searchParams.get('limit') ?? 50);
    return json(response, 200, {
      generatedAt: now(),
      ...store.projectView(match.projectId, { observationLimit: Number.isInteger(limit) ? limit : 50 }),
      readiness: (() => {
        const source = checkReadiness(store.getProfile(match.projectId));
        return { api: { ready: source.ready, reason: source.reason ?? null },
          community: { ready: Boolean(store.getProfile(match.projectId)) },
          schedule: scheduleDescription };
      })(),
    });
  }

  async function mutate(url, method, request, projects, response, { json, readBody }) {
    const match = projectMatch(url);
    if (!match) return false;
    if (!store) return unavailable(json, response);
    assertKnownProject(match.projectId, projects);
    const { projectId, rest } = match;
    if (method === 'POST' && rest === 'community-brief') {
      const body = await readBody(request);
      return json(response, 200, await prepareCommunityBrief({
        store, projectId, url: body.url, env, fetchImpl, collectorFactory, now,
      }));
    }
    const draftMatch = rest.match(/^briefs\/([^/]+)\/drafts\/([^/]+)$/);
    if (method === 'POST' && draftMatch) {
      const body = await readBody(request);
      return json(response, 200, store.updateCommunityDraft(
        projectId, decodeURIComponent(draftMatch[1]), decodeURIComponent(draftMatch[2]), body.body, body.title, now(),
      ));
    }
    if (method === 'POST' && rest === 'growth') {
      return json(response, 200, growth.mutate(projectId, await readBody(request), now()));
    }
    if (method === 'PUT' && rest === 'profile') {
      const body = await readBody(request);
      return json(response, 200, store.saveProfile(projectId, body, { now: now() }));
    }
    if (method === 'POST' && rest === 'prompts') {
      const body = await readBody(request);
      return json(response, 201, store.addPrompt(projectId, body.promptText, { category: body.category ?? null, now: now() }));
    }
    const promptMatch = rest.match(/^prompts\/([^/]+)\/remove$/);
    if (method === 'POST' && promptMatch) {
      return json(response, 200, store.removePrompt(projectId, decodeURIComponent(promptMatch[1])));
    }
    if (method === 'POST' && rest === 'checks') {
      const result = await refreshBrandEvidence({ store, projectId, scope: 'api', trigger: 'manual', env, fetchImpl, now });
      return json(response, 200, result.api);
    }
    if (method === 'POST' && rest === 'collect') {
      const result = await refreshBrandEvidence({ store, projectId, scope: 'community', collectorFactory, now });
      return json(response, 200, { ...result.community, website: result.website });
    }
    if (method === 'POST' && rest === 'actions') {
      const body = await readBody(request);
      return json(response, 201, store.createAction(projectId, {
        subjectKind: String(body.subjectKind ?? ''),
        subjectId: String(body.subjectId ?? ''),
        title: body.title ?? null,
        now: now(),
      }));
    }
    const actionMatch = rest.match(/^actions\/([^/]+)$/);
    if (method === 'POST' && actionMatch) {
      const body = await readBody(request);
      return json(response, 200, store.updateActionStatus(projectId, decodeURIComponent(actionMatch[1]), {
        status: String(body.status ?? ''),
        now: now(),
      }));
    }
    const findingMatch = rest.match(/^findings\/([^/]+)$/);
    if (method === 'POST' && findingMatch) {
      const body = await readBody(request);
      return json(response, 200, store.updateFindingStatus(projectId, decodeURIComponent(findingMatch[1]), {
        status: String(body.status ?? ''),
        note: body.note ?? null,
        now: now(),
      }));
    }
    return false;
  }

  return { read, mutate };
}
