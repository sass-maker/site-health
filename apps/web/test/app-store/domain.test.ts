import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  appleId,
  appleSearchUrl,
  auditDraft,
  backupBytes,
  backupText,
  BACKUP_LIMIT,
  cell,
  emptyWorkspace,
  estimates,
  exportCsv,
  keyId,
  keywordBytes,
  mergeWorkspace,
  normalizeTerm,
  parseApp,
  parseKeywords,
  parseObservation,
  readBackup,
  retain,
  safeAppleUrl,
  searchKey,
  trend,
  validateWorkspace,
  type App,
  type Observation,
  type Project,
  type Workspace,
} from '../../src/features/app-store/domain.ts';
import { pacedCapture, pause } from '../../src/features/app-store/api.ts';
const golden = JSON.parse(
  readFileSync(new URL('./source-data.json', import.meta.url), 'utf8'),
);
const now = '2026-10-25T10:00:00.000Z';
const app: App = {
  id: '904280696',
  name: 'Things 3',
  developer: 'Cultured Code',
  url: 'https://apps.apple.com/us/app/things-3/id904280696',
  description: 'Task planning',
  genre: 'Productivity',
  rating: 0,
  ratings: 0,
  price: '$49.99',
  version: '3',
};
const project: Project = {
  id: 'project-1',
  name: 'Things',
  app,
  platform: 'mac',
  countries: ['us'],
  keywords: ['things 3'],
  limit: 20,
  cadenceHours: 24,
  autoRefresh: false,
  createdAt: now,
  updatedAt: now,
};
const key = searchKey({ term: 'Things 3', country: 'us', platform: 'mac', limit: 20 });
const obs = (id = 'capture-1', apps: App[] = [app], at = now): Observation => ({
  id,
  fetchedAt: at,
  sourceUrl: appleSearchUrl(key),
  key,
  apps,
});
const workspace = (observations: Observation[] = [obs()]): Workspace => ({
  version: 1,
  projects: [project],
  observations,
  attempts: observations.map((o, i) => ({
    id: `attempt-${i}`,
    projectId: project.id,
    key: o.key,
    at: o.fetchedAt,
    status: 'success',
    observationId: o.id,
    cache: 'miss',
  })),
  drafts: [],
});
test('normalizes Unicode words without erasing language and binds all comparable parameters', () => {
  assert.equal(normalizeTerm(' Ｔａｓｋ   管理 '), 'task 管理');
  assert.deepEqual(parseKeywords('Task,task\nタスク管理; Notes'), ['task', 'タスク管理', 'notes']);
  assert.notEqual(keyId(key), keyId({ ...key, limit: 50 }));
  assert.throws(() => searchKey({ ...key, limit: 201 }));
  assert.throws(() => parseKeywords('a'.repeat(101)));
});
test('Apple lookup accepts numeric IDs or exact HTTPS Apple URL paths, not lookalike hosts', () => {
  assert.equal(appleId('https://apps.apple.com/us/app/things-3/id904280696?mt=12'), '904280696');
  for (const value of [
    'https://apps.apple.com.evil.test/id12',
    'https://apps.apple.com@evil.test/id12',
    'http://apps.apple.com/id12',
    'https://apps.apple.com:444/id12',
    'javascript:alert(1)',
    'https://itunes.apple.com/lookup?id=12',
  ])
    assert.equal(appleId(value), null);
  assert.equal(safeAppleUrl('javascript:alert(1)'), '');
});
test('six real study snapshots preserve source terms/platforms and real zero rating counts', () => {
  assert.equal(golden.observations.length, 6);
  for (const observation of golden.observations) {
    const url = new URL(observation.source);
    const query = searchKey({ term: observation.keyword, country: observation.country, platform: 'mac', limit: observation.resultLimit });
    assert.equal(new URL(appleSearchUrl(query)).searchParams.get('entity'), 'macSoftware');
    assert.equal(url.searchParams.get('term')?.toLowerCase(), query.term);
  }
  const first = parseApp(golden.observations[3].competitors[0], true);
  assert.equal(first.id, app.id);
  assert.equal(first.rating, 0);
  assert.equal(first.ratings, 0);
  assert.equal(golden.observations[3].position, 1);
});
test('successful absence, missing data and failure remain distinct; failure preserves evidence', () => {
  assert.equal(cell(emptyWorkspace(), project, key).presence.kind, 'unobserved');
  const found = workspace();
  assert.deepEqual(cell(found, project, key).presence, { kind: 'found', position: 1 });
  const absent = workspace([obs('absent', [])]);
  assert.equal(cell(absent, project, key).presence.kind, 'not-in-returned-results');
  const failed: Workspace = {
    ...found,
    attempts: [
      ...found.attempts,
      {
        id: 'failed',
        projectId: project.id,
        key,
        at: '2026-10-25T10:01:00.000Z',
        status: 'failure',
        message: 'Provider timed out',
      },
    ],
  };
  assert.equal(cell(failed, project, key).presence.kind, 'unavailable');
  assert.equal(cell(failed, project, key).observation?.id, 'capture-1');
});
test('trend compares identical coverage only and never turns absence into rank zero', () => {
  assert.equal(trend(app.id, obs('new'), obs('old', [])), 'Entered returned results');
  assert.equal(trend(app.id, obs('new', []), obs('old')), 'Left returned results');
  assert.equal(
    trend(app.id, obs(), { ...obs(), key: { ...key, limit: 50 } }),
    'No comparable capture',
  );
  assert.equal(trend(app.id, obs(), obs()), 'Unchanged');
});
test('estimates expose inputs/coverage and treat empty/unknown evidence as unknown', () => {
  assert.equal(estimates().competition.value, null);
  assert.equal(estimates(obs('empty', [])).targeting.value, null);
  const scored = estimates(obs());
  assert.equal(scored.targeting.value, 100);
  assert.equal(scored.competition.value, 0);
  assert.equal(scored.competition.coverage, 1);
  assert.deepEqual(scored.targeting.evidenceIds, ['capture-1']);
  assert.equal(estimates(obs('missing', [{ ...app, ratings: null }])).competition.value, null);
});
test('validated backup round trips, rejects unknown schema, duplicate IDs and dangling relations', () => {
  const w = workspace();
  assert.deepEqual(readBackup(backupText(w)), w);
  assert.throws(() => validateWorkspace({ ...w, version: 2 }));
  assert.throws(() => validateWorkspace({ ...w, projects: [project, project] }));
  assert.throws(() => validateWorkspace({ ...w, observations: [] }));
  assert.throws(() =>
    validateWorkspace({ ...w, observations: [{ ...obs(), sourceUrl: 'https://evil.test/' }] }),
  );
  assert.throws(() =>
    validateWorkspace({ ...w, projects: [{ ...project, app: { ...app, rating: 100 } }] }),
  );
  assert.throws(() => readBackup('a'.repeat(BACKUP_LIMIT + 1)));
});
test('invalid import and merge conflict leave both input workspaces unchanged', () => {
  const current = workspace();
  const original = backupText(current);
  assert.throws(() => readBackup('{bad'));
  const incoming = { ...current, projects: [{ ...project, name: 'Changed' }] };
  assert.throws(() => mergeWorkspace(current, incoming), /Conflicting/);
  assert.equal(backupText(current), original);
  assert.deepEqual(mergeWorkspace(current, readBackup(original)), current);
});
test('import reconstructs known fields, preventing prototype and credential payload propagation', () => {
  const w = JSON.parse(backupText(workspace()));
  w.FREE_AI_API_KEY = 'must-not-survive';
  w.projects[0].__proto__ = { polluted: true };
  const restored = validateWorkspace(w);
  assert.equal((restored as unknown as Record<string, unknown>).FREE_AI_API_KEY, undefined);
  assert.equal(({} as Record<string, unknown>).polluted, undefined);
  assert.ok(!backupText(restored).includes('must-not-survive'));
});
test('byte-aware retention always produces a restorable multilingual backup with valid references', () => {
  const apps = Array.from({ length: 100 }, (_, i) => ({
    ...app,
    id: String(i + 1),
    description: '界'.repeat(14000),
  }));
  const observations = Array.from({ length: 5 }, (_, i) => ({
    ...obs(`large-${i}`, apps, `2026-10-25T10:0${i}:00.000Z`),
    key: { ...key, limit: 200 },
    sourceUrl: appleSearchUrl({ ...key, limit: 200 }),
  }));
  const retained = retain(workspace(observations));
  assert.ok(retained.observations.length < 5);
  assert.ok(backupBytes(retained) <= BACKUP_LIMIT);
  assert.deepEqual(readBackup(backupText(retained)), retained);
  assert.equal(workspace(observations).observations.length, 5);
});
test('keyword audit uses conservative UTF-8 bytes for Japanese while title budgets use code points', () => {
  const draft = {
    id: 'draft',
    projectId: project.id,
    locale: 'ja-JP',
    name: 'あ'.repeat(30),
    subtitle: 'テスト',
    keywords: '語'.repeat(34),
    description: 'A description',
    updatedAt: now,
  };
  assert.equal(keywordBytes(draft.keywords), 102);
  assert.ok(auditDraft(draft).some((n) => n.includes('2 UTF-8 bytes')));
  assert.ok(!auditDraft(draft).some((n) => n.startsWith('Name is')));
});
test('CSV reports explicit states and neutralizes leading spreadsheet formulas', () => {
  const w = workspace();
  const dangerous = { ...project, keywords: ['=SUM(1+1)'] };
  const csv = exportCsv(w, dangerous);
  assert.ok(csv.includes("'=SUM(1+1)"));
  assert.ok(csv.includes('unobserved'));
  assert.ok(!csv.includes('unobserved","0"'));
});
test('collection cancellation stops quota waiting and sends no extra requests', async () => {
  const original = globalThis.fetch;
  let calls = 0;
  const controller = new AbortController();
  globalThis.fetch = async () => {
    calls++;
    return Response.json({ error: 'pacing' }, { status: 429, headers: { 'Retry-After': '1' } });
  };
  try {
    await assert.rejects(
      () => pacedCapture(key, controller.signal, () => controller.abort()),
      /Cancelled/,
    );
    assert.equal(calls, 1);
  } finally {
    globalThis.fetch = original;
  }
});
test('cached capture retains original source timestamp and is not refetched client-side', async () => {
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    Response.json({
      apps: [app],
      observation: obs(),
      sourceUrl: obs().sourceUrl,
      fetchedAt: now,
      cache: 'hit',
      expiresAt: '2026-10-25T10:15:00.000Z',
    });
  try {
    const result = await pacedCapture(key, new AbortController().signal, () => {});
    assert.equal(result.fetchedAt, now);
    assert.equal(result.observation?.fetchedAt, now);
    assert.equal(result.cache, 'hit');
  } finally {
    globalThis.fetch = original;
  }
});
test('pre-aborted delay settles immediately without a timer', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(() => pause(60000, controller.signal), /Cancelled/);
});

