import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import brandConfig from '../config/brand-channels.json' with { type: 'json' };

const PROVIDER_FOR_CHANNEL = { youtube_shorts: 'youtube', instagram_reels: 'instagram' };

export function checkSocialReadiness(options = {}) {
  const configPath = path.resolve(options.configPath ?? process.env.POSTIZ_INTEGRATIONS_CONFIG ?? 'config/postiz-integrations.json');
  const templatePath = path.resolve(options.templatePath ?? 'config/postiz-integrations.example.json');
  const env = options.env ?? process.env;
  const installed = existsSync(configPath);
  const raw = JSON.parse(readFileSync(installed ? configPath : templatePath, 'utf8'));
  const integrations = raw?.integrations ?? {};
  const accounts = [];

  for (const [brandSlug, brand] of Object.entries(brandConfig.brands)) {
    for (const channel of brand.channels) {
      const accountSlug = brand.accountMappings?.[channel] ?? null;
      const mapping = accountSlug ? integrations[accountSlug] : null;
      const expectedProvider = PROVIDER_FOR_CHANNEL[channel];
      const providerMatches = Boolean(mapping?.provider === expectedProvider);
      accounts.push({
        brand: brandSlug,
        channel,
        platform: expectedProvider,
        accountSlug,
        routeConfigured: Boolean(accountSlug),
        accountDeclared: Boolean(mapping?.integrationId),
        integrationIdConfigured: Boolean(mapping?.integrationId),
        providerMatches,
        ready: Boolean(accountSlug && mapping?.integrationId && providerMatches && env.POSTIZ_API_KEY),
      });
    }
  }

  const infrastructure = {
    postizAccess: Boolean(env.POSTIZ_API_KEY),
    artifactBucket: true,
    artifactBaseUrl: true,
    kokoro: options.kokoroReady ?? existsSync(path.resolve('tools/kokoro')),
    ffmpeg: options.ffmpegReady ?? commandExists('ffmpeg', options.pathEnv ?? env.PATH),
  };
  const summary = {
    totalAccounts: accounts.length,
    routedAccounts: accounts.filter((entry) => entry.routeConfigured && entry.accountDeclared && entry.providerMatches).length,
    connectedAccounts: accounts.filter((entry) => entry.ready).length,
    missingCredentialVariables: env.POSTIZ_API_KEY ? [] : ['POSTIZ_API_KEY'],
    infrastructureReady: Object.values(infrastructure).every(Boolean),
  };
  return {
    schema: 'reel-pipeline.social-readiness.v2',
    generatedAt: new Date().toISOString(),
    provider: 'postiz',
    configPath,
    configInstalled: installed,
    activeChannels: ['instagram_reels', 'youtube_shorts'],
    accounts,
    infrastructure,
    summary: { ...summary, readyForLivePosting: summary.connectedAccounts === summary.totalAccounts && summary.infrastructureReady },
  };
}

function commandExists(command, pathEnv = '') {
  return String(pathEnv).split(path.delimiter).some((dir) => existsSync(path.join(dir, command)));
}
