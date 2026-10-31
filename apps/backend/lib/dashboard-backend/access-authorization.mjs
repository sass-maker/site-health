import { createRemoteJWKSet, jwtVerify } from 'jose';

const CLOCK_TOLERANCE_SECONDS = 60;
const KEY_AVAILABILITY_ERRORS = new Set(['ERR_JWKS_TIMEOUT', 'ERR_JWKS_INVALID', 'ERR_JOSE_GENERIC']);
export class AccessKeysUnavailable extends Error {}

function exactHttpsOrigin(value, name) {
  let url;
  try { url = new URL(value); } catch { throw new Error(`${name} must be an exact HTTPS origin`); }
  if (url.protocol !== 'https:' || url.origin !== value || url.username || url.password) {
    throw new Error(`${name} must be an exact HTTPS origin`);
  }
  return url;
}

export function hostedConfiguration(env = process.env) {
  if (env.SITE_HEALTH_HOSTED !== '1') {
    if (env.SITE_HEALTH_HOSTED) throw new Error('SITE_HEALTH_HOSTED must be 1 when enabled');
    return null;
  }
  const origin = exactHttpsOrigin(env.SITE_HEALTH_PUBLIC_ORIGIN, 'SITE_HEALTH_PUBLIC_ORIGIN');
  const issuer = exactHttpsOrigin(env.ACCESS_TEAM_DOMAIN, 'ACCESS_TEAM_DOMAIN');
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.cloudflareaccess\.com$/.test(issuer.hostname) || issuer.port) {
    throw new Error('ACCESS_TEAM_DOMAIN must be https://<team>.cloudflareaccess.com');
  }
  if (typeof env.ACCESS_AUD !== 'string' || !env.ACCESS_AUD.trim() || env.ACCESS_AUD !== env.ACCESS_AUD.trim()) {
    throw new Error('ACCESS_AUD is required');
  }
  if (typeof env.ACCESS_OWNER_EMAIL !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(env.ACCESS_OWNER_EMAIL)) {
    throw new Error('ACCESS_OWNER_EMAIL must be an email address');
  }
  return Object.freeze({ origin: origin.origin, host: origin.host, issuer: issuer.origin,
    audience: env.ACCESS_AUD, ownerEmail: env.ACCESS_OWNER_EMAIL.toLowerCase() });
}

export function createAccessAuthorizer(config, { keyResolver } = {}) {
  const resolver = keyResolver ?? createRemoteJWKSet(new URL(`${config.issuer}/cdn-cgi/access/certs`), {
    timeoutDuration: 5000, cooldownDuration: 30_000, cacheMaxAge: 10 * 60_000,
  });
  const resolveKeys = async (...args) => {
    try { return await resolver(...args); }
    catch (error) {
      if (error instanceof TypeError || KEY_AVAILABILITY_ERRORS.has(error?.code)) throw new AccessKeysUnavailable();
      throw error;
    }
  };
  return async (request) => {
    if (request.headers.host !== config.host) return null;
    const assertion = request.headers['cf-access-jwt-assertion'];
    if (typeof assertion !== 'string' || assertion.length > 16 * 1024) return null;
    try {
      const { payload } = await jwtVerify(assertion, resolveKeys, {
        algorithms: ['RS256'], issuer: config.issuer, audience: config.audience,
        requiredClaims: ['sub', 'iat', 'exp', 'email'], clockTolerance: CLOCK_TOLERANCE_SECONDS,
      });
      if (typeof payload.sub !== 'string' || !payload.sub.trim()
        || typeof payload.email !== 'string' || payload.email.toLowerCase() !== config.ownerEmail
        || payload.iat > Math.floor(Date.now() / 1000) + CLOCK_TOLERANCE_SECONDS) return null;
      return { subject: payload.sub, email: payload.email };
    } catch (error) {
      if (error instanceof AccessKeysUnavailable) throw error;
      return null;
    }
  };
}

