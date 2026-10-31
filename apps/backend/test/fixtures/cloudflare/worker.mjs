import worker, { DashboardState as Dashboard, BrandState as Brand, AppStoreState as AppStore } from '../../../cloudflare/worker.mjs';
import { durableSqlDatabase, durableTransaction } from '../../../cloudflare/sql-adapter.mjs';
import { DurableJobs } from '../../../cloudflare/jobs.mjs';
import { DurableObject } from 'cloudflare:workers';
export class DashboardState extends Dashboard {
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
