import test from 'node:test';
import assert from 'node:assert/strict';
import type { App, Project, Workspace, Observation } from '../../src/features/app-store/domain.ts';
const domain: typeof import('../../src/features/app-store/domain.ts') = await import(
  process.env.REPRO_DOMAIN ?? '../../src/features/app-store/domain.ts'
);
const app: App = {
  id: '1',
  name: 'One',
  developer: 'Dev',
  url: 'https://apps.apple.com/us/app/one/id1',
  description: 'Text',
  genre: 'Productivity',
  rating: 0,
  ratings: 0,
  price: 'Free',
  version: '1',
};
const project: Project = {
  id: 'project',
  name: 'One',
  app,
  platform: 'ios',
  countries: ['us'],
  keywords: ['one'],
  limit: 20,
  cadenceHours: 24,
  autoRefresh: false,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z',
};
const key = { term: 'one', country: 'us', platform: 'ios' as const, limit: 20 };
function captures(prefix: string, count: number, owner = project, offset = 0): Workspace {
  const observations: Observation[] = Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i}`,
    fetchedAt: new Date(Date.UTC(2026, 9, 1) + offset + i * 1000).toISOString(),
    sourceUrl: domain.appleSearchUrl(key),
    key,
    apps: [app],
  }));
  return {
    version: 1,
    projects: [owner],
    observations,
    attempts: observations.map((o) => ({
      id: `attempt-${o.id}`,
      projectId: owner.id,
      key,
      at: o.fetchedAt,
      status: 'success',
      observationId: o.id,
      cache: 'miss',
    })),
    drafts: [],
  };
}
test('server timestamps and stored metadata remain readable independently of browser clock', () => {
  const w = captures('clock', 1);
  w.projects[0] = {
    ...project,
    createdAt: '2090-01-01T00:00:00.000Z',
    updatedAt: '2090-01-01T00:00:00.000Z',
  };
  w.observations = [{ ...w.observations[0], fetchedAt: '2090-01-01T00:00:00.000Z' }];
  assert.doesNotThrow(() => domain.readBackup(domain.backupText(w)));
  assert.throws(() =>
    domain.validateWorkspace({ ...w, projects: [{ ...project, createdAt: 'garbage' }] }),
  );
});
test('merge unions 70 plus70 captures and trims evidence before final size validation', () => {
  const a = captures('left', 70);
  const b = captures('right', 70, project, 100000);
  const merged = domain.mergeWorkspace(a, b);
  assert.equal(merged.observations.length, 120);
  assert.equal(merged.attempts.length, 120);
  assert.doesNotThrow(() => domain.readBackup(domain.backupText(merged)));
  assert.equal(a.observations.length, 70);
  assert.equal(b.observations.length, 70);
});
test('pruning newer success never reveals an older provider failure as the latest state', () => {
  const old = captures('old', 1);
  old.attempts.unshift({
    id: 'stale-failure',
    projectId: project.id,
    key,
    at: '2026-09-30T00:00:00.000Z',
    status: 'failure',
    message: 'Old outage',
  });
  const other = { ...project, id: 'other' };
  const newer = captures('new', 120, other, 100000);
  const retained = domain.retain({
    ...old,
    projects: [project, other],
    observations: [...old.observations, ...newer.observations],
    attempts: [...old.attempts, ...newer.attempts],
  });
  assert.equal(domain.cell(retained, project, key).presence.kind, 'unobserved');
  assert.ok(!retained.attempts.some((a) => a.id === 'stale-failure'));
});
