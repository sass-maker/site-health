import { coverageTargets, LOCAL_PROPERTY_DAILY_LIMIT, urlInCoverageScope } from './search-index-coverage.mjs';
import { selectSearchConsoleProperty } from './search-console.mjs';

const DAY = 86_400_000;
const HORIZONS = [3, 7];
const resolved = observation => ['indexed', 'not-indexed', 'unknown'].includes(observation?.state);
const inWindow = (observation, round) => resolved(observation) && Date.parse(observation.observedAt) >= Date.parse(round.dueAt) && Date.parse(observation.observedAt) < Date.parse(round.expiresAt);
const timestamp = value => {
  const parsed = typeof value === 'number' ? value : Date.parse(value);
  if (!Number.isFinite(parsed)) throw new Error('Invalid follow-up timestamp');
  return new Date(parsed).toISOString();
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
  if (!record?.property || !selectSearchConsoleProperty(target.surfaceUrl, [{siteUrl:record.property}])) throw new Error('Baseline needs a covering Google property');
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
    property: record.property, sourceRevision: input.sourceRevision, registeredAt, baselineAt, urls, baseline,
    rounds: HORIZONS.map(days => ({ days, dueAt: new Date(Date.parse(baselineAt) + days * DAY).toISOString(),
      expiresAt: new Date(Date.parse(baselineAt) + (days + 2) * DAY).toISOString(), status: 'pending', attempts: [], observations: {} })) });
  return artifact;
}

export function indexFollowupSummary(cohort) {
  const count = rows => Object.values(rows).filter(row => row.state === 'indexed').length;
  return { id: cohort.id, surfaceUrl: cohort.surfaceUrl, baselineAt: cohort.baselineAt, total: cohort.urls.length, baselineIndexed: count(cohort.baseline),
    rounds: cohort.rounds.map(round => ({ days: round.days, dueAt: round.dueAt, status: round.status,
      observedAt: round.finishedAt ?? null, checked: Object.values(round.observations).filter(row => inWindow(row,round)).length,
      outsideWindow: Object.values(round.observations).filter(row => resolved(row) && !inWindow(row,round)).length,
      indexed: count(Object.fromEntries(Object.entries(round.observations).filter(([,row])=>inWindow(row,round)))), regressions: cohort.urls.filter(url => cohort.baseline[url]?.state === 'indexed' && round.observations[url]?.state === 'not-indexed' && inWindow(round.observations[url],round)).length,
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
      if (round.status === 'complete') continue;
      // The last response can be durable even if completion was interrupted.
      if (cohort.urls.every(url => inWindow(round.observations[url],round))) {
        round.status = 'complete';
        round.finishedAt = timestamp(Math.max(...cohort.urls.map(url => Date.parse(round.observations[url].observedAt))));
        const last = round.attempts.at(-1);
        if (last?.state === 'running') { last.state = 'complete'; last.finishedAt = round.finishedAt; }
        delete round.failure; delete round.retryAt; await persist(); continue;
      }
      if (['missed', 'failed', 'scope-changed'].includes(round.status) || now < round.dueAt) continue;
      if (now >= round.expiresAt) { round.status = 'missed'; round.failure = 'Observation window passed; historical indexing cannot be reconstructed'; await persist(); continue; }
      const target = targets.find(row => row.projectId === cohort.projectId && !row.exemption && row.surfaceUrl === cohort.surfaceUrl);
      const record = artifact.records.find(row => row.projectId === cohort.projectId && row.surfaceUrl === cohort.surfaceUrl);
      if (!target || cohort.urls.some(url => !urlInCoverageScope(url, target.surfaceUrl))) {
        round.status = 'scope-changed'; round.failure = 'Current public surface/property no longer matches this baseline'; await persist(); continue;
      }
      const property = record?.property ?? cohort.property;
      if (!record || !property || !selectSearchConsoleProperty(target.surfaceUrl, [{siteUrl:property}])) {
        round.status = 'retrying'; round.failure = 'Covering Google property evidence unavailable; baseline retained'; await persist(); continue;
      }
      if (blocked || requests >= maxInspections || (round.retryAt && now < round.retryAt)) continue;
      if (round.attempts.filter(attempt => attempt.state === 'failed').length >= 3 || round.attempts.length >= 100) { round.status = 'failed'; await persist(); continue; }
      const interrupted = round.attempts.at(-1);
      if (interrupted?.state === 'running') { interrupted.state = 'interrupted'; interrupted.finishedAt = now; }
      const attempt = { startedAt: now, requests: 0, state: 'running' };
      round.attempts.push(attempt);
      round.status = 'running';
      await persist();
      let quotaLimited = false;
      let providerFailed = false;
      for (const url of cohort.urls.filter(url => !inWindow(round.observations[url],round))) {
        if (requests >= maxInspections || blocked || signal?.aborted) break;
        const reservedAt = timestamp(clock());
        if (reservedAt >= round.expiresAt) break;
        const budget = (artifact.dailyBudget ??= {})[quotaDay(reservedAt)] ??= { total: 0, properties: {} };
        if ((budget.properties[property] ?? 0) >= LOCAL_PROPERTY_DAILY_LIMIT) { quotaLimited = true; break; }
        budget.total++; budget.properties[property] = (budget.properties[property] ?? 0) + 1;
        requests++; attempt.requests++;
        await persist();
        let result;
        try { result = await inspect({ inspectionUrl: url, siteUrl: property }); }
        catch (error) { result = { inspectedUrl: url, state: 'unavailable', failureReason: error?.code === 'GOOGLE_AUTH_UNAVAILABLE' ? 'Google authorization unavailable' : 'Google URL Inspection unavailable' }; }
        const observation = { ...result, inspectedUrl: url, observedAt: timestamp(clock()) };
        round.observations[url] = observation;
        const retained = record.inspections[url];
        record.inspections[url] = !resolved(observation) && retained ? { ...retained, lastFailure: observation } : observation;
        if (!resolved(observation)) {
          providerFailed = !signal?.aborted;
          round.failure = observation.failureReason ?? 'Google inspection returned no usable verdict';
          blocked = /401|403|429|quota|credential|permission|auth/i.test(round.failure);
          await persist();
          break;
        }
        await persist();
      }
      const finishedAt = timestamp(clock());
      const complete = cohort.urls.every(url => inWindow(round.observations[url],round));
      attempt.finishedAt = finishedAt;
      attempt.state = complete ? 'complete' : providerFailed ? 'failed' : signal?.aborted ? 'interrupted' : 'partial';
      if (quotaLimited && attempt.requests === 0) round.attempts.pop();
      round.status = complete ? 'complete' : round.attempts.filter(attempt => attempt.state === 'failed').length >= 3 ? 'failed' : providerFailed ? 'retrying' : signal?.aborted ? 'interrupted' : 'pending';
      if (complete) { round.finishedAt = finishedAt; delete round.failure; delete round.retryAt; }
      else if (finishedAt >= round.expiresAt) { round.status = 'missed'; round.failure = 'Observation window ended; outside-window responses are retained but excluded'; delete round.retryAt; }
      else if (providerFailed || quotaLimited) round.retryAt = new Date(Date.parse(finishedAt) + DAY / 24).toISOString();
      else delete round.retryAt;
      await persist();
    }
  }
  return { artifact, requests };
}
