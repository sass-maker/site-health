import test from 'node:test';
import assert from 'node:assert/strict';
import { unresolvedUiCalls } from '../scripts/ui-source-audit.mjs';
test('a library marker cannot qualify a raw application control',()=>{
  assert.equal(unresolvedUiCalls('const View=()=> <button data-slot="button">Go</button>;','view.tsx').length,1);
  assert.equal(unresolvedUiCalls('const text="<button>example</button>"; // <input/>','view.tsx').length,0);
});
test('unknown DOM constructors block coverage, while the bounded content helper stays content only',()=>{
  const helper='function element(tag){return document.createElement(tag);}';
  assert.equal(unresolvedUiCalls(helper+'element("p");','view.ts').length,0);
  assert.equal(unresolvedUiCalls(helper+'element("button");','view.ts').length,1);
  assert.equal(unresolvedUiCalls(helper+'element(variable);','view.ts').length,1);
  assert.equal(unresolvedUiCalls('document.createElement(variable);','view.ts').length,1);
  assert.equal(unresolvedUiCalls('document.createElement("button");','view.ts').length,1);
  assert.equal(unresolvedUiCalls('host.innerHTML=template;','view.ts').length,1);
});
test('only statically supported library constructor tags qualify',()=>{
  assert.equal(unresolvedUiCalls('createUiControl(flag?"button":"input");','view.ts').length,0);
  assert.equal(unresolvedUiCalls('createUiControl(flag?"button":unknown);','view.ts').length,1);
  assert.equal(unresolvedUiCalls('createUiControl("script");','view.ts').length,1);
});

// JSX controls in props must not disappear behind a shared shell.
test('JSX traversal includes controls supplied as component props', async()=>{
  const {inspectJsxControls}=await import('../scripts/ui-source-audit.mjs');
  const seen=[];
  inspectJsxControls('import {Button} from "@saas-maker/ui/components/button"; const x=<Shell secondary={<Button>Go</Button>}/>;', 'test.tsx',(text)=>{seen.push(text);return {shared:[],bespoke:[],blocks:[]};});
  assert.equal(seen.length,2);assert.ok(seen.some(text=>text.endsWith('<Button/>')));
});
