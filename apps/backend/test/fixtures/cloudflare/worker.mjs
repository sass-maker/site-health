import worker, { DashboardState as Dashboard, BrandState as Brand, AppStoreState as AppStore } from '../../../cloudflare/worker.mjs';
import { durableSqlDatabase, durableTransaction } from '../../../cloudflare/sql-adapter.mjs';
import { DurableJobs } from '../../../cloudflare/jobs.mjs';
import { emptyReadinessState } from '../../../lib/dashboard-backend/readiness-model.mjs';
import { DurableObject } from 'cloudflare:workers';
export class DashboardState extends Dashboard {
  now(){return this.store?.getMetadata('test:clock')?.value??super.now();}
  async scheduleJobs(){if(this.store?.getMetadata('test:pause')?.value){await this.ctx.storage.deleteAlarm();return;}return super.scheduleJobs();}
  async alarm(){this.lastAlarm=super.alarm();return this.lastAlarm;}
  runAlarm(){return this.alarm();}
  idle(){return this.lastAlarm??Promise.resolve();}
  alarmAt(){return this.ctx.storage.getAlarm();}
  async startPinned(input){const runtime=this.runtime();const catalog=(await this.env.EVIDENCE.get(`evidence/catalog/${runtime.catalog.digest}.json`));return this.enqueueHttp(input,runtime,(await catalog.json()).payload.projects);}
  control(){return {publications:this.database.prepare('SELECT * FROM _cloud_publications ORDER BY job_id,batch_id').all(),schedules:this.database.prepare('SELECT * FROM _cloud_schedules ORDER BY family').all(),metadata:this.store.listMetadata()};}

  async interleavedCatalog(firstHasProject) {
    const project={id:'fixture',name:'Fixture',status:'active',lifecycle:{status:'active'}};
    let admit,release;
    const admitted=new Promise(resolve=>{admit=resolve;});
    const released=new Promise(resolve=>{release=resolve;});
    const body=new ReadableStream({async start(controller){admit();await released;controller.enqueue(new TextEncoder().encode(JSON.stringify({expectedRevision:0,idempotencyKey:'interleave',state:emptyReadinessState()})));controller.close();}});
    const pending=this.route(new Request('https://fixture.example/v1/readiness/fixture',{method:'PUT',body,duplex:'half'}),null,firstHasProject?[project]:[]);
    await admitted;
    const other=await this.route(new Request('https://fixture.example/v1/projects'),null,firstHasProject?[]:[project]);
    const otherProjects=await other.json();
    release();
    const result=await pending;
    return {status:result.status,body:await result.json(),otherProjects};
  }
  test(action, value) {
    if (action === 'metadata') return this.store.setMetadata(value.key,value.value);
    if (action === 'events') return this.store.listEvents();
    if (action === 'append') return this.store.append(value);
    if (action === 'project') { this.store.projects=value; return true; }
    if (action === 'rollback') return this.transaction(() => { this.store.setMetadata('rollback',true); throw new Error('Synthetic rollback'); });
    if (action === 'evict') this.ctx.abort('Synthetic eviction');
  }
}
export class BrandState extends Brand {}
export class AppStoreState extends AppStore {}
export class JobState extends DurableObject {
  constructor(ctx,env) { super(ctx,env); this.database=durableSqlDatabase(ctx.storage); this.transaction=durableTransaction(ctx.storage); this.clock=0; this.jobs=new DurableJobs(this.database,this.transaction,{now:()=>this.clock,leaseMs:1000}); }
  test(action, args) { if (action==='clock') {this.clock=args;return true;} return this.jobs[action](...args); }
}
export default {
  async fetch(request,env) {
    if (new URL(request.url).pathname !== '/__test') return worker.fetch(request,env);
    const { binding='DASHBOARD', name='fixture', method, args=[] }=await request.json();
    try { return Response.json({result:await env[binding].getByName(name)[method](...args)}); }
    catch(error) {return Response.json({error:error.message},{status:409});}
  }
};
