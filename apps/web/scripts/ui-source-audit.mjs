import ts from 'typescript';
import { readdirSync, readFileSync } from 'node:fs';
import { resolve,join } from 'node:path';
import { pathToFileURL } from 'node:url';

const controls = new Set(['button','input','select','textarea','details','dialog','progress','table']);
const supported = new Set([...controls,'a','summary','thead','tbody','tfoot','tr','th','td','caption']);
const literals = node => ts.isStringLiteral(node) ? [node.text] : ts.isConditionalExpression(node) ? [...literals(node.whenTrue),...literals(node.whenFalse)] : ['?'];
// Parse every JSX opening separately, including controls passed through props.
// The shared classifier still determines which imported roots qualify.
export function inspectJsxControls(text,path,inspectSource) {
  const source=ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
  const imports=source.statements.filter(ts.isImportDeclaration).map(node=>node.getText(source)).join('\n');
  const result={shared:[],bespoke:[],blocks:[]};
  function visit(node) {
    if(ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node)) {
      const name=node.tagName.getText(source);
      const reading=inspectSource(`${imports}\n<${name}/>`,path);
      const line=source.getLineAndCharacterOfPosition(node.getStart(source)).line+1;
      for(const kind of ['shared','bespoke','blocks'])for(const site of reading[kind])result[kind].push({...site,line});
    }
    ts.forEachChild(node,visit);
  }
  visit(source);return result;
}
export function unresolvedUiCalls(text,path) {
  if (path.endsWith('.astro')) return [...text.matchAll(/<(button|input|select|textarea|details|dialog|progress|table)\b/g)].map(match=>({line:text.slice(0,match.index).split('\n').length,reason:'Native Astro control has no library component owner'}));
  const source=ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true,path.endsWith('x')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  const gaps=[],contentCalls=[];
  const gap=(node,reason)=>gaps.push({line:source.getLineAndCharacterOfPosition(node.getStart(source)).line+1,reason});
  function visit(node) {
    if (ts.isCallExpression(node)&&ts.isIdentifier(node.expression)&&node.expression.text==='element') contentCalls.push(node);
    if ((ts.isJsxOpeningElement(node)||ts.isJsxSelfClosingElement(node))&&controls.has(node.tagName.getText(source))) gap(node,'Native JSX control has no library component owner');
    if (ts.isCallExpression(node)) {
      if (ts.isIdentifier(node.expression)&&node.expression.text==='createUiControl'&&(!node.arguments[0]||literals(node.arguments[0]).some(tag=>!supported.has(tag)))) gap(node,'Library constructor tag cannot be statically qualified');
      if (ts.isPropertyAccessExpression(node.expression)&&node.expression.name.text==='createElement') {
        const arg=node.arguments[0];
        if(arg&&ts.isStringLiteral(arg)&&controls.has(arg.text))gap(node,'Native constructor bypasses a shared control');
        if (!arg || !ts.isStringLiteral(arg)) {
          let parent=node;while(parent&&!ts.isFunctionDeclaration(parent))parent=parent.parent;
          if (!(arg&&ts.isIdentifier(arg)&&arg.text==='tag'&&parent?.name?.text==='element'&&!parent.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword))) gap(node,'Dynamic native constructor has unresolved UI ownership');
        }
      }
      if(ts.isPropertyAccessExpression(node.expression)&&node.expression.name.text==='insertAdjacentHTML')gap(node,'Constructed HTML has unresolved UI ownership');
    }
    if(ts.isBinaryExpression(node)&&ts.isPropertyAccessExpression(node.left)&&['innerHTML','outerHTML'].includes(node.left.name.text))gap(node,'Constructed HTML has unresolved UI ownership');
    ts.forEachChild(node,visit);
  }
  visit(source);
  for (const call of contentCalls) {
    const tags=call.arguments[0]?literals(call.arguments[0]):['?'];
    if(tags.some(tag=>tag==='?'||controls.has(tag)))gap(call,'Content-only DOM helper may construct a reusable control');
  }
  return gaps;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href) {
  const root=resolve(import.meta.dirname,'../src'),failures=[];let files=0;
  const visit=directory=>{for(const entry of readdirSync(directory,{withFileTypes:true})){const path=join(directory,entry.name);if(entry.isDirectory())visit(path);else if(/\.(?:[cm]?[jt]sx?|astro)$/.test(path)&&!path.endsWith('.d.ts')){files++;for(const gap of unresolvedUiCalls(readFileSync(path,'utf8'),path))failures.push({path,...gap});}}};
  visit(root);console.log(JSON.stringify({files,failures},null,2));if(failures.length)process.exitCode=1;
}
