import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const RECEIPT_SCHEMA = 'fleet.campaign-item-receipt.v1';
const MAX_CANDIDATES = 60;
const NON_ARTIFACT_PROVIDERS = new Set(['live-http', 'live-site', 'search-discovery']);
const NON_PUBLIC_PATH = /(?:\/edit(?:\/|$)|\/drafts?(?:\/|$)|\/settings?(?:\/|$)|\/pull\/\d+(?:\/|$)|\/issues?(?:\/|$)|\/moderation(?:\/|$)|\/queue(?:\/|$)|\/submit(?:\/|$)|\/account(?:\/|$)|\/profile(?:\/|$)|\/login(?:\/|$)|\/sign-?in(?:\/|$)|\/new(?:\/|$))/i;

function isArtifactUrl(url) {
  if (url.pathname === '/') return false;
  if (url.hostname === 'github.com') return /\/(?:releases\/tag|discussions\/\d+)(?:\/|$)/i.test(url.pathname);
  if (url.hostname === 'substack.com') return /\/(?:note|p)\//i.test(url.pathname);
  if (url.hostname.endsWith('.quora.com') || url.hostname === 'www.quora.com') return /\/answer\//i.test(url.pathname);
  return true;
}

function json(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return null;
  }
}

function safePublicUrl(value) {
  try {
    const url = new URL(String(value ?? ''));
    if (
      url.protocol !== 'https:'
      || url.username
      || url.password
      || NON_PUBLIC_PATH.test(url.pathname)
      || !isArtifactUrl(url)
    ) return null;
    return url;
  } catch {
    return null;
  }
}

function scheduledAt(receipt) {
  const match = String(receipt.message ?? '').match(/\b\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z\b/);
  return match && Number.isFinite(Date.parse(match[0])) ? new Date(match[0]).toISOString() : null;
}

export function campaignCandidates({ root, projects = [], now = new Date().toISOString() } = {}) {
  if (!root || !existsSync(root)) return [];
  const domains = new Map(projects.map((project) => [project.id, project.domains?.[0] ?? null]));
  const candidates = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name === 'drafts') continue;
    const campaignRoot = join(root, entry.name);
    const manifest = json(join(campaignRoot, 'manifest.json'));
    const receiptsRoot = join(campaignRoot, 'receipts');
    if (!manifest || !existsSync(receiptsRoot)) continue;
    const projectId = manifest.campaign?.projectId ?? null;
    const targetRoot = domains.get(projectId) ?? null;
    if (!targetRoot) continue;
    for (const receiptFile of readdirSync(receiptsRoot).filter((name) => name.endsWith('.json'))) {
      const receipt = json(join(receiptsRoot, receiptFile));
      if (receipt?.$schema !== RECEIPT_SCHEMA || !['queued', 'confirmed', 'published'].includes(receipt.outcome)) continue;
      if (NON_ARTIFACT_PROVIDERS.has(String(receipt.provider ?? '').toLowerCase())) continue;
      const resultUrl = safePublicUrl(receipt.resultUrl);
      if (!resultUrl) continue;
      const dueAt = scheduledAt(receipt);
      if (dueAt && Date.parse(dueAt) > Date.parse(now)) continue;
      candidates.push({
        campaignId: receipt.campaignId,
        itemKey: receipt.itemKey,
        projectId,
        targetRoot,
        provider: receipt.provider,
        originalOutcome: receipt.outcome,
        resultUrl: resultUrl.href,
        recordedAt: receipt.recordedAt,
        dueAt,
      });
    }
  }
  const unique = new Map();
  for (const candidate of candidates.sort((left, right) => Date.parse(right.recordedAt) - Date.parse(left.recordedAt))) {
    const key = `${candidate.campaignId}:${candidate.itemKey}`;
    if (!unique.has(key)) unique.set(key, candidate);
  }
  return [...unique.values()].slice(0, MAX_CANDIDATES);
}

function htmlEvidence(html, finalUrl, targetRoot) {
  const canonicalMatch = html.match(/<link\b[^>]*rel=["'][^"']*canonical[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>/i)
    ?? html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["'][^"']*canonical[^"']*["'][^>]*>/i);
  let canonical = null;
  try {
    if (canonicalMatch?.[1]) canonical = new URL(canonicalMatch[1], finalUrl).href;
  } catch {}
  const robots = html.match(/<meta\b[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i)?.[1] ?? '';
  let followState = 'not-observed';
  if (targetRoot) {
    const escaped = targetRoot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const anchor = html.match(new RegExp(`<a\\b[^>]*href=["'][^"']*${escaped}[^"']*["'][^>]*>`, 'i'))?.[0] ?? '';
    if (anchor) followState = /rel=["'][^"']*nofollow/i.test(anchor) ? 'nofollow' : 'follow';
  }
  return { canonical, indexable: !/\bnoindex\b/i.test(robots), followState };
}

async function probe(candidate, { fetchImpl = fetch, now }) {
  try {
    const response = await fetchImpl(candidate.resultUrl, {
      redirect: 'follow',
      headers: { accept: 'text/html,application/xhtml+xml', 'user-agent': 'site-health-evidence-reconciler/1.0' },
      signal: AbortSignal.timeout(6_000),
    });
    const finalUrl = safePublicUrl(response.url || candidate.resultUrl);
    const contentType = response.headers.get('content-type') ?? '';
    if (!response.ok || !finalUrl || !contentType.includes('text/html')) {
      return { ...candidate, state: 'not-verified', checkedAt: now, httpStatus: response.status };
    }
    const html = (await response.text()).slice(0, 256_000);
    const evidence = htmlEvidence(html, finalUrl.href, candidate.targetRoot);
    return {
      ...candidate,
      state: 'externally-verified',
      checkedAt: now,
      firstVerifiedAt: now,
      httpStatus: response.status,
      finalUrl: finalUrl.href,
      ...evidence,
    };
  } catch (error) {
    return {
      ...candidate,
      state: 'unavailable',
      checkedAt: now,
      failure: String(error?.name ?? 'PROBE_FAILED').slice(0, 80),
    };
  }
}

export async function reconcileCampaignEvidence({
  store,
  root = resolve(process.env.HOME ?? '', 'Library/Application Support/Fleet Ops/growth-campaigns'),
  projects = [],
  fetchImpl = fetch,
  now = new Date().toISOString(),
} = {}) {
  const previous = store.getMetadata('campaign-reconciliation:portfolio')?.value ?? { items: [] };
  const previousByKey = new Map(previous.items.map((item) => [`${item.campaignId}:${item.itemKey}`, item]));
  const candidates = campaignCandidates({ root, projects, now });
  const items = [];
  for (let index = 0; index < candidates.length; index += 4) {
    const batch = await Promise.all(candidates.slice(index, index + 4).map((candidate) =>
      probe(candidate, { fetchImpl, now })));
    items.push(...batch);
  }
  for (const item of items) {
    const prior = previousByKey.get(`${item.campaignId}:${item.itemKey}`);
    if (prior?.firstVerifiedAt && item.state === 'externally-verified') item.firstVerifiedAt = prior.firstVerifiedAt;
  }
  const value = {
    schemaVersion: 'site-health.campaign-reconciliation.v1',
    state: items.some((item) => item.state === 'unavailable') ? 'partial' : 'succeeded',
    lastAttemptAt: now,
    lastSuccessAt: now,
    counts: {
      candidates: candidates.length,
      verified: items.filter((item) => item.state === 'externally-verified').length,
      unavailable: items.filter((item) => item.state === 'unavailable').length,
      notVerified: items.filter((item) => item.state === 'not-verified').length,
    },
    items,
  };
  store.setMetadata('campaign-reconciliation:portfolio', value, { now });
  return value;
}

export function readCampaignReconciliation(store) {
  return store.getMetadata('campaign-reconciliation:portfolio')?.value ?? null;
}
