import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {build,transform} from 'esbuild';
import {Miniflare} from 'miniflare';
import {generateKeyPair,exportJWK,SignJWT} from 'jose';
import {writeEvidence} from '../cloudflare/evidence.mjs';
import {clarityPolicy} from './fixtures/cloudflare/policy.mjs';
const origin='https://dashboard.fixture.example',issuer='https://fixture.cloudflareaccess.com';
const project=id=>({id,name:id,status:'active',lifecycle:{status:'active'},audience:'internal',purposeCategories:['personal-use'],domains:[],family:id});
const deferred=()=>{let resolve;const promise=new Promise(done=>resolve=done);return {promise,resolve};};
async function harness({projects=[project('fixture')],role='active',token=true,collectors={usage:{enabled:true},clarity:{enabled:true},'provider-revenue':{enabled:true}}}={}){
 const root=await mkdtemp(join(tmpdir(),'site-health-publication-')),bundle=join(root,'worker.mjs');
 await build({entryPoints:['apps/backend/test/fixtures/cloudflare/worker.mjs'],bundle:true,format:'esm',platform:'neutral',target:'es2024',outfile:bundle,external:['cloudflare:workers','node:*'],loader:{'.sql':'text'},conditions:['workerd','worker','browser']});
 const keys=await generateKeyPair('RS256'),jwk=await exportJWK(keys.publicKey);jwk.kid='fixture';
 const state={clock:new Date().toISOString(),fail:new Set(),visitors:0,hold:null,requests:[],claritySessions:9,redirect:false};
 const bindings={SITE_HEALTH_WRITER_ROLE:role,SITE_HEALTH_PUBLIC_ORIGIN:origin,ACCESS_TEAM_DOMAIN:issuer,ACCESS_AUD:'audience',ACCESS_OWNER_EMAIL:'owner@fixture.example',OWNER_STORE_ID:'fixture'};
 if(token){bindings.APP_HEALTH_READ_TOKEN='synthetic-read-token';for(const row of projects)bindings[`CLARITY_API_TOKEN_${row.id.toUpperCase().replace(/[^A-Z0-9]/g,'_')}`]='synthetic-clarity-token';}
 const options={modules:true,modulesRoot:root,scriptPath:bundle,compatibilityDate:'2026-07-30',compatibilityFlags:['nodejs_compat'],bindings,durableObjects:{DASHBOARD:{className:'DashboardState',useSQLite:true},BRAND:{className:'BrandState',useSQLite:true},APP_STORE:{className:'AppStoreState',useSQLite:true}},r2Buckets:['EVIDENCE'],durableObjectsPersist:join(root,'durable'),r2Persist:join(root,'r2'),
 serviceBindings:{ASSETS:async()=>new Response('Not found',{status:404})},outboundService:async request=>{
   const url=new URL(request.url);
   if(url.href===issuer+'/cdn-cgi/access/certs')return Response.json({keys:[jwk]});
   state.requests.push(url.pathname+'?'+url.searchParams);
   assert.equal(request.method,'GET');assert.ok(request.headers.get('authorization')?.startsWith('Bearer synthetic-'));
   if(url.hostname==='www.clarity.ms'){
     if(state.fail.has('clarity'))return Response.json({error:'synthetic'}, {status:429});
     return Response.json([{metricName:'Traffic',information:[{totalSessionCount:state.claritySessions,totalBotSessionCount:1,distinctUserCount:4,PagesPerSessionPercentage:2}]}]);
   }
   assert.equal(url.origin,'https://health.sassmaker.com');
   if(state.redirect)return new Response('{}',{status:302,headers:{location:'https://unapproved.example'}});
   if(url.pathname==='/v1/apps')return Response.json({apps:projects.map(row=>({app:{id:row.id,name:row.name},environments:[{id:'prod-'+row.id,name:'production'}]}))});
   const id=url.searchParams.get('app_id');
   if(state.hold){const hold=state.hold;hold.started.resolve();await hold.release.promise;}
   if(state.fail.has(id))return Response.json({error:'synthetic'}, {status:503});
   const end=Date.parse(state.clock),start=end-30*86400000;
   if(url.pathname==='/v1/analytics/report')return Response.json({from:start,to:end,sampled:false,source:'local',sessions:2,audience:{visitors:state.visitors},events:[{count:3}]});
   assert.equal(url.pathname,'/v1/analytics/provider-revenue');
   const total={provider:'stripe',account_id:'synthetic',mode:'live',currency:'USD',gross_minor:10,refunds_minor:0,net_minor:10,payments:1,refunds:0,attributed_payments:1,pending_refunds:0,pending_refunds_minor:0};
   return Response.json({schema_version:1,basis:'provider_object_created',source:'local',from:Number(url.searchParams.get('from')),to:Number(url.searchParams.get('to')),breakdown:'source',totals:[total],dimensions:[],coverage_note:'Synthetic aggregate',unresolved:[],diagnostics_truncated:false});
 }};
 let mf=new Miniflare(options);
 const auth=await new SignJWT({email:'owner@fixture.example'}).setProtectedHeader({alg:'RS256',kid:'fixture'}).setSubject('owner').setIssuer(issuer).setAudience('audience').setIssuedAt().setExpirationTime('10m').sign(keys.privateKey);
 const rpc=async(method,...args)=>{const response=await mf.dispatchFetch('http://localhost/__test',{method:'POST',body:JSON.stringify({method,args})});const result=await response.json();if(!response.ok)throw new Error(result.error);return result.result;};
 const api=async(path,body)=>{const response=await mf.dispatchFetch(origin+'/api/dashboard'+path,{method:body===undefined?'GET':'POST',headers:{'cf-access-jwt-assertion':auth,...(body===undefined?{}:{origin,'content-type':'application/json'})},...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:response.status,body:await response.json()};};
 let bucket=await mf.getR2Bucket('EVIDENCE');
 const evidence=(family,payload)=>writeEvidence(bucket,{schema:'site-health.cloud-evidence.v1',family,source:'synthetic-fixture',provenance:'source-observation',observedAt:state.clock,payload});
 const manifest={catalog:await evidence('catalog',{projects,collections:[]}),dashboard:await evidence('dashboard',{generatedAt:state.clock,outcomes:{domains:[],search:[],performance:[],seoAudit:[],geoAwareness:[],aiAwareness:[]},readinessObservations:[]}),clarityPolicy:await evidence('policy',clarityPolicy(projects)),uiLibrary:await evidence('ui-library',{siteHealth:{total:3,current:2,stale:1},projects:[],coverage:null}),capabilities:await evidence('capabilities',{skills:[],sources:{}}),spend:await evidence('spend',{state:'not-measured'}),collectors};
 await rpc('test','metadata',{key:'test:clock',value:state.clock});await rpc('configureRuntime',manifest);
 const clock=async value=>{state.clock=value;await rpc('test','metadata',{key:'test:clock',value});};
 const wait=async id=>{for(let i=0;i<500;i++){const run=(await api('/v1/metric-runs/'+id)).body;if(run.state!=='running')return run;if(run.phase==='queued')await rpc('runAlarm');await new Promise(done=>setTimeout(done,10));}throw new Error('Synthetic collector did not finish');};
 const snapshot=async family=>{const control=await rpc('control');const ref=control.metadata.find(row=>row.key==='cloud:source:'+family)?.value;return ref?{ref,payload:(await (await bucket.get(`evidence/${family}/${ref.digest}.json`)).json()).payload}:null;};
 return {get mf(){return mf;},state,projects,get bucket(){return bucket;},manifest,rpc,api,evidence,clock,wait,snapshot,restart:async()=>{await mf.dispose();mf=new Miniflare(options);bucket=await mf.getR2Bucket('EVIDENCE');},close:()=>{state.hold?.release.resolve();return mf.dispose();}};
}
test('actual dashboard polling completes queued durable HTTP batches and publishes fresh zero/revenue/Clarity evidence',async()=>{
 const f=await harness({projects:Array.from({length:17},(_,i)=>project('project-'+i))});try{
   const source=await readFile('apps/web/src/scripts/dashboard-client.ts','utf8');const fragment=source.slice(source.indexOf('async function completeMetricRun('),source.indexOf('async function runRefreshPlans('));
   const compiled=(await transform(fragment,{loader:'ts',format:'esm'})).code;
   let polls=0;const complete=new Function('api','wait',compiled+';return completeMetricRun;')(async path=>{polls++;return (await f.api(path)).body;},()=>new Promise(done=>setTimeout(done,20)));
   const started=await f.api('/v1/metric-runs',{family:'usage',scope:'portfolio'});assert.equal(started.status,202);assert.equal(started.body.state,'running');
   const completed=await complete(started.body);assert.equal(completed.state,'succeeded',JSON.stringify({summary:completed.summary,requests:f.state.requests}));assert.ok(polls>0);assert.equal(completed.progress.total,17);assert.equal(completed.attempts,5);
   assert.equal(Object.keys((await f.snapshot('usage')).payload.records).length,17);
   const revenue=await f.api('/v1/metric-runs',{family:'provider-revenue',scope:'portfolio'});assert.equal((await f.wait(revenue.body.runId)).state,'succeeded');
   const clarity=await f.api('/v1/metric-runs',{family:'clarity',scope:'project',projectId:'project-0'});assert.equal((await f.wait(clarity.body.runId)).state,'succeeded');
   const live=(await f.api('/v1/projects/project-0/clarity')).body;assert.equal(live.state,'fresh');assert.equal(live.snapshot.metrics.sessions,9);assert.equal(live.snapshot.metrics.uniqueBrowsers,4);assert.equal(live.snapshot.metrics.pagesPerSession,2);assert.equal(live.lastSuccessAt,f.state.clock);
   const readiness=(await f.api('/v1/readiness')).body.projects.find(row=>row.id==='project-0');assert.equal(readiness.evidence.find(row=>row.id==='monthly-browser-proxy').value,0);assert.equal(readiness.evidence.find(row=>row.id==='provider-revenue:0').value,10);
   await f.clock(new Date(Date.parse(f.state.clock)+4*86400000).toISOString());assert.equal((await f.api('/v1/projects/project-0/clarity')).body.state,'stale');
   await f.bucket.put(`evidence/dashboard/${f.manifest.dashboard.digest}.json`,'{}');
   for(const path of ['/v1/ui-library','/v1/capabilities','/v1/spend','/v1/projects/project-0/clarity'])assert.equal((await f.api(path)).status,200,path);
   assert.equal((await f.api('/v1/outcomes/search')).status,503);
 }finally{await f.close();}
});
test('partial failed HTTP refresh retains prior values and dates while reporting failure; typed corruption stays isolated',async()=>{
 const f=await harness({projects:[project('alpha'),project('beta')]});try{
   for(const family of ['usage','provider-revenue']){const run=await f.api('/v1/metric-runs',{family,scope:'portfolio'});await f.wait(run.body.runId);}
   const beforeUsage=(await f.snapshot('usage')).payload.records.alpha,beforeRevenue=(await f.snapshot('provider-revenue')).payload.records.alpha;
   await f.clock(new Date(Date.parse(f.state.clock)+3600000).toISOString());f.state.fail.add('alpha');f.state.visitors=7;
   for(const family of ['usage','provider-revenue']){const run=await f.api('/v1/metric-runs',{family,scope:'portfolio'});const ended=await f.wait(run.body.runId);assert.equal(ended.state,'failed');assert.equal(ended.progress.failed,1);}
   const usage=await f.snapshot('usage'),revenue=await f.snapshot('provider-revenue');assert.equal(usage.payload.records.alpha.status,'retained');assert.equal(usage.payload.records.alpha.observedAt,beforeUsage.observedAt);assert.equal(usage.payload.records.alpha.count,0);assert.equal(usage.payload.records.beta.count,7);
   assert.equal(revenue.payload.records.alpha.status,'retained');assert.equal(revenue.payload.records.alpha.observedAt,beforeRevenue.observedAt);assert.deepEqual(revenue.payload.records.alpha.totals,beforeRevenue.totals);
   await f.bucket.put(`evidence/usage/${usage.ref.digest}.json`,'{}');const view=(await f.api('/v1/readiness')).body.projects.find(row=>row.id==='alpha');assert.equal(view.evidence.find(row=>row.id==='monthly-browser-proxy').value,null);assert.ok(view.evidence.some(row=>row.source==='app-health.provider-revenue'));
 }finally{await f.close();}
});
test('cancelled and expired publication leases cannot replace good evidence or duplicate committed batches',async()=>{
 const f=await harness();try{
   const initial=await f.api('/v1/metric-runs',{family:'usage',scope:'portfolio'});await f.wait(initial.body.runId);const baseline=await f.snapshot('usage');
   f.state.visitors=99;f.state.hold={started:deferred(),release:deferred()};
   const cancelled=await f.api('/v1/metric-runs',{family:'usage',scope:'portfolio'});await Promise.race([f.state.hold.started.promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Synthetic provider did not start')),3000))]);
   assert.equal((await f.api('/v1/metric-runs/'+cancelled.body.runId+'/cancel',{})).body.state,'cancelled');f.state.hold.release.resolve();await f.rpc('idle');f.state.hold=null;
   assert.equal((await f.snapshot('usage')).ref.digest,baseline.ref.digest);
   f.state.hold={started:deferred(),release:deferred()};const retry=await f.api('/v1/metric-runs',{family:'usage',scope:'portfolio'});await Promise.race([f.state.hold.started.promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Synthetic provider did not start')),3000))]);
   await f.clock(new Date(Date.parse(f.state.clock)+61000).toISOString());f.state.hold.release.resolve();await f.rpc('idle');f.state.hold=null;
   assert.equal((await f.snapshot('usage')).ref.digest,baseline.ref.digest);
   await f.rpc('runAlarm');const ended=await f.wait(retry.body.runId);assert.equal(ended.state,'succeeded');assert.equal(ended.attempts,2);assert.equal((await f.snapshot('usage')).payload.records.fixture.count,99);
   const rows=(await f.rpc('control')).publications.filter(row=>row.job_id===retry.body.runId);assert.equal(rows.length,1);
 }finally{await f.close();}
});
test('staging suppresses alarms/writes; scheduled missing bindings leave an honest unavailable receipt',async()=>{
 const staged=await harness({role:'staging',collectors:{usage:{enabled:true,schedule:true}}});try{assert.equal(await staged.rpc('alarmAt'),null);assert.equal((await staged.api('/v1/prefill',{})).status,503);assert.equal(staged.state.requests.length,0);}finally{await staged.close();}
 const missing=await harness({token:false,collectors:{usage:{enabled:true,schedule:true}}});try{await missing.rpc('runAlarm');const control=await missing.rpc('control');const receipt=control.metadata.find(row=>row.key==='evidence-refresh:usage:portfolio').value;assert.equal(receipt.state,'unavailable');assert.equal(receipt.failure.code,'SCHEDULE_PREREQUISITES_UNAVAILABLE');assert.ok(control.schedules[0].next_due>Date.parse(missing.state.clock));assert.equal(missing.state.requests.length,0);}finally{await missing.close();}
});

test('pinned portfolio targets survive catalog replacement and prefill drives the qualified HTTP lanes',async()=>{
 const f=await harness({projects:Array.from({length:9},(_,i)=>project('pinned-'+i))});try{
   const job=await f.rpc('startPinned',{family:'usage',scope:'portfolio'});
   const replacement=await f.evidence('catalog',{projects:[project('replacement')],collections:[]});await f.rpc('configureRuntime',{...f.manifest,catalog:replacement},1);
   await f.rpc('runAlarm');const completed=await f.wait(job.runId);assert.equal(completed.state,'succeeded');assert.equal(completed.progress.total,9);assert.deepEqual(Object.keys((await f.snapshot('usage')).payload.records).sort(),f.projects.map(p=>p.id).sort());
   await f.rpc('configureRuntime',f.manifest,2);
   const prefilling=await f.api('/v1/prefill',{});assert.equal(prefilling.body.schemaVersion,'site-health.prefill.v1');assert.equal(prefilling.body.sources.length,3);
   for(const source of prefilling.body.sources)assert.equal((await f.wait(source.runId)).state,'succeeded');
 }finally{await f.close();}
});
test('repeated expired publication leases exhaust the unchanged batch budget without erasing last good evidence',async()=>{
 const f=await harness();try{
   const seed=await f.api('/v1/metric-runs',{family:'usage',scope:'portfolio'});await f.wait(seed.body.runId);const baseline=await f.snapshot('usage');f.state.visitors=42;
   const job=await f.rpc('startPinned',{family:'usage',scope:'portfolio'});
   for(let attempt=0;attempt<3;attempt++){
     f.state.hold={started:deferred(),release:deferred()};const work=f.rpc('runAlarm');await Promise.race([f.state.hold.started.promise,new Promise((_,reject)=>setTimeout(()=>reject(new Error('Provider did not start')),3000))]);
     await f.clock(new Date(Date.parse(f.state.clock)+61000).toISOString());f.state.hold.release.resolve();await work;f.state.hold=null;assert.equal((await f.snapshot('usage')).ref.digest,baseline.ref.digest);
   }
   await f.rpc('runAlarm');const ended=(await f.api('/v1/metric-runs/'+job.runId)).body;assert.equal(ended.state,'failed');assert.equal(ended.attempts,3);
   const control=await f.rpc('control'),receipt=control.metadata.find(row=>row.key==='evidence-refresh:usage:portfolio').value;assert.equal(receipt.failure.code,'REFRESH_RETRY_EXHAUSTED');assert.equal((await f.snapshot('usage')).ref.digest,baseline.ref.digest);
 }finally{await f.close();}
});
test('provider redirects are refused without forwarding credentials; immutable evidence read-back rejects a damaged existing key',async()=>{
 const f=await harness();try{
   const seed=await f.api('/v1/metric-runs',{family:'usage',scope:'portfolio'});await f.wait(seed.body.runId);const baseline=await f.snapshot('usage');
   const document=await (await f.bucket.get(`evidence/usage/${baseline.ref.digest}.json`)).json();f.state.redirect=true;
   const redirected=await f.api('/v1/metric-runs',{family:'usage',scope:'portfolio'});assert.equal((await f.wait(redirected.body.runId)).state,'failed');assert.equal((await f.snapshot('usage')).payload.records.fixture.observedAt,baseline.payload.records.fixture.observedAt);
   await f.bucket.put(`evidence/usage/${baseline.ref.digest}.json`,'{}');await assert.rejects(writeEvidence(f.bucket,document),/evidence|Evidence/);
 }finally{await f.close();}
});

test('daily scheduling preserves success cadence across configuration/restart semantics and records retained prerequisite failures',async()=>{
 const f=await harness({collectors:{usage:{enabled:true}}});try{
   const run=await f.api('/v1/metric-runs',{family:'usage',scope:'portfolio'});await f.wait(run.body.runId);const count=f.state.requests.length;
   await f.rpc('configureRuntime',{...f.manifest,collectors:{usage:{enabled:true,schedule:true}}},1);
   let control=await f.rpc('control');assert.equal(control.schedules[0].next_due,Date.parse(f.state.clock)+86400000);
   await f.rpc('runAlarm');assert.equal(f.state.requests.length,count);
   await f.clock(new Date(Date.parse(f.state.clock)+86400001).toISOString());await f.rpc('runAlarm');control=await f.rpc('control');assert.equal(control.publications.length,2);assert.ok(control.schedules[0].next_due>Date.parse(f.state.clock));
 }finally{await f.close();}
 const missing=await harness({token:false,collectors:{usage:{enabled:true}}});try{
   const oldDate=new Date(Date.parse(missing.state.clock)-2*86400000).toISOString();
   const oldSnapshot={schemaVersion:1,observedAt:oldDate,records:{fixture:{status:'available',count:5,unit:'browsers',actionEvents:1,observedAt:oldDate,window:`${new Date(Date.parse(oldDate)-30*86400000).toISOString()} to ${oldDate}`}}};
   const reference=await missing.evidence('usage',oldSnapshot);await missing.rpc('test','metadata',{key:'cloud:source:usage',value:reference});await missing.rpc('test','metadata',{key:'evidence-refresh:usage:portfolio',value:{schemaVersion:'site-health.refresh-receipt.v1',source:'usage',state:'succeeded',lastAttemptAt:oldDate,lastSuccessAt:oldDate}});
   await missing.rpc('configureRuntime',{...missing.manifest,collectors:{usage:{enabled:true,schedule:true}}},1);await missing.rpc('runAlarm');
   const receipt=(await missing.rpc('control')).metadata.find(row=>row.key==='evidence-refresh:usage:portfolio').value;assert.equal(receipt.state,'unavailable');assert.equal(receipt.lastSuccessAt,oldDate);assert.equal((await missing.snapshot('usage')).ref.digest,reference.digest);assert.equal((await missing.snapshot('usage')).payload.records.fixture.count,5);
 }finally{await missing.close();}
});

test('checkpointed publication survives full workerd restart and resumes the same job without duplicated batches',async()=>{
 const f=await harness({projects:Array.from({length:9},(_,i)=>project('resume-'+i))});try{
   await f.rpc('test','metadata',{key:'test:pause',value:true});const job=await f.rpc('startPinned',{family:'usage',scope:'portfolio'});await f.rpc('runAlarm');
   let progress=(await f.api('/v1/metric-runs/'+job.runId)).body;assert.equal(progress.progress.completed,4);assert.equal((await f.rpc('control')).publications.length,1);
   const before=await f.snapshot('usage');await f.restart();assert.equal((await f.snapshot('usage')).ref.digest,before.ref.digest);
   await f.rpc('test','metadata',{key:'test:pause',value:false});await f.rpc('runAlarm');progress=await f.wait(job.runId);assert.equal(progress.state,'succeeded');assert.equal(progress.progress.completed,9);assert.equal(progress.attempts,3);
   const publications=(await f.rpc('control')).publications.filter(row=>row.job_id===job.runId);assert.equal(publications.length,3);assert.deepEqual(publications.map(row=>row.batch_id).sort(),['0','4','8']);
   assert.equal(Object.keys((await f.snapshot('usage')).payload.records).length,9);
 }finally{await f.close();}
});

test('a scheduled missing catalog reference records a safe unavailable attempt and advances cadence',async()=>{
 const f=await harness({collectors:{usage:{enabled:true}}});try{
   await f.rpc('configureRuntime',{...f.manifest,catalog:{...f.manifest.catalog,digest:'0'.repeat(64)},collectors:{usage:{enabled:true,schedule:true}}},1);await f.rpc('runAlarm');
   const control=await f.rpc('control'),receipt=control.metadata.find(row=>row.key==='evidence-refresh:usage:portfolio').value;assert.equal(receipt.failure.code,'SCHEDULE_REFERENCE_UNAVAILABLE');assert.ok(control.schedules[0].next_due>Date.parse(f.state.clock));assert.equal(f.state.requests.length,0);
 }finally{await f.close();}
});
