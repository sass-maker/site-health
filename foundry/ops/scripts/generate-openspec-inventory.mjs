#!/usr/bin/env node

import { existsSync, realpathSync } from 'node:fs';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const fleetRoot = resolve(import.meta.dirname, '../../..');
const desktopRoot = dirname(fleetRoot);
const inactiveRoot = join(desktopRoot, 'fleet-inactive-projects');
const outputPath = join(fleetRoot, 'foundry/ops/docs/openspec-inventory.md');
const fleetSpecRoot = realpathSync(join(fleetRoot, 'openspec'));
const trackedFleetOpenSpecFiles = trackedFiles(join(fleetRoot, 'foundry/openspec'));
const registry = JSON.parse(
  await readFile(join(fleetRoot, 'foundry/ops/config/automation-registry.json'), 'utf8'),
);

const attentionOrder = new Map(
  ['my-work', 'toolbox', 'foundry', 'ignored'].map((value, index) => [value, index]),
);

const projects = [];
for (const entry of registry.entries) {
  const checkout = resolveCheckout(entry);
  const specRoot = checkout ? join(checkout, 'openspec') : null;
  projects.push({
    id: entry.id,
    name: entry.name,
    attention: entry.attention,
    checkout,
    checkoutPresent: Boolean(checkout && existsSync(checkout)),
    specRoot: specRoot && existsSync(specRoot) ? specRoot : null,
  });
}

projects.sort(
  (left, right) =>
    attentionOrder.get(left.attention) - attentionOrder.get(right.attention) ||
    left.name.localeCompare(right.name),
);

const rootOwners = new Map();
for (const project of projects.filter((item) => item.specRoot)) {
  const owners = rootOwners.get(project.specRoot) ?? [];
  owners.push(project.name);
  rootOwners.set(project.specRoot, owners);
}

const projectRoots = [];
for (const [specRoot, owners] of rootOwners) {
  projectRoots.push({
    kind: 'project',
    id: owners.join(', '),
    root: dirname(specRoot),
    scan: await scanOpenSpec(specRoot),
  });
}
projectRoots.sort((left, right) => left.id.localeCompare(right.id));

const stores = await registeredStores();
const storeRoots = [];
for (const store of stores) {
  if (resolve(store.root) === fleetRoot) continue;
  const specRoot = join(store.root, 'openspec');
  storeRoots.push({
    kind: 'store',
    id: store.id,
    root: store.root,
    scan: existsSync(specRoot) ? await scanOpenSpec(specRoot) : null,
  });
}
storeRoots.sort((left, right) => left.id.localeCompare(right.id));

const rendered = render({ projects, projectRoots, storeRoots });
await writeFile(outputPath, rendered);
console.log(
  `Wrote ${relative(fleetRoot, outputPath)} (${projects.length} registry entries, ${projectRoots.length} project OpenSpec roots, ${storeRoots.length} external stores)`,
);

function resolveCheckout(entry) {
  if (entry.attention === 'ignored') {
    return join(inactiveRoot, entry.id);
  }
  if (entry.id === 'fleet-workspace') return fleetRoot;
  if (entry.repository === 'portfolio') return join(desktopRoot, 'portfolio');
  if (entry.repository) return join(fleetRoot, entry.repository);
  return null;
}

async function scanOpenSpec(specRoot) {
  specRoot = realpathSync(specRoot);
  const trackedOnly = specRoot === fleetSpecRoot;
  const specs = [];
  const specsRoot = join(specRoot, 'specs');
  for (const name of await directories(specsRoot)) {
    const specPath = join(specsRoot, name, 'spec.md');
    if (
      existsSync(specPath) &&
      (!trackedOnly || trackedFleetOpenSpecFiles.has(specPath))
    ) {
      specs.push(name);
    }
  }

  const changes = [];
  const changesRoot = join(specRoot, 'changes');
  for (const name of await directories(changesRoot)) {
    if (name === 'archive') continue;
    const changeRoot = join(changesRoot, name);
    if (trackedOnly && !hasTrackedFile(changeRoot)) continue;
    if (!existsSync(join(changeRoot, 'proposal.md')) && !existsSync(join(changeRoot, '.openspec.yaml'))) {
      continue;
    }
    const tasks = await readFile(join(changeRoot, 'tasks.md'), 'utf8').catch(() => '');
    const total = (tasks.match(/^- \[[ xX]\]/gm) ?? []).length;
    const complete = (tasks.match(/^- \[[xX]\]/gm) ?? []).length;
    changes.push({
      name,
      complete,
      total,
      status: total === 0 ? 'planned' : complete === total ? 'complete' : 'in progress',
    });
  }

  const archivedRoot = join(changesRoot, 'archive');
  const archived = (await directories(archivedRoot)).filter(
    (name) => !trackedOnly || hasTrackedFile(join(archivedRoot, name)),
  );
  return {
    specs: specs.sort(),
    changes: changes.sort((left, right) => left.name.localeCompare(right.name)),
    archivedCount: archived.length,
  };
}

async function directories(root) {
  if (!existsSync(root)) return [];
  return (await readdir(root, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name);
}

async function registeredStores() {
  const result = spawnSync('openspec', ['store', 'list', '--json'], {
    cwd: fleetRoot,
    encoding: 'utf8',
  });
  if (result.status !== 0) return [];
  try {
    return JSON.parse(result.stdout).stores ?? [];
  } catch {
    return [];
  }
}

function trackedFiles(root) {
  const result = spawnSync('git', ['ls-files', '--cached', '--', relative(fleetRoot, root)], {
    cwd: fleetRoot,
    encoding: 'utf8',
  });
  if (result.status !== 0) return new Set();
  return new Set(
    result.stdout
      .split('\n')
      .filter(Boolean)
      .map((file) => resolve(fleetRoot, file)),
  );
}

function hasTrackedFile(root) {
  const prefix = `${root}/`;
  return [...trackedFleetOpenSpecFiles].some(
    (file) => file === root || file.startsWith(prefix),
  );
}

function displayPath(target) {
  if (!target) return '—';
  const fromFleet = relative(fleetRoot, target);
  if (!fromFleet.startsWith('..')) return fromFleet || '.';
  return `../${relative(desktopRoot, target)}`;
}

function escapeCell(value) {
  return String(value).replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function render({ projects: projectEntries, projectRoots: roots, storeRoots: storesToRender }) {
  const availableProjects = projectEntries.filter((project) => project.specRoot).length;
  const totalSpecs = roots.reduce((sum, item) => sum + item.scan.specs.length, 0);
  const totalChanges = roots.reduce((sum, item) => sum + item.scan.changes.length, 0);
  const lines = [
    '# Fleet OpenSpec inventory',
    '',
    'Generated by `npm run generate:openspec-inventory` from the canonical Fleet',
    'registry, current local checkouts, the Desktop inactive-project archive, and',
    'registered OpenSpec stores. This inventories planning artifacts; it does not',
    'reactivate ignored projects.',
    '',
    '## Summary',
    '',
    `- Registry entries: ${projectEntries.length}`,
    `- Project/component checkouts with OpenSpec: ${availableProjects}`,
    `- Project/component spec roots: ${roots.length}`,
    `- Project/component base specs: ${totalSpecs}`,
    `- Project/component active changes: ${totalChanges}`,
    `- Registered external stores (excluding Fleet itself): ${storesToRender.length}`,
    '',
    '## Project coverage',
    '',
    '| Attention | Project | Checkout | OpenSpec |',
    '| --- | --- | --- | --- |',
  ];

  for (const project of projectEntries) {
    const state = !project.checkoutPresent
      ? 'checkout missing'
      : project.specRoot
        ? 'available'
        : 'none';
    lines.push(
      `| ${escapeCell(project.attention)} | ${escapeCell(project.name)} | \`${escapeCell(displayPath(project.checkout))}\` | ${state} |`,
    );
  }

  lines.push('', '## Project and component OpenSpecs', '');
  for (const item of roots) {
    lines.push(`### ${item.id}`, '', `Root: \`${displayPath(item.root)}\``, '');
    lines.push(
      item.scan.specs.length
        ? `Base specs: ${item.scan.specs.map((name) => `\`${name}\``).join(', ')}`
        : 'Base specs: none',
      '',
    );
    if (item.scan.changes.length) {
      lines.push('| Active change | Progress | State |', '| --- | ---: | --- |');
      for (const change of item.scan.changes) {
        lines.push(
          `| \`${escapeCell(change.name)}\` | ${change.complete}/${change.total} | ${change.status} |`,
        );
      }
      lines.push('');
    } else {
      lines.push('Active changes: none', '');
    }
    lines.push(`Archived changes: ${item.scan.archivedCount}`, '');
  }

  lines.push('## Registered cross-project stores', '');
  if (!storesToRender.length) {
    lines.push('No external stores are registered.', '');
  }
  for (const store of storesToRender) {
    lines.push(`### ${store.id}`, '', `Root: \`${displayPath(store.root)}\``, '');
    if (!store.scan) {
      lines.push('Status: registered checkout missing', '');
      continue;
    }
    lines.push(
      store.scan.specs.length
        ? `Base specs: ${store.scan.specs.map((name) => `\`${name}\``).join(', ')}`
        : 'Base specs: none',
      '',
    );
    if (store.scan.changes.length) {
      lines.push('| Active change | Progress | State |', '| --- | ---: | --- |');
      for (const change of store.scan.changes) {
        lines.push(
          `| \`${escapeCell(change.name)}\` | ${change.complete}/${change.total} | ${change.status} |`,
        );
      }
      lines.push('');
    } else {
      lines.push('Active changes: none', '');
    }
    lines.push(`Archived changes: ${store.scan.archivedCount}`, '');
  }

  lines.push(
    '## Interpretation',
    '',
    '- **Available** means an `openspec/` directory exists in the current checkout.',
    '- **None** means the project is present but has no OpenSpec artifacts.',
    '- **Checkout missing** means the registry entry has no corresponding local checkout.',
    '- Completed but unarchived changes remain listed because they still require lifecycle closure.',
    '- Ignored projects remain excluded from operations even when their historical OpenSpecs are available.',
  );
  return `${lines.join('\n')}\n`;
}
