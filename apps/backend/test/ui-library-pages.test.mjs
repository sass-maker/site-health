import test from 'node:test';
import assert from 'node:assert/strict';
import { validateUiPages,qualifyUiPages } from '../lib/dashboard-backend/ui-library-pages.mjs';
const fixture=()=>({schemaVersion:'site-health-ui-pages.v1',sourceRevision:'a'.repeat(40),observedAt:new Date().toISOString(),files:[{path:'apps/web/src/shared.tsx',sha256:'b'.repeat(64),shared:3,bespoke:1,unresolved:0,controls:{shared:[{name:'Button',line:1},{name:'Input',line:2},{name:'Select',line:3}],bespoke:[{name:'button',line:4}],unresolved:[]}}],pages:[{id:'a',label:'A',route:'/a',files:['apps/web/src/shared.tsx']},{id:'b',label:'B',route:'/b',files:['apps/web/src/shared.tsx']}],runtimeSamples:[]});
test('page overlap never double-counts overall coverage and saved percentages cannot override counts',()=>{
  const data=fixture();data.total={percent:100};const result=validateUiPages(data);
  assert.equal(result.total.percent,75);assert.equal(result.total.shared,3);assert.equal(result.pages[0].percent,75);assert.equal(result.pages[1].percent,75);
});
test('unresolved ownership blocks qualification and zero controls never become 100%',()=>{
  const data=fixture();data.files[0].unresolved=1;data.files[0].controls.unresolved.push({line:5,reason:'Unknown constructor'});assert.equal(validateUiPages(data).total.percent,null);
  data.files[0].shared=data.files[0].bespoke=data.files[0].unresolved=0;data.files[0].controls={shared:[],bespoke:[],unresolved:[]};assert.equal(validateUiPages(data).total.percent,null);
});
test('missing files, duplicate routes and invalid dates fail closed',()=>{
  const data=fixture();data.pages[0].files.push('apps/web/src/missing.tsx');assert.throws(()=>validateUiPages(data));
  const duplicate=fixture();duplicate.pages[1].id='a';assert.throws(()=>validateUiPages(duplicate));
  const future=fixture();future.observedAt=new Date(Date.now()+3600000).toISOString();assert.throws(()=>validateUiPages(future));
});
test('a different revision or local UI changes cannot display current coverage',()=>{
  const report=validateUiPages(fixture());
  assert.equal(qualifyUiPages(report,{revision:report.sourceRevision,dirty:false}).total.percent,75);
  assert.equal(qualifyUiPages(report,{revision:'c'.repeat(40),dirty:false}).total.percent,null);
  assert.equal(qualifyUiPages(report,{revision:report.sourceRevision,dirty:true}).total.percent,null);
});

test('runtime evidence stays separate and requires matching source, valid counts and viewport',()=>{
 const data=fixture();const sample={sourceRevision:data.sourceRevision,route:'/a',state:'loaded',observedAt:data.observedAt,shared:2,eligible:3,viewport:{width:390,height:844}};
 data.runtimeSamples=[sample,{...sample,sourceRevision:'c'.repeat(40)},{...sample,shared:4},{...sample,viewport:{width:-1,height:844}}];
 const result=validateUiPages(data);assert.equal(result.runtimeSamples.length,1);assert.equal(result.runtimeSamples[0].percent,66.7);assert.equal(result.total.percent,75);
 assert.equal(qualifyUiPages(result,{revision:'c'.repeat(40),dirty:false}).runtimeSamples.length,0);
});
