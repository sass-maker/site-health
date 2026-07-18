#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const ROOT = resolve(import.meta.dirname, '..', '..');
const CONTRACT_PATH = resolve(ROOT, 'fleet-ops/config/spotlight-products.json');
const PORTFOLIO_SPOTLIGHT_PATH = resolve(ROOT, '../portfolio/src/data/spotlight-products.ts');
const FOUNDRY_PATH = resolve(ROOT, 'saas-maker/foundry.projects.json');
const PRODUCT_SITES_PATH = resolve(ROOT, 'saas-maker/apps/showcase/src/data/product-sites.json');

const contract = JSON.parse(await readFile(CONTRACT_PATH, 'utf8'));
const portfolioSource = await readFile(PORTFOLIO_SPOTLIGHT_PATH, 'utf8');
const foundry = JSON.parse(await readFile(FOUNDRY_PATH, 'utf8'));
const productSites = JSON.parse(await readFile(PRODUCT_SITES_PATH, 'utf8'));

const expected = contract.products;
const errors = [];

if (expected.length !== 5) errors.push(`contract must contain 5 products, found ${expected.length}`);
if (new Set(expected.map((p) => p.id)).size !== expected.length) errors.push('contract contains duplicate IDs');

for (const product of expected) {
  for (const field of ['id', 'showcaseId', 'label', 'name', 'url', 'organizationUrl', 'repositoryUrl', 'description']) {
    if (!product[field]) errors.push(`${product.id || '<unknown>'} is missing ${field}`);
  }

  if (!portfolioSource.includes(`id: '${product.id}'`)) {
    errors.push(`portfolio spotlight data is missing ${product.id}`);
  }
  if (!portfolioSource.includes(product.url)) {
    errors.push(`portfolio spotlight data has the wrong URL for ${product.id}`);
  }
}

const foundryKeyBySpotlightId = {
  codevetter: 'CodeVetter',
  posttrainllm: 'posttrainllm',
  heypace: 'pace',
  hisignal: 'high-signal',
  'saas-maker': 'saas-maker',
};
const spotlightFoundryKeys = Object.entries(foundry)
  .filter(([, project]) => project.spotlight === true)
  .map(([id]) => id)
  .sort();
const expectedFoundryKeys = expected.map((p) => foundryKeyBySpotlightId[p.id]).sort();
if (JSON.stringify(spotlightFoundryKeys) !== JSON.stringify(expectedFoundryKeys)) {
  errors.push(`foundry spotlight keys drifted: expected ${expectedFoundryKeys.join(', ')}, found ${spotlightFoundryKeys.join(', ')}`);
}

const spotlightSites = productSites.products
  .filter((product) => product.spotlight === true)
  .map((product) => `${product.id}:${product.url}`)
  .sort();
const expectedSites = expected
  .map((product) => `${product.showcaseId}:${product.url}`)
  .sort();
if (JSON.stringify(spotlightSites) !== JSON.stringify(expectedSites)) {
  errors.push(`showcase spotlight sites drifted: expected ${expectedSites.join(', ')}, found ${spotlightSites.join(', ')}`);
}

if (errors.length) {
  console.error('Spotlight contract FAILED');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Spotlight contract OK (${expected.length} products): ${expected.map((p) => p.id).join(', ')}`);
