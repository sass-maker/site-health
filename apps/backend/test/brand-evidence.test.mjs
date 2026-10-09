import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import { analyzeAnswer } from '../lib/brand-evidence/analysis.mjs';
import {
  applyTransfer,
  openMentionPilotExport,
  planTransfer,
  revertTransfer,
  verifyTransfer,
} from '../lib/brand-evidence/mentionpilot-transfer.mjs';
import { dueProjects, runApiModelCheck } from '../lib/brand-evidence/runner.mjs';
import { BrandEvidenceStore } from '../lib/brand-evidence/store.mjs';
import { startDashboardService } from '../lib/dashboard-backend/service.mjs';
import { DashboardStore } from '../lib/dashboard-backend/store.mjs';

const exportPath = fileURLToPath(new URL('./fixtures/brand-evidence/mentionpilot-export.synthetic.sql', import.meta.url));
const mapping = {
  schema: 'site-health.mentionpilot-mapping.v1',
  projects: { 'mp-alpha': 'alpha-site', beta: 'beta-site' },
};
const knownProjectIds = ['alpha-site', 'beta-site', 'other-site'];

function temporaryStore() {
  const path = join(mkdtempSync(join(tmpdir(), 'brand-evidence-')), 'brand-evidence.sqlite');
  return { store: new BrandEvidenceStore({ databasePath: path }), path };
}

function fixedClock(start = '2026-10-05T06:00:00.000Z') {
  let tick = Date.parse(start);
  return () => new Date((tick += 1000)).toISOString();
}

const alphaProfile = {
  brandName: 'Alphatool',
  aliases: ['Alpha Tool'],
  brandUrl: 'https://alphatool.example',
  competitors: [{ name: 'Betacorp' }],
};

test('analysis keeps MentionPilot verdicts: mention, list position, citation, competitors', () => {
  const analysis = analyzeAnswer('1. Betacorp\n2. Alphatool is reliable, see https://alphatool.example/pricing', alphaProfile);
  assert.equal(analysis.brandMentioned, true);
  assert.equal(analysis.brandPosition, 2);
  assert.equal(analysis.brandSentiment, 'positive');
  assert.equal(analysis.brandCited, true);
  assert.deepEqual(analysis.competitorsMentioned, [{ name: 'Betacorp', mentioned: true, position: 1 }]);
  assert.equal(analyzeAnswer('Nothing relevant here.', alphaProfile).brandMentioned, false);
});

test('a failed provider call is stored as a failure, never as a negative mention', () => {
  const { store } = temporaryStore();
  store.saveProfile('alpha-site', alphaProfile);
  store.recordObservation({
    projectId: 'alpha-site', channel: 'api-model', provider: 'free-ai', model: 'auto',
    promptText: 'best uptime tools?', status: 'error', errorMessage: 'Provider returned an error (503)',
    observedAt: '2026-10-01T00:00:00Z', analysis: { brandMentioned: false },
  });
  store.recordObservation({
    projectId: 'alpha-site', channel: 'api-model', provider: 'free-ai', model: 'auto',
    promptText: 'best uptime tools?', status: 'completed', answerText: 'Alphatool',
    observedAt: '2026-10-01T00:01:00Z', analysis: analyzeAnswer('Alphatool', alphaProfile),
  });
  store.recordObservation({
    projectId: 'alpha-site', channel: 'consumer-assistant', provider: 'chatgpt-web', model: 'consumer-ui',
    promptText: 'best uptime tools?', status: 'completed', answerText: 'Betacorp only',
    observedAt: '2026-10-01T00:02:00Z', analysis: analyzeAnswer('Betacorp only', alphaProfile),
  });
  const [, , failed] = store.listObservations('alpha-site');
  assert.equal(failed.status, 'error');
  assert.equal(failed.brandMentioned, null);
  assert.equal(failed.answerText, null);
  assert.throws(() => store.database.prepare(`
    INSERT INTO evidence_observations(id, project_id, channel, provider, model, prompt_text, status, brand_mentioned, observed_at, fingerprint, source)
    VALUES ('x', 'alpha-site', 'api-model', 'p', 'm', 't', 'error', 0, '2026-10-01T00:00:00Z', 'f', 'test')
  `).run());
  const summary = store.summary('alpha-site');
  assert.deepEqual(
    { completed: summary.channels['api-model'].completed, error: summary.channels['api-model'].error, rate: summary.channels['api-model'].mentionRate },
    { completed: 1, error: 1, rate: 1 },
  );
  assert.equal(summary.channels['consumer-assistant'].mentionRate, 0);
  assert.equal(store.summary('beta-site').channels['api-model'].completed, 0);
  store.close();
});

test('provider settings refuse credentials', () => {
  const { store } = temporaryStore();
  assert.throws(() => store.saveProfile('alpha-site', { ...alphaProfile, provider: { mode: 'custom-endpoint', endpointUrl: 'https://x.example', model: 'm', apiKey: 'secret' } }), /credentials/);
  store.close();
});

test('API model check records completed, errored and empty answers through the gateway', async () => {
  const { store, path } = temporaryStore();
  store.saveProfile('alpha-site', { ...alphaProfile, schedule: 'daily' });
  for (const prompt of ['first prompt', 'second prompt', 'third prompt']) store.addPrompt('alpha-site', prompt);
  const skipped = await runApiModelCheck({ store, projectId: 'alpha-site', env: {}, fetchImpl: () => assert.fail('no call without a key') });
  assert.equal(skipped.status, 'skipped');
  const calls = [];
  const replies = [
    { status: 200, body: { model: 'synthetic/model', choices: [{ message: { content: '1. Alphatool https://alphatool.example' } }] } },
    { status: 503, body: {} },
    { status: 200, body: { choices: [{ message: { content: '' } }] } },
  ];
  const result = await runApiModelCheck({
    store,
    projectId: 'alpha-site',
    env: { AI_GATEWAY_API_KEY: 'synthetic-gateway-key' },
    now: fixedClock(),
    fetchImpl: async (url, init) => {
      calls.push({ url, headers: init.headers, body: JSON.parse(init.body) });
      const reply = replies[calls.length - 1];
      return new Response(JSON.stringify(reply.body), { status: reply.status });
    },
  });
  assert.equal(result.status, 'partial');
  assert.deepEqual([result.completed, result.failed, result.mentionRate], [1, 2, 1]);
  assert.equal(calls[0].url, 'https://ai-gateway.sassmaker.com/v1/chat/completions');
  assert.equal(calls[0].headers['x-gateway-project-id'], 'site-health');
  assert.equal(calls[0].body.model, 'auto');
  const statuses = store.listObservations('alpha-site').map((row) => [row.promptText, row.status, row.brandMentioned]).sort();
  assert.deepEqual(statuses, [
    ['first prompt', 'completed', true],
    ['second prompt', 'error', null],
    ['third prompt', 'unavailable', null],
  ]);
  assert.equal(store.listObservations('alpha-site').find((row) => row.status === 'error').errorMessage, 'Provider returned an error (503)');
  store.close();
  assert.equal(readFileSync(path).includes('synthetic-gateway-key'), false);
  const reopened = new BrandEvidenceStore({ databasePath: path });
  assert.deepEqual(dueProjects(reopened, { now: '2026-10-05T12:00:00.000Z' }), []);
  assert.deepEqual(dueProjects(reopened, { now: '2026-10-06T06:00:00.000Z' }), ['alpha-site']);
  reopened.close();
});

test('MentionPilot transfer plans, applies, verifies and reverts one reversible batch', () => {
  const { store, path } = temporaryStore();
  const source = openMentionPilotExport(exportPath);
  const plan = planTransfer({ store, source, mapping, knownProjectIds });
  assert.equal(plan.mode, 'plan');
  assert.deepEqual(plan.unmapped.map((project) => project.slug), ['gamma']);
  assert.equal(store.listProfiles().length, 0, 'planning writes nothing');

  const applied = applyTransfer({ store, source, mapping, knownProjectIds, now: () => '2026-10-09T00:00:00.000Z' });
  const alpha = applied.projects.find((project) => project.targetProjectId === 'alpha-site');
  assert.deepEqual(alpha.source, {
    profile: 1, prompt: 2, check: 2, observation: 3, finding: 1, history: 1, action: 1,
    observationStatuses: { completed: 1, unavailable: 1, error: 1 },
  });
  assert.equal(alpha.outcome.observation.inserted, 3);

  const alphaView = store.projectView('alpha-site');
  assert.equal(alphaView.profile.schedule, 'daily');
  assert.deepEqual(alphaView.profile.communities, ['r/synthetic']);
  const byId = Object.fromEntries(alphaView.observations.map((row) => [row.status, row]));
  assert.equal(byId.completed.brandMentioned, true);
  assert.equal(byId.completed.brandPosition, 1);
  assert.deepEqual(byId.completed.citations, ['https://alphatool.example/docs']);
  assert.equal(byId.completed.observedAt, '2026-09-01T06:00:20.000Z');
  assert.equal(byId.error.brandMentioned, null);
  assert.equal(byId.error.errorMessage, 'Provider returned an error (503)');
  assert.equal(byId.unavailable.brandMentioned, null);
  assert.equal(byId.unavailable.promptText, 'Alphatool vs Betacorp?', 'legacy rows recover prompt text from the prompt list');
  assert.deepEqual(alphaView.checks.map((check) => check.status).sort(), ['incomplete', 'partial']);
  assert.equal(alphaView.findings[0].status, 'reviewed');
  assert.equal(alphaView.actions[0].subjectId, alphaView.findings[0].id);
  assert.equal(alphaView.history[0].note, 'Worth a reply');

  const beta = store.getProfile('beta-site');
  assert.deepEqual(beta.provider, {
    mode: 'custom-endpoint',
    endpointUrl: 'https://llm.example/v1/chat/completions',
    model: 'synthetic-model',
    keyPresentAtSource: true,
  });
  assert.match(applied.projects.find((project) => project.targetProjectId === 'beta-site').warnings.join(' '), /not transferred/);
  assert.equal(store.projectView('beta-site').observations[0].status, 'error');
  assert.equal(store.countsFor('other-site').observations, 0);

  const verified = verifyTransfer({ store, source, batchId: applied.batchId });
  assert.deepEqual(verified.problems, []);
  assert.equal(verified.verified, true);

  const again = applyTransfer({ store, source, mapping, knownProjectIds });
  assert.equal(again.projects.find((project) => project.targetProjectId === 'alpha-site').outcome.observation.alreadyPresent, 3);
  assert.equal(store.countsFor('alpha-site').observations, 3, 're-applying never duplicates');
  revertTransfer({ store, batchId: again.batchId });

  const action = store.createAction('alpha-site', { subjectKind: 'observation', subjectId: byId.completed.id, title: 'Publish a comparison page' });
  assert.throws(() => revertTransfer({ store, batchId: applied.batchId }), /attached to imported evidence/);
  store.database.prepare('DELETE FROM evidence_history WHERE source = ?').run('site-health');
  store.database.prepare('DELETE FROM evidence_actions WHERE id = ?').run(action.id);

  const reverted = revertTransfer({ store, batchId: applied.batchId });
  assert.equal(reverted.removed.observation, 4);
  assert.deepEqual(store.countsFor('alpha-site'), { profiles: 0, prompts: 0, checks: 0, observations: 0, findings: 0, actions: 0, history: 0 });
  assert.equal(verifyTransfer({ store, source, batchId: applied.batchId }).verified, false);
  source.database.close();
  store.close();
  const bytes = readFileSync(path);
  for (const secret of ['synthetic-byok-key-not-real', 'synthetic-legacy-key-not-real', 'synthetic-session-hash', 'owner@example.invalid']) {
    assert.equal(bytes.includes(secret), false, `${secret} must never be copied`);
  }
});

test('transfer links duplicate observations instead of inserting them twice', () => {
  const { store } = temporaryStore();
  store.recordObservation({
    projectId: 'alpha-site', channel: 'api-model', provider: 'free-ai', model: 'synthetic/auto-model',
    promptText: 'What are the best uptime tools for indie founders?', status: 'completed',
    answerText: '1. Alphatool is a reliable choice. 2. Betacorp. See https://alphatool.example/docs',
    observedAt: '2026-09-01T06:00:20Z', analysis: { brandMentioned: true },
  });
  const source = openMentionPilotExport(exportPath);
  const applied = applyTransfer({ store, source, mapping, knownProjectIds });
  const alpha = applied.projects.find((project) => project.targetProjectId === 'alpha-site');
  assert.equal(alpha.outcome.observation.linkedDuplicate, 1);
  assert.equal(store.countsFor('alpha-site').observations, 3);
  assert.equal(verifyTransfer({ store, source, batchId: applied.batchId }).verified, true);
  source.database.close();
  store.close();
});

test('transfer mapping enforces project isolation and catalog ids', () => {
  const { store } = temporaryStore();
  const source = openMentionPilotExport(exportPath);
  assert.throws(() => planTransfer({
    store, source, knownProjectIds,
    mapping: { schema: mapping.schema, projects: { 'mp-alpha': 'alpha-site', 'mp-beta': 'alpha-site' } },
  }), /two MentionPilot projects/);
  assert.throws(() => planTransfer({
    store, source, knownProjectIds,
    mapping: { schema: mapping.schema, projects: { 'mp-alpha': 'not-in-catalog' } },
  }), /not in the catalog/);
  source.database.close();
  store.close();
});

test('service exposes one project at a time and runs the evidence-to-action flow', async (context) => {
  const dashboard = new DashboardStore({
    databasePath: join(mkdtempSync(join(tmpdir(), 'brand-evidence-service-')), 'dashboard.sqlite'),
    projects: [],
  });
  const { store } = temporaryStore();
  const source = openMentionPilotExport(exportPath);
  applyTransfer({ store, source, mapping, knownProjectIds });
  source.database.close();
  const projects = knownProjectIds.map((id) => ({ id, name: id, status: 'live' }));
  const server = await startDashboardService({
    store: dashboard,
    port: 0,
    trustLoopback: false,
    ownerToken: 'owner-test-token',
    projectionProvider: () => ({ outcomes: {} }),
    visibilityPortfolio: { eligible: [], scheduleIntent: { enabled: false } },
    projectsProvider: () => projects,
    brandEvidenceStore: store,
    brandEvidenceEnv: {},
  });
  context.after(() => new Promise((resolve) => server.close(() => {
    dashboard.close();
    store.close();
    resolve();
  })));
  const base = `http://127.0.0.1:${server.address().port}`;
  const owner = { authorization: 'Bearer owner-test-token', 'content-type': 'application/json' };

  const list = await (await fetch(`${base}/v1/brand-evidence/projects`)).json();
  assert.deepEqual(list.profiles.map((profile) => profile.projectId).sort(), ['alpha-site', 'beta-site']);
  assert.equal((await fetch(`${base}/v1/projects/unknown/brand-evidence`)).status, 404);

  const alpha = await (await fetch(`${base}/v1/projects/alpha-site/brand-evidence`)).json();
  const beta = await (await fetch(`${base}/v1/projects/beta-site/brand-evidence`)).json();
  assert.ok(alpha.observations.every((row) => row.projectId === 'alpha-site'));
  const completed = alpha.observations.find((row) => row.status === 'completed');

  const unauthenticated = await fetch(`${base}/v1/projects/alpha-site/brand-evidence/actions`, {
    method: 'POST', body: JSON.stringify({ subjectKind: 'observation', subjectId: completed.id }),
  });
  assert.equal(unauthenticated.status, 401);

  const crossProject = await fetch(`${base}/v1/projects/beta-site/brand-evidence/actions`, {
    method: 'POST', headers: owner, body: JSON.stringify({ subjectKind: 'observation', subjectId: completed.id }),
  });
  assert.equal(crossProject.status, 404, 'an action can only cite evidence from its own project');

  const created = await fetch(`${base}/v1/projects/alpha-site/brand-evidence/actions`, {
    method: 'POST', headers: owner,
    body: JSON.stringify({ subjectKind: 'observation', subjectId: completed.id, title: 'Add a comparison page citing the docs' }),
  });
  assert.equal(created.status, 201);
  const action = await created.json();
  const done = await (await fetch(`${base}/v1/projects/alpha-site/brand-evidence/actions/${action.id}`, {
    method: 'POST', headers: owner, body: JSON.stringify({ status: 'completed' }),
  })).json();
  assert.equal(done.status, 'completed');

  const finding = alpha.findings[0];
  const resolved = await (await fetch(`${base}/v1/projects/alpha-site/brand-evidence/findings/${finding.id}`, {
    method: 'POST', headers: owner, body: JSON.stringify({ status: 'resolved', note: 'Replied' }),
  })).json();
  assert.equal(resolved.status, 'resolved');
  assert.equal((await fetch(`${base}/v1/projects/beta-site/brand-evidence/findings/${finding.id}`, {
    method: 'POST', headers: owner, body: JSON.stringify({ status: 'dismissed' }),
  })).status, 404);

  const check = await (await fetch(`${base}/v1/projects/alpha-site/brand-evidence/checks`, { method: 'POST', headers: owner })).json();
  assert.equal(check.status, 'skipped', 'no gateway key means no attempt and no fabricated failure');

  const after = await (await fetch(`${base}/v1/projects/alpha-site/brand-evidence`)).json();
  assert.deepEqual(after.history.slice(0, 3).map((entry) => entry.action), ['resolved', 'action-completed', 'action-created']);
  assert.equal(after.summary.openActions, 1, 'the imported open task remains open');
  assert.equal(beta.summary.channels['api-model'].error, 1);
});
