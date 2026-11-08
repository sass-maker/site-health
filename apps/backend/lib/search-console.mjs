import { createHash } from 'node:crypto';
import { searchConsoleTarget, searchObservationDomain, searchObservationSurface } from './visibility-projects.mjs';

const SEARCH_CONSOLE_API = 'https://www.googleapis.com/webmasters/v3';
const SEARCH_CONSOLE_INSPECTION_API = 'https://searchconsole.googleapis.com/v1';
const SEARCH_CONSOLE_TIMEOUT_MS = 20_000;
const SEARCH_CONSOLE_INSPECTION_CONCURRENCY = 4;
const SEARCH_CONSOLE_QUERY_POOL_LIMIT = 5000;

function isoDay(date) {
  return date.toISOString().slice(0, 10);
}

function shiftedDay(day, amount) {
  const date = new Date(`${day}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  return isoDay(date);
}

async function mapWithConcurrency(values, limit, mapper) {
  const results = new Array(values.length);
  let nextIndex = 0;
  async function worker() {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, worker));
  return results;
}

function createConcurrencyGate(limit) {
  let active = 0;
  const queue = [];
  const advance = () => {
    if (active >= limit || queue.length === 0) return;
    active += 1;
    const { task, resolve, reject } = queue.shift();
    Promise.resolve()
      .then(task)
      .then(resolve, reject)
      .finally(() => {
        active -= 1;
        advance();
      });
  };
  return (task) => new Promise((resolve, reject) => {
    queue.push({ task, resolve, reject });
    advance();
  });
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

export function selectSearchConsoleProperty(surface, properties) {
  const explicitUrl = String(surface).startsWith('https://');
  const targetUrl = new URL(explicitUrl ? surface : `https://${surface}/`);
  const domain = targetUrl.hostname;
  const accessible = properties.filter((property) =>
    property?.siteUrl && property.permissionLevel !== 'siteUnverifiedUser');
  const prefixes = accessible.filter((property) => {
    const host = propertyHost(property.siteUrl);
    if (host !== domain || !property.siteUrl.startsWith('https://')) return false;
    const prefix = new URL(property.siteUrl);
    const path = prefix.pathname.replace(/\/+$/, '');
    return prefix.origin === targetUrl.origin && !prefix.search && !prefix.hash &&
      (targetUrl.pathname === path || targetUrl.pathname.startsWith(`${path}/`));
  });
  if (explicitUrl) prefixes.sort((left, right) => right.siteUrl.length - left.siteUrl.length);
  const prefix = prefixes[0];
  const filter = explicitUrl ? { pageFilter: targetUrl.href, pageFilterOperator: 'includingRegex' } : null;
  if (prefix) return { ...prefix, ...(filter ?? { pageFilter: null }) };

  const domains = accessible
    .map((property) => ({ property, domain: propertyDomain(property.siteUrl) }))
    .filter(({ domain: candidate }) =>
      candidate && (candidate === domain || domain.endsWith(`.${candidate}`)))
    .sort((left, right) => right.domain.length - left.domain.length);
  if (domains.length === 0) return null;
  return {
    ...domains[0].property,
    ...(filter ?? { pageFilter: `https://${domain}/` }),
  };
}

export function searchConsoleProviderUrl(siteUrl) {
  const property = String(siteUrl ?? '').trim();
  if (!property) return null;
  return `https://search.google.com/search-console/performance/search-analytics?resource_id=${encodeURIComponent(property)}`;
}

export function searchConsoleSitemapTargets(projects, rootDomains = [], sitemapOverrides = {}) {
  const targets = [];
  const seen = new Set();
  for (const item of [
    ...projects.map((project) => ({ id: project.id, domain: searchConsoleTarget(project)?.domain })),
    ...rootDomains.map((domain) => ({ id: `root:${domain}`, domain })),
  ]) {
    const domain = String(item.domain ?? '').trim().toLowerCase();
    if (!domain || seen.has(domain)) continue;
    const sitemapUrl = safeHttpsUrl(sitemapOverrides[domain] ?? `https://${domain}/sitemap.xml`);
    if (!sitemapUrl) throw new Error(`Invalid Search Console sitemap domain: ${domain}`);
    if (new URL(sitemapUrl).hostname !== domain) {
      throw new Error(`Search Console sitemap must stay on its canonical domain: ${domain}`);
    }
    seen.add(domain);
    targets.push({ id: item.id, domain, sitemapUrl });
  }
  return targets;
}

function sitemapBelongsToProperty(sitemapUrl, siteUrl) {
  const url = safeHttpsUrl(sitemapUrl);
  if (!url) return false;
  const host = new URL(url).hostname;
  const domain = propertyDomain(siteUrl);
  if (domain) return host === domain || host.endsWith(`.${domain}`);
  try {
    return url.startsWith(new URL(siteUrl).href);
  } catch {
    return false;
  }
}

export async function reconcileSearchConsoleSitemaps({
  targets,
  accessToken,
  quotaProject,
  fetchImpl = fetch,
  apply = false,
  removeUnlisted = false,
}) {
  if (typeof removeUnlisted !== 'boolean') throw new Error('removeUnlisted must be an explicit boolean');
  if (!accessToken) throw new Error('Search Console access token is required');
  if (!quotaProject) throw new Error('Search Console quota project is required');
  if (!Array.isArray(targets) || targets.length === 0) {
    throw new Error('Search Console sitemap targets are required');
  }

  const siteList = await googleRequest('/sites', { accessToken, quotaProject, fetchImpl });
  const properties = siteList.siteEntry ?? [];
  const desiredByProperty = new Map();
  const assignments = targets.map((target) => {
    const selected = selectSearchConsoleProperty(target.sitemapUrl, properties);
    if (selected) {
      const desired = desiredByProperty.get(selected.siteUrl) ?? new Set();
      desired.add(target.sitemapUrl);
      desiredByProperty.set(selected.siteUrl, desired);
    }
    return { ...target, selected };
  });

  const listings = await mapWithConcurrency([...desiredByProperty.keys()], 4, async (siteUrl) => {
    try {
      const listed = await googleRequest(`/sites/${encodeURIComponent(siteUrl)}/sitemaps`, {
        accessToken,
        quotaProject,
        fetchImpl,
      });
      return [siteUrl, { entries: listed.sitemap ?? [] }];
    } catch (error) {
      return [siteUrl, {
        entries: [],
        error: boundedProviderText(error instanceof Error ? error.message : error),
      }];
    }
  });
  const listingsByProperty = new Map(listings);
  const actions = [];

  for (const assignment of assignments) {
    if (!assignment.selected) {
      actions.push({
        targetId: assignment.id,
        sitemapUrl: assignment.sitemapUrl,
        action: 'add',
        state: 'property-unavailable',
      });
      continue;
    }
    const property = assignment.selected.siteUrl;
    const listing = listingsByProperty.get(property);
    if (listing?.error) {
      actions.push({
        targetId: assignment.id,
        property,
        sitemapUrl: assignment.sitemapUrl,
        action: 'add',
        state: 'blocked',
        reason: listing.error,
      });
      continue;
    }
    const existing = listing.entries.find((entry) => entry.path === assignment.sitemapUrl);
    if (existing) {
      actions.push({
        targetId: assignment.id,
        property,
        sitemapUrl: assignment.sitemapUrl,
        action: 'retain',
        state: 'unchanged',
        errors: Number(existing.errors ?? 0),
        warnings: Number(existing.warnings ?? 0),
        pending: existing.isPending === true,
      });
      continue;
    }
    if (!apply) {
      actions.push({
        targetId: assignment.id,
        property,
        sitemapUrl: assignment.sitemapUrl,
        action: 'add',
        state: 'planned',
      });
      continue;
    }
    try {
      await googleRequest(
        `/sites/${encodeURIComponent(property)}/sitemaps/${encodeURIComponent(assignment.sitemapUrl)}`,
        { accessToken, quotaProject, fetchImpl, method: 'PUT' },
      );
      actions.push({
        targetId: assignment.id,
        property,
        sitemapUrl: assignment.sitemapUrl,
        action: 'add',
        state: 'submitted',
      });
    } catch (error) {
      actions.push({
        targetId: assignment.id,
        property,
        sitemapUrl: assignment.sitemapUrl,
        action: 'add',
        state: 'blocked',
        reason: boundedProviderText(error instanceof Error ? error.message : error),
      });
    }
  }

  // A caller may submit only part of a shared domain property's sitemaps.
  // Removing other registrations requires an explicit complete-inventory choice.
  const removalProperties = removeUnlisted ? desiredByProperty : new Map();
  for (const [property, desired] of removalProperties) {
    const listing = listingsByProperty.get(property);
    if (listing?.error) continue;
    for (const entry of listing?.entries ?? []) {
      if (desired.has(entry.path)) continue;
      if (!sitemapBelongsToProperty(entry.path, property)) {
        actions.push({
          property,
          sitemapUrl: String(entry.path ?? ''),
          action: 'remove',
          state: 'blocked',
          reason: 'sitemap URL is outside the selected property boundary',
        });
        continue;
      }
      if (!apply) {
        actions.push({
          property,
          sitemapUrl: entry.path,
          action: 'remove',
          state: 'planned',
        });
        continue;
      }
      try {
        await googleRequest(
          `/sites/${encodeURIComponent(property)}/sitemaps/${encodeURIComponent(entry.path)}`,
          { accessToken, quotaProject, fetchImpl, method: 'DELETE' },
        );
        actions.push({
          property,
          sitemapUrl: entry.path,
          action: 'remove',
          state: 'deleted',
        });
      } catch (error) {
        actions.push({
          property,
          sitemapUrl: entry.path,
          action: 'remove',
          state: 'blocked',
          reason: boundedProviderText(error instanceof Error ? error.message : error),
        });
      }
    }
  }

  return {
    apply,
    removeUnlisted,
    targetCount: targets.length,
    propertyCount: desiredByProperty.size,
    actions,
  };
}

function requestBody({ startDate, endDate, pageFilter, pageFilterOperator = 'contains', dimensions = [], rowLimit = 1 }) {
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
          operator: pageFilterOperator,
          expression: pageFilterOperator === 'includingRegex' ? `^${pageFilter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}` : pageFilter,
        }],
      }],
    } : {}),
  };
}

async function googleRequest(path, {
  accessToken,
  quotaProject,
  fetchImpl,
  body,
  method = body ? 'POST' : 'GET',
  baseUrl = SEARCH_CONSOLE_API,
}) {
  const response = await fetchImpl(`${baseUrl}${path}`, {
    method,
    signal: AbortSignal.timeout(SEARCH_CONSOLE_TIMEOUT_MS),
    headers: {
      authorization: `Bearer ${accessToken}`,
      'x-goog-user-project': quotaProject,
      ...(body ? { 'content-type': 'application/json' } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  let payload = {};
  if (typeof response.text === 'function') {
    const responseText = await response.text();
    payload = responseText.trim() ? JSON.parse(responseText) : {};
  } else {
    payload = await response.json();
  }
  if (!response.ok) {
    throw new Error(`Search Console request failed (${response.status}): ${payload?.error?.message ?? 'unknown error'}`);
  }
  return payload;
}

export async function ensureSearchConsoleSitemaps({
  projects,
  accessToken,
  quotaProject,
  fetchImpl = fetch,
  now = new Date(),
}) {
  if (!accessToken) throw new Error('Search Console access token is required');
  if (!quotaProject) throw new Error('Search Console quota project is required');
  const targets = projects.map(project => ({ project, target: searchConsoleTarget(project) }));
  const siteList = await googleRequest('/sites', { accessToken, quotaProject, fetchImpl });
  const properties = siteList.siteEntry ?? [];
  const plans = [];
  const plansBySitemap = new Map();

  for (const { project, target } of targets) {
    const domain = target?.domain;
    const sitemapUrl = domain ? `https://${domain}/sitemap.xml` : null;
    const selected = sitemapUrl ? selectSearchConsoleProperty(sitemapUrl, properties) : null;
    if (!selected) {
      plans.push({ project, domain: domain ?? null, selected: null, sitemapUrl: null, targets: [{ project, target }] });
      continue;
    }
    const key = `${selected.siteUrl}\n${sitemapUrl}`;
    const existing = plansBySitemap.get(key);
    if (existing) {
      existing.targets.push({ project, target });
      continue;
    }
    const plan = { project, domain, selected, sitemapUrl, targets: [{ project, target }] };
    plansBySitemap.set(key, plan);
    plans.push(plan);
  }

  const propertyUrls = [...new Set(plans.flatMap((plan) => plan.selected ? [plan.selected.siteUrl] : []))];
  const propertyListings = await mapWithConcurrency(propertyUrls, 4, async (siteUrl) => {
    try {
      const listed = await googleRequest(`/sites/${encodeURIComponent(siteUrl)}/sitemaps`, {
        accessToken,
        quotaProject,
        fetchImpl,
      });
      return [siteUrl, {
        entries: new Map((listed.sitemap ?? []).map((entry) => [entry.path, entry])),
      }];
    } catch (error) {
      return [siteUrl, { error }];
    }
  });
  const listingsByProperty = new Map(propertyListings);
  let submissionBlockedReason = null;

  const results = await mapWithConcurrency(plans, 4, async ({ project, domain, selected, sitemapUrl }) => {
    if (!selected) {
      return { projectId: project.id, domain, state: 'property-unavailable' };
    }
    const listing = listingsByProperty.get(selected.siteUrl);
    if (listing?.error) {
      return {
        projectId: project.id,
        domain,
        sitemapUrl,
        state: 'blocked',
        reason: boundedProviderText(listing.error instanceof Error ? listing.error.message : listing.error),
      };
    }
    const listedSitemap = listing?.entries.get(sitemapUrl);
    if (listedSitemap) {
      const submittedAt = Number.isFinite(Date.parse(listedSitemap.lastSubmitted))
        ? new Date(listedSitemap.lastSubmitted).toISOString()
        : null;
      return {
        projectId: project.id,
        domain,
        sitemapUrl,
        state: 'already-submitted',
        ...(submittedAt ? { submittedAt } : {}),
      };
    }
    if (submissionBlockedReason) {
      return { projectId: project.id, domain, sitemapUrl, state: 'blocked', reason: submissionBlockedReason };
    }
    try {
      await googleRequest(
        `/sites/${encodeURIComponent(selected.siteUrl)}/sitemaps/${encodeURIComponent(sitemapUrl)}`,
        { accessToken, quotaProject, fetchImpl, method: 'PUT' },
      );
      return {
        projectId: project.id,
        domain,
        sitemapUrl,
        state: 'submitted',
        submittedAt: now.toISOString(),
      };
    } catch (error) {
      const reason = boundedProviderText(error instanceof Error ? error.message : error);
      if (/\(403\).*insufficient authentication scopes/i.test(reason ?? '')) {
        submissionBlockedReason = reason;
      }
      return {
        projectId: project.id,
        domain,
        sitemapUrl,
        state: 'blocked',
        reason,
      };
    }
  });
  return results.flatMap((result, index) => plans[index].targets.map(({ project, target }) => ({
    ...result,
    projectId: project.id,
    ...(target?.explicit ? { surfaceUrl: target.surfaceUrl } : {}),
  })));
}

const RECORDED_SITEMAP_STATES = new Set(['submitted', 'already-submitted']);

export function attachSitemapSubmissionState(bundle, sitemapResults) {
  const sitemapBySurface = new Map(sitemapResults.filter(result => result.surfaceUrl).map(result => [`${result.projectId}:${result.surfaceUrl}`, result]));
  const sitemapByDomain = new Map(sitemapResults.filter(result => !result.surfaceUrl).map(result => [`${result.projectId}:${result.domain ?? ''}`, result]));
  return {
    ...bundle,
    observations: bundle.observations.map((observation) => {
      const sitemap = sitemapBySurface.get(`${observation.projectId}:${searchObservationSurface(observation) ?? ''}`)
        ?? sitemapByDomain.get(`${observation.projectId}:${searchObservationDomain(observation) ?? ''}`);
      if (
        !observation.indexInspection ||
        !sitemap?.submittedAt ||
        !RECORDED_SITEMAP_STATES.has(sitemap.state)
      ) {
        return observation;
      }
      return {
        ...observation,
        indexInspection: {
          ...observation.indexInspection,
          sitemapSubmissionState: sitemap.state,
          sitemapSubmittedAt: sitemap.submittedAt,
        },
      };
    }),
  };
}

function boundedProviderText(value, maximum = 300) {
  const normalized = String(value ?? '').replace(/\s+/g, ' ').trim();
  return normalized ? normalized.slice(0, maximum) : null;
}

function safeHttpsUrl(value) {
  try {
    const url = new URL(String(value ?? ''));
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : null;
  } catch {
    return null;
  }
}

export async function inspectSearchConsoleUrl({
  inspectionUrl,
  maxAttempts = 2,
  siteUrl,
  accessToken,
  quotaProject,
  fetchImpl = fetch,
  requestImpl = googleRequest,
}) {
  let lastError = null;
  for (let attempt = 0; attempt < Math.max(1, Math.min(2, maxAttempts)); attempt += 1) {
    try {
      const payload = await requestImpl('/urlInspection/index:inspect', {
        accessToken,
        quotaProject,
        fetchImpl,
        baseUrl: SEARCH_CONSOLE_INSPECTION_API,
        body: { inspectionUrl, siteUrl, languageCode: 'en-US' },
      });
      const result = payload.inspectionResult?.indexStatusResult ?? {};
      const verdict = boundedProviderText(result.verdict, 40);
      const lastCrawlTime = Number.isFinite(Date.parse(result.lastCrawlTime))
        ? new Date(result.lastCrawlTime).toISOString()
        : null;
      const sitemapUrls = [...new Set((result.sitemap ?? []).map(safeHttpsUrl).filter(Boolean))].slice(0, 10);
      return {
        inspectedUrl: inspectionUrl,
        state: verdict === 'PASS' ? 'indexed' : ['FAIL', 'NEUTRAL'].includes(verdict) ? 'not-indexed' : 'unknown',
        verdict,
        coverageState: boundedProviderText(result.coverageState),
        robotsTxtState: boundedProviderText(result.robotsTxtState, 80),
        indexingState: boundedProviderText(result.indexingState, 80),
        pageFetchState: boundedProviderText(result.pageFetchState, 80),
        ...(lastCrawlTime ? { lastCrawlTime } : {}),
        ...(safeHttpsUrl(result.userCanonical) ? { userCanonical: safeHttpsUrl(result.userCanonical) } : {}),
        ...(safeHttpsUrl(result.googleCanonical) ? { googleCanonical: safeHttpsUrl(result.googleCanonical) } : {}),
        ...(sitemapUrls.length > 0 ? { sitemapUrls } : {}),
      };
    } catch (error) {
      lastError = error;
      if (attempt === 0 && maxAttempts > 1 && error?.name !== 'TimeoutError' && !/(?:401|403|429|quota|credential|permission|auth)/i.test(String(error?.message))) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      } else {
        break;
      }
    }
  }
  return {
    inspectedUrl: inspectionUrl,
    state: 'unavailable',
    verdict: null,
    coverageState: null,
    robotsTxtState: null,
    indexingState: null,
    pageFetchState: null,
    failureReason: boundedProviderText(lastError instanceof Error ? lastError.message : lastError),
  };
}

// Search Console sorts query rows by clicks. Keep a bounded mix of clicked
// results and high-impression opportunities, including rows with zero clicks.
function selectSearchTerms(rows, limit) {
  const key = (row) => `${row.query}\n${row.landingPage}`;
  const unique = [...new Map(rows.map((row) => [key(row), row])).values()];
  const tie = (left, right) => key(left).localeCompare(key(right), 'en');
  const clicked = unique.filter((row) => row.clicks > 0)
    .sort((a, b) => b.clicks - a.clicks || b.impressions - a.impressions || tie(a, b))
    .slice(0, Math.ceil(limit / 2));
  const retained = new Map(clicked.map((row) => [key(row), row]));
  for (const row of unique.sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks || tie(a, b))) {
    if (retained.size >= limit) break;
    retained.set(key(row), row);
  }
  return [...retained.values()];
}

export function searchConsoleRefreshReceipt({ projectId = null, runId }) {
  return {
    family: 'search',
    scope: projectId ? 'project' : 'portfolio',
    projectId,
    runId,
    label: projectId ? `${projectId} Search Console evidence` : 'Portfolio Search Console evidence',
  };
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
  requestImpl = googleRequest,
  provenance = 'provider',
}) {
  if (requestImpl === googleRequest && !accessToken) throw new Error('Search Console access token is required');
  if (requestImpl === googleRequest && !quotaProject) throw new Error('Search Console quota project is required');
  if (!Number.isInteger(searchTermLimit) || searchTermLimit < 1 || searchTermLimit > 50) {
    throw new Error('Search Console search term limit must be 1-50');
  }
  const endDate = shiftedDay(isoDay(now), -reportingLagDays);
  const startDate = shiftedDay(endDate, -(reportingWindowDays - 1));
  const previousEndDate = shiftedDay(startDate, -1);
  const previousStartDate = shiftedDay(previousEndDate, -(reportingWindowDays - 1));
  const observedAt = now.toISOString();
  const runId = observedAt.replace(/[^0-9]/g, '');
  const targets = projects.map(project => ({ project, target: searchConsoleTarget(project) }));
  const siteList = await requestImpl('/sites', {
    accessToken,
    quotaProject,
    fetchImpl,
  });
  const properties = siteList.siteEntry ?? [];
  const inspectWithBoundedConcurrency = createConcurrencyGate(
    SEARCH_CONSOLE_INSPECTION_CONCURRENCY,
  );
  const collectedProjects = await mapWithConcurrency(targets, 4, async ({ project, target }) => {
    const domain = target?.domain;
    const selected = target ? selectSearchConsoleProperty(target.explicit ? target.surfaceUrl : domain, properties) : null;
    if (!selected) {
      return {
        unavailable: { projectId: project.id, domain: domain ?? null, reason: 'property-unavailable' },
      };
    }
    const aggregateRequest = requestImpl(
      `/sites/${encodeURIComponent(selected.siteUrl)}/searchAnalytics/query`, {
        accessToken,
        quotaProject,
        fetchImpl,
        body: requestBody({ startDate, endDate, pageFilter: selected.pageFilter, pageFilterOperator: selected.pageFilterOperator }),
      },
    );
    const termsRequest = requestImpl(
      `/sites/${encodeURIComponent(selected.siteUrl)}/searchAnalytics/query`, {
        accessToken,
        quotaProject,
        fetchImpl,
        body: requestBody({
          startDate,
          endDate,
          pageFilter: selected.pageFilter,
          pageFilterOperator: selected.pageFilterOperator,
          dimensions: ['query', 'page'],
          rowLimit: SEARCH_CONSOLE_QUERY_POOL_LIMIT,
        }),
      },
    );
    const dailyRequest = requestImpl(
      `/sites/${encodeURIComponent(selected.siteUrl)}/searchAnalytics/query`, {
        accessToken,
        quotaProject,
        fetchImpl,
        body: requestBody({
          startDate,
          endDate,
          pageFilter: selected.pageFilter,
          pageFilterOperator: selected.pageFilterOperator,
          dimensions: ['date'],
          rowLimit: Math.min(reportingWindowDays, 90),
        }),
      },
    );
    const previousRequest = requestImpl(
      `/sites/${encodeURIComponent(selected.siteUrl)}/searchAnalytics/query`, {
        accessToken,
        quotaProject,
        fetchImpl,
        body: requestBody({
          startDate: previousStartDate,
          endDate: previousEndDate,
          pageFilter: selected.pageFilter,
          pageFilterOperator: selected.pageFilterOperator,
        }),
      },
    );
    const inspectedUrl = target.surfaceUrl;
    const inspectionRequest = inspectWithBoundedConcurrency(() => inspectSearchConsoleUrl({
      inspectionUrl: inspectedUrl,
      siteUrl: selected.siteUrl,
      accessToken,
      quotaProject,
      fetchImpl,
      requestImpl,
    }));
    const [result, termResult, dailyResult, previousResult, indexInspection] = await Promise.all([
      aggregateRequest,
      termsRequest,
      dailyRequest,
      previousRequest,
      inspectionRequest,
    ]);
    const row = result.rows?.[0] ?? null;
    const queryRows = (termResult.rows ?? []).flatMap((term) => {
      const query = String(term.keys?.[0] ?? '').replace(/\s+/g, ' ').trim();
      let landingPage = null;
      try {
        const url = new URL(String(term.keys?.[1] ?? ''));
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.href.length > 2048) return [];
        landingPage = url.href;
      } catch {
        return [];
      }
      if (!query || query.length > 2048 || !Number.isFinite(Number(term.position)) || Number(term.position) <= 0) {
        return [];
      }
      if (!Number.isFinite(Number(term.impressions ?? 0)) || Number(term.impressions ?? 0) < 0 ||
          !Number.isFinite(Number(term.clicks ?? 0)) || Number(term.clicks ?? 0) < 0 ||
          !Number.isFinite(Number(term.ctr ?? 0)) || Number(term.ctr ?? 0) < 0 || Number(term.ctr ?? 0) > 1) return [];
      return [{
        query,
        landingPage,
        impressions: Number(term.impressions ?? 0),
        clicks: Number(term.clicks ?? 0),
        ctr: Number(term.ctr ?? 0) * 100,
        position: Number(term.position),
      }];
    });
    const diagnosticRows = queryRows.filter(term => /\bsite:/i.test(term.query));
    const searchTerms = selectSearchTerms(queryRows.filter(term => !/\bsite:/i.test(term.query)), searchTermLimit);
    const searchTermSample = {
      requestedRowLimit: SEARCH_CONSOLE_QUERY_POOL_LIMIT,
      returnedRows: (termResult.rows ?? []).length,
      retainedRows: searchTerms.length,
      rowLimitReached: (termResult.rows ?? []).length >= SEARCH_CONSOLE_QUERY_POOL_LIMIT,
      strategy: 'clicks-and-impressions',
      ...(diagnosticRows.length ? {
        excludedDiagnosticRows: diagnosticRows.length,
        diagnosticImpressions: diagnosticRows.reduce((sum, term) => sum + term.impressions, 0),
        returnedQueryImpressions: queryRows.reduce((sum, term) => sum + term.impressions, 0),
      } : {}),
    };
    const metrics = [
      { label: 'Search impressions', value: Number(row?.impressions ?? 0) },
      { label: 'Search clicks', value: Number(row?.clicks ?? 0) },
      { label: 'Search CTR', value: Number(row?.ctr ?? 0) * 100 },
      ...(Number(row?.impressions) > 0 && Number(row?.position) > 0
        ? [{ label: 'Search average position', value: Number(row.position) }]
        : []),
    ];
    const previousRow = previousResult.rows?.[0] ?? null;
    const previousMetrics = [
      { label: 'Search impressions', value: Number(previousRow?.impressions ?? 0) },
      { label: 'Search clicks', value: Number(previousRow?.clicks ?? 0) },
      { label: 'Search CTR', value: Number(previousRow?.ctr ?? 0) * 100 },
      ...(Number(previousRow?.impressions) > 0 && Number(previousRow?.position) > 0
        ? [{ label: 'Search average position', value: Number(previousRow.position) }]
        : []),
    ];
    const dailySeries = (dailyResult.rows ?? []).flatMap((point) => {
      const date = String(point.keys?.[0] ?? '');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return [];
      return [{
        date,
        impressions: Number(point.impressions ?? 0),
        clicks: Number(point.clicks ?? 0),
        ctr: Number(point.ctr ?? 0) * 100,
        position: Number(point.position ?? 0),
      }];
    });
    return { observation: {
      id: `search-${project.id}-${createHash('sha256').update(target.surfaceUrl).digest('hex').slice(0, 12)}-${endDate}-${runId}`,
      projectId: project.id,
      family: 'search',
      provider: 'google-search-console',
      provenance,
      providerUrl: searchConsoleProviderUrl(selected.siteUrl),
      scope: selected.pageFilter
        ? `${selected.siteUrl} · page:${selected.pageFilter}`
        : selected.siteUrl,
      observedAt,
      period: {
        start: `${startDate}T00:00:00.000Z`,
        end: `${endDate}T23:59:59.999Z`,
      },
      metrics,
      dailySeries,
      previousPeriod: {
        start: `${previousStartDate}T00:00:00.000Z`,
        end: `${previousEndDate}T23:59:59.999Z`,
        metrics: previousMetrics,
      },
      searchTerms,
      searchTermSample,
      indexInspection,
    } };
  });
  const observations = collectedProjects.flatMap((result) => result.observation ? [result.observation] : []);
  const unavailable = collectedProjects.flatMap((result) => result.unavailable ? [result.unavailable] : []);

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
