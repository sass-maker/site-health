import { readFileSync,statSync } from 'node:fs';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const execFileAsync=promisify(execFile);
import { fileURLToPath } from 'node:url';

export const uiPagesPath = () => join(process.env.HOME ?? '', 'Library/Application Support/Fleet Ops/ui-library-coverage/site-health-pages.json');
const valid = value => Number.isSafeInteger(value) && value >= 0;
export function validateUiPages(snapshot) {
  if (snapshot?.schemaVersion !== 'site-health-ui-pages.v1' || !/^[a-f0-9]{40}$/.test(snapshot.sourceRevision ?? '') || !Number.isFinite(Date.parse(snapshot.observedAt)) || Date.parse(snapshot.observedAt)>Date.now()+60_000 || !Array.isArray(snapshot.pages) || !Array.isArray(snapshot.files)) throw Error('Invalid UI coverage snapshot');
  const files = new Map();
  for (const file of snapshot.files) {
    if (typeof file.path !== 'string' || !file.path.startsWith('apps/web/src/') || files.has(file.path) || !valid(file.shared) || !valid(file.bespoke) || !valid(file.unresolved) || !/^[a-f0-9]{64}$/.test(file.sha256 ?? '')) throw Error('Invalid UI coverage file');
    for(const kind of ['shared','bespoke','unresolved']) {
      const sites=file.controls?.[kind];
      if(!Array.isArray(sites)||sites.length!==file[kind]||sites.some(site=>!Number.isSafeInteger(site.line)||site.line<1||typeof (kind==='unresolved'?site.reason:site.name)!=='string'))throw Error('UI coverage lacks matching source evidence');
    }
    files.set(file.path,file);
  }
  const ids = new Set();
  const summarize = paths => {
    if (!Array.isArray(paths) || new Set(paths).size !== paths.length || paths.some(path=>!files.has(path))) throw Error('Invalid UI coverage file scope');
    const selected = paths.map(path=>files.get(path));
    const shared=selected.reduce((n,f)=>n+f.shared,0), bespoke=selected.reduce((n,f)=>n+f.bespoke,0), unresolved=selected.reduce((n,f)=>n+f.unresolved,0), eligible=shared+bespoke+unresolved;
    return {shared,bespoke,unresolved,eligible,percent:unresolved?null:eligible?Math.round(1000*shared/eligible)/10:null};
  };
  const pages=snapshot.pages.map(page=>{
    if (typeof page.id!=='string' || ids.has(page.id) || typeof page.label!=='string' || typeof page.route!=='string' || !page.route.startsWith('/')) throw Error('Invalid UI coverage page');
    ids.add(page.id);
    return {...page,...summarize(page.files)};
  });
  const runtimeSamples=(Array.isArray(snapshot.runtimeSamples)?snapshot.runtimeSamples:[]).filter(sample=>sample?.sourceRevision===snapshot.sourceRevision&&typeof sample.route==='string'&&typeof sample.state==='string'&&valid(sample.shared)&&valid(sample.eligible)&&sample.shared<=sample.eligible&&Number.isFinite(Date.parse(sample.observedAt))&&Date.parse(sample.observedAt)<=Date.now()+60_000&&Number.isSafeInteger(sample.viewport?.width)&&sample.viewport.width>0&&Number.isSafeInteger(sample.viewport?.height)&&sample.viewport.height>0).map(sample=>({...sample,percent:sample.eligible?Math.round(1000*sample.shared/sample.eligible)/10:null}));
  return {...snapshot,pages,total:summarize([...files.keys()]),runtimeSamples,limits:Array.isArray(snapshot.limits)?snapshot.limits.filter(limit=>typeof limit==='string'):[],stale:Date.now()-Date.parse(snapshot.observedAt)>7*86400000};
}
export function qualifyUiPages(snapshot,{revision,dirty}) {
  const current=revision===snapshot.sourceRevision&&!dirty;
  return {...snapshot,current,recordedPercent:snapshot.total.percent,total:{...snapshot.total,percent:current?snapshot.total.percent:null},pages:snapshot.pages.map(page=>({...page,percent:current?page.percent:null})),runtimeSamples:current?snapshot.runtimeSamples:[]};
}
export async function readUiPages(path=uiPagesPath()) {
  try {
    if(statSync(path).size>5*1024*1024)return null;
    const snapshot=validateUiPages(JSON.parse(readFileSync(path,'utf8')));
    const root=fileURLToPath(new URL('../../../../',import.meta.url));
    const git=async args=>(await execFileAsync('git',['-C',root,...args],{encoding:'utf8',timeout:5000})).stdout.trim();
    return qualifyUiPages(snapshot,{revision:await git(['rev-parse','HEAD']),dirty:!!(await git(['status','--porcelain','--untracked-files=normal','--','apps/web/src','apps/web/package.json','apps/web/pnpm-lock.yaml','apps/web/astro.config.mjs','apps/web/scripts/ui-source-audit.mjs']))});
  }
  catch { return null; }
}
