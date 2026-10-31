import { DurableObject } from 'cloudflare:workers';
import dashboardSchema from '../lib/dashboard-backend/migrations/001-initial.sql';
import brandSchema from '../lib/brand-evidence/schema.sql';
import { SqlDashboardStore } from '../lib/dashboard-backend/store-core.mjs';
import { SqlBrandEvidenceStore } from '../lib/brand-evidence/store-core.mjs';
import { SqlAppStoreStore } from '../lib/app-store/store-core.mjs';
import { GrowthCycleStore } from '../lib/brand-evidence/growth-cycle.mjs';
import { createBrandEvidenceRoutes } from '../lib/brand-evidence/routes-core.mjs';
import { createAppStoreRoutes } from '../lib/app-store/routes.mjs';
import { buildReadinessProjection, readinessObservations, saveReadiness } from '../lib/dashboard-backend/readiness.mjs';
import { outcomeProjection, OUTCOME_SOURCES } from '../lib/dashboard-backend/outcome-projection.mjs';
import { buildEvidenceEnvelope, readRefreshReceipt, recordRefreshReceipt } from '../lib/dashboard-backend/evidence-freshness.mjs';
import { exportStoreSnapshot, importStoreSnapshot } from '../lib/store-snapshot.mjs';
import { durableSqlDatabase, durableTransaction } from './sql-adapter.mjs';
import { DurableJobs } from './jobs.mjs';
import { readEvidence } from './evidence.mjs';
import { jsonResponse, readJson, routeResponse } from './http.mjs';
const unavailable = message => { throw Object.assign(new Error(message), { statusCode: 503 }); };
const fail = (message, statusCode = 400) => { throw Object.assign(new Error(message), { statusCode }); };
class StoreState extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env); this.database = durableSqlDatabase(ctx.storage); this.transaction = durableTransaction(ctx.storage);
    this.database.exec('PRAGMA foreign_keys=ON');
  }
  async route(request, ...args) {
    try { return await this.handleRoute(request, ...args); }
    catch (error) { return jsonResponse(error.statusCode ?? (error.code ? 422 : 503), { error: error.statusCode && error.statusCode < 500 ? error.message : 'Site Health cloud operation unavailable', ...(error.code ? {code:error.code} : {}) }); }
  }
  exportSnapshot() { return this.transaction(() => exportStoreSnapshot(this.database, this.kind)); }
  importSnapshot(snapshot) { return importStoreSnapshot(this.database, this.transaction, snapshot, this.kind); }
}
export class DashboardState extends StoreState {
  constructor(ctx, env) {
    super(ctx, env); this.kind = 'dashboard';
    this.store = new SqlDashboardStore({ database: this.database, transaction: this.transaction, migrationSql: dashboardSchema });
    this.jobs = new DurableJobs(this.database, this.transaction);
    ctx.blockConcurrencyWhile(() => this.scheduleJobs());
  }
  runtime() { return this.store.getMetadata('cloud:runtime')?.value ?? null; }
  configureRuntime(manifest, expectedRevision = 0) {
    // Internal RPC only. Publication needs explicit operator preparation; this
    // method never reads arbitrary R2 keys or native filesystem paths.
    return this.transaction(() => {
      const previous = this.runtime();
      if ((previous?.revision ?? 0) !== expectedRevision) fail('Runtime revision conflict', 409);
      if (!manifest?.catalog || !manifest?.dashboard) fail('Catalog and dashboard evidence are required');
      const value = { ...manifest, revision: expectedRevision + 1 };
      this.store.setMetadata('cloud:runtime', value); return value;
    });
  }
  async handleRoute(request, runtime, projects, collections = []) {
    this.store.projects = projects;
    const url = new URL(request.url), method = request.method;
    if (method === 'GET' && url.pathname === '/health') {
      let projection = 'unavailable';
      try { await readEvidence(this.env.EVIDENCE,runtime?.dashboard,'dashboard'); projection='available'; } catch {}
      return jsonResponse(200, { ok: true, service: 'site-health-backend', database: 'available', projection, brandEvidence: 'native-v2', hosting: 'cloudflare' });
    }
    const runMatch = url.pathname.match(/^\/v1\/metric-runs\/([^/]+)(?:\/(cancel))?$/);
    if (runMatch) {
      const id = decodeURIComponent(runMatch[1]);
      if (method === 'GET' && !runMatch[2]) { const run = this.jobs.get(id); return jsonResponse(run ? 200 : 404, run ?? { error: 'metric run not found' }); }
      if (method === 'POST' && runMatch[2]) { const run = this.jobs.cancel(id); await this.scheduleJobs(); return jsonResponse(run ? 200 : 404, run ?? { error: 'metric run not found' }); }
    }
    if (method === 'POST' && url.pathname === '/v1/metric-runs') {
      const input = await readJson(request);
      if (!Object.values(OUTCOME_SOURCES).includes(input.family) && !['clarity','usage'].includes(input.family)) fail('Unsupported evidence family');
      if (!['project','portfolio'].includes(input.scope ?? 'project')) fail('Invalid refresh scope');
      if ((input.scope ?? 'project') === 'project' && !projects.some(p => p.id === input.projectId)) fail('project not found', 404);
      const capability = runtime?.collectors?.[input.family];
      if (!capability?.enabled || !this.env.COLLECTOR) unavailable(capability?.reason ?? 'Cloud collector is not configured; existing evidence retained');
      const job = this.jobs.start({ family: input.family, scope: input.scope ?? 'project', projectId: input.projectId ?? '' }, request.headers.get('idempotency-key'));
      await this.scheduleJobs(); return jsonResponse(202, job);
    }
    if (method === 'POST' && url.pathname === '/v1/prefill') unavailable('Cloud prefill requires qualified collector bindings; existing evidence retained');
    const projections = this.store.rebuildProjections();
    const readiness = url.pathname.match(/^\/v1\/readiness\/([^/]+)$/);
    if (method === 'PUT' && readiness) return jsonResponse(200, saveReadiness(this.store, decodeURIComponent(readiness[1]), await readJson(request, 28*1024), new Date().toISOString()));
    if (method === 'POST' && url.pathname === '/v1/projections/rebuild') return jsonResponse(200, projections);
    if (method !== 'GET') return jsonResponse(404, { error: 'route not found' });
    if (url.pathname === '/v1/projects') return jsonResponse(200, projections.projects);
    if (url.pathname === '/v1/project-collections') return jsonResponse(200, collections);
    const payload = (await readEvidence(this.env.EVIDENCE, runtime?.dashboard, 'dashboard')).payload;
    if (url.pathname === '/v1/readiness') return jsonResponse(200, buildReadinessProjection({ ...projections,
      uiCoverage: runtime?.uiLibrary ? (await readEvidence(this.env.EVIDENCE, runtime.uiLibrary, 'ui-library')).payload.coverage : null,
      generatedAt: new Date().toISOString(), observations: [...readinessObservations(projections.projects, payload, payload.clarityByProject ?? {}), ...(payload.readinessObservations ?? [])] }));
    const outcome = url.pathname.match(/^\/v1\/outcomes\/(domains|search|seo-audit|geo-awareness|ai-awareness|performance)$/);
    if (outcome) return jsonResponse(200, outcomeProjection(payload, outcome[1], { receipt: readRefreshReceipt(this.store, OUTCOME_SOURCES[outcome[1]]), now: new Date().toISOString() }));
    if (url.pathname === '/v1/evidence-status') return jsonResponse(200, { schemaVersion: 'site-health.evidence-status.v1', generatedAt: new Date().toISOString(),
      sources: Object.fromEntries(Object.entries(OUTCOME_SOURCES).map(([family,source]) => [source, buildEvidenceEnvelope({ family: source, rows: outcomeProjection(payload,family).rows, receipt: readRefreshReceipt(this.store,source), now: new Date().toISOString() })])),
      campaigns: payload.campaigns ?? null, capabilities: runtime.collectors ?? {} });
    const clarity = url.pathname.match(/^\/v1\/projects\/([^/]+)\/clarity$/);
    if (clarity) { const id = decodeURIComponent(clarity[1]); if (!projects.some(p => p.id === id)) fail('project not found',404); return jsonResponse(200, payload.clarityByProject?.[id] ?? { state: 'not-measured', projectId: id }); }
    if (url.pathname === '/v1/ui-library') {
      const ui = (await readEvidence(this.env.EVIDENCE, runtime.uiLibrary, 'ui-library')).payload;
      return jsonResponse(200, url.searchParams.get('summary') === '1' ? { siteHealth: ui.siteHealth ? { total: ui.siteHealth.total, current: ui.siteHealth.current, stale: ui.siteHealth.stale } : null } : ui);
    }
    if (url.pathname === '/v1/capabilities') return jsonResponse(200, (await readEvidence(this.env.EVIDENCE, runtime.capabilities, 'capabilities')).payload);
    if (url.pathname === '/v1/spend') return jsonResponse(200, (await readEvidence(this.env.EVIDENCE, runtime.spend, 'spend')).payload);
    return jsonResponse(404, { error: 'route not found' });
  }
  async scheduleJobs() {
    const at = this.jobs.nextAlarm();
    if (at === null) await this.ctx.storage.deleteAlarm(); else await this.ctx.storage.setAlarm(at);
  }
  async alarm() {
    const claimed = this.jobs.claim();
    if (!claimed) { await this.scheduleJobs(); return; }
    // Set recovery alarm before network I/O. A terminated execution is claimed
    // again after its durable lease. Runner receives the same idempotency key.
    await this.scheduleJobs();
    const { job, token } = claimed;
    try {
      if (!this.env.COLLECTOR) unavailable('Cloud collector binding unavailable');
      const response = await this.env.COLLECTOR.fetch('https://collector.internal/v1/run', { method: 'POST', headers: { 'content-type':'application/json', 'idempotency-key': job.runId }, body: JSON.stringify(job), signal: AbortSignal.timeout(45_000) });
      if (!response.ok) throw new Error('Collector request failed');
      const result = await readJson(response, 64*1024);
      if (result.runId !== job.runId || !['succeeded','failed','unavailable'].includes(result.state)) throw new Error('Collector receipt invalid');
      if (result.state === 'succeeded') throw new Error('Collector evidence publication is not qualified');
      const finished = this.jobs.finish(job.runId,token,result);
      recordRefreshReceipt(this.store,finished);
    } catch (error) {
      try { const finished = this.jobs.finish(job.runId,token,{ state: error.statusCode === 503 ? 'unavailable' : 'failed', summary: 'Cloud collector did not return qualified evidence; previous evidence retained' }); recordRefreshReceipt(this.store,finished); }
      catch { /* Cancellation or a newer lease owns the result. */ }
    }
    await this.scheduleJobs();
  }
}
export class BrandState extends StoreState {
  constructor(ctx, env) {
    super(ctx, env); this.kind='brand';
    this.store = new SqlBrandEvidenceStore({ database:this.database, transaction:this.transaction, schemaSql:brandSchema });
    this.growth = new GrowthCycleStore(this.store);
  }
  async handleRoute(request, projects) {
    const url = new URL(request.url), method = request.method;
    const routes = createBrandEvidenceRoutes({ store:this.store, env:this.env,
      checkReadiness: () => ({ready:false,reason:'Durable cloud AI checks are not qualified; saved evidence retained'}),
      scheduleDescription: 'Cloud scheduling is not qualified; existing schedules remain on the native owner service.',
      refreshBrandEvidence: async () => unavailable('Durable cloud brand collection is not qualified; saved evidence retained'),
      prepareCommunityBrief: async () => unavailable('Cloud community brief collector is not qualified; drafts retained'),
    });
    return await routeResponse((response,helpers) => method === 'GET'
      ? routes.read(url,projects,response,helpers.json)
      : routes.mutate(url,method,request,projects,response,helpers),request) ?? jsonResponse(404,{error:'route not found'});
  }
}
export class AppStoreState extends StoreState {
  constructor(ctx,env) {
    super(ctx,env); this.kind='app-store'; this.store = new SqlAppStoreStore({ database:this.database, transaction:this.transaction });
  }
  async handleRoute(request) {
    const routes = createAppStoreRoutes({ store:this.store, env:this.env });
    return await routeResponse((response,helpers) => routes.handle(new URL(request.url),request.method,request,response,helpers),request) ?? jsonResponse(404,{error:'route not found'});
  }
}
