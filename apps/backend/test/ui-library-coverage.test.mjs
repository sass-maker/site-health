import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execFileSync } from 'node:child_process';
import { uiLibraryCoverage } from '../lib/dashboard-backend/ui-library-coverage.mjs';
import { buildReadinessProjection } from '../lib/dashboard-backend/readiness.mjs';
const now = '2026-10-28T00:00:00Z';
function snapshot() { return { schemaVersion: 'ui-library-source-coverage.v1', observedAt: now, records: { demo: { status: 'source-estimate', shared: 3, eligible: 4, percent: 99, revision: 'a'.repeat(40), dirty: true, surfaces: [{ kind: 'web', shared: 3, eligible: 4, files: [{ path: 'page.tsx' }], tokenFiles: 1 }], gap: 'Source estimate only.' } } }; }
test('source adoption is recomputed from counts, scoped and separate from readiness scores', () => {
  const data = snapshot(), result = uiLibraryCoverage(data, 'demo', Date.parse(now));
  assert.equal(result.percent, 75); assert.equal(result.surfaces[0].percent, 75); assert.equal(result.stale, false);
  assert.equal(uiLibraryCoverage(data, 'other'), null);
  const args = { generatedAt: now, projects: [{ id: 'demo', name: 'Demo', lifecycle: { status: 'active' } }] };
  const before = buildReadinessProjection(args), after = buildReadinessProjection({ ...args, uiCoverage: data });
  assert.deepEqual(after.projects[0].scores, before.projects[0].scores); assert.deepEqual(after.projects[0].state, before.projects[0].state);
  assert.equal(after.projects[0].uiLibrary.percent, 75);
});
test('zero remains real, missing scans remain unknown and stale evidence stays labelled', () => {
  const data = snapshot(), row = data.records.demo; row.shared = row.surfaces[0].shared = 0;
  assert.equal(uiLibraryCoverage(data, 'demo', Date.parse(now)).percent, 0);
  assert.equal(uiLibraryCoverage(data, 'demo', Date.parse(now) + 8 * 86400000).stale, true);
  assert.equal(uiLibraryCoverage(null, 'demo'), null);
  row.shared = row.eligible = 0; row.surfaces = []; row.status = 'unavailable';
  assert.equal(uiLibraryCoverage(data, 'demo', Date.parse(now)).percent, null);
});
test('contradictory and future-dated evidence cannot establish an adoption percentage', () => {
  const data = snapshot(); data.records.demo.shared = 5;
  assert.equal(uiLibraryCoverage(data, 'demo', Date.parse(now)), null);
  const mismatch = snapshot(); mismatch.records.demo.surfaces[0].shared = 2;
  assert.equal(uiLibraryCoverage(mismatch, 'demo', Date.parse(now)), null);
  assert.equal(uiLibraryCoverage(snapshot(), 'demo', Date.parse(now) - 120000), null);
});

test('malformed optional display fields are safe to render', () => {
  const data = snapshot(); data.records.demo.surfaces[0].tokenFiles = {}; data.records.demo.surfaces[0].sharedBlocks = -1; data.evidencePath = {};
  const result = uiLibraryCoverage(data, 'demo', Date.parse(now));
  assert.equal(result.surfaces[0].tokenFiles, 0); assert.equal(result.surfaces[0].sharedBlocks, 0); assert.equal(typeof result.evidencePath, 'string');
  data.records.demo.status = 'unavailable'; data.records.demo.revision = 123;
  assert.equal(uiLibraryCoverage(data, 'demo', Date.parse(now)).revision, null);
});
test('collector entrypoint scopes nested products and rejects a private output inside a product repo', () => {
  const root = mkdtempSync(join(tmpdir(), 'site-health-ui-scan-')), fleet = join(root, 'fleet');
  mkdirSync(join(fleet, 'site-health/catalog'), { recursive: true });
  const catalog = join(fleet, 'site-health/catalog/projects.json');
  writeFileSync(catalog, JSON.stringify({ projects: [
    { id: 'parent', name: 'A Parent', lifecycle: { status: 'active' }, repositories: { localPath: 'app' } },
    { id: 'nested', name: 'B Nested', lifecycle: { status: 'primary' }, repositories: { localPath: 'app', sourcePath: 'app/apps/nested' } },
    { id: 'retired', name: 'Retired', lifecycle: { status: 'retired' }, repositories: { localPath: 'retired' } },
  ] }));
  const collector = join(root, 'collector.mjs');
  writeFileSync(collector, `export function collectCoverage(input) { return { schemaVersion:'ui-library-source-coverage.v1', observedAt:new Date().toISOString(), input, records:Object.fromEntries(input.projects.map(p=>[p.id,{status:'not-measured',revision:null,shared:0,eligible:0,percent:null,surfaces:[],gap:'fixture'}])) }; }`);
  const script = resolve(import.meta.dirname, '../scripts/ui-library-coverage.mjs'), output = join(root, 'private.json');
  const args = [script, '--fleet-root', fleet, '--collector', collector, '--output', output];
  execFileSync(process.execPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  const result = JSON.parse(readFileSync(output, 'utf8'));
  assert.deepEqual(Object.keys(result.records), ['parent', 'nested']);
  assert.deepEqual(result.input.projects[0].excludePrefixes, ['apps/nested']); assert.equal(result.input.projects[1].prefix, 'apps/nested');
  const tooling = join(fleet, 'saas-maker'); mkdirSync(join(tooling, 'tooling/scripts'), { recursive: true });
  const sharedCollector = join(tooling, 'tooling/scripts/ui-library-coverage.mjs'); writeFileSync(sharedCollector, readFileSync(collector));
  const git = (...values) => execFileSync('git', ['-C', tooling, ...values], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
  git('init', '-b', 'main'); git('add', '.'); git('-c', 'user.name=Coverage Test', '-c', 'user.email=test@example.invalid', 'commit', '-m', 'collector fixture'); git('update-ref', 'refs/remotes/origin/main', 'HEAD');
  writeFileSync(sharedCollector, "throw Error('Dirty working collector must not run')");
  execFileSync(process.execPath, [script, '--fleet-root', fleet, '--output', output], { stdio: ['ignore', 'pipe', 'pipe'] });
  assert.equal(JSON.parse(readFileSync(output, 'utf8')).collectorRevision, git('rev-parse', 'HEAD').trim());
  assert.throws(() => execFileSync(process.execPath, [...args.slice(0,-1), join(fleet, 'site-health/private.json')], { stdio: ['ignore', 'pipe', 'pipe'] }));
});

test('inspected informational HTML has a completed scope without an invented percentage', () => {
  const data=snapshot(), row=data.records.demo;
  row.status='no-eligible-controls'; row.shared=row.eligible=0;
  row.surfaces=[{kind:'web',shared:0,eligible:0,sharedBlocks:1,files:[{path:'src/worker.ts',documents:1}]}];
  const result=uiLibraryCoverage(data,'demo',Date.parse(now));
  assert.equal(result.status,'no-eligible-controls'); assert.equal(result.percent,null); assert.equal(result.surfaces[0].sharedBlocks,1);
  row.surfaces[0].files[0].documents=0; assert.equal(uiLibraryCoverage(data,'demo',Date.parse(now)),null);
  row.surfaces={}; assert.equal(uiLibraryCoverage(data,'demo',Date.parse(now)),null);
  row.surfaces=[{files:{}}]; assert.equal(uiLibraryCoverage(data,'demo',Date.parse(now)),null);
});
