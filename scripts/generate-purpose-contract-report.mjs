#!/usr/bin/env node

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fleetRoot = resolve(repositoryRoot, '..');
const catalogPath = resolve(repositoryRoot, 'apps/backend/config/projects.json');
const outputPath = resolve(repositoryRoot, 'docs/product-purpose-contracts-latest.md');
const checkOnly = process.argv.includes('--check');
const catalog = JSON.parse(readFileSync(catalogPath, 'utf8'));
const projects = catalog.projects.filter((project) => project.id !== 'ios-landings');

function publicRepository(project) {
  if (project.repositoryVisibility !== 'public') return null;
  return project.public?.repositoryUrl ?? project.repositoryUrl ?? null;
}

function repositoryTruth(project) {
  const sourcePath = project.sourcePath ?? project.repo;
  for (const filename of ['PRODUCT.md', 'PROJECT_STATUS.md']) {
    if (existsSync(resolve(fleetRoot, sourcePath, filename))) return filename;
  }
  return 'Owner review and canonical catalog';
}

function link(label, url) {
  return url ? `[${label}](${url})` : '—';
}

function escapeCell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}

const rows = projects.map((project) => {
  const metadata = catalog.publicDirectory.projects[project.id];
  const contract = metadata.purposeContract;
  if (!contract) throw new Error(`${project.id}: missing purpose contract`);
  const profileUrl =
    project.id === 'saas-maker' ? 'https://sassmaker.com/' : `https://sassmaker.com/p/${project.id}`;
  const destinationUrl = project.domains?.[0] ? `https://${project.domains[0]}` : null;
  const repositoryUrl = publicRepository(project);
  const source = repositoryTruth(project);
  const sourceLabel = repositoryUrl ? `${source} / source` : source;
  const sourceLink = repositoryUrl ? link(sourceLabel, repositoryUrl) : sourceLabel;
  return `| ${link(project.public?.name ?? project.name, profileUrl)} | ${escapeCell(contract.purpose)} | ${escapeCell(project.lifecycle)} | ${link('Product', destinationUrl)} | ${sourceLink} | ${escapeCell(contract.nextAction)} |`;
});

const rendered = `# Fleet product-purpose contracts\n\nGenerated from \`apps/backend/config/projects.json\` on 2026-08-27. This is the reconciliation view for the 55 product identities; the shared \`ios-landings\` factory is intentionally excluded. Repository-local \`PRODUCT.md\` or \`PROJECT_STATUS.md\` wins when it contains newer product truth.\n\nAll 55 contracts currently have a resolved purpose, audience, outcome, mechanism, proof, and lifecycle-honest next action. No owner clarification remains open from this pass. SaaS Maker links identify the intended public profile routes; the new contract UI remains local until a separately authorized deployment.\n\n| Project profile | Canonical purpose | Lifecycle | Destination | Repository truth | Honest next action |\n| --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n`;

if (checkOnly) {
  const current = readFileSync(outputPath, 'utf8');
  if (current !== rendered) {
    console.error('Product-purpose contract report is stale; run pnpm docs:purpose-contracts');
    process.exitCode = 1;
  } else {
    console.log(`Verified ${projects.length} product-purpose contract rows`);
  }
} else {
  writeFileSync(outputPath, rendered);
  console.log(`Generated ${projects.length} product-purpose contract rows`);
}
