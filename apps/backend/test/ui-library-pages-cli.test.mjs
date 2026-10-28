import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {execFileSync,spawnSync} from 'node:child_process';

test('page collector imports and retains runtime evidence, replaces duplicates and rejects foreign source without overwriting',()=>{
 const temporary=mkdtempSync(join(tmpdir(),'site-health-ui-pages-'));
 const collector=join(temporary,'collector');mkdirSync(join(collector,'tooling/scripts'),{recursive:true});
 writeFileSync(join(collector,'tooling/scripts/ui-library-coverage.mjs'),'export const inspectSource=()=>({shared:[],bespoke:[],blocks:[]});');
 const git=args=>execFileSync('git',['-C',collector,...args],{stdio:'pipe',encoding:'utf8'}).trim();
 git(['init','-q']);git(['add','.']);git(['-c','user.name=Fixture','-c','user.email=fixture@example.invalid','commit','-qm','collector fixture']);git(['update-ref','refs/remotes/origin/main','HEAD']);
 const repo=resolve(import.meta.dirname,'../../..'), revision=execFileSync('git',['-C',repo,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
 const output=join(temporary,'pages.json'), input=join(temporary,'samples.json');
 const sample={sourceRevision:revision,route:'/projects',state:'loaded',observedAt:new Date().toISOString(),shared:2,eligible:3,viewport:{width:390,height:844}};
 const run=(extra=[])=>spawnSync(process.execPath,[join(repo,'apps/backend/scripts/ui-library-pages.mjs'),'--repo',repo,'--collector-repo',collector,'--output',output,...extra],{encoding:'utf8',timeout:30000});
 writeFileSync(input,JSON.stringify([sample]));
 let result=run(['--runtime-samples',input]);assert.equal(result.status,0,result.stderr);
 assert.equal(JSON.parse(readFileSync(output)).runtimeSamples[0].percent,66.7);
 result=run();assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(readFileSync(output)).runtimeSamples.length,1);
 writeFileSync(input,JSON.stringify([{...sample,shared:3}]));
 result=run(['--runtime-samples',input]);assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(readFileSync(output)).runtimeSamples[0].percent,100);
 const before=readFileSync(output,'utf8');writeFileSync(input,JSON.stringify([{...sample,sourceRevision:'0'.repeat(40)}]));
 result=run(['--runtime-samples',input]);assert.notEqual(result.status,0);assert.equal(readFileSync(output,'utf8'),before);
});
