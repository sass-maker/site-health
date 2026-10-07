function day(value) {
  return new Date(value).toISOString().slice(0, 10);
}

function shift(value, days) {
  return day(new Date(`${value}T00:00:00Z`).getTime() + days * 86_400_000);
}

function providerDay(value) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date(value));
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function sumWindow(observation, start, end) {
  if (!Array.isArray(observation.dailySeries)
    || day(observation.period.start) > start || day(observation.period.end) < end) return null;
  const rows = observation.dailySeries.filter((row) => row.date >= start && row.date <= end);
  if (rows.some((row) => !Number.isFinite(row.clicks) || !Number.isFinite(row.impressions))) return null;
  // Search Console omits zero-activity dates. These are zeros only inside a
  // successfully collected, complete date window, never outside its coverage.
  const clicks = rows.reduce((total, row) => total + row.clicks, 0);
  const impressions = rows.reduce((total, row) => total + row.impressions, 0);
  return { start, end, clicks, impressions, ctrPercent: impressions ? clicks / impressions * 100 : null };
}

export function reviewDiscoveryExperiment(experiment, observation, now = new Date()) {
  const base = {
    schema: 'fleet.discovery-experiment-review.v1',
    experimentId: experiment.id,
    projectId: experiment.projectId,
    reviewedAt: new Date(now).toISOString(),
    hypothesis: experiment.hypothesis,
    reportingTimezone: 'America/Los_Angeles',
    limitations: [
      'Project-scoped Google search activity, not unique external people, retention or revenue.',
      'A before/after observation cannot isolate this edit from previous fixes, recrawls or other changes.',
      'Query/page rows are a bounded subset; aggregate clicks do not establish relevant non-brand demand.',
    ],
  };
  if (experiment.publication?.status !== 'live-verified' || !experiment.publication.publishedAt) {
    return { ...base, status: 'awaiting-publication', reason: 'Local edits cannot start a traffic experiment.' };
  }
  if (!observation || observation.provider !== 'google-search-console'
    || observation.projectId !== experiment.projectId || observation.scope !== experiment.scope) {
    return { ...base, status: 'unavailable', reason: 'Missing or mismatched provider/project/page-filter evidence.' };
  }
  // Search Console daily keys are Pacific dates. Ledger period ISO strings
  // carry those request-date labels; publication timestamps need conversion.
  const firstDay = shift(providerDay(experiment.publication.publishedAt), 1);
  const completeThrough = shift(providerDay(now), -experiment.reportingLagDays);
  const end = [shift(firstDay, 6), day(observation.period.end), completeThrough].sort()[0];
  if (end < firstDay) return { ...base, status: 'awaiting-final-data', firstFullTreatmentDay: firstDay };
  // Match weekdays two weeks back so the baseline never includes the partial
  // deployment day. The immediately preceding week ends on that day.
  const before = sumWindow(observation, shift(firstDay, -14), shift(end, -14));
  const after = sumWindow(observation, firstDay, end);
  if (!before || !after) {
    return { ...base, status: 'unavailable', reason: 'Complete matched daily windows are not covered by the provider record.' };
  }
  const days = Math.round((new Date(end) - new Date(firstDay)) / 86_400_000) + 1;
  return {
    ...base,
    status: 'observed',
    observationId: observation.id,
    observedAt: observation.observedAt,
    scope: observation.scope,
    days,
    fullWeek: days === 7,
    before,
    after,
    clickDelta: after.clicks - before.clicks,
    impressionDelta: after.impressions - before.impressions,
    decision: days < 7 ? 'Partial checkpoint; wait for seven complete treatment days.'
      : 'Inspect relevant query/page pairs and recrawl evidence before expanding or attributing an effect.',
    indexInspection: observation.indexInspection ?? null,
  };
}

// URL Inspection describes Google's recorded version, not a live fetch. A
// missing crawl timestamp cannot establish that this release has been seen.
export function reviewDiscoveryRecrawl(experiment, inspections = []) {
  const publishedAt = Date.parse(experiment.publication?.publishedAt);
  if (experiment.publication?.status !== 'live-verified' || !Number.isFinite(publishedAt)) {
    return { status: 'awaiting-publication', routes: [] };
  }
  const targets = experiment.liveChecks?.map((target) => target.url) ?? [];
  if (!targets.length) return { status: 'unavailable', reason: 'No changed URLs configured.', routes: [] };
  const routes = targets.map((url) => {
    const inspection = inspections.find((item) => item.inspectedUrl === url);
    const crawl = Date.parse(inspection?.lastCrawlTime);
    return {
      url,
      indexState: inspection?.state ?? 'unavailable',
      coverageState: inspection?.coverageState ?? null,
      lastCrawlTime: inspection?.lastCrawlTime ?? null,
      recrawledSincePublication: inspection && inspection.state !== 'unavailable' && Number.isFinite(crawl)
        ? crawl >= publishedAt : null,
      userCanonical: inspection?.userCanonical ?? null,
      googleCanonical: inspection?.googleCanonical ?? null,
    };
  });
  return {
    status: routes.every((route) => route.recrawledSincePublication === true)
      ? 'recrawl-recorded' : 'awaiting-recrawl-evidence',
    routes,
    limitation: 'Recorded crawl dates do not prove Google rendered the new content or that it will rank. Missing evidence cannot reject the hypothesis.',
  };
}
