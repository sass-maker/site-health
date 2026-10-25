import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyWorkspace,
  appleSearchUrl,
  removeProject,
  importSummary,
  type Workspace,
  type ListingDraft,
  type Project,
  type App,
} from '../../src/features/app-store/domain.ts';
import {
  commitWorkspace,
  persistDraft,
  DraftConflictError,
  SaveError,
  withDraftGuard,
} from '../../src/features/app-store/persistence.ts';
import { ConflictError, StoredDataError } from '../../src/features/app-store/storage.ts';
const now = '2026-10-25T10:00:00.000Z';
const app: App = {
  id: '1',
  name: 'One',
  developer: 'Dev',
  url: 'https://apps.apple.com/us/app/one/id1',
  description: 'Text',
  genre: 'Productivity',
  rating: null,
  ratings: null,
  price: 'Free',
  version: '1',
};
const project: Project = {
  id: 'p',
  name: 'One',
  app,
  platform: 'ios',
  countries: ['us'],
  keywords: ['one'],
  limit: 200,
  cadenceHours: 0,
  autoRefresh: false,
  createdAt: now,
  updatedAt: now,
};
const key = { term: 'one', country: 'us', platform: 'ios' as const, limit: 200 };
const draft: ListingDraft = {
  id: 'draft',
  projectId: 'p',
  locale: 'en-US',
  name: 'Original',
  subtitle: 'Sub',
  keywords: 'one',
  description: 'Text',
  updatedAt: now,
};
const base = (): Workspace => ({ ...emptyWorkspace(), projects: [project], drafts: [draft] });
test('revision conflict re-reads and reapplies pure capture update without losing other-tab drafts', async () => {
  let current = { revision: 2, data: { ...base(), drafts: [{ ...draft, name: 'Other tab' }] } };
  let calls = 0;
  const observation = {
    id: 'obs',
    key,
    sourceUrl: appleSearchUrl(key),
    fetchedAt: now,
    apps: [app],
  };
  const result = await commitWorkspace(
    {
      read: async () => current,
      write: async (data, revision) => {
        calls++;
        if (revision !== current.revision) throw new ConflictError();
        current = { revision: revision + 1, data };
        return current;
      },
    },
    { revision: 1, data: base() },
    (data) => ({
      ...data,
      observations: [...data.observations, observation],
      attempts: [
        ...data.attempts,
        {
          id: 'success',
          projectId: 'p',
          key,
          at: now,
          status: 'success',
          cache: 'miss',
          observationId: 'obs',
        },
      ],
    }),
  );
  assert.equal(calls, 2);
  assert.equal(result.data.drafts[0].name, 'Other tab');
  assert.equal(result.data.observations[0].id, 'obs');
  assert.equal(result.data.attempts[0].status, 'success');
});
test('storage retries are bounded and provide valid capture recovery without provider failure records', async () => {
  let calls = 0;
  const observation = {
    id: 'obs',
    key,
    sourceUrl: appleSearchUrl(key),
    fetchedAt: now,
    apps: [app],
  };
  await assert.rejects(
    () =>
      commitWorkspace(
        {
          read: async () => ({ revision: calls, data: base() }),
          write: async () => {
            calls++;
            throw new ConflictError('busy');
          },
        },
        { revision: 0, data: base() },
        (data) => ({ ...data, observations: [observation] }),
      ),
    (e) =>
      e instanceof SaveError &&
      e.recovery.observations[0].id === 'obs' &&
      e.recovery.attempts.length === 0,
  );
  assert.equal(calls, 3);
});
test('failed draft commit leaves base unchanged; refreshed retry and subsequent edits save', async () => {
  let current = base();
  let marker = draft.updatedAt;
  let reject = true;
  const change = async (update: (data: Workspace) => Workspace) => {
    const next = update(current);
    if (reject) throw new Error('Disk full');
    current = next;
  };
  const next = { ...draft, name: 'Mine', updatedAt: '2026-10-25T10:01:00.000Z' };
  await assert.rejects(async () => {
    marker = await persistDraft(change, next, marker);
  });
  assert.equal(marker, draft.updatedAt);
  assert.equal(current.drafts[0].name, 'Original');
  reject = false;
  marker = await persistDraft(change, next, marker);
  marker = await persistDraft(
    change,
    { ...next, name: 'Edited again', updatedAt: '2026-10-25T10:02:00.000Z' },
    marker,
  );
  assert.equal(current.drafts[0].name, 'Edited again');
  assert.equal(marker, '2026-10-25T10:02:00.000Z');
});
test('true draft conflict exposes saved text and supports explicit keep-mine or load-saved recovery', async () => {
  const other = { ...draft, name: 'Theirs', updatedAt: '2026-10-25T10:01:00.000Z' };
  let current = { ...base(), drafts: [other] };
  const change = async (update: (data: Workspace) => Workspace) => {
    current = update(current);
  };
  const mine = { ...draft, name: 'Mine', updatedAt: '2026-10-25T10:02:00.000Z' };
  await assert.rejects(
    () => persistDraft(change, mine, draft.updatedAt),
    (e) => e instanceof DraftConflictError && e.latest.name === 'Theirs',
  );
  await persistDraft(change, mine, other.updatedAt);
  assert.equal(current.drafts[0].name, 'Mine');
});
test('navigation, restore and backup actions wait for successful draft flush and stay blocked on failure', async () => {
  let moved = false;
  let finish: (ok: boolean) => void = () => {};
  const guard = () =>
    new Promise<boolean>((resolve) => {
      finish = resolve;
    });
  const action = withDraftGuard(guard, () => {
    moved = true;
  });
  assert.equal(moved, false);
  finish(false);
  assert.equal(await action, false);
  assert.equal(moved, false);
  assert.equal(
    await withDraftGuard(
      async () => true,
      () => {
        moved = true;
      },
    ),
    true,
  );
  assert.equal(moved, true);
});
test('invalid stored records retain a raw exportable recovery payload', () => {
  const raw = { revision: 3, data: { version: 99, privateNote: 'Keep this local text' } };
  const error = new StoredDataError(new Error('Unknown version'), raw);
  assert.equal(JSON.parse(JSON.stringify(error.raw)).data.privateNote, 'Keep this local text');
});
test('project deletion cleans its drafts/attempts but preserves captures referenced elsewhere', () => {
  const second = { ...project, id: 'q' };
  const shared = { id: 'shared', key, sourceUrl: appleSearchUrl(key), fetchedAt: now, apps: [app] };
  const only = { ...shared, id: 'only' };
  const attempt = (id: string, projectId: string, observationId: string) => ({
    id,
    projectId,
    key,
    at: now,
    status: 'success' as const,
    cache: 'miss' as const,
    observationId,
  });
  const w = {
    ...base(),
    projects: [project, second],
    observations: [shared, only],
    attempts: [
      attempt('p-shared', 'p', 'shared'),
      attempt('p-only', 'p', 'only'),
      attempt('q-shared', 'q', 'shared'),
    ],
  };
  const removed = removeProject(w, 'p');
  assert.deepEqual(
    removed.projects.map((p) => p.id),
    ['q'],
  );
  assert.equal(removed.drafts.length, 0);
  assert.deepEqual(
    removed.observations.map((o) => o.id),
    ['shared'],
  );
  assert.equal(removed.attempts.length, 1);
  assert.equal(w.observations.length, 2);
});
test('merge preview discloses retention trimming without silently trimming project/draft limits', () => {
  const incoming = { ...base(), projects: [{ ...project, id: 'q' }], drafts: [] };
  const preview = importSummary(base(), incoming, 'merge');
  assert.equal(preview.workspace.projects.length, 2);
  assert.equal(preview.trimmedCaptures, 0);
  assert.throws(
    () =>
      importSummary(
        {
          ...emptyWorkspace(),
          projects: Array.from({ length: 20 }, (_, i) => ({ ...project, id: `p${i}` })),
        },
        incoming,
        'merge',
      ),
    /at most 20/,
  );
});
