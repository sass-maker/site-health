import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';

// Resolve only the named gateway credential, once per process. Never print or
// persist it, copy a complete secret set, or pass a plaintext key on argv.
export function gatewayEnvironment({
  env = process.env,
  ownerRepository = env.SITE_HEALTH_OWNER_REPOSITORY ?? resolve(import.meta.dirname, '../../../..'),
  readSecret = execFileSync,
} = {}) {
  if (env.AI_GATEWAY_API_KEY || env.GATEWAY_API_KEY) return env;
  const secretName = env.SITE_HEALTH_GATEWAY_SECRET_NAME ?? 'Free_ai';
  try {
    const key = String(readSecret('infisical', [
      'secrets', 'get', secretName, '--plain', '--env', 'dev', '--path', '/', '--silent',
    ], {
      cwd: resolve(ownerRepository, '..'), encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'], timeout: 15_000,
    })).trim();
    if (key) return { ...env, AI_GATEWAY_API_KEY: key };
  } catch { /* Unavailable credentials are reflected by source readiness. */ }
  return env;
}
