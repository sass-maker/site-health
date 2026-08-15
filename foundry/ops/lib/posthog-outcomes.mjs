const POSTHOG_API = 'https://us.i.posthog.com';

export const DEFAULT_POSTHOG_PROJECT_ID = 110635;

const EVENT_TAXONOMY = ['page_view', 'signup', 'activated', 'core_action', 'returned'];

/**
 * Collect read-only PostHog Insights aggregates grouped by project_id property.
 *
 * The collector uses a PostHog personal API key (POSTHOG_PERSONAL_API_KEY) with
 * read-only access to the Insights API. It never writes events, never reads
 * raw event payloads, and never stores PII — only aggregate counts per
 * project_id are emitted as visibility outcome observations.
 *
 * @param {object} options
 * @param {Array} options.projects - Canonical Fleet projects with PostHog instrumentation.
 * @param {string} options.personalApiKey - PostHog personal API key (read-only).
 * @param {number} [options.projectId] - PostHog project ID (numeric).
 * @param {Function} [options.fetchImpl] - Fetch implementation (for testing).
 * @param {Date} [options.now] - Current timestamp.
 * @param {number} [options.reportingWindowDays] - Reporting window (default 7).
 */
export async function collectPosthogOutcomes({
  projects,
  personalApiKey,
  projectId = DEFAULT_POSTHOG_PROJECT_ID,
  fetchImpl = fetch,
  now = new Date(),
  reportingWindowDays = 7,
}) {
  if (!personalApiKey) throw new Error('PostHog personal API key is required');
  if (!Number.isInteger(reportingWindowDays) || reportingWindowDays < 1 || reportingWindowDays > 90) {
    throw new Error('PostHog reporting window must be 1-90 days');
  }

  const observedAt = now.toISOString();
  const runId = observedAt.replace(/[^0-9]/g, '');
  const endDate = new Date(now);
  endDate.setUTCDate(endDate.getUTCDate() - 1);
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - (reportingWindowDays - 1));

  const period = {
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };

  const projectIds = (projects ?? [])
    .map((project) => project.id)
    .filter(Boolean);

  const observations = [];
  const unavailable = [];

  for (const project of projects ?? []) {
    if (!project.id) continue;
    const projectIdProperty = project.posthogProjectId ?? project.id;

    try {
      const metrics = await queryProjectMetrics({
        fetchImpl,
        personalApiKey,
        posthogProjectId: projectId,
        projectIdProperty,
        startDate,
        endDate,
      });

      if (metrics.length === 0) {
        unavailable.push({ projectId: project.id, reason: 'no-events' });
        continue;
      }

      const scope = project.domains?.[0] ?? project.id;
      observations.push({
        id: `user-metrics-posthog-${project.id}-${runId}`,
        projectId: project.id,
        family: 'user-metrics',
        provider: 'posthog-insights',
        scope,
        observedAt,
        period,
        metrics,
      });
    } catch (error) {
      unavailable.push({
        projectId: project.id,
        reason: 'api-error',
        detail: error?.message ?? String(error),
      });
    }
  }

  return {
    bundle: {
      schema: 'fleet.visibility-outcome-bundle.v1',
      observations,
    },
    projectCount: projects?.length ?? 0,
    observationCount: observations.length,
    unavailable,
    period,
  };
}

async function queryProjectMetrics({
  fetchImpl,
  personalApiKey,
  posthogProjectId,
  projectIdProperty,
  startDate,
  endDate,
}) {
  const dateFrom = startDate.toISOString().slice(0, 10);
  const dateTo = endDate.toISOString().slice(0, 10);
  const propertyFilter = JSON.stringify([
    {
      key: 'project_id',
      operator: 'exact',
      value: [projectIdProperty],
      type: 'event',
    },
  ]);

  const metrics = [];

  // Visitors: unique users who triggered page_view
  const visitors = await queryInsights({
    fetchImpl,
    personalApiKey,
    posthogProjectId,
    dateFrom,
    dateTo,
    event: 'page_view',
    propertyFilter,
    aggregation: 'unique_user_count',
  });
  if (visitors > 0) metrics.push({ label: 'Visitors', value: visitors });

  // Identified users: unique users across all 5 events with identified distinct_id
  const identifiedUsers = await queryInsights({
    fetchImpl,
    personalApiKey,
    posthogProjectId,
    dateFrom,
    dateTo,
    event: null,
    propertyFilter,
    aggregation: 'unique_user_count',
  });
  if (identifiedUsers > 0) metrics.push({ label: 'Identified users', value: identifiedUsers });

  // Signup count
  const signups = await queryInsights({
    fetchImpl,
    personalApiKey,
    posthogProjectId,
    dateFrom,
    dateTo,
    event: 'signup',
    propertyFilter,
    aggregation: 'total_event_count',
  });
  if (signups > 0) metrics.push({ label: 'Accounts', value: signups });

  // Activation rate: activated / signup (as percent)
  const activated = await queryInsights({
    fetchImpl,
    personalApiKey,
    posthogProjectId,
    dateFrom,
    dateTo,
    event: 'activated',
    propertyFilter,
    aggregation: 'unique_user_count',
  });
  if (signups > 0 && activated > 0) {
    metrics.push({
      label: 'Activation rate',
      value: Number(((activated / signups) * 100).toFixed(1)),
    });
  }

  // Core actions count
  const coreActions = await queryInsights({
    fetchImpl,
    personalApiKey,
    posthogProjectId,
    dateFrom,
    dateTo,
    event: 'core_action',
    propertyFilter,
    aggregation: 'total_event_count',
  });
  if (coreActions > 0) metrics.push({ label: 'Core actions', value: coreActions });

  // D7 retention: users who returned after 7+ days
  const returned = await queryInsights({
    fetchImpl,
    personalApiKey,
    posthogProjectId,
    dateFrom,
    dateTo,
    event: 'returned',
    propertyFilter,
    aggregation: 'unique_user_count',
  });
  if (signups > 0 && returned > 0) {
    metrics.push({
      label: 'D7 retention',
      value: Number(((returned / signups) * 100).toFixed(1)),
    });
  }

  return metrics;
}

async function queryInsights({
  fetchImpl,
  personalApiKey,
  posthogProjectId,
  dateFrom,
  dateTo,
  event,
  propertyFilter,
  aggregation,
}) {
  const events = event ? [event] : EVENT_TAXONOMY;
  const body = {
    events: events.map((eventName) => ({
      id: eventName,
      math: aggregation,
      name: eventName,
      properties: [],
    })),
    date_from: dateFrom,
    date_to: dateTo,
    properties: JSON.parse(propertyFilter),
    interval: 'day',
  };

  const response = await fetchImpl(`${POSTHOG_API}/api/projects/${posthogProjectId}/insights/trend`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${personalApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error('PostHog rate limit exceeded');
    throw new Error(`PostHog API returned ${response.status}`);
  }

  const data = await response.json();
  const results = data?.results ?? [];
  let total = 0;
  for (const result of results) {
    const values = result?.data ?? [];
    for (const value of values) {
      if (typeof value === 'number') total += value;
    }
  }
  return total;
}
