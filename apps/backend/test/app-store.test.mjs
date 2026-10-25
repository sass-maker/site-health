import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AppStoreStore } from '../lib/app-store/store.mjs';
import { DashboardStore } from '../lib/dashboard-backend/store.mjs';
import { startDashboardService } from '../lib/dashboard-backend/service.mjs';

const providerApp = { wrapperType:'software', kind:'software', trackId:123, trackName:'Sample Notes', artistName:'Example', trackViewUrl:'https://apps.apple.com/us/app/id123', description:'A note editor.', userRatingCount:0, averageUserRating:0 };
async function host(t, options={}) {
  const store = new DashboardStore({databasePath:join(mkdtempSync(join(tmpdir(),'aso-host-')),'dashboard.sqlite'),projects:[]});
  const appStoreStore = new AppStoreStore({databasePath:':memory:'});
  let calls=0;
  const server=await startDashboardService({store,appStoreStore,port:0,trustLoopback:true,visibilityPortfolio:{eligible:[],scheduleIntent:{enabled:false}},projectsProvider:()=>[],brandEvidenceEnv:{}, brandEvidenceFetch:async()=>{calls++; return Response.json({resultCount:1,results:[providerApp]});},...options});
  t.after(()=>new Promise(resolve=>server.close(()=>{store.close();appStoreStore.close();resolve();})));
  return {base:`http://127.0.0.1:${server.address().port}/v1/seo/app-store`,dashboardStore:store,appStoreStore,calls:()=>calls};
}
const post=(body={})=>({method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)});
test('host owner gate protects all provider requests before spending allowance',async t=>{
  const h=await host(t,{trustLoopback:false,ownerToken:'test-owner'});
  assert.equal((await fetch(h.base+'/search?term=notes&country=us&platform=ios&limit=50',post())).status,401);
  assert.equal(h.calls(),0);
});
test('host rejects cross-site provider mutations, malformed input, large AI bodies and unsupported routes',async t=>{
  const h=await host(t);
  assert.equal((await fetch(h.base+'/lookup?id=123&country=us&platform=ios',{...post(),headers:{'content-type':'application/json',origin:'https://foreign.example'}})).status,403);
  assert.equal((await fetch(h.base+'/search?term=notes&country=us&platform=wrong',post())).status,400);
  assert.equal((await fetch(h.base+'/ai',post({text:'日'.repeat(25000)}))).status,413);
  assert.equal((await fetch(h.base+'/private',post())).status,404);
  assert.equal(h.calls(),0);
});
test('public captures cache once with stable provenance; quota spans lookup and search',async t=>{
  const h=await host(t),path='/search?term=notes&country=us&platform=ios&limit=50';
  const first=await (await fetch(h.base+path,post())).json();
  assert.equal(first.cache,'miss');assert.equal(first.apps[0].ratings,0);assert.equal(first.observation.apps[0].id,'123');assert.match(first.sourceUrl,/itunes.apple.com/);
  const cached=await (await fetch(h.base+path,post())).json();
  assert.equal(cached.cache,'hit');assert.equal(cached.fetchedAt,first.fetchedAt);assert.equal(cached.observation.id,first.observation.id);assert.equal(h.calls(),1);
  const throttled=await fetch(h.base+'/lookup?id=123&country=us&platform=ios',post());
  assert.equal(throttled.status,429);assert.ok(Number(throttled.headers.get('retry-after'))>0);assert.equal(h.calls(),1);
});
test('persistent shared allowance survives restart; expiry is explicit and cache is bounded',()=>{
  let clock=Date.parse('2026-10-25T12:00:00Z');
  const path=join(mkdtempSync(join(tmpdir(),'app-store-')),'public.sqlite');
  let s=new AppStoreStore({databasePath:path,now:()=>clock});s.reserveApple();s.reserveAI();s.put('a',{fetchedAt:'original'},1000);s.close();
  s=new AppStoreStore({databasePath:path,now:()=>clock});
  assert.throws(()=>s.reserveApple(),e=>e.statusCode===429);assert.throws(()=>s.reserveAI(),e=>e.statusCode===429);
  assert.equal(s.get('a').fetchedAt,'original');clock+=1001;assert.equal(s.get('a'),null);
  for(let i=0;i<140;i++)s.put(String(i),{id:i},10000);
  assert.equal(s.db.prepare('SELECT COUNT(*) AS total FROM public_captures').get().total,128);
  assert.equal(s.put('oversized',{text:'x'.repeat(1900001)},10000),false);s.close();
});
test('AI uses existing Site Health gateway attribution and only returns validated proposals',async t=>{
  let sent;
  const h=await host(t,{brandEvidenceEnv:{AI_GATEWAY_API_KEY:'synthetic-test-key'},brandEvidenceFetch:async(url,init)=>{sent={url,headers:new Headers(init.headers),body:JSON.parse(init.body)};return Response.json({id:'qa',object:'chat.completion',created:1,model:'test',choices:[{index:0,message:{role:'assistant',content:JSON.stringify({keywords:[{term:'notes',rationale:'A hypothesis'}]})},finish_reason:'stop'}],usage:{prompt_tokens:1,completion_tokens:1,total_tokens:2}});}});
  const r=await fetch(h.base+'/ai',post({mode:'brainstorm',appName:'Sample',description:'A note editor.',seed:'notes',locale:'en-US'}));
  assert.equal(r.status,200);assert.equal((await r.json()).keywords[0].term,'notes');assert.equal(sent.headers.get('x-gateway-project-id'),'site-health');assert.equal(sent.body.project_id,'site-health');assert.equal(sent.body.model,'auto');
});

test('unavailable portfolio projection does not block independent App Store SEO or disguise its failure',async t=>{
  const h=await host(t,{prewarmProjection:true,projectionProvider:()=>{throw new Error('catalog projection unavailable');}});
  const health=await (await fetch(h.base.replace('/v1/seo/app-store','')+'/health')).json();assert.equal(health.projection,'unavailable');
  const status=await fetch(h.base+'/status');assert.equal(status.status,200);
  const r=await fetch(h.base+'/lookup?id=123&country=us&platform=ios',post());assert.equal(r.status,200);assert.equal((await r.json()).apps[0].id,'123');
  const search=await fetch(h.base.replace('/v1/seo/app-store','')+'/v1/outcomes/search');assert.equal(search.status,500);assert.match((await search.json()).error,/catalog projection unavailable/);
});

test('projection health follows later provider failure and successful recovery', async t => {
  let failing = false;
  const h = await host(t, { prewarmProjection: true, projectionProvider: () => {
    if (failing) throw new Error('provider unavailable');
    return { schemaVersion: 'dashboard.projection.v1', outcomes: {} };
  }});
  const base = h.base.replace('/v1/seo/app-store', '');
  assert.equal((await (await fetch(base + '/health')).json()).projection, 'available');
  failing = true;
  assert.equal((await fetch(base + '/v1/projections/rebuild', post())).status, 500);
  assert.equal((await (await fetch(base + '/health')).json()).projection, 'unavailable');
  failing = false;
  assert.equal((await fetch(base + '/v1/projections/rebuild', post())).status, 200);
  assert.equal((await (await fetch(base + '/health')).json()).projection, 'available');
});

test('projection health follows catalog and store snapshot failures without blocking independent SEO', async t => {
  let missingCatalog = false;
  const h = await host(t, { prewarmProjection: true, projectsProvider: () => {
    if (missingCatalog) throw new Error('catalog unavailable');
    return [];
  }, projectionProvider: () => ({ schemaVersion: 'dashboard.projection.v1', outcomes: {} }) });
  const base = h.base.replace('/v1/seo/app-store', '');
  const health = async () => (await (await fetch(base + '/health')).json()).projection;
  assert.equal(await health(), 'available');
  missingCatalog = true;
  assert.equal((await fetch(base + '/v1/projections/rebuild', post())).status, 500);
  assert.equal(await health(), 'unavailable');
  assert.equal((await fetch(h.base + '/status')).status, 200);
  missingCatalog = false;
  assert.equal((await fetch(base + '/v1/projections/rebuild', post())).status, 200);
  assert.equal(await health(), 'available');
  const rebuild = h.dashboardStore.rebuildProjections.bind(h.dashboardStore);
  h.dashboardStore.rebuildProjections = () => { throw new Error('snapshot unavailable'); };
  assert.equal((await fetch(base + '/v1/outcomes/search')).status, 500);
  assert.equal(await health(), 'unavailable');
  h.dashboardStore.rebuildProjections = rebuild;
  assert.equal((await fetch(base + '/v1/projections/rebuild', post())).status, 200);
  assert.equal(await health(), 'available');
});
