import { containsTerm } from './term-match.mjs';

const ORIGIN = 'https://reddit-insights.highsignal.app';

export async function loadRedditCatalog(collector, now = new Date().toISOString()) {
  const result = await collector.collect({ url: `${ORIGIN}/api/snapshots/catalog`, extractor: 'json', transport: 'http' });
  const catalog = result.data;
  if (catalog?.schema !== 'reddit-insights.catalog.v1' || !Array.isArray(catalog.entries)) throw new Error('Invalid Reddit snapshot catalog');
  const latest = new Map();
  for (const entry of catalog.entries) {
    if (!/^[A-Za-z0-9_]{2,30}$/.test(entry.subreddit) || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)
      || !/^[a-f0-9]{12,64}$/i.test(entry.source?.revision ?? '')
      || !(Date.parse(entry.expiresAt) > Date.parse(now))) continue;
    const key = entry.subreddit.toLowerCase();
    if (!latest.has(key) || entry.capturedAt > latest.get(key).capturedAt) latest.set(key, entry);
  }
  return latest;
}

export async function loadRedditSnapshot(collector, entry, now = new Date().toISOString()) {
  const revision = entry.source.revision.slice(0, 12);
  const url = `${ORIGIN}/api/snapshots/${entry.date}/${encodeURIComponent(entry.subreddit)}?v=${revision}`;
  const { data } = await collector.collect({ url, extractor: 'json', transport: 'http' });
  if (data?.schema !== 'reddit-insights.snapshot.v1' || data.subreddit?.toLowerCase() !== entry.subreddit.toLowerCase()
    || data.date !== entry.date || !data.source?.revision?.startsWith(revision)
    || !(Date.parse(data.expiresAt) > Date.parse(now)) || !Array.isArray(data.posts)) throw new Error('Invalid or expired Reddit snapshot');
  return {
    subreddit: entry.subreddit, sourceUrl: url, capturedAt: data.capturedAt,
    sourceRevision: data.source.revision, expiresAt: data.expiresAt,
    window: data.window, coverage: data.coverage,
    // Omit author/profile fields. The public snapshot already minimizes them;
    // the consumer never rehydrates raw archives or deleted records.
    posts: data.posts.slice(0, 200).filter((post) => post.id && post.title
      && !post.removalState && post.body !== '[removed]' && post.body !== '[deleted]')
      .map((post) => ({
        id: String(post.id), subreddit: entry.subreddit, title: String(post.title).slice(0, 500),
        body: String(post.body ?? '').slice(0, 4000), permalink: post.permalink,
        createdUtc: post.createdUtc, score: post.score ?? null, commentCount: post.commentCount ?? null,
      })),
    comments: (data.comments ?? []).slice(0, 2000).filter((comment) => !comment.removalState)
      .map((comment) => ({ postId: String(comment.postId), body: String(comment.body ?? '').slice(0, 800) })),
  };
}

export function snapshotThreads(snapshot, terms, now = new Date().toISOString(), { includeUnmatched = false } = {}) {
  return snapshot.posts.filter((post) => Number.isFinite(post.createdUtc)
    && post.createdUtc * 1000 <= Date.parse(now) + 300_000
    && Date.parse(now) - post.createdUtc * 1000 <= 30 * 86_400_000
    && (includeUnmatched || terms.some((term) => containsTerm(`${post.title} ${post.body}`, term)))
    && typeof post.permalink === 'string'
    && post.permalink.toLowerCase().startsWith(`/r/${snapshot.subreddit.toLowerCase()}/comments/`))
    .slice(0, 10).map((post) => ({
      id: post.id, subreddit: snapshot.subreddit, title: post.title, body: post.body,
      url: `https://www.reddit.com${post.permalink}`, publishedAt: new Date(post.createdUtc * 1000).toISOString(),
      capturedAt: snapshot.capturedAt, source: 'reddit-insights',
      sourceUrl: snapshot.sourceUrl, sourceRevision: snapshot.sourceRevision,
      commentCount: post.commentCount,
      comments: snapshot.comments.filter((comment) => comment.postId === post.id).slice(0, 3).map((comment) => comment.body),
    }));
}
