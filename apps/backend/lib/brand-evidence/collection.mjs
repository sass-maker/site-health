import { createCollector } from '@saas-maker/collect';
import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';
import { BrandEvidenceError } from './store.mjs';
import { loadRedditCatalog, loadRedditSnapshot, snapshotThreads } from './reddit-snapshots.mjs';
import { containsTerm } from './term-match.mjs';

// Source-specific interpretation belongs to Site Health. The shared package
// only fetches/extracts; it knows nothing about brands, findings or follow-ups.
const plain = (value) => String(value ?? '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const timestamp = (value) => Number.isFinite(Date.parse(value)) ? new Date(value).toISOString() : null;

export async function assertPublicWebsite(value, resolveHost = lookup) {
  const url = new URL(value);
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (url.protocol !== 'https:' || url.username || url.password || (url.port && url.port !== '443')) throw new Error('Public HTTPS website required');
  const addresses = isIP(host) ? [{ address: host }] : await resolveHost(host, { all: true });
  const publicAddress = (address) => {
    if (isIP(address) === 4) {
      const [a, b] = address.split('.').map(Number);
      return a !== 0 && a !== 10 && a !== 127 && a < 224
        && !(a === 169 && b === 254) && !(a === 172 && b >= 16 && b <= 31)
        && !(a === 192 && (b === 168 || b === 0)) && !(a === 100 && b >= 64 && b <= 127)
        && !(a === 198 && (b === 18 || b === 19));
    }
    // Global IPv6 unicast only; embedded/mapped private IPv4 is rejected.
    return /^[23][0-9a-f]{3}:/i.test(address) && !address.toLowerCase().startsWith('2001:db8:');
  };
  if (!addresses.length || addresses.some(({ address }) => !publicAddress(address))) throw new Error('Public website address required');
}

export function collectionTerms(profile) {
  return [...new Set([profile.brandName, ...(profile.aliases ?? []).slice(0, 2),
    ...(profile.keywords ?? []).slice(0, 2), ...(profile.topics ?? []).slice(0, 1),
    ...(profile.competitors ?? []).slice(0, 2).map((item) => item.name)]
    .map((term) => String(term).trim()).filter((term) => term.length >= 2))].slice(0, 8);
}

export function communityTargets(profile, now = new Date().toISOString()) {
  const terms = collectionTerms(profile);
  const since = Math.floor((Date.parse(now) - 30 * 86_400_000) / 1000);
  const queries = terms.map((term) => ({
    source: 'hackernews', term,
    url: `https://hn.algolia.com/api/v1/search_by_date?${new URLSearchParams({
      query: term, hitsPerPage: '20', numericFilters: `created_at_i>${since}`,
    })}`,
  }));
  // One bounded search across configured communities, rather than one request
  // per subreddit. A denied endpoint remains unavailable, never zero mentions.
  const communities = (profile.communities ?? []).map((name) => name.replace(/^r\//, ''))
    .filter((name) => /^[A-Za-z0-9_]{2,30}$/.test(name)).slice(0, 5);
  const scope = communities.length ? `/r/${communities.join('+')}` : '';
  if (terms.length) queries.push({
    source: 'reddit', term: terms.join(' OR '),
    url: `https://www.reddit.com${scope}/search.json?${new URLSearchParams({
      q: terms.map((term) => `"${term.replaceAll('"', '')}"`).join(' OR '),
      sort: 'new', t: 'month', limit: '25', restrict_sr: communities.length ? 'on' : 'off', type: 'link',
    })}`,
  });
  return queries;
}

export async function collectWebsiteEvidence({
  store, projectId, now = () => new Date().toISOString(), collectorFactory = createCollector,
}) {
  const profile = store.getProfile(projectId);
  if (!profile?.brandUrl) return { status: 'skipped', reason: 'No brand website configured.' };
  const id = store.startCollection(projectId, 'website', profile.brandUrl, now());
  const collector = collectorFactory({ timeoutMs: 10_000, retries: 0, maxResponseBytes: 2_000_000,
    validateUrl: assertPublicWebsite });
  try {
    const url = new URL(profile.brandUrl);
    if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Website requires HTTPS');
    const result = await collector.collect({ url: url.href, extractor: 'page', transport: 'http' });
    const data = result.data;
    if (!data || typeof data.text !== 'string') throw new Error('No page evidence');
    const terms = collectionTerms(profile).filter((term) => containsTerm(data.text, term));
    const payload = {
      sourceUrl: result.finalUrl ?? result.sourceUrl, title: data.title, description: data.description,
      canonicalUrl: data.canonicalUrl, headings: data.headings?.slice(0, 20) ?? [],
      textExcerpt: data.text.slice(0, 4000), matchedTerms: terms,
      fetchedAt: result.fetchedAt, checkedAt: result.checkedAt ?? result.fetchedAt,
    };
    store.finishCollection(id, { status: 'completed', received: 1, matched: terms.length, payload }, now());
    return { status: 'completed', payload };
  } catch (error) {
    const errorMessage = sourceError(error);
    store.finishCollection(id, { status: 'error', errorMessage }, now());
    return { status: 'error', errorMessage };
  } finally { await collector.close(); }
}

export function normalizeCommunityResults(source, data, profile) {
  let rows;
  if (source === 'hackernews') {
    if (!Array.isArray(data?.hits)) throw new Error('Invalid Hacker News response');
    rows = data.hits.slice(0, 20).map((hit) => ({
      source, sourceRecordId: String(hit.objectID ?? ''), sourceName: 'Hacker News',
      title: plain(hit.title || hit.story_title || 'Hacker News comment').slice(0, 500),
      content: plain(hit.comment_text || hit.story_text).slice(0, 4000),
      url: `https://news.ycombinator.com/item?id=${encodeURIComponent(hit.objectID)}`,
      author: plain(hit.author).slice(0, 120) || null, publishedAt: timestamp(hit.created_at),
      engagementScore: Number.isFinite(hit.points) ? hit.points : null,
      commentCount: Number.isFinite(hit.num_comments) ? hit.num_comments : null,
    }));
  } else {
    if (!Array.isArray(data?.data?.children)) throw new Error('Invalid Reddit response');
    rows = data.data.children.slice(0, 25).map(({ data: row }) => ({
      source, sourceRecordId: String(row?.id ?? ''), sourceName: 'Reddit',
      title: plain(row?.title).slice(0, 500), content: plain(row?.selftext).slice(0, 4000),
      url: typeof row?.permalink === 'string' && row.permalink.startsWith('/r/')
        ? `https://www.reddit.com${row.permalink}` : null,
      author: plain(row?.author).slice(0, 120) || null,
      publishedAt: Number.isFinite(row?.created_utc) ? timestamp(new Date(row.created_utc * 1000).toISOString()) : null,
      engagementScore: Number.isFinite(row?.score) ? row.score : null,
      commentCount: Number.isFinite(row?.num_comments) ? row.num_comments : null,
    }));
  }
  const terms = collectionTerms(profile);
  const findings = rows.filter((row) => row.sourceRecordId && row.url).flatMap((row) => {
    const haystack = `${row.title} ${row.content}`.toLocaleLowerCase();
    const matchedKeywords = terms.filter((term) => containsTerm(haystack, term));
    if (!matchedKeywords.length) return [];
    const direct = [profile.brandName, ...(profile.aliases ?? [])]
      .some((term) => matchedKeywords.includes(term));
    return [{ ...row, matchedKeywords, relevanceScore: direct ? 100 : 60, intent: direct ? 'brand-mention' : 'topic-match' }];
  });
  return { received: rows.length, findings };
}

function sourceError(error) {
  if (error?.code === 'upstream_blocked') return `Source unavailable (HTTP ${error.status}); no bypass attempted.`;
  if (/Invalid (Hacker News|Reddit) response/.test(error?.message ?? '')) return error.message;
  return 'Source collection failed or timed out. Previous evidence is retained.';
}

export async function collectCommunityEvidence({
  store, projectId, now = () => new Date().toISOString(), collectorFactory = createCollector,
}) {
  const profile = store.getProfile(projectId);
  if (!profile) throw new BrandEvidenceError('Save a brand profile first');
  const collector = collectorFactory({ timeoutMs: 10_000, retries: 0, maxResponseBytes: 2_000_000,
    userAgent: 'SiteHealth/1.0 (owner-local brand research; github.com/sass-maker/site-health)' });
  const results = [];
  const blocked = new Set();
  try {
    for (const target of communityTargets(profile, now()).filter((target) => target.source !== 'reddit' || !(profile.communities ?? []).length)) {
      if (blocked.has(target.source)) continue;
      const startedAt = now();
      const id = store.startCollection(projectId, target.source, target.term, startedAt);
      try {
        const response = await collector.collect({ url: target.url, extractor: 'json', transport: 'http' });
        const normalized = normalizeCommunityResults(target.source, response.data, profile);
        const observedAt = now();
        store.transaction(() => {
          for (const finding of normalized.findings) store.upsertFinding(projectId, finding, observedAt);
          store.finishCollection(id, { status: 'completed', received: normalized.received, matched: normalized.findings.length }, observedAt);
        });
        results.push({ source: target.source, status: 'completed', received: normalized.received, matched: normalized.findings.length });
      } catch (error) {
        const errorMessage = sourceError(error);
        store.finishCollection(id, { status: 'error', errorMessage }, now());
        results.push({ source: target.source, status: 'error', matched: null, errorMessage });
        // Stop querying a denied/rate-limited provider for the rest of this run.
        if (error?.code === 'upstream_blocked') {
          blocked.add(target.source);
        }
      }
    }
    if ((profile.communities ?? []).length) {
      let catalog;
      try { catalog = await loadRedditCatalog(collector, now()); } catch { catalog = new Map(); }
      for (const name of profile.communities.slice(0, 5).map((value) => value.replace(/^r\//, ''))) {
        const id = store.startCollection(projectId, 'reddit_insights', name, now());
        try {
          const entry = catalog.get(name.toLowerCase());
          if (!entry) throw new Error('No current public snapshot');
          const snapshot = await loadRedditSnapshot(collector, entry, now());
          const threads = snapshotThreads(snapshot, collectionTerms(profile), now());
          store.transaction(() => {
            for (const thread of threads) store.upsertFinding(projectId, {
              source: 'reddit_insights', sourceRecordId: thread.id, sourceName: `Reddit Insights · r/${name}`,
              title: thread.title, content: thread.body, url: thread.url, publishedAt: thread.publishedAt,
              commentCount: thread.commentCount, relevanceScore: 60, intent: 'topic-match',
              matchedKeywords: collectionTerms(profile).filter((term) => containsTerm(`${thread.title} ${thread.body}`, term)),
            }, now());
            store.finishCollection(id, { status: 'completed', received: snapshot.posts.length, matched: threads.length,
              payload: { sourceUrl: snapshot.sourceUrl, sourceRevision: snapshot.sourceRevision, capturedAt: snapshot.capturedAt,
                expiresAt: snapshot.expiresAt, window: snapshot.window, coverage: snapshot.coverage } }, now());
          });
          results.push({ source: 'reddit_insights', status: 'completed', received: snapshot.posts.length, matched: threads.length });
        } catch {
          const errorMessage = 'Current public Reddit snapshot unavailable for this community; previous evidence is retained.';
          store.finishCollection(id, { status: 'error', errorMessage }, now());
          results.push({ source: 'reddit_insights', status: 'error', matched: null, errorMessage });
        }
      }
    }
  } finally {
    await collector.close();
  }
  return {
    status: results.every((row) => row.status === 'completed') ? 'completed'
      : results.some((row) => row.status === 'completed') ? 'partial' : 'failed',
    results,
  };
}
