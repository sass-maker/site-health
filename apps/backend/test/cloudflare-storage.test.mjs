import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build } from 'esbuild';
import { Miniflare } from 'miniflare';
import { DashboardStore } from '../lib/dashboard-backend/store.mjs';
import { BrandEvidenceStore } from '../lib/brand-evidence/store.mjs';
import { GrowthCycleStore } from '../lib/brand-evidence/growth-cycle.mjs';
import { AppStoreStore } from '../lib/app-store/store.mjs';
import { exportStoreSnapshot, snapshotDigest, migrationBundle, verifyMigrationBundle, stageMigrationBundle } from '../lib/store-snapshot.mjs';

const event = key => ({type:'visibility.run-recorded',actor:{type:'owner',id:'fixture'},idempotencyKey:key,projectId:'fixture',payload:{runId:'fixture-run',promptSetId:'synthetic',coverage:{},cost:{},metrics:{},citations:[],attempts:[]},evidence:[]});
const definitions = {DASHBOARD:{className:'DashboardState',useSQLite:true},BRAND:{className:'BrandState',useSQLite:true},APP_STORE:{className:'AppStoreState',useSQLite:true},JOBS:{className:'JobState',useSQLite:true}};
async function fixture() {
  const root=await mkdtemp(join(tmpdir(),'site-health-cloud-test-'));
  const bundle=join(root,'worker.mjs');
  await build({entryPoints:['apps/backend/test/fixtures/cloudflare/worker.mjs'],bundle:true,format:'esm',platform:'neutral',target:'es2024',outfile:bundle,external:['cloudflare:workers','node:*'],loader:{'.sql':'text'},conditions:['workerd','worker','browser']});
  const options={modules:true,modulesRoot:root,scriptPath:bundle,compatibilityDate:'2026-07-30',compatibilityFlags:['nodejs_compat'],durableObjects:definitions,durableObjectsPersist:join(root,'durable'),r2Buckets:['EVIDENCE'],r2BucketsPersist:join(root,'r2')};
  const start=()=>new Miniflare(options); let mf=start();
  const call=async(binding,name,method,...args)=>{const response=await mf.dispatchFetch('http://localhost/__test',{method:'POST',body:JSON.stringify({binding,name,method,args})});const body=await response.json();if(!response.ok)throw new Error(body.error);return body.result;};
  return {call,get mf(){return mf;},async restart(){await mf.dispose();mf=start();},async close(){await mf.dispose();}};
}
test('all three stores roundtrip every table, metadata, rowid and sequences in real SQLite Durable Objects',async()=>{
  const f=await fixture();
  const stores={dashboard:new DashboardStore({databasePath:':memory:'}),brand:new BrandEvidenceStore({databasePath:':memory:'}),'app-store':new AppStoreStore({databasePath:':memory:',now:()=>1700000000000})};
  try {
    new GrowthCycleStore(stores.brand);
    stores.dashboard.setMetadata('native:private-receipt',{sample:'retained',at:'2026-01-01'});
    // An allocated then removed event sequence must not be reused after import.
    stores.dashboard.database.exec("INSERT INTO events(id,schema_version,type,occurred_at,recorded_at,actor_json,idempotency_key,visibility,payload_json,evidence_json) VALUES ('fixture',1,'note.created','2026-01-01','2026-01-01','{}','old','private','{}','[]'); DELETE FROM events");
    stores.brand.saveProfile('fixture',{brandName:'Fixture',keywords:['synthetic']});
    stores.brand.addPrompt('fixture','Synthetic prompt');
    const checkId=stores.brand.createCheck({projectId:'fixture',startedAt:'2026-01-01T00:00:00.000Z'});
    stores.brand.recordObservation({projectId:'fixture',checkId,channel:'api-model',provider:'synthetic',model:'fixture',promptText:'Synthetic prompt',status:'error',errorMessage:'Synthetic failure',observedAt:'2026-01-01T00:00:00.000Z'});
    stores.brand.finishCheck(checkId,{status:'failed',attempted:1,completed:0,failed:1,mentionRate:null,summary:'Synthetic failure',finishedAt:'2026-01-01T00:00:00.000Z'});
    stores.brand.upsertFinding('fixture',{source:'synthetic',sourceRecordId:'one',sourceName:'Fixture',title:'Synthetic finding',url:'https://fixture.example/one',relevanceScore:0,intent:'general',origin:'synthetic'});
    stores.brand.createAction('fixture',{subjectKind:'check',subjectId:checkId});
    const collection=stores.brand.startCollection('fixture','synthetic','query');stores.brand.finishCollection(collection,{status:'error',errorMessage:'Synthetic failure'});
    stores.brand.saveCommunityBrief('fixture',{status:'prepared',drafts:[]});
    stores.brand.database.exec("INSERT INTO transfer_batches VALUES ('batch','synthetic','digest','{}','{}','applied','2026-01-01',NULL); INSERT INTO transfer_links VALUES ('batch','observation','one','one','inserted')");
    stores.dashboard.append(event('snapshot-event'));stores.dashboard.rebuildProjections();
    stores.brand.database.prepare('INSERT INTO brand_growth VALUES (?,?,?)').run('fixture',7,JSON.stringify({revision:7,cycles:[],tasks:[]}));
    stores['app-store'].reserveAI(); stores['app-store'].put('capture',{synthetic:true},900000);
    assert.ok(stores.brand.listHistory('fixture').length > 0);
    const snapshots=Object.fromEntries(Object.entries(stores).map(([kind,store])=>[kind,exportStoreSnapshot(store.database??store.db,kind,{now:'2026-01-01T00:00:00.000Z'})]));
    for (const snapshot of Object.values(snapshots)) for (const [name,count] of Object.entries(snapshot.counts)) assert.ok(count > 0, name+' must contain a synthetic row');
    const bundle=migrationBundle(snapshots,{sourceRevision:'1'.repeat(40),watermark:'synthetic-final-watermark'});assert.equal(bundle.digest.length,64);
    for(const [kind,binding] of [['dashboard','DASHBOARD'],['brand','BRAND'],['app-store','APP_STORE']]) {
      const imported=await f.call(binding,'staged','importSnapshot',snapshots[kind]);assert.equal(imported.duplicate,false);assert.deepEqual(imported.counts,snapshots[kind].counts);
      assert.equal((await f.call(binding,'staged','importSnapshot',snapshots[kind])).duplicate,true);
      const exported=await f.call(binding,'staged','exportSnapshot');
      assert.deepEqual(exported.tables,snapshots[kind].tables);assert.deepEqual(exported.sequences,snapshots[kind].sequences);
    }
    const bindings={dashboard:'DASHBOARD',brand:'BRAND','app-store':'APP_STORE'};
    let interruptBrand=true;
    const namespaces=Object.fromEntries(Object.entries(bindings).map(([kind,binding])=>[kind,{getByName:name=>({
      importSnapshot:async snapshot=>{if(kind==='brand' && interruptBrand){interruptBrand=false;throw new Error('Synthetic import interruption');}return f.call(binding,name,'importSnapshot',snapshot);},
      exportSnapshot:()=>f.call(binding,name,'exportSnapshot'),
    })}]));
    await assert.rejects(stageMigrationBundle(bundle,namespaces,{stageId:'staging-resume'}),/Synthetic import interruption/);
    const resumed=await stageMigrationBundle(bundle,namespaces,{stageId:'staging-resume'});assert.equal(resumed.cutoverPerformed,false);assert.equal(resumed.stores.dashboard.duplicate,true);
    const repeated=await stageMigrationBundle(bundle,namespaces,{stageId:'staging-resume'});assert.ok(Object.values(repeated.stores).every(s=>s.duplicate));
    await assert.rejects(stageMigrationBundle(bundle,namespaces,{stageId:'active-owner'}),/staging identity/);
    assert.throws(()=>verifyMigrationBundle({...bundle,watermark:'tampered'}),/digest mismatch/);
    await f.restart();
    const exported=await f.call('DASHBOARD','staged','exportSnapshot');assert.deepEqual(exported.tables,snapshots.dashboard.tables);
    assert.deepEqual((await f.call('BRAND','staged','exportSnapshot')).tables,snapshots.brand.tables);
    assert.deepEqual((await f.call('APP_STORE','staged','exportSnapshot')).tables,snapshots['app-store'].tables);
    const corrupted=structuredClone(snapshots.dashboard);corrupted.tables[0].rows.push({});
    await assert.rejects(f.call('DASHBOARD','corrupt','importSnapshot',corrupted),/digest mismatch/);
    const incomplete=structuredClone(snapshots.brand);incomplete.tables.pop();const {digest,counts,...body}=incomplete;incomplete.digest=snapshotDigest(body);
    await assert.rejects(f.call('BRAND','incomplete','importSnapshot',incomplete),/incomplete/);
    assert.equal((await f.call('DASHBOARD','corrupt','exportSnapshot')).counts.events,0);
    const invalid=structuredClone(snapshots.dashboard);invalid.tables.find(t=>t.name==='idempotency_keys').rows[0].event_id='missing';
    const {digest:oldDigest,counts:oldCounts,...invalidBody}=invalid;invalid.digest=snapshotDigest(invalidBody);
    await assert.rejects(f.call('DASHBOARD','invalid-fk','importSnapshot',invalid),/FOREIGN KEY/);
    assert.equal((await f.call('DASHBOARD','invalid-fk','exportSnapshot')).counts.events,0);
    await f.call('DASHBOARD','staged','test','append',event('after-restart'));
    assert.deepEqual((await f.call('DASHBOARD','staged','test','events')).map(e=>e.sequence),[2,3]);
    await assert.rejects(f.call('DASHBOARD','staged','importSnapshot',snapshots.dashboard),/changed after import/);
  } finally {Object.values(stores).forEach(s=>s.close());await f.close();}
});
test('DO changes, idempotency conflict, transaction rollback, eviction and durable job leases',async()=>{
 const f=await fixture();try{
  await assert.rejects(f.call('DASHBOARD','owner','test','rollback'),/Synthetic rollback/);
  assert.equal((await f.call('DASHBOARD','owner','exportSnapshot')).tables.find(t=>t.name==='local_metadata').rows.length,0);
  const appended=await Promise.all([f.call('DASHBOARD','owner','test','append',event('same')),f.call('DASHBOARD','owner','test','append',event('same'))]);
  assert.equal(appended.filter(x=>x.duplicate).length,1);
  await assert.rejects(f.call('DASHBOARD','owner','test','append',{...event('same'),payload:{...event('same').payload,runId:'different'}}),/already belongs/);
  // Job state, expiry, old-worker fencing and duplicate request semantics use actual DO SQL.
  const start=await f.call('JOBS','queue','test','start',[{family:'psi'},'key']);
  assert.equal((await f.call('JOBS','queue','test','start',[{family:'psi'},'key'])).duplicate,true);
  await assert.rejects(f.call('JOBS','queue','test','start',[{family:'search'},'key']),/conflict/);
  const first=await f.call('JOBS','queue','test','claim',[]);assert.equal(first.job.attempts,1);
  assert.equal(await f.call('JOBS','queue','test','claim',[]),null);
  await f.call('JOBS','queue','test','clock',1001);
  const retry=await f.call('JOBS','queue','test','claim',[]);assert.equal(retry.job.runId,start.runId);assert.equal(retry.job.attempts,2);
  await assert.rejects(f.call('JOBS','queue','test','finish',[start.runId,first.token,{}]),/expired/);
  await f.call('JOBS','queue','test','cancel',[start.runId]);
  await assert.rejects(f.call('JOBS','queue','test','finish',[start.runId,retry.token,{}]),/cancelled/);
  await f.call('DASHBOARD','owner','test','metadata',{key:'persisted',value:42});
  await assert.rejects(f.call('DASHBOARD','owner','test','evict'),/Synthetic eviction/);
  const restored=await f.call('DASHBOARD','owner','exportSnapshot');assert.equal(JSON.parse(restored.tables.find(t=>t.name==='local_metadata').rows[0].value_json),42);
 }finally{await f.close();}
});
