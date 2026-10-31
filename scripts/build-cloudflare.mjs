import { build } from 'esbuild';
const result = await build({ entryPoints:['apps/backend/cloudflare/worker.mjs'], bundle:true, format:'esm', platform:'neutral', target:'es2024',
  outfile:'apps/backend/cloudflare/.build/worker.mjs', external:['cloudflare:workers','node:*'], loader:{'.sql':'text'}, metafile:true, conditions:['workerd','worker','browser'] });
const unsupported = new Set(['node:sqlite','node:fs','node:fs/promises','node:child_process','node:dns','node:dns/promises','node:os']);
for (const output of Object.values(result.metafile.outputs)) for (const imported of output.imports) {
  if (unsupported.has(imported.path)) throw new Error(`Unsupported Worker dependency: ${imported.path}`);
}
