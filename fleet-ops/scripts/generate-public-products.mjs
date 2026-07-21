#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { buildPublicProducts } from '../lib/public-products.mjs';

const root = path.resolve(import.meta.dirname, '../..');
const paths = {
  projects: path.join(root, 'fleet-ops/config/projects.json'),
  marketing: path.join(root, 'fleet-ops/config/marketing-program.json'),
  annotations: path.join(root, 'fleet-ops/config/public-products.json'),
  output: path.join(root, 'fleet-ops/public/products.json'),
};

const [projects, marketingProgram, annotations] = await Promise.all([
  readJson(paths.projects),
  readJson(paths.marketing),
  readJson(paths.annotations),
]);
const rendered = `${JSON.stringify(buildPublicProducts({ projects, marketingProgram, annotations }), null, 2)}\n`;

if (process.argv.includes('--check')) {
  const current = await readFile(paths.output, 'utf8').catch(() => '');
  if (current !== rendered) {
    console.error('Fleet public product projection is stale; run npm run generate:public');
    process.exitCode = 1;
  } else {
    console.log(`Fleet public product projection is current (${annotations.products.length} products)`);
  }
} else {
  await writeFile(paths.output, rendered);
  console.log(`Wrote ${path.relative(root, paths.output)} (${annotations.products.length} products)`);
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}
