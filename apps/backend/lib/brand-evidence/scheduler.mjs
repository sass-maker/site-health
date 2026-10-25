import { collectCommunityEvidence, collectWebsiteEvidence } from './collection.mjs';
import { runApiModelCheck, dueProjects } from './runner.mjs';

const refreshes = new WeakMap();

// One refresh per project across manual and scheduled entry points. A promise
// is shared by concurrent callers so double-clicks never duplicate evidence.
export function refreshBrandEvidence({ store, projectId, scope = 'all', ...options }) {
  let active = refreshes.get(store);
  if (!active) { active = new Map(); refreshes.set(store, active); }
  const key = projectId;
  const existing = active.get(key);
  if (existing) return existing.scope === scope ? existing.work
    : existing.work.then(() => refreshBrandEvidence({ store, projectId, scope, ...options }));
  const work = (async () => {
    const result = { projectId };
    if (scope !== 'community') result.api = await runApiModelCheck({ store, projectId, ...options });
    if (scope !== 'api') {
      result.community = await collectCommunityEvidence({ store, projectId, ...options });
      result.website = await collectWebsiteEvidence({ store, projectId, ...options });
    }
    return result;
  })().finally(() => active.delete(key));
  active.set(key, { scope, work });
  return work;
}

export function dueCommunityProjects(store, { now = new Date().toISOString() } = {}) {
  return store.listProfiles().filter((profile) => {
    if (!profile.schedule) return false;
    if (profile.schedule === 'weekly' && new Date(now).getUTCDay() !== 1) return false;
    const last = store.listCollections(profile.projectId).find((run) => run.source !== 'website');
    const elapsed = last ? Date.parse(now) - Date.parse(last.startedAt) : Infinity;
    return elapsed >= (profile.schedule === 'daily' ? 23 * 3_600_000 : 6 * 86_400_000);
  }).map((profile) => profile.projectId);
}

export function startBrandEvidenceScheduler({
  store, projectsProvider, intervalMs = 60_000, now = () => new Date().toISOString(), ...options
}) {
  let stopped = false;
  let pending = null;
  const attempted = new Map();
  async function runTick() {
    {
      const current = new Set(projectsProvider().filter((p) =>
        ['primary', 'active'].includes(p.lifecycle?.status ?? p.status)).map((p) => p.id));
      const apiDue = new Set(dueProjects(store, { now: now() }));
      const communityDue = new Set(dueCommunityProjects(store, { now: now() }));
      for (const projectId of new Set([...apiDue, ...communityDue])) {
        if (stopped || !current.has(projectId)) continue;
        // Missing AI credentials are skipped, with a bounded hourly retry.
        if (Date.parse(now()) - (attempted.get(projectId) ?? 0) < 3_600_000) continue;
        attempted.set(projectId, Date.parse(now()));
        const scope = apiDue.has(projectId) && communityDue.has(projectId) ? 'all'
          : apiDue.has(projectId) ? 'api' : 'community';
        try { await refreshBrandEvidence({ store, projectId, scope, trigger: 'scheduled', now, ...options }); }
        catch { /* Source/check failures are retained by their runners. */ }
      }
    }
  }
  function tick() {
    if (stopped) return Promise.resolve();
    if (!pending) pending = runTick().finally(() => { pending = null; });
    return pending;
  }
  const timer = setInterval(() => { void tick(); }, intervalMs);
  timer.unref?.();
  void tick();
  return { tick, async stop() { stopped = true; clearInterval(timer); await pending; }, get running() { return Boolean(pending); } };
}
