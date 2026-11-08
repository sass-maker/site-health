import { coverageTargets, LOCAL_PROPERTY_DAILY_LIMIT, urlInCoverageScope } from './search-index-coverage.mjs';
import { selectSearchConsoleProperty } from './search-console.mjs';

const DAY = 86_400_000;
const HORIZONS = [3, 7];
const resolved = observation => ['indexed', 'not-indexed', 'unknown'].includes(observation?.state);
const timestamp = value => {
  if (!Number.isFinite(Date.parse(value))) throw new Error('Invalid follow-up timestamp');
  return new Date(value).toISOString();
};
const quotaDay = value => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(new Date(value));

export function registerIndexFollowup(previous, input, { catalog, now = new Date().toISOString() } = {}) {
  const registeredAt = timestamp(now);
  if (!previous?.records || !/^[a-z0-9][a-z0-9-]{0,99}$/.test(input.id ?? '') ||
      !/^[a-f0-9]{40}$/.test(input.sourceRevision ?? '') || !Array.isArray(input.urls) ||
      input.urls.length < 1 || input.urls.length > 50 || new Set(input.urls).size !== input.urls.length) {
    throw new Error('A follow-up needs an id, source revision and 1-50 unique baseline URLs');
  }
  const target = coverageTargets(catalog).find(row => row.projectId === input.projectId && !row.exemption);
  if (!target || input.urls.some(url => !urlInCoverageScope(url, target.surfaceUrl))) throw new Error('Follow-up must stay on its current public surface');
  const artifact = structuredClone(previous);
  artifact.followups ??= [];
  const existing = artifact.followups.find(row => row.id === input.id);
  const urls = [...input.urls].sort();
  if (existing) {
    if (existing.projectId !== input.projectId || existing.sourceRevision !== input.sourceRevision ||
        existing.surfaceUrl !== target.surfaceUrl || JSON.stringify(existing.urls) !== JSON.stringify(urls)) {
      throw new Error('Follow-up id already belongs to another baseline');
    }
    return artifact;
  }
  if (artifact.followups.length >= 50) throw new Error('Follow-up register is full; retain and review existing history');
  const record = artifact.records.find(row => row.projectId === input.projectId && row.surfaceUrl === target.surfaceUrl);
  const inventory = new Set(record?.inventory?.urls ?? []);
  const baseline = Object.fromEntries(urls.map(url => {
    const observation = record?.inspections?.[url];
    if (!inventory.has(url) || !resolved(observation) || !Number.isFinite(Date.parse(observation.observedAt)) ||
        Date.parse(observation.observedAt) > Date.parse(registeredAt) || Date.parse(registeredAt) - Date.parse(observation.observedAt) > 7 * DAY) {
      throw new Error('Every baseline URL needs a recent retained Google inspection and sitemap membership');
    }
    return [url, structuredClone(observation)];
  }));
  const baselineAt = Object.values(baseline).map(row => row.observedAt).sort().at(-1);
  artifact.followups.push({ id: input.id, projectId: input.projectId, surfaceUrl: target.surfaceUrl,
    sourceRevision: input.sourceRevision, registeredAt, baselineAt, urls, baseline,
    rounds: HORIZONS.map(days => ({ days, dueAt: new Date(Date.parse(baselineAt) + days * DAY).toISOString(),
      expiresAt: new Date(Date.parse(baselineAt) + (days + 2) * DAY).toISOString(), status: 'pending', attempts: [], observations: {} })) });
  return artifact;
}

export function indexFollowupSummary(cohort) {
  const count = rows => Object.values(rows).filter(row => row.state === 'indexed').length;
  return { id: cohort.id, baselineAt: cohort.baselineAt, total: cohort.urls.length, baselineIndexed: count(cohort.baseline),
    rounds: cohort.rounds.map(round => ({ days: round.days, dueAt: round.dueAt, status: round.status,
      observedAt: round.finishedAt ?? null, checked: Object.values(round.observations).filter(resolved).length,
      indexed: count(round.observations), regressions: cohort.urls.filter(url => cohort.baseline[url]?.state === 'indexed' && round.observations[url]?.state === 'not-indexed').length,
      failure: round.failure ?? null })) };
}

// The caller owns the existing coverage checkpoint lock. Reservations and results
// are checkpointed before/after each call; original baselines and rounds survive retries.
export async function collectIndexFollowups({ previous, catalog, inspect, maxInspections = 100,
  clock = () => new Date().toISOString(), onProgress = () => {}, signal } = {}) {
  if (!Number.isInteger(maxInspections) || maxInspections < 0 || maxInspections > 200) throw new Error('Follow-up inspection budget must be 0-200');
  const artifact = structuredClone(previous);
  const targets = coverageTargets(catalog);
  let requests = 0;
  let blocked = false;
  const persist = async () => { artifact.updatedAt = timestamp(clock()); await onProgress(artifact); };
  for (const cohort of artifact.followups ?? []) {
    if (signal?.aborted) break;
    for (const round of cohort.rounds) {
      if (signal?.aborted) break;
      const now = timestamp(clock());
      if (['complete', 'missed', 'failed', 'scope-changed'].includes(round.status) || now < round.dueAt) continue;
      if (now >= round.expiresAt) { round.status = 'missed'; round.failure = 'Observation window passed; historical indexing cannot be reconstructed'; await persist(); continue; }
      const target = targets.find(row => row.projectId === cohort.projectId && !row.exemption && row.surfaceUrl === cohort.surfaceUrl);
      const record = artifact.records.find(row => row.projectId === cohort.projectId && row.surfaceUrl === cohort.surfaceUrl);
      if (!target || cohort.urls.some(url => !urlInCoverageScope(url, target.surfaceUrl)) ||
          !record?.property || !selectSearchConsoleProperty(target.surfaceUrl, [{ siteUrl: record.property }])) {
        round.status = 'scope-changed'; round.failure = 'Current public surface/property no longer matches this baseline'; await persist(); continue;
      }
      if (blocked || requests >= maxInspections || (round.retryAt && now < round.retryAt)) continue;
      if (round.attempts.length >= 3) { round.status = 'failed'; await persist(); continue; }
      const attempt = { startedAt: now, requests: 0, state: 'running' };
      round.attempts.push(attempt);
      round.status = 'running';
      await persist();
      let quotaLimited = false;
      for (const url of cohort.urls.filter(url => !resolved(round.observations[url]))) {
        if (requests >= maxInspections || blocked || signal?.aborted) break;
        const reservedAt = timestamp(clock());
        if (reservedAt >= round.expiresAt) break;
        const budget = (artifact.dailyBudget ??= {})[quotaDay(reservedAt)] ??= { total: 0, properties: {} };
        if ((budget.properties[record.property] ?? 0) >= LOCAL_PROPERTY_DAILY_LIMIT) { quotaLimited = true; break; }
        budget.total++; budget.properties[record.property] = (budget.properties[record.property] ?? 0) + 1;
        requests++; attempt.requests++;
        await persist();
        let result;
        try { result = await inspect({ inspectionUrl: url, siteUrl: record.property }); }
        catch { result = { inspectedUrl: url, state: 'unavailable', failureReason: 'Google URL Inspection unavailable' }; }
        const observation = { ...result, inspectedUrl: url, observedAt: timestamp(clock()) };
        round.observations[url] = observation;
        const retained = record.inspections[url];
        record.inspections[url] = !resolved(observation) && retained ? { ...retained, lastFailure: observation } : observation;
        if (!resolved(observation)) {
          round.failure = observation.failureReason ?? 'Google inspection returned no usable verdict';
          blocked = /401|403|429|quota|credential|permission|auth/i.test(round.failure);
          await persist();
          break;
        }
        await persist();
      }
      const finishedAt = timestamp(clock());
      const complete = cohort.urls.every(url => resolved(round.observations[url]));
      attempt.finishedAt = finishedAt;
      attempt.state = complete ? 'complete' : 'incomplete';
      if (quotaLimited && attempt.requests === 0) round.attempts.pop();
      round.status = complete ? 'complete' : round.attempts.length >= 3 ? 'failed' : 'retrying';
      if (complete) { round.finishedAt = finishedAt; delete round.failure; delete round.retryAt; }
      else round.retryAt = new Date(Date.parse(finishedAt) + (quotaLimited ? 1 / 24 : 1) * DAY).toISOString();
      await persist();
    }
  }
  return { artifact, requests };
}
