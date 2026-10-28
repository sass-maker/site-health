#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync,writeFileSync,renameSync,readFileSync } from 'node:fs';
import { dirname,resolve,posix } from 'node:path';
import { pathToFileURL } from 'node:url';
import { uiPagesPath,validateUiPages } from '../lib/dashboard-backend/ui-library-pages.mjs';

const args=process.argv.slice(2), option=name=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
if (args.length%2 || args.some((a,i)=>i%2===0&&!['--repo','--collector-repo','--revision','--output','--runtime-samples'].includes(a))) throw Error('Usage: ui-library-pages.mjs [--repo path] [--collector-repo path] [--revision ref] [--output private.json] [--runtime-samples private.json]');
const repo=resolve(option('--repo')??resolve(import.meta.dirname,'../../..'));
const { unresolvedUiCalls,inspectJsxControls }=await import(pathToFileURL(resolve(repo,'apps/web/scripts/ui-source-audit.mjs')).href);
const git=(root,parameters)=>execFileSync('git',['-C',root,...parameters],{encoding:'utf8',maxBuffer:16*1024*1024,stdio:['ignore','pipe','pipe']});
const revision=git(repo,['rev-parse',option('--revision')??'HEAD']).trim();
const collectorRepo=resolve(option('--collector-repo')??resolve(repo,'../saas-maker'));
const collectorRevision=git(collectorRepo,['rev-parse','origin/main']).trim();
const collector=git(collectorRepo,['show',`${collectorRevision}:tooling/scripts/ui-library-coverage.mjs`]);
const { inspectSource }=await import(`data:text/javascript;base64,${Buffer.from(collector).toString('base64')}`);
const tracked=git(repo,['ls-tree','-r','--name-only',revision]).trim().split('\n');
const production=tracked.filter(p=>p.startsWith('apps/web/src/')&&/\.(?:[cm]?[jt]sx?|astro)$/.test(p)&&!p.endsWith('.d.ts')&&!p.includes('/design-review/'));
const texts=new Map(production.map(path=>[path,git(repo,['show',`${revision}:${path}`])]));
const files=production.map(path=>{
  const text=texts.get(path),reading=/\.[jt]sx$/.test(path)?inspectJsxControls(text,path,inspectSource):inspectSource(text,path);
  const unresolved=unresolvedUiCalls(text,path);
  return {path,sha256:createHash('sha256').update(text).digest('hex'),shared:reading.shared.length,bespoke:reading.bespoke.length,unresolved:unresolved.length,controls:{shared:reading.shared,bespoke:reading.bespoke,unresolved},sharedBlocks:reading.blocks};
});
const closure=entry=>{
  const seen=new Set();
  const visit=path=>{
    if(seen.has(path))return;
    if(!texts.has(path))throw Error(`Missing UI source ${path}`);
    seen.add(path);
    const text=texts.get(path);
    for(const match of text.matchAll(/(?:\bfrom\s*|\bimport\s*\(?\s*)['"](\.[^'"]+)['"]/g)) {
      const base=posix.normalize(posix.join(posix.dirname(path),match[1]));
      const dependency=[base,...['.tsx','.ts','.mjs','.js','.astro','/index.tsx','/index.ts'].map(ext=>base+ext)].find(candidate=>texts.has(candidate));
      if(dependency)visit(dependency);
      else if(!/\.(?:css|json)$/.test(base)&&!base.endsWith('.mjs')&&!base.endsWith('.js'))throw Error(`Unresolved UI source import ${path}: ${match[1]}`);
    }
  };
  visit(entry);return [...seen].sort();
};
const routes=[
  ['shell','Sidebar & shell','/*','components/SiteHealthShell.tsx'],
  ['projects','Projects','/projects','pages/projects/index.astro'],
  ['project','Product detail','/projects/[slug]','pages/projects/[slug].astro'],
  ['domains','Domains','/domains','pages/domains.astro'],
  ['performance','Performance','/performance','pages/performance.astro'],
  ['search','Web SEO','/search','pages/search.astro'],
  ['app-store','App Store SEO','/search/app-store','pages/search/app-store.astro'],
  ['awareness','AI awareness','/ai-awareness','pages/ai-awareness.astro'],
  ['readiness','Readiness & history','/readiness','pages/readiness.astro'],
  ['ui-library','UI Library coverage','/ui-library','pages/ui-library.astro'],
];
const registered=new Set(routes.map(r=>`apps/web/src/${r[3]}`));
const extraPages=production.filter(p=>p.startsWith('apps/web/src/pages/')&&p.endsWith('.astro')&&!registered.has(p)&&p!=='apps/web/src/pages/index.astro');
if(extraPages.length)throw Error(`Unregistered UI pages: ${extraPages.join(', ')}`);
const output=resolve(option('--output')??uiPagesPath());
let priorSamples=[];
try { priorSamples=JSON.parse(readFileSync(output,'utf8')).runtimeSamples??[]; } catch(error) { if(error.code!=='ENOENT')throw error; }
let importedSamples=[];
if(option('--runtime-samples')) {
 const imported=JSON.parse(readFileSync(resolve(option('--runtime-samples')),'utf8'));
 importedSamples=Array.isArray(imported)?imported:imported.runtimeSamples;
 if(!Array.isArray(importedSamples))throw Error('Runtime sample import must contain an array');
}
const runtimeSamples=[...new Map([...priorSamples,...importedSamples].filter(sample=>sample?.sourceRevision===revision).map(sample=>[JSON.stringify([sample.route,sample.state,sample.viewport?.width,sample.viewport?.height]),sample])).values()];
const snapshot=validateUiPages({schemaVersion:'site-health-ui-pages.v1',observedAt:new Date().toISOString(),sourceRevision:revision,collectorRevision,method:'reachable-control-call-sites.v2',files,pages:routes.map(([id,label,route,entry])=>({id,label,route,files:closure(`apps/web/src/${entry}`)})),runtimeSamples,limits:['Reachable committed source, with JSX AST traversal including controls passed through props; not rendered area or every possible state.','The shared dashboard renderer is conservatively reachable on each evidence page; its branches are not attributed to individual pages.','Ordinary content, product-specific SVG plots and layout composition are outside the reusable-control denominator.','Runtime ownership markers corroborate source imports; they cannot establish adoption alone.']});
if(importedSamples.some(sample=>sample?.sourceRevision!==revision)||snapshot.runtimeSamples.length!==runtimeSamples.length)throw Error('Runtime samples must have valid counts, dates, viewports and current source revision');
if(output===repo||output.startsWith(`${repo}/`))throw Error('Keep private UI measurements outside the repository');
mkdirSync(dirname(output),{recursive:true,mode:0o700});writeFileSync(`${output}.tmp`,JSON.stringify(snapshot,null,2)+'\n',{mode:0o600});renameSync(`${output}.tmp`,output);
console.log(JSON.stringify({output,sourceRevision:revision,pages:snapshot.pages.length,...snapshot.total}));
