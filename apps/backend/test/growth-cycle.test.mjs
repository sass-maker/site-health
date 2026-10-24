import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { GrowthCycleStore, GROWTH_QA, growthWeek } from '../lib/brand-evidence/growth-cycle.mjs';
import { BrandEvidenceStore } from '../lib/brand-evidence/store.mjs';
import { startDashboardService } from '../lib/dashboard-backend/service.mjs';
import { DashboardStore } from '../lib/dashboard-backend/store.mjs';

const now = '2026-10-19T12:00:00.000Z';
const source = { url: 'https://example.com/research', observedAt: now, note: 'Observed category intent; traffic metrics unavailable.' };
const opportunity = { command: 'add', kind: 'comparison', intent: 'alpha vs beta', title: 'Alpha vs Beta', keyword: 'alpha vs beta',
  targetUrl: 'https://alpha.example/vs/beta', brief: 'For founders comparing the actual features. Cite pricing sources and use signup CTA.',
  baseline: 'Search and conversion baselines unavailable.', evidence: [source] };
const checks = (passed = true) => Object.fromEntries(GROWTH_QA.map((key) => [key, { passed, note: `${key}: checked in the synthetic preview.` }]));
function setup(t) {
  const store = new BrandEvidenceStore({ databasePath: ':memory:' });
  t.after(() => store.close());
  store.saveProfile('alpha', { brandName: 'Alpha', brandUrl: 'https://alpha.example', keywords: ['uptime'], targetCustomer: 'Founders' });
  store.saveProfile('beta', { brandName: 'Beta' });
  const growth = new GrowthCycleStore(store);
  const apply = (input, at = now, project = 'alpha') => growth.mutate(project, { revision: growth.view(project).revision, ...input }, at);
  return { store, growth, apply };
}

test('weekly planning carries measured absence with its channel, deduplicates open work and preserves gaps', (t) => {
  const { store, growth, apply } = setup(t);
  store.recordObservation({ projectId: 'alpha', channel: 'consumer-assistant', provider: 'synthetic', model: 'ui',
    promptText: 'best tools?', status: 'completed', answerText: 'Beta', observedAt: now, analysis: { brandMentioned: false } });
  store.recordObservation({ projectId: 'alpha', channel: 'api-model', provider: 'synthetic', model: 'auto',
    promptText: 'failed prompt', status: 'error', observedAt: now });
  assert.equal(growthWeek('2026-10-25T23:59:59Z'), '2026-10-19');
  let view = apply({ command: 'plan' });
  assert.equal(view.tasks.length, 5);
  assert.equal(view.cycles[0].missingMentions.length, 1);
  assert.equal(view.cycles[0].missingMentions[0].channel, 'consumer-assistant');
  view = apply({ command: 'plan' });
  assert.equal(view.cycles.length, 1);
  view = apply({ command: 'plan' }, '2026-10-26T12:00:00Z');
  assert.equal(view.cycles.length, 2);
  assert.equal(view.tasks.length, 5);
  assert.ok(growth.view('beta').gaps.length > 0);
  assert.equal(growth.view('beta').tasks.length, 0);
  assert.throws(() => growth.mutate('missing', { command: 'plan', revision: 0 }), /profile/);
});

test('intent mapping, project isolation and revision checks prevent duplicate or stale writes', (t) => {
  const { growth, apply } = setup(t);
  const view = apply(opportunity);
  assert.throws(() => apply({ ...opportunity, targetUrl: 'https://alpha.example/another-page' }), /already maps/);
  assert.throws(() => growth.mutate('alpha', { ...opportunity, revision: 0 }), /revision changed/);
  assert.equal(growth.view('alpha').revision, 1, 'failed operations roll back');
  assert.throws(() => apply({ command: 'draft', taskId: view.tasks[0].id, author: 'writer', content: 'text' }, now, 'beta'), /not found/);
  assert.throws(() => apply({ ...opportunity, intent: 'new intent', evidence: [{ ...source, url: 'https://secret:password@example.com' }] }), /credential-free/);
});

test('research completion retains evidence and allows a new weekly review without bypassing content QA', (t) => {
  const { apply } = setup(t);
  const taskId = apply({ command: 'plan' }).tasks[0].id;
  let view = apply({ command: 'complete', taskId, evidence: source });
  assert.equal(view.tasks[0].status, 'completed');
  assert.equal(view.tasks[0].completion.note, source.note);
  view = apply({ command: 'plan' }, '2026-10-26T12:00:00Z');
  assert.equal(view.tasks.filter((task) => task.kind === 'research').length, 2);
  const articleId = apply(opportunity).tasks.at(-1).id;
  assert.throws(() => apply({ command: 'complete', taskId: articleId, evidence: source }), /reviewed draft/);
});

test('draft revisions invalidate QA and publication requires an independent exact-draft review', (t) => {
  const { apply } = setup(t);
  const taskId = apply(opportunity).tasks[0].id;
  let task = apply({ command: 'draft', taskId, content: 'Synthetic comparison draft', author: 'writer' }).tasks[0];
  const oldDigest = task.draft.digest;
  assert.throws(() => apply({ command: 'publish', taskId, digest: oldDigest, receipt: source }), /pass QA/);
  assert.throws(() => apply({ command: 'review', taskId, digest: oldDigest, reviewer: 'writer', checks: checks() }), /separate reviewer/);
  task = apply({ command: 'review', taskId, digest: oldDigest, reviewer: 'qa', checks: checks(false) }).tasks[0];
  assert.equal(task.status, 'changes-requested');
  task = apply({ command: 'draft', taskId, content: 'Revised comparison draft', author: 'writer' }).tasks[0];
  assert.equal(task.review, null);
  assert.throws(() => apply({ command: 'review', taskId, digest: oldDigest, reviewer: 'qa', checks: checks() }), /current unpublished/);
  task = apply({ command: 'review', taskId, digest: task.draft.digest, reviewer: 'qa', checks: checks() }).tasks[0];
  assert.equal(task.status, 'ready');
  assert.throws(() => apply({ command: 'publish', taskId, digest: task.draft.digest, receipt: { ...source, revision: 'abc123' } }), /mapped target URL/);
  task = apply({ command: 'publish', taskId, digest: task.draft.digest, receipt: { ...source, url: opportunity.targetUrl, revision: 'abc123' } }).tasks[0];
  assert.equal(task.status, 'awaiting-evidence');
  assert.equal(task.receipt.kind, 'supplied-publication-receipt');
  assert.throws(() => apply({ command: 'draft', taskId, content: 'rewrite published', author: 'writer' }), /refresh task/);
});

test('measurement keeps unknown distinct from zero and requires post-publication attribution and AI denominators', (t) => {
  const { apply } = setup(t);
  const taskId = apply(opportunity).tasks[0].id;
  let task = apply({ command: 'draft', taskId, content: 'Draft', author: 'writer' }).tasks[0];
  apply({ command: 'review', taskId, digest: task.draft.digest, reviewer: 'qa', checks: checks() });
  apply({ command: 'publish', taskId, digest: task.draft.digest, receipt: { ...source, url: opportunity.targetUrl, revision: 'abc123' } });
  const measurement = { ...source, observedAt: '2026-10-27T12:00:00Z', windowStart: '2026-10-20T00:00:00Z', windowEnd: '2026-10-27T00:00:00Z',
    attribution: 'Synthetic analytics, landing URL /vs/beta, event signup, all sources.', conclusion: 'Observed only; no comparable pre-period or causal claim.' };
  const measuredAt = '2026-10-27T12:00:00Z';
  assert.throws(() => apply({ command: 'measure', taskId, measurement }, measuredAt), /at least one/);
  assert.throws(() => apply({ command: 'measure', taskId, measurement: { ...measurement, aiMentions: 3, aiAnswers: 2, aiChannel: 'api-model' } }, measuredAt), /denominator/);
  assert.throws(() => apply({ command: 'measure', taskId, measurement: { ...measurement, clicks: 2, windowStart: '2026-10-01T00:00:00Z' } }, measuredAt), /post-publication/);
  task = apply({ command: 'measure', taskId, measurement: { ...measurement, clicks: 0 } }, measuredAt).tasks[0];
  assert.equal(task.status, 'measured');
  assert.equal(task.measurement.clicks, 0);
  assert.equal(task.measurement.conversions, null);
  const refreshed = apply({ ...opportunity, refreshOf: taskId }, measuredAt);
  assert.equal(refreshed.tasks[1].refreshOf, taskId);
});

test('growth routes use the existing owner gate, catalog scope and conflict responses', async (t) => {
  const { store } = setup(t);
  const projects = [{ id: 'alpha' }, { id: 'beta' }];
  const dashboard = new DashboardStore({ databasePath: join(mkdtempSync(join(tmpdir(), 'growth-service-')), 'dashboard.sqlite'), projects });
  const service = await startDashboardService({ store: dashboard, brandEvidenceStore: store, port: 0,
    ownerToken: 'fixture-owner', now: () => now, projectionProvider: () => ({ outcomes: {} }),
    projectsProvider: () => projects, visibilityPortfolio: { eligible: [], scheduleIntent: { enabled: false } } });
  t.after(() => new Promise((resolve) => service.close(() => { dashboard.close(); resolve(); })));
  const base = `http://127.0.0.1:${service.address().port}/v1/projects`;
  const headers = { authorization: 'Bearer fixture-owner', 'content-type': 'application/json' };
  const post = (project, input, authorized = true) => fetch(`${base}/${project}/brand-evidence/growth`, {
    method: 'POST', headers: authorized ? headers : {}, body: JSON.stringify(input),
  });
  assert.equal((await post('alpha', { command: 'plan', revision: 0 }, false)).status, 401);
  assert.equal((await post('unknown', { command: 'plan', revision: 0 })).status, 404);
  const created = await post('alpha', { command: 'plan', revision: 0 });
  assert.equal(created.status, 200);
  assert.equal((await created.json()).tasks.length, 5);
  assert.equal((await post('alpha', { command: 'plan', revision: 0 })).status, 409);
  const beta = await (await fetch(`${base}/beta/brand-evidence/growth`)).json();
  assert.equal(beta.tasks.length, 0);
});
