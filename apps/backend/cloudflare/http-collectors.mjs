import { fetchClaritySnapshot,clarityEligibility,clarityTokenEnvironmentKey,readClarityProjection,createClarityRegistry } from '../lib/dashboard-backend/clarity-core.mjs';
import { collectUsageEvidence,usageFailureSnapshot,mergeUsageSnapshots,usageObservations } from '../lib/dashboard-backend/usage-evidence-core.mjs';
import { collectProviderRevenueEvidence,providerRevenueFailureSnapshot,mergeProviderRevenueSnapshots,providerRevenueObservations,validProviderRevenueTotal } from '../lib/dashboard-backend/provider-revenue-core.mjs';
import { isCurrentPortfolioProject } from '../lib/dashboard-backend/domain-scope.mjs';
import { readEvidence,writeEvidence } from './evidence.mjs';
import { recordRefreshReceipt } from '../lib/dashboard-backend/evidence-freshness.mjs';
import { snapshotDigest } from '../lib/store-snapshot.mjs';
import { readJson } from './http.mjs';
export const HTTP_FAMILIES=Object.freeze(['clarity','usage','provider-revenue']);
const unavailable=message=>Object.assign(new Error(message),{statusCode:503});
export async function cloudProviderFetch(input,init={}) {
  const url=new URL(input);
  if(url.protocol!=='https:'||!['www.clarity.ms','health.sassmaker.com'].includes(url.hostname)||url.port||url.username||url.password)throw unavailable('Collector provider origin is not approved');
  const headers=new Headers(init.headers);headers.delete('connection');
  const response=await fetch(url,{...init,headers,redirect:'manual'});
  if(response.status>=300&&response.status<400)throw unavailable('Collector provider redirect refused');
  // Both providers return bounded JSON aggregates. Never retain raw responses.
  const value=await readJson(response,4*1024*1024);
  return Response.json(value,{status:response.status,headers:{'content-type':'application/json'}});
}
export async function clarityRegistry(bucket,runtime){
  const policy=(await readEvidence(bucket,runtime?.clarityPolicy,'policy')).payload;
  if(!Array.isArray(policy.journeys?.projects))throw unavailable('Clarity journey policy unavailable');
  return createClarityRegistry(policy.registry,policy.capabilities,new Map(policy.journeys.projects.map(row=>[row.id,row])));
}
export function validateHttpSnapshot(family,snapshot,expectedProjectId=null) {
  const timestamp=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
  const count=value=>value===null||(Number.isSafeInteger(value)&&value>=0);
  if(family==='clarity'){
    if(expectedProjectId!==null&&snapshot?.projectId!==expectedProjectId)throw unavailable('Clarity snapshot project mismatch');
    if(snapshot?.schemaVersion!=='site-health.clarity-snapshot.v1'||typeof snapshot.projectId!=='string'||!timestamp(snapshot.observedAt)||![1,2,3].includes(snapshot.period?.days)||snapshot.state!=='verified'||snapshot.provenance!=='provider'
      ||!snapshot.metrics||Object.values(snapshot.metrics).some(value=>value!==null&&(typeof value!=='number'||!Number.isFinite(value)||value<0)))throw unavailable('Clarity snapshot schema invalid');
  }else{
    if(snapshot?.schemaVersion!==1||!timestamp(snapshot.observedAt)||!snapshot.records||typeof snapshot.records!=='object'||Array.isArray(snapshot.records))throw unavailable('Aggregate snapshot schema invalid');
    for(const [id,row] of Object.entries(snapshot.records)){
      if(!/^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,159}$/.test(id)||!row||!['available','failed','unmapped','retained','empty',undefined].includes(row.status)||row.observedAt!==null&&row.observedAt!==undefined&&!timestamp(row.observedAt))throw unavailable('Aggregate record schema invalid');
      if(family==='usage'&&(!Object.hasOwn(row,'count')||!count(row.count??null)||!count(row.actionEvents??null)||row.unit!==undefined&&row.unit!==null&&!['sessions','browsers','devices','users'].includes(row.unit)))throw unavailable('Usage record schema invalid');
      if(family==='provider-revenue'&&row.totals!==null&&(!Array.isArray(row.totals)||row.totals.length>200||!row.totals.every(validProviderRevenueTotal)))throw unavailable('Provider revenue schema invalid');
    }
  }
  return snapshot;
}
export async function sourceSnapshot(store,bucket,family){
  const reference=store.getMetadata(`cloud:source:${family}`)?.value??null;
  return reference?validateHttpSnapshot(family,(await readEvidence(bucket,reference,family)).payload):null;
}
export async function collectHttpBatch({family,projects,env,registry,now,fetcher=cloudProviderFetch}) {
  if(family==='clarity'){
    const rows=[];
    for(const project of projects){
      const eligible=clarityEligibility(project.id,registry),token=env[clarityTokenEnvironmentKey(project.id)];
      if(!eligible.eligible||!token){rows.push({projectId:project.id,error:{code:'CLARITY_TOKEN_REQUIRED',message:'Clarity project or token binding unavailable'}});continue;}
      try{rows.push({projectId:project.id,snapshot:await fetchClaritySnapshot({projectId:project.id,token,days:3,now,fetchImpl:fetcher})});}
      catch(error){rows.push({projectId:project.id,error:{code:error.code??'CLARITY_REFRESH_FAILED',message:'Clarity provider evidence unavailable'}});}
    }
    return {family,rows};
  }
  if(!env.APP_HEALTH_READ_TOKEN)throw unavailable('App Health read token binding unavailable');
  const collect=family==='usage'?collectUsageEvidence:collectProviderRevenueEvidence;
  let snapshot;
  try{snapshot=await collect({projects,credential:env.APP_HEALTH_READ_TOKEN,fetcher,now:family==='usage'?now:()=>Date.parse(now())});}
  catch{snapshot=(family==='usage'?usageFailureSnapshot:providerRevenueFailureSnapshot)(projects,now);}
  return {family,snapshot};
}
export function currentCollectorProjects(projects){return projects.filter(isCurrentPortfolioProject);}
export async function prepareBatchPublication({store,bucket,job,batch,now}) {
  if(batch.family!==job.family)throw unavailable('Collector family mismatch');
  if(job.family==='clarity'){
    const documents=[];
    for(const row of batch.rows){
      if(!job.targets.includes(row.projectId))throw unavailable('Collector project mismatch');
      if(!row.snapshot){documents.push(row);continue;}
      validateHttpSnapshot('clarity',row.snapshot,row.projectId);
      const document={schema:'site-health.cloud-evidence.v1',family:'clarity',source:'clarity-data-export',provenance:'provider',observedAt:row.snapshot.observedAt,payload:row.snapshot};
      documents.push({...row,reference:await writeEvidence(bucket,document)});
    }
    return {family:job.family,rows:documents};
  }
  const previousReference=store.getMetadata(`cloud:source:${job.family}`)?.value??null;
  const previous=previousReference?(await readEvidence(bucket,previousReference,job.family)).payload:null;
  // A bounded batch must preserve observations for products not in this batch.
  // Shared merge rules still decide failures, explicit unknowns and local feeds.
  const incoming={...batch.snapshot,records:{...(previous?.records??{}),...batch.snapshot.records}};
  const snapshot=(job.family==='usage'?mergeUsageSnapshots:mergeProviderRevenueSnapshots)(incoming,previous);
  validateHttpSnapshot(job.family,snapshot);
  const reference=await writeEvidence(bucket,{schema:'site-health.cloud-evidence.v1',family:job.family,source:'app-health-aggregate-api',provenance:'provider',observedAt:batch.snapshot.observedAt,payload:snapshot});
  return {family:job.family,reference,snapshot,previousDigest:previousReference?.digest??null,
    failures:Object.values(batch.snapshot.records).filter(row=>row.status==='failed').length,
    count:Object.keys(batch.snapshot.records).length};
}
export function commitBatchPublication({store,database,job,publication,now}) {
  const batchId=String(job.progress?.completed??0);
  const previous=database.prepare('SELECT digest FROM _cloud_publications WHERE job_id=? AND batch_id=?').get(job.runId,batchId);
  if(previous)return {duplicate:true};
  if(job.family==='clarity'){
    for(const row of publication.rows){
      if(row.reference){store.setMetadata(`cloud:clarity:${row.projectId}`,row.reference,{now});store.setMetadata(`clarity-snapshot:${row.projectId}`,row.snapshot,{now});}
      recordRefreshReceipt(store,{family:'clarity',scope:'project',projectId:row.projectId,runId:job.runId,state:row.error?'failed':'succeeded',startedAt:job.startedAt,finishedAt:now,resultCount:row.snapshot?1:0,code:row.error?.code,summary:row.error?.message??'Clarity evidence published'});
    }
  }else{
    const current=store.getMetadata(`cloud:source:${job.family}`)?.value?.digest??null;
    if(current!==publication.previousDigest)throw Object.assign(new Error('Collector evidence changed during publication'),{code:'PUBLICATION_REVISION_CONFLICT'});
    store.setMetadata(`cloud:source:${job.family}`,publication.reference,{now});
  }
  const digest=publication.reference?.digest??snapshotDigest(publication.rows.map(r=>({projectId:r.projectId,digest:r.reference?.digest??null,error:r.error?.code??null})));
  database.prepare('INSERT INTO _cloud_publications(job_id,batch_id,digest,published_at) VALUES (?,?,?,?)').run(job.runId,batchId,digest,now);
  return {duplicate:false};
}
export async function httpReadinessObservations(store,bucket,projects){
  const observations=[],authoritativeSources=new Set();
  for(const family of ['usage','provider-revenue']){
    if(!store.getMetadata(`cloud:source:${family}`)?.value)continue;
    let snapshot;
    try{snapshot=await sourceSnapshot(store,bucket,family);}
    catch{snapshot=(family==='usage'?usageFailureSnapshot:providerRevenueFailureSnapshot)(projects);}
    const rows=(family==='usage'?usageObservations:providerRevenueObservations)(projects,snapshot);
    rows.forEach(row=>authoritativeSources.add(row.source));observations.push(...rows);
  }
  return {observations,authoritativeSources:[...authoritativeSources]};
}
export async function liveClarityProjection(store,bucket,projectId,runtime,now,registry=null){
  registry??=await clarityRegistry(bucket,runtime);
  const reference=store.getMetadata(`cloud:clarity:${projectId}`)?.value;
  const snapshot=reference?validateHttpSnapshot('clarity',(await readEvidence(bucket,reference,'clarity')).payload,projectId):null;
  const view={getMetadata:key=>snapshot&&key===`clarity-snapshot:${projectId}`?{value:snapshot,updatedAt:snapshot.observedAt}:store.getMetadata(key)};
  return readClarityProjection(view,projectId,registry,{now});
}
export async function httpClarityProjections(store,bucket,projects,runtime,now){
  const registry=await clarityRegistry(bucket,runtime),rows={};
  for(const project of projects)rows[project.id]=await liveClarityProjection(store,bucket,project.id,runtime,now,registry);
  return rows;
}
