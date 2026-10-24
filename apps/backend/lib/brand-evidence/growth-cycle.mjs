import { createHash, randomUUID } from 'node:crypto';
import { BrandEvidenceError, normalizeTimestamp } from './store.mjs';

export const GROWTH_KINDS = Object.freeze([
  'research', 'keyword-map', 'article', 'comparison', 'free-tool', 'page-fix',
  'index-check', 'fact-check', 'listicle-outreach', 'directory', 'social', 'report',
]);
export const GROWTH_QA = Object.freeze(['readability', 'originality', 'seo', 'claims', 'images', 'cta']);
const hash = (text) => createHash('sha256').update(text).digest('hex');
const REVIEW_KINDS = new Set(['research', 'keyword-map', 'index-check', 'fact-check', 'report']);
const fail = (message, status = 400) => { throw new BrandEvidenceError(message, status); };
const text = (value, label, max = 2000) => {
  if (typeof value !== 'string' || !value.trim() || value.length > max) fail(`${label} is required (maximum ${max} characters)`);
  return value.trim();
};
const url = (value) => {
  let parsed;
  try { parsed = new URL(value); } catch { fail('Evidence must have an absolute HTTP(S) URL'); }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) fail('Evidence URL must be credential-free HTTP(S)');
  return parsed.href;
};
const evidence = (value) => ({
  url: url(value?.url),
  observedAt: normalizeTimestamp(value?.observedAt),
  note: text(value?.note, 'evidence note'),
});
function sourceList(input, now) {
  if (!Array.isArray(input) || !input.length || input.length > 20) fail('Supply 1–20 source observations');
  const sources = input.map(evidence);
  if (sources.some((source) => Date.parse(source.observedAt) > Date.parse(now))) fail('Source observations cannot be in the future');
  return sources;
}

export function growthWeek(now) {
  const date = new Date(normalizeTimestamp(now));
  date.setUTCDate(date.getUTCDate() - ((date.getUTCDay() + 6) % 7));
  return date.toISOString().slice(0, 10);
}

// An evidence workflow inside the existing private brand store, not a second
// issue tracker. Delivery work links to the owning repo's issue/PR. There is no
// CMS, provider call, outreach send, scheduler or publication side effect here.
export class GrowthCycleStore {
  constructor(store) {
    this.store = store;
    store.database.exec(`CREATE TABLE IF NOT EXISTS brand_growth (
      project_id TEXT PRIMARY KEY REFERENCES brand_profiles(project_id),
      revision INTEGER NOT NULL, document_json TEXT NOT NULL
    )`);
  }

  view(projectId) {
    const row = this.store.database.prepare('SELECT * FROM brand_growth WHERE project_id = ?').get(projectId);
    const doc = row ? JSON.parse(row.document_json) : { revision: 0, cycles: [], tasks: [] };
    const profile = this.store.getProfile(projectId);
    const gaps = [];
    if (!profile) gaps.push('Save a brand profile first.');
    if (!profile?.targetCustomer) gaps.push('Define the target customer.');
    if (!profile?.brandUrl) gaps.push('Identify the product website.');
    if (!profile?.keywords?.length) gaps.push('Research buyer questions and search intent.');
    return { schema: 'site-health.growth.v1', projectId, ...doc, gaps,
      boundary: 'Plans, reviewer attestations and supplied receipts; no automatic publishing or independently verified growth claims.' };
  }

  mutate(projectId, input, now = new Date().toISOString()) {
    if (!input || typeof input !== 'object' || Array.isArray(input)) fail('Growth change must be a JSON object');
    now = normalizeTimestamp(now);
    return this.store.transaction(() => {
      if (!this.store.getProfile(projectId)) fail('Save a brand profile first');
      const doc = this.view(projectId);
      if (!Number.isInteger(input.revision) || input.revision !== doc.revision) fail('Growth revision changed; reload before retrying', 409);
      const command = input.command;
      if (command === 'plan') this.plan(doc, now);
      else if (command === 'add') this.add(doc, input, now);
      else {
        const task = doc.tasks.find((item) => item.id === input.taskId);
        if (!task) fail('Growth task not found in this project', 404);
        if (command === 'brief') {
          if (task.receipt) fail('Published work needs a new refresh task');
          task.brief = text(input.brief, 'brief', 10000);
          if (input.baseline !== undefined) task.baseline = text(input.baseline, 'baseline or explicit unavailable state');
          if (input.evidence !== undefined) task.evidence = sourceList(input.evidence, now);
          if (input.issueUrl !== undefined) task.issueUrl = input.issueUrl === null ? null : url(input.issueUrl);
          task.review = null;
          delete task.completion;
          task.status = task.draft ? 'draft' : 'open';
        } else if (command === 'draft') {
          if (task.receipt) fail('Published work needs a new refresh task');
          task.draft = { content: text(input.content, 'draft content', 100000), author: text(input.author, 'author', 200), updatedAt: now };
          task.draft.digest = hash(task.draft.content);
          task.review = null;
          delete task.completion;
          task.status = 'draft';
        } else if (command === 'review') this.review(task, input, now);
        else if (command === 'publish') this.publish(task, input, now);
        else if (command === 'complete') {
          if (!REVIEW_KINDS.has(task.kind) || task.receipt) fail('Content and distribution work need a reviewed draft and publication receipt', 409);
          task.completion = evidence(input.evidence);
          if (Date.parse(task.completion.observedAt) > Date.parse(now)) fail('Completion observation cannot be in the future');
          task.status = 'completed';
        }
        else if (command === 'measure') this.measure(task, input, now);
        else if (command === 'park') {
          task.parkReason = text(input.reason, 'park reason');
          task.status = 'parked';
        } else fail('Unknown growth command');
        if (command !== 'park') delete task.parkReason;
        task.updatedAt = now;
        (task.history ??= []).push({ command, at: now, status: task.status, digest: task.draft?.digest ?? null,
          ...(command === 'review' ? { review: structuredClone(task.review) } : {}),
          ...(command === 'publish' ? { receipt: structuredClone(task.receipt) } : {}),
          ...(command === 'measure' ? { measurement: structuredClone(task.measurement) } : {}),
          ...(command === 'complete' ? { completion: structuredClone(task.completion) } : {}),
          ...(command === 'brief' ? { brief: task.brief, baseline: task.baseline, evidence: structuredClone(task.evidence), issueUrl: task.issueUrl } : {}),
          ...(command === 'park' ? { reason: task.parkReason } : {}) });
      }
      doc.revision += 1;
      doc.updatedAt = now;
      // Keep only the durable document; readiness is derived from the profile.
      const { gaps, boundary, schema, projectId: ignored, ...durable } = doc;
      this.store.database.prepare(`INSERT INTO brand_growth(project_id, revision, document_json) VALUES (?, ?, ?)
        ON CONFLICT(project_id) DO UPDATE SET revision=excluded.revision, document_json=excluded.document_json`)
        .run(projectId, doc.revision, JSON.stringify(durable));
      return this.view(projectId);
    });
  }

  plan(doc, now) {
    const week = growthWeek(now);
    if (doc.cycles.some((cycle) => cycle.week === week)) return;
    const profile = this.store.getProfile(doc.projectId);
    const prompts = this.store.projectView(doc.projectId).observations
      .filter((row) => row.status === 'completed' && row.brandMentioned === false)
      .slice(0, 5).map((row) => ({ prompt: row.promptText, channel: row.channel, observedAt: row.observedAt, observationId: row.id }));
    doc.cycles.push({ week, createdAt: now, status: 'planned', observationGaps: doc.gaps, missingMentions: prompts });
    const seeds = [
      ['research', 'Review buyer questions, competitors and conversion evidence', 'Research qualified opportunities; unknown search volume and conversions remain unavailable.'],
      ['keyword-map', 'Map search intent to existing pages', 'Inspect existing URLs before proposing articles, comparisons or useful free tools. Prevent cannibalization.'],
      ['index-check', 'Check Google and AI crawler access', 'Review robots, canonical, sitemap, rendering and actual indexing evidence. Submission is not proof of indexing.'],
      ['fact-check', 'Check brand facts and conversion paths', 'Verify current features, pricing, claims, internal links, images and CTA events against product truth.'],
      ['report', 'Review this week’s changes and observed outcomes', 'Separate execution from comparable search, AI visibility and useful conversions. Create a sourced refresh only when evidence warrants it.'],
    ];
    for (const [kind, title, brief] of seeds) {
      if (doc.tasks.some((task) => task.kind === kind && !['measured', 'parked', 'completed'].includes(task.status))) continue;
      doc.tasks.push({ id: randomUUID(), kind, title, brief, keyword: null, targetUrl: profile.brandUrl,
        intent: kind, status: 'open', week, createdAt: now, updatedAt: now,
        baseline: null, evidence: [], issueUrl: null });
    }
  }

  add(doc, input, now) {
    const kind = input.kind;
    if (!GROWTH_KINDS.includes(kind)) fail('Unknown growth task kind');
    const intent = text(input.intent, 'intent', 300).toLowerCase();
    const targetUrl = url(input.targetUrl);
    const mapped = doc.tasks.filter((task) => task.intent === intent && task.status !== 'parked');
    const previous = mapped.find((task) => task.id === input.refreshOf);
    if (input.refreshOf && (!previous?.receipt || previous.targetUrl !== targetUrl)) fail('refreshOf must reference published work for this intent and URL in this project', 409);
    if (mapped.length && (!previous || mapped.some((task) => !task.receipt))) fail('This intent already maps to a page; reuse open work or cite published work with refreshOf', 409);
    const sources = sourceList(input.evidence, now);
    doc.tasks.push({ id: randomUUID(), kind, title: text(input.title, 'title', 300), intent, targetUrl,
      keyword: input.keyword ? text(input.keyword, 'keyword', 300) : null,
      brief: text(input.brief, 'brief', 10000), baseline: text(input.baseline, 'baseline or explicit unavailable state'),
      issueUrl: input.issueUrl ? url(input.issueUrl) : null, evidence: sources,
      refreshOf: previous?.id ?? null, status: 'open', week: growthWeek(now), createdAt: now, updatedAt: now });
  }

  review(task, input, now) {
    if (!task.draft || task.receipt || input.digest !== task.draft.digest) fail('Review must reference the current unpublished draft digest', 409);
    const reviewer = text(input.reviewer, 'reviewer', 200);
    if (reviewer === task.draft.author) fail('Use a separate reviewer');
    const checks = {};
    for (const name of GROWTH_QA) {
      const item = input.checks?.[name];
      if (typeof item?.passed !== 'boolean') fail(`QA check ${name} needs passed and a specific note`);
      checks[name] = { passed: item.passed, note: text(item.note, `${name} note`) };
    }
    task.review = { reviewer, digest: input.digest, checks, reviewedAt: now, kind: 'reviewer-attestation' };
    task.status = Object.values(checks).every((item) => item.passed) ? 'ready' : 'changes-requested';
  }

  publish(task, input, now) {
    if (task.status !== 'ready' || input.digest !== task.draft?.digest || task.review?.digest !== input.digest) fail('Current draft must pass QA before recording publication', 409);
    const receipt = evidence(input.receipt);
    if (['article', 'comparison', 'free-tool', 'page-fix'].includes(task.kind) && receipt.url !== task.targetUrl) fail('Publication receipt must match the mapped target URL');
    if (Date.parse(receipt.observedAt) < Date.parse(task.review.reviewedAt) || Date.parse(receipt.observedAt) > Date.parse(now)) fail('Publication observation must follow review and cannot be in the future');
    task.receipt = { ...receipt, revision: text(input.receipt.revision, 'published source revision', 200), digest: input.digest, kind: 'supplied-publication-receipt' };
    task.status = 'awaiting-evidence';
  }

  measure(task, input, now) {
    if (!task.receipt) fail('Record publication evidence first', 409);
    const observation = evidence(input.measurement);
    const start = normalizeTimestamp(input.measurement.windowStart);
    const end = normalizeTimestamp(input.measurement.windowEnd);
    if (Date.parse(start) < Date.parse(task.receipt.observedAt) || Date.parse(start) >= Date.parse(end) || Date.parse(end) > Date.parse(observation.observedAt) || Date.parse(observation.observedAt) > Date.parse(now)) fail('Measurement needs a completed post-publication window');
    const metrics = {};
    for (const name of ['impressions', 'clicks', 'visits', 'conversions', 'aiMentions', 'aiAnswers']) {
      const value = input.measurement[name];
      if (value !== undefined && value !== null && (!Number.isSafeInteger(value) || value < 0)) fail(`${name} must be a nonnegative count or null`);
      metrics[name] = value ?? null;
    }
    if (Object.values(metrics).every((value) => value === null)) fail('Supply at least one observed metric; unavailable is not zero');
    if (metrics.aiMentions !== null && (metrics.aiAnswers === null || metrics.aiMentions > metrics.aiAnswers)) fail('AI mentions need an answer denominator');
    const channel = input.measurement.aiChannel ?? null;
    if (metrics.aiAnswers !== null && !['api-model', 'consumer-assistant'].includes(channel)) fail('Keep API model and consumer-assistant measurements separate');
    task.measurement = { ...observation, ...metrics, aiChannel: channel, windowStart: start, windowEnd: end,
      attribution: text(input.measurement.attribution, 'property, filters, source and conversion event'),
      conclusion: text(input.measurement.conclusion, 'observed result and comparison limits'), recordedAt: now };
    task.status = 'measured';
  }
}
