import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from 'esbuild';
import { Miniflare } from 'miniflare';
import { generateKeyPair, exportJWK, SignJWT } from 'jose';
import { writeEvidence } from '../cloudflare/evidence.mjs';
import { emptyReadinessState } from '../lib/dashboard-backend/readiness-model.mjs';
import { outcomeProjection } from '../lib/dashboard-backend/outcome-projection.mjs';
const origin='https://dashboard.fixture.example',issuer='https://fixture.cloudflareaccess.com',owner='owner@fixture.example';
const project={id:'fixture',name:'Fixture',lifecycle:{status:'active'},status:'active',audience:'internal',purposeCategories:['personal-use'],domains:[],family:'fixture'};

test('signed owner Access gates HTML, assets, APIs and R2; invalid claims and exact Origin fail closed',async()=>{
 const root=await mkdtemp(join(tmpdir(),'site-health-http-test-')),bundle=join(root,'worker.mjs');
 await build({entryPoints:['apps/backend/test/fixtures/cloudflare/worker.mjs'],bundle:true,format:'esm',platform:'neutral',target:'es2024',outfile:bundle,external:['cloudflare:workers','node:*'],loader:{'.sql':'text'},conditions:['workerd','worker','browser']});
 const keys=await generateKeyPair('RS256'),jwk=await exportJWK(keys.publicKey);jwk.kid='fixture';jwk.alg='RS256';
 let keysUnavailable=false,assetReads=0,appleCalls=0,aiCalls=0;
 const options={modules:true,modulesRoot:root,scriptPath:bundle,compatibilityDate:'2026-07-30',compatibilityFlags:['nodejs_compat'],
 durableObjects:{DASHBOARD:{className:'DashboardState',useSQLite:true},BRAND:{className:'BrandState',useSQLite:true},APP_STORE:{className:'AppStoreState',useSQLite:true}},r2Buckets:['EVIDENCE'],
 bindings:{SITE_HEALTH_PUBLIC_ORIGIN:origin,ACCESS_TEAM_DOMAIN:issuer,ACCESS_AUD:'fixture-audience',ACCESS_OWNER_EMAIL:owner,OWNER_STORE_ID:'fixture',AI_GATEWAY_API_KEY:'synthetic-test-key'},
 serviceBindings:{ASSETS:async()=>{assetReads++;return new Response('<html>Private fixture</html>',{headers:{'content-type':'text/html'}});}},
 outboundService:async request=>{
   if(request.url===issuer+'/cdn-cgi/access/certs')return keysUnavailable ? new Response('Unavailable',{status:503}) : Response.json({keys:[jwk]});
   if(new URL(request.url).hostname==='itunes.apple.com') {appleCalls++;return Response.json({resultCount:1,results:[{wrapperType:'software',kind:'software',trackId:123,trackName:'Synthetic Notes',artistName:'Fixture',trackViewUrl:'https://apps.apple.com/us/app/id123',description:'A synthetic note app.',userRatingCount:0,averageUserRating:0}]});}
   if(request.url==='https://ai-gateway.sassmaker.com/v1/chat/completions') {
     aiCalls++;const sent=await request.json();assert.equal(sent.model,'auto');assert.equal(sent.project_id,'site-health');assert.equal(request.headers.get('x-gateway-project-id'),'site-health');
     return Response.json({id:'synthetic',object:'chat.completion',created:1,model:'auto',choices:[{index:0,message:{role:'assistant',content:JSON.stringify({keywords:[{term:'notes',rationale:'Synthetic hypothesis'}]})},finish_reason:'stop'}]});
   }
   throw new Error('Unexpected external request in synthetic test');
 }};
 const mf=new Miniflare(options);
 const token=async(claims={})=>new SignJWT({email:owner,...claims}).setProtectedHeader({alg:'RS256',kid:'fixture'}).setSubject('owner-fixture').setIssuer(issuer).setAudience('fixture-audience').setIssuedAt().setExpirationTime('5m').sign(keys.privateKey);
 const auth=await token();
 const request=(path,options={})=>mf.dispatchFetch(origin+path,{...options,headers:{'cf-access-jwt-assertion':auth,...options.headers}});
 try{
   for(const path of ['/','/_astro/private.js','/v1/projects','/health','/r2/evidence/catalog/private'])assert.equal((await mf.dispatchFetch(origin+path)).status,401);
   assert.equal(assetReads,0);
   assert.equal((await request('/')).status,200);assert.equal(assetReads,1);
   assert.equal((await request('/_astro/private.js')).headers.get('cache-control'),'private, no-store');
   assert.equal((await mf.dispatchFetch('https://bypass.workers.dev/',{headers:{'cf-access-jwt-assertion':auth}})).status,403);
   for(const claims of [{email:'other@fixture.example'},{iss:'https://other.cloudflareaccess.com'},{aud:'other'}]){
     const bad=await new SignJWT({email:owner,sub:'owner-fixture',iss:issuer,aud:'fixture-audience',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+300,...claims}).setProtectedHeader({alg:'RS256',kid:'fixture'}).sign(keys.privateKey);
     assert.equal((await request('/',{headers:{'cf-access-jwt-assertion':bad}})).status,401);
   }
   for(const claims of [{exp:Math.floor(Date.now()/1000)-120},{iat:Math.floor(Date.now()/1000)+120}]){
     const bad=await new SignJWT({email:owner,sub:'owner-fixture',iss:issuer,aud:'fixture-audience',iat:Math.floor(Date.now()/1000),exp:Math.floor(Date.now()/1000)+300,...claims}).setProtectedHeader({alg:'RS256',kid:'fixture'}).sign(keys.privateKey);
     assert.equal((await request('/',{headers:{'cf-access-jwt-assertion':bad}})).status,401);
   }
   assert.equal((await request('/r2/private')).status,404);
   assert.equal((await request('/v1/readiness/fixture',{method:'PUT',headers:{'content-type':'application/json',origin:'https://evil.example'},body:'{}'})).status,403);
   assert.equal((await request('/v1/readiness/fixture',{method:'PUT',headers:{origin},body:'{}'})).status,415);
   assert.equal((await request('/v1/projects')).status,503);
   const post=body=>({method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body??{})});
   const applePath='/v1/seo/app-store/search?term=notes&country=us&platform=ios&limit=50';
   const first=await request(applePath,post());assert.equal(first.status,200);assert.equal((await first.json()).cache,'miss');
   assert.equal((await (await request(applePath,post())).json()).cache,'hit');assert.equal(appleCalls,1);
   assert.equal((await request('/v1/seo/app-store/lookup?id=123&country=us&platform=ios',post())).status,429);
   const proposal=await request('/v1/seo/app-store/ai',post({mode:'brainstorm',appName:'Synthetic Notes',description:'Synthetic note app.',seed:'notes',locale:'en-US'}));assert.equal(proposal.status,200);assert.equal((await proposal.json()).keywords[0].term,'notes');assert.equal(aiCalls,1);
   const bucket=await mf.getR2Bucket('EVIDENCE');
   const evidence=(family,payload)=>writeEvidence(bucket,{schema:'site-health.cloud-evidence.v1',family,source:'synthetic-fixture',provenance:'authenticated-native-feed',observedAt:'2026-10-31T00:00:00.000Z',payload});
   const payload={generatedAt:'2026-10-31T00:00:00.000Z',outcomes:{domains:[],search:[],seoAudit:[],geoAwareness:[],aiAwareness:[],performance:[]}};
   const manifest={catalog:await evidence('catalog',{projects:[project],collections:[]}),dashboard:await evidence('dashboard',payload),
     uiLibrary:await evidence('ui-library',{siteHealth:null,projects:[],coverage:null}),capabilities:await evidence('capabilities',{schemaVersion:'site-health.capability-projection.v1',sources:{},skills:[]}),spend:await evidence('spend',{state:'not-measured'}),collectors:{psi:{enabled:false,reason:'Synthetic unqualified runner'}}};
   const setup=await mf.dispatchFetch('http://localhost/__test',{method:'POST',body:JSON.stringify({method:'configureRuntime',args:[manifest]})});assert.equal(setup.status,200);
   assert.equal((await request('/v1/projects')).status,200);
   assert.equal((await request('/v1/project-collections')).status,200);
   for(const family of ['domains','search','seo-audit','geo-awareness','ai-awareness','performance']){
     const response=await request('/v1/outcomes/'+family);assert.equal(response.status,200);
     const value=await response.json(),expected=outcomeProjection(payload,family);assert.deepEqual(value.rows,expected.rows);assert.equal(value.schemaVersion,expected.schemaVersion);
   }
   for(const path of ['/v1/readiness','/v1/ui-library','/v1/ui-library?summary=1','/v1/capabilities','/v1/evidence-status','/v1/spend','/v1/projects/fixture/clarity','/v1/brand-evidence/projects','/v1/projects/fixture/brand-evidence','/v1/projects/fixture/brand-evidence/growth','/v1/seo/app-store/status'])assert.equal((await request(path)).status,200,path);
   assert.equal((await request('/v1/metric-runs',{method:'POST',headers:{origin,'content-type':'application/json','idempotency-key':'fixture'},body:JSON.stringify({family:'psi',projectId:'fixture'})})).status,503);
   assert.equal((await request('/v1/readiness/fixture',{method:'PUT',headers:{origin,'content-type':'application/json'},body:'a'.repeat(28*1024+1)})).status,413);
   assert.equal((await request('/v1/readiness/fixture',{method:'PUT',headers:{origin,'content-type':'application/json'},body:'{'})).status,400);
   const save=(key)=>request('/v1/readiness/fixture',{method:'PUT',headers:{origin,'content-type':'application/json'},body:JSON.stringify({expectedRevision:0,idempotencyKey:key,state:emptyReadinessState()})});
   const writes=await Promise.all([save('concurrent-one'),save('concurrent-two')]);assert.deepEqual(writes.map(r=>r.status).sort(),[200,409]);
   const winner=await writes.find(r=>r.status===200).json();assert.equal(winner.revision,1);
   const profile=await request('/v1/projects/fixture/brand-evidence/profile',{method:'PUT',headers:{origin,'content-type':'application/json'},body:JSON.stringify({brandName:'Synthetic fixture'})});assert.equal(profile.status,200);
   assert.equal((await (await request('/v1/projects/fixture/brand-evidence')).json()).profile.brandName,'Synthetic fixture');
   // A malformed content-addressed object cannot be served as valid evidence.
   await bucket.put(`evidence/dashboard/${manifest.dashboard.digest}.json`,JSON.stringify({broken:true}));
   assert.equal((await request('/v1/outcomes/search')).status,503);
 }finally{await mf.dispose();}
 keysUnavailable=true;
 const outage=new Miniflare(options);
 try {const response=await outage.dispatchFetch(origin+'/',{headers:{'cf-access-jwt-assertion':auth}});assert.equal(response.status,503);assert.deepEqual(await response.json(),{error:'Owner authentication temporarily unavailable'});}finally{await outage.dispose();}
 const unconfigured=new Miniflare({...options,bindings:{...options.bindings,ACCESS_AUD:''}});
 try {assert.equal((await unconfigured.dispatchFetch(origin+'/')).status,503);}finally{await unconfigured.dispose();}
});
