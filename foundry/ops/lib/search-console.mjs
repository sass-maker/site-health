const SEARCH_CONSOLE_API = 'https://www.googleapis.com/webmasters/v3';

function isoDay(date) {
  return date.toISOString().slice(0, 10);
}

function shiftedDay(day, amount) {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return isoDay(date);
}

function propertyDomain(siteUrl) {
  return siteUrl.startsWith('sc-domain:') ? siteUrl.slice('sc-domain:'.length) : null;
}

function propertyHost(siteUrl) {
  try {
    return new URL(siteUrl).hostname;
  } catch {
    return null;
  }
}

export function selectSearchConsoleProperty(domain, properties) {
  const accessible = properties.filter((property) =>
    property?.siteUrl && property.permissionLevel !== 'siteUnverifiedUser');
  const prefix = accessible.find((property) => {
    const host = propertyHost(property.siteUrl);
    return host === domain && property.siteUrl.startsWith('https://');
  });
  if (prefix) return { ...prefix, pageFilter: null };

  const domains = accessible
    .map((property) => ({ property, domain: propertyDomain(property.siteUrl) }))
    .filter(({ domain: candidate }) =>
      candidate && (candidate === domain || domain.endsWith(`.${candidate}`)))
    .sort((left, right) => right.domain.length - left.domain.length);
  if (domains.length === 0) return null;
  return {
    ...domains[0].property,
    pageFilter: `https://${domain}/`,
  };
}

function requestBody({ startDate, endDate, pageFilter, dimensions = [], rowLimit = 1 }) {
  return {
    startDate,
    endDate,
    dataState: 'final',
    rowLimit,
    ...(dimensions.length > 0 ? { dimensions } : {}),
    ...(pageFilter ? {
      dimensionFilterGroups: [{
        filters: [{
          dimension: 'page',
          operator: 'contains',
          expression: pageFilter,
        }],
      }],
    } : {}),
  };
}

async function googleRequest(path, { accessToken, quotaProject, fetchImpl, body }) {
  const response = await fetchImpl(`${SEARCH_CONSOLE_API}${path}`, {
    method: body ? 'POST' : 'GET',
    headers: {
      authorization: `Bearer ${accessToken}`,
      'x-goog-user-project': quotaProject,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(`Search Console request failed (${response.status}): ${payload?.error?.message ?? 'unknown error'}`);
  }
  return payload;
}

export async function collectSearchConsoleOutcomes({
  projects,
  accessToken,
  quotaProject,
  fetchImpl = fetch,
  now = new Date(),
  reportingWindowDays = 28,
  reportingLagDays = 3,
  searchTermLimit = 25,
}) {
  if (!accessToken) throw new Error('Search Console access token is required');
  if (!quotaProject) throw new Error('Search Console quota project is required');
  if (!Number.isInteger(searchTermLimit) || searchTermLimit < 1 || searchTermLimit > 50) {
    throw new Error('Search Console search term limit must be 1-50');
  }
  const endDate = shiftedDay(isoDay(now), -reportingLagDays);
  const startDate = shiftedDay(endDate, -(reportingWindowDays - 1));
  const observedAt = now.toISOString();
  const runId = observedAt.replace(/[^0-9]/g, '');
  const siteList = await googleRequest('/sites', {
    accessToken,
    quotaProject,
    fetchImpl,
  });
  const properties = siteList.siteEntry ?? [];
  const observations = [];
  const unavailable = [];

  for (const project of projects) {
    const domain = project.domains?.[0];
    const selected = domain ? selectSearchConsoleProperty(domain, properties) : null;
    if (!selected) {
      unavailable.push({ projectId: project.id, domain: domain ?? null, reason: 'property-unavailable' });
      continue;
    }
    const result = await googleRequest(
      `/sites/${encodeURIComponent(selected.siteUrl)}/searchAnalytics/query`,
      {
        accessToken,
        quotaProject,
        fetchImpl,
        body: requestBody({ startDate, endDate, pageFilter: selected.pageFilter }),
      },
    );
    const row = result.rows?.[0] ?? null;
    const termResult = await googleRequest(
      `/sites/${encodeURIComponent(selected.siteUrl)}/searchAnalytics/query`,
      {
        accessToken,
        quotaProject,
        fetchImpl,
        body: requestBody({
          startDate,
          endDate,
          pageFilter: selected.pageFilter,
          dimensions: ['query', 'page'],
          rowLimit: searchTermLimit,
        }),
      },
    );
    const searchTerms = (termResult.rows ?? []).flatMap((term) => {
      const query = String(term.keys?.[0] ?? '').replace(/\s+/g, ' ').trim();
      let landingPage = null;
      try {
        const url = new URL(String(term.keys?.[1] ?? ''));
        if (!['http:', 'https:'].includes(url.protocol)) return [];
        landingPage = url.href;
      } catch {
        return [];
      }
      if (!query || !Number.isFinite(Number(term.position)) || Number(term.position) <= 0) {
        return [];
      }
      return [{
        query,
        landingPage,
        impressions: Number(term.impressions ?? 0),
        clicks: Number(term.clicks ?? 0),
        ctr: Number(term.ctr ?? 0) * 100,
        position: Number(term.position),
      }];
    });
    const metrics = [
      { label: 'Search impressions', value: Number(row?.impressions ?? 0) },
      { label: 'Search clicks', value: Number(row?.clicks ?? 0) },
      { label: 'Search CTR', value: Number(row?.ctr ?? 0) * 100 },
      ...(Number(row?.impressions) > 0 && Number(row?.position) > 0
        ? [{ label: 'Search average position', value: Number(row.position) }]
        : []),
    ];
    observations.push({
      id: `search-${project.id}-${endDate}-${runId}`,
      projectId: project.id,
      family: 'search',
      provider: 'google-search-console',
      scope: selected.pageFilter
        ? `${selected.siteUrl} · page:${selected.pageFilter}`
        : selected.siteUrl,
      observedAt,
      period: {
        start: `${startDate}T00:00:00.000Z`,
        end: `${endDate}T23:59:59.999Z`,
      },
      metrics,
      searchTerms,
    });
  }

  return {
    bundle: {
      schema: 'fleet.visibility-outcome-bundle.v1',
      observations,
    },
    unavailable,
    propertyCount: properties.length,
    period: { start: startDate, end: endDate },
  };
}
