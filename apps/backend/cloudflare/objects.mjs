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
import { HTTP_FAMILIES,clarityRegistry,collectHttpBatch,currentCollectorProjects,prepareBatchPublication,commitBatchPublication,httpReadinessObservations,liveClarityProjection,httpClarityProjections } from './http-collectors.mjs';
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
    try {
      if(!['GET','HEAD'].includes(request.method)&&this.env.SITE_HEALTH_WRITER_ROLE!=='active')unavailable('Staging and read-only writes are disabled');
      return await this.handleRoute(request, ...args);
    }
    catch (error) { return jsonResponse(error.statusCode ?? (error.code ? 422 : 503), { error: error.statusCode && error.statusCode < 500 ? error.message : 'Site Health cloud operation unavailable', ...(error.code ? {code:error.code} : {}) }); }
  }
  exportSnapshot() { return this.transaction(() => exportStoreSnapshot(this.database, this.kind)); }
  importSnapshot(snapshot) { return importStoreSnapshot(this.database, this.transaction, snapshot, this.kind); }
}
export class DashboardState extends StoreState {
  constructor(ctx, env) {
    super(ctx, env); this.kind = 'dashboard';
    this.store = new SqlDashboardStore({ database: this.database, transaction: this.transaction, migrationSql: dashboardSchema });
    this.jobs = new DurableJobs(this.database,this.transaction,{now:()=>Date.parse(this.now())});
    this.database.exec(`CREATE TABLE IF NOT EXISTS _cloud_publications (job_id TEXT NOT NULL,batch_id TEXT NOT NULL,digest TEXT NOT NULL,published_at TEXT NOT NULL,PRIMARY KEY(job_id,batch_id));
      CREATE TABLE IF NOT EXISTS _cloud_schedules (family TEXT PRIMARY KEY,next_due INTEGER NOT NULL,cadence INTEGER NOT NULL);`);
    ctx.blockConcurrencyWhile(() => this.scheduleJobs());
  }
  now() { return new Date().toISOString(); }
  activeWriter() { return this.env.SITE_HEALTH_WRITER_ROLE==='active'; }
  runtime() { return this.store.getMetadata('cloud:runtime')?.value ?? null; }
  async configureRuntime(manifest, expectedRevision = 0) {
    // Internal RPC only. Publication needs explicit operator preparation; this
    // method never reads arbitrary R2 keys or native filesystem paths.
    const configured=this.transaction(() => {
      const previous = this.runtime();
      if ((previous?.revision ?? 0) !== expectedRevision) fail('Runtime revision conflict', 409);
      if (!manifest?.catalog || !manifest?.dashboard) fail('Catalog and dashboard evidence are required');
      const value = { ...manifest, revision: expectedRevision + 1 };
      this.store.setMetadata('cloud:runtime', value); return value;
    });
    await this.scheduleJobs();return configured;
  }
  async handleRoute(request, runtime, projects, collections = []) {
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
      if (method === 'POST' && runMatch[2]) { const run = this.transaction(()=>{const cancelled=this.jobs.cancel(id);if(cancelled)recordRefreshReceipt(this.store,{...cancelled,state:'failed',code:'REFRESH_CANCELLED',summary:'Collection cancelled; previous evidence retained'});return cancelled;}); await this.scheduleJobs(); return jsonResponse(run ? 200 : 404, run ?? { error: 'metric run not found' }); }
    }
    if (method === 'POST' && url.pathname === '/v1/metric-runs') {
      const input = await readJson(request);
      if (HTTP_FAMILIES.includes(input.family)) {
        const job=await this.enqueueHttp(input,runtime,projects,request.headers.get('idempotency-key'));await this.scheduleJobs();return jsonResponse(202,job);
      }
      if (!Object.values(OUTCOME_SOURCES).includes(input.family) && !['clarity','usage'].includes(input.family)) fail('Unsupported evidence family');
      if (!['project','portfolio'].includes(input.scope ?? 'project')) fail('Invalid refresh scope');
      if ((input.scope ?? 'project') === 'project' && !projects.some(p => p.id === input.projectId)) fail('project not found', 404);
      const capability = runtime?.collectors?.[input.family];
      if (!capability?.enabled || !this.env.COLLECTOR) unavailable(capability?.reason ?? 'Cloud collector is not configured; existing evidence retained');
      const job = this.jobs.start({ family: input.family, scope: input.scope ?? 'project', projectId: input.projectId ?? '' }, request.headers.get('idempotency-key'));
      await this.scheduleJobs(); return jsonResponse(202, job);
    }
    if (method==='POST' && url.pathname==='/v1/prefill') {
      if(!this.activeWriter())unavailable('Staging and read-only collectors are disabled');
      const sources=[];
      for(const family of HTTP_FAMILIES){
        if(!runtime?.collectors?.[family]?.enabled){sources.push({family,state:'unavailable',reason:'Collector policy is not enabled'});continue;}
        try{sources.push(await this.enqueueHttp({family,scope:'portfolio'},runtime,projects));}catch{sources.push({family,state:'unavailable',reason:'Collector prerequisites unavailable'});}
      }
      await this.scheduleJobs();return jsonResponse(202,{schemaVersion:'site-health.prefill.v1',startedAt:this.now(),sources,campaigns:'unavailable',capabilities:'cloud-http'});
    }
    const projections = this.store.rebuildProjections({projects});
    const readiness = url.pathname.match(/^\/v1\/readiness\/([^/]+)$/);
    if (method === 'PUT' && readiness) return jsonResponse(200, saveReadiness(this.store, decodeURIComponent(readiness[1]), await readJson(request, 28*1024), this.now(), projects));
    if (method === 'POST' && url.pathname === '/v1/projections/rebuild') return jsonResponse(200, projections);
    if (method !== 'GET') return jsonResponse(404, { error: 'route not found' });
    if (url.pathname === '/v1/projects') return jsonResponse(200, projections.projects);
    if (url.pathname === '/v1/project-collections') return jsonResponse(200, collections);
    const clarity = url.pathname.match(/^\/v1\/projects\/([^/]+)\/clarity$/);
    if (clarity) { const id = decodeURIComponent(clarity[1]); if (!projects.some(p => p.id === id)) fail('project not found',404); return jsonResponse(200, await liveClarityProjection(this.store,this.env.EVIDENCE,id,runtime,this.now())); }
    if (url.pathname === '/v1/ui-library') {
      const ui = (await readEvidence(this.env.EVIDENCE, runtime.uiLibrary, 'ui-library')).payload;
      return jsonResponse(200, url.searchParams.get('summary') === '1' ? { siteHealth: ui.siteHealth ? { total: ui.siteHealth.total, current: ui.siteHealth.current, stale: ui.siteHealth.stale } : null } : ui);
    }
    if (url.pathname === '/v1/capabilities') return jsonResponse(200, (await readEvidence(this.env.EVIDENCE, runtime.capabilities, 'capabilities')).payload);
    if (url.pathname === '/v1/spend') return jsonResponse(200, (await readEvidence(this.env.EVIDENCE, runtime.spend, 'spend')).payload);
    const payload = (await readEvidence(this.env.EVIDENCE, runtime?.dashboard, 'dashboard')).payload;
    let clarityByProject=payload.clarityByProject??{};
    if(url.pathname==='/v1/readiness'&&runtime.clarityPolicy){try{clarityByProject={...clarityByProject,...await httpClarityProjections(this.store,this.env.EVIDENCE,projections.projects,runtime,this.now())};}catch{}}
    const httpEvidence=url.pathname==='/v1/readiness'?await httpReadinessObservations(this.store,this.env.EVIDENCE,projections.projects):{observations:[],authoritativeSources:[]};
    if (url.pathname === '/v1/readiness') return jsonResponse(200, buildReadinessProjection({ ...projections,
      uiCoverage: runtime?.uiLibrary ? (await readEvidence(this.env.EVIDENCE, runtime.uiLibrary, 'ui-library')).payload.coverage : null,
      generatedAt: this.now(), observations: [...readinessObservations(projections.projects, payload, clarityByProject), ...(payload.readinessObservations ?? []).filter(row=>!httpEvidence.authoritativeSources.includes(row.source)),...httpEvidence.observations] }));
    const outcome = url.pathname.match(/^\/v1\/outcomes\/(domains|search|seo-audit|geo-awareness|ai-awareness|performance)$/);
    if (outcome) return jsonResponse(200, outcomeProjection(payload, outcome[1], { receipt: readRefreshReceipt(this.store, OUTCOME_SOURCES[outcome[1]]), now: this.now() }));
    if (url.pathname === '/v1/evidence-status') return jsonResponse(200, { schemaVersion: 'site-health.evidence-status.v1', generatedAt: this.now(),
      sources: Object.fromEntries(Object.entries(OUTCOME_SOURCES).map(([family,source]) => [source, buildEvidenceEnvelope({ family: source, rows: outcomeProjection(payload,family).rows, receipt: readRefreshReceipt(this.store,source), now: this.now() })])),
      campaigns: payload.campaigns ?? null, capabilities: runtime.collectors ?? {} });
    return jsonResponse(404, { error: 'route not found' });
  }
  async enqueueHttp(input,runtime,projects,requestKey=null) {
    if(!this.activeWriter())unavailable('Staging and read-only collectors are disabled');
    if(!HTTP_FAMILIES.includes(input.family)||!runtime?.collectors?.[input.family]?.enabled)unavailable('HTTP collector is not enabled');
    const scope=input.scope??'project';if(!['project','portfolio'].includes(scope))fail('Invalid refresh scope');
    let targets=currentCollectorProjects(projects).filter(project=>scope==='portfolio'||project.id===input.projectId);
    if(input.family==='clarity'){
      const registry=await clarityRegistry(this.env.EVIDENCE,runtime);
      targets=targets.filter(project=>registry.get(project.id)?.wired);
      if(!targets.some(project=>this.env[`CLARITY_API_TOKEN_${project.id.toUpperCase().replace(/[^A-Z0-9]/g,'_')}`]))unavailable('Clarity token bindings unavailable');
    }else if(!this.env.APP_HEALTH_READ_TOKEN)unavailable('App Health read token binding unavailable');
    if(!targets.length)fail('No eligible current collector targets',404);
    if(targets.length>256)fail('Collector target bound exceeded');
    return this.jobs.start({family:input.family,scope,projectId:scope==='project'?input.projectId:'',targets:targets.map(project=>project.id),catalog:runtime.catalog,clarityPolicy:runtime.clarityPolicy??null,generation:runtime.revision},requestKey,run=>{recordRefreshReceipt(this.store,run);if(input.family==='clarity')for(const project of targets)recordRefreshReceipt(this.store,{...run,scope:'project',projectId:project.id});});
  }
  async scheduleJobs() {
    if(!this.activeWriter()){await this.ctx.storage.deleteAlarm();return;}
    const runtime=this.runtime(),now=Date.parse(this.now());
    for(const family of HTTP_FAMILIES){
      const policy=runtime?.collectors?.[family];
      if(!policy?.enabled||policy.schedule!==true){this.database.prepare('DELETE FROM _cloud_schedules WHERE family=?').run(family);continue;}
      const cadence=family==='clarity'?3*86400000:86400000;
      const receipt=readRefreshReceipt(this.store,family),last=Date.parse(receipt?.lastAttemptAt??'');
      const initial=receipt?.state==='succeeded'&&Number.isFinite(last)?Math.max(now,last+cadence):now;
      this.database.prepare('INSERT INTO _cloud_schedules(family,next_due,cadence) VALUES (?,?,?) ON CONFLICT(family) DO UPDATE SET cadence=excluded.cadence').run(family,initial,cadence);
    }
    const due=this.database.prepare('SELECT MIN(next_due) AS at FROM _cloud_schedules').get().at;
    const candidates=[this.jobs.nextAlarm(),due].filter(value=>value!==null);
    if(!candidates.length)await this.ctx.storage.deleteAlarm();else await this.ctx.storage.setAlarm(Math.min(...candidates));
  }
  async queueScheduled(runtime) {
    const due=this.database.prepare('SELECT * FROM _cloud_schedules WHERE next_due<=? ORDER BY family').all(Date.parse(this.now()));
    if(!due.length)return;
    let catalog;
    try{catalog=(await readEvidence(this.env.EVIDENCE,runtime.catalog,'catalog')).payload;}catch{
      for(const entry of due){recordRefreshReceipt(this.store,{family:entry.family,scope:'portfolio',runId:`scheduled:${entry.family}:${entry.next_due}`,state:'unavailable',startedAt:this.now(),finishedAt:this.now(),code:'SCHEDULE_REFERENCE_UNAVAILABLE',summary:'Scheduled catalog reference unavailable; previous observations retained'});this.database.prepare('UPDATE _cloud_schedules SET next_due=? WHERE family=? AND next_due=?').run(Date.parse(this.now())+entry.cadence,entry.family,entry.next_due);}
      return;
    }
    for(const entry of due){
      try{await this.enqueueHttp({family:entry.family,scope:'portfolio'},runtime,catalog.projects,`scheduled:${entry.family}:${entry.next_due}`);}catch{recordRefreshReceipt(this.store,{family:entry.family,scope:'portfolio',runId:`scheduled:${entry.family}:${entry.next_due}`,state:'unavailable',startedAt:this.now(),finishedAt:this.now(),code:'SCHEDULE_PREREQUISITES_UNAVAILABLE',summary:'Scheduled collector prerequisites unavailable; previous observations retained'});}
      this.database.prepare('UPDATE _cloud_schedules SET next_due=? WHERE family=? AND next_due=?').run(Date.parse(this.now())+entry.cadence,entry.family,entry.next_due);
    }
  }
  async alarm() {
    if(!this.activeWriter()){await this.ctx.storage.deleteAlarm();return;}
    const runtime=this.runtime();
    try{await this.queueScheduled(runtime);}catch{await this.ctx.storage.setAlarm(Date.parse(this.now())+60000);return;}
    const claimed=this.jobs.claim(exhausted=>recordRefreshReceipt(this.store,{...exhausted,code:'REFRESH_RETRY_EXHAUSTED'}));if(claimed?.exhausted){await this.scheduleJobs();return;}if(!claimed){await this.scheduleJobs();return;}
    await this.scheduleJobs();
    const {job,token}=claimed;
    try{
      if(!HTTP_FAMILIES.includes(job.family))unavailable('Collector executor is not qualified');
      const catalog=(await readEvidence(this.env.EVIDENCE,job.catalog,'catalog')).payload;
      const completed=job.progress?.completed??0,ids=job.targets.slice(completed,completed+(job.family==='clarity'?1:4));
      const projects=ids.map(id=>catalog.projects.find(project=>project.id===id));
      if(projects.some(project=>!project))throw new Error('Pinned collector catalog target missing');
      const registry=job.family==='clarity'?await clarityRegistry(this.env.EVIDENCE,job):null;
      const batch=await collectHttpBatch({family:job.family,projects,env:this.env,registry,now:()=>this.now()});
      const failures=job.family==='clarity'?batch.rows.filter(row=>row.error).length:Object.values(batch.snapshot.records).filter(row=>row.status==='failed').length;
      const progress={completed:completed+ids.length,failed:(job.progress?.failed??0)+failures,total:job.targets.length};
      const terminal=progress.completed>=progress.total,state=terminal?(progress.failed?'failed':'succeeded'):'queued';
      const summary=`${job.family}: ${progress.completed}/${progress.total} targets checked; ${progress.failed} failed. Previous valid observations retained on failure.`;
      let finished;
      for(let attempt=0;attempt<3;attempt++){
        const publication=await prepareBatchPublication({store:this.store,bucket:this.env.EVIDENCE,job,batch,now:this.now()});
        try{
          finished=this.jobs.publish(job.runId,token,progress,{state,summary},current=>{
            commitBatchPublication({store:this.store,database:this.database,job:current,publication,now:this.now()});
            recordRefreshReceipt(this.store,{...job,state:terminal?state:'running',finishedAt:terminal?this.now():null,summary,resultCount:progress.completed-progress.failed});
          });break;
        }catch(error){if(error.code!=='PUBLICATION_REVISION_CONFLICT'||attempt===2)throw error;}
      }
    }catch(error){
      try{const finished=this.jobs.finish(job.runId,token,{state:error.statusCode===503?'unavailable':'failed',summary:'HTTP collection/publication unavailable; previous qualified evidence retained'});recordRefreshReceipt(this.store,finished);}catch{ /* Cancelled/expired leases cannot advance evidence or receipts. */ }
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
