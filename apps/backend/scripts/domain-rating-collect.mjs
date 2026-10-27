#!/usr/bin/env node
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import { collectDomainRatings, DomainRatingCollectionError } from '../lib/domain-rating-collector.mjs';
import { domainStrengthRoots } from '../lib/dashboard-backend/domain-scope.mjs';
import { loadDashboardProjects } from '../lib/dashboard-backend/registry.mjs';

function targetsFromArgs(args, configuredTargets) {
  if (args.length === 1 && ['--help', '-h'].includes(args[0])) return { help: true };
  const requested = [];
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] !== '--target' || !args[index + 1]) {
      throw new DomainRatingCollectionError('DOMAIN_RATING_ARGUMENTS_INVALID', 'Use --target <domain> for each requested domain.');
    }
    requested.push(args[index + 1]);
    index += 1;
  }
  if (requested.length === 0) return { targets: configuredTargets };
  const allowed = new Set(configuredTargets);
  if (requested.some((target) => !allowed.has(target))) {
    throw new DomainRatingCollectionError('METRIC_DOMAIN_INVALID', 'Requested target is not in the current Site Health domain scope.');
  }
  return { targets: [...new Set(requested)] };
}

export async function runDomainRatingCollector({ args = process.argv.slice(2), log = console.log, errorLog = console.error } = {}) {
  try {
    const configuredTargets = domainStrengthRoots(loadDashboardProjects());
    const plan = targetsFromArgs(args, configuredTargets);
    if (plan.help) {
      log('Usage: domain-rating-collect.mjs [--target <domain>]...');
      return { help: true };
    }
    const result = await collectDomainRatings({ targets: plan.targets });
    log(`Domain Rating by Ahrefs: ${result.resultCount} domains updated.`);
    return result;
  } catch (error) {
    const code = error instanceof DomainRatingCollectionError ? error.code : 'DOMAIN_RATING_COLLECTOR_FAILED';
    const message = error instanceof DomainRatingCollectionError
      ? error.message
      : 'Domain Rating collection failed. Local history was retained.';
    errorLog(`${code}: ${message}`);
    process.exitCode = 1;
    return { error: { code, message } };
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await runDomainRatingCollector();
}
