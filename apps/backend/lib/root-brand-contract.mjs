import { readFileSync } from 'node:fs';

import {
  domainStrengthRoots,
  normalizedDomain,
  registrableDomain,
} from './dashboard-backend/domain-scope.mjs';

const ROOT_DOMAIN_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/;
const MAX_ALTERNATE_NAMES = 3;

function normalizedName(value) {
  return String(value ?? '').trim().toLocaleLowerCase('en-US');
}

function collectionForBrand(brand, projects) {
  const collection = brand.collection;
  if (collection === undefined) return undefined;
  const fields = ['id', 'description', 'websiteUrl', 'projectIds'];
  if (!collection || typeof collection !== 'object' || Array.isArray(collection)
    || Object.keys(collection).some(key => !fields.includes(key))) {
    throw new Error(`invalid root brand collection: ${brand.rootDomain}`);
  }
  if (typeof collection.id !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(collection.id)
    || typeof collection.description !== 'string' || !collection.description.trim()) {
    throw new Error(`invalid root brand collection identity: ${brand.rootDomain}`);
  }
  let website;
  try { website = new URL(collection.websiteUrl); } catch {}
  if (!website || website.protocol !== 'https:' || website.hostname !== brand.rootDomain
    || website.port || website.username || website.password || website.search || website.hash
    || website.pathname !== '/' || collection.websiteUrl !== `${website.origin}/`) {
    throw new Error(`root brand collection website must be its HTTPS root: ${brand.rootDomain}`);
  }
  const currentIds = new Set(projects.filter(project =>
    ['primary', 'active'].includes(project.lifecycle?.status)).map(project => project.id));
  if (!Array.isArray(collection.projectIds) || collection.projectIds.length < 2
    || new Set(collection.projectIds).size !== collection.projectIds.length
    || collection.projectIds.some(id => !currentIds.has(id))) {
    throw new Error(`root brand collection needs unique current project ids: ${brand.rootDomain}`);
  }
  return {
    id: collection.id,
    description: collection.description.trim(),
    websiteUrl: website.href,
    projectIds: [...collection.projectIds],
  };
}

export function validateRootBrandContract(contract, projects) {
  if (!contract || contract.version !== 1 || !Array.isArray(contract.brands)) {
    throw new Error('root brand contract must contain version 1 and a brands array');
  }

  const byRoot = new Map();
  const globalNames = new Map();
  for (const brand of contract.brands) {
    const root = String(brand?.rootDomain ?? '').trim();
    const canonicalName = String(brand?.canonicalName ?? '').trim();
    const alternateNames = brand?.alternateNames;

    if (!ROOT_DOMAIN_PATTERN.test(root) || root !== root.toLowerCase()) {
      throw new Error(`invalid root brand domain: ${root || '(empty)'}`);
    }
    if (byRoot.has(root)) throw new Error(`duplicate root brand domain: ${root}`);
    if (!canonicalName) throw new Error(`missing canonical brand name: ${root}`);
    if (!Array.isArray(alternateNames) || alternateNames.length > MAX_ALTERNATE_NAMES) {
      throw new Error(`invalid alternate brand names: ${root}`);
    }

    const recordNames = [canonicalName, ...alternateNames];
    const localNames = new Set();
    for (const name of recordNames) {
      const trimmed = String(name ?? '').trim();
      const normalized = normalizedName(trimmed);
      if (!trimmed) throw new Error(`empty brand name: ${root}`);
      if (localNames.has(normalized)) throw new Error(`duplicate brand name for ${root}: ${trimmed}`);
      localNames.add(normalized);

      const existingRoot = globalNames.get(normalized);
      if (existingRoot && existingRoot !== root) {
        throw new Error(`brand name belongs to multiple roots: ${trimmed}`);
      }
      globalNames.set(normalized, root);
    }

    byRoot.set(root, {
      rootDomain: root,
      canonicalName,
      alternateNames: alternateNames.map((name) => String(name).trim()),
    });
  }

  const expectedRoots = domainStrengthRoots(projects);
  const actualRoots = [...byRoot.keys()].sort((left, right) => left.localeCompare(right));
  if (JSON.stringify(actualRoots) !== JSON.stringify(expectedRoots)) {
    const missing = expectedRoots.filter((root) => !byRoot.has(root));
    const extra = actualRoots.filter((root) => !expectedRoots.includes(root));
    throw new Error(`root brand coverage mismatch: missing=${missing.join(',') || 'none'} extra=${extra.join(',') || 'none'}`);
  }

  return byRoot;
}

export function validateRootBrandCollections(contract, projects) {
  const brands = validateRootBrandContract(contract, projects);
  const collections = new Map();
  const collectionIds = new Set();
  const collectionMembers = new Set();
  for (const brand of contract.brands) {
    if (brand.priority !== undefined && !/^P[0-4]$/.test(brand.priority)) {
      throw new Error(`invalid root brand priority: ${brand.rootDomain}`);
    }
    const collection = collectionForBrand(brand, projects);
    if (!collection) continue;
    if (collectionIds.has(collection.id) || collection.projectIds.some(id => collectionMembers.has(id))) {
      throw new Error(`duplicate root brand collection or member: ${brand.rootDomain}`);
    }
    collectionIds.add(collection.id);
    collection.projectIds.forEach(id => collectionMembers.add(id));
    collections.set(brand.rootDomain, {
      ...brands.get(brand.rootDomain),
      ...(brand.priority === undefined ? {} : { priority: brand.priority }),
      collection,
    });
  }
  return collections;
}

export function loadRootBrandContract(path, projects) {
  const contract = JSON.parse(readFileSync(path, 'utf8'));
  return validateRootBrandContract(contract, projects);
}

export function rootBrandForUrl(url, brandMap) {
  const domain = normalizedDomain(url);
  if (!domain) return null;
  return brandMap.get(registrableDomain(domain)) ?? null;
}
