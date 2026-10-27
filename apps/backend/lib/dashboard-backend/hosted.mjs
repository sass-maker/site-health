import { createReadStream } from 'node:fs';
import { readdir, realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, relative, resolve, sep } from 'node:path';
import { createRemoteJWKSet, jwtVerify } from 'jose';

import { createDashboardHandler } from './service.mjs';

const CONTENT_TYPES = new Map(Object.entries({
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif',
  '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2',
  '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8', '.json': 'application/json',
}));

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

function errorResponse(response, status, message) {
  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store',
    'x-content-type-options': 'nosniff',
  });
  response.end(JSON.stringify({ error: message }));
}

export function createAccessAuthorizer(config, { keyResolver } = {}) {
  const resolver = keyResolver ?? createRemoteJWKSet(new URL(`${config.issuer}/cdn-cgi/access/certs`), {
    timeoutDuration: 5000, cooldownDuration: 30_000, cacheMaxAge: 10 * 60_000,
  });
  return async (request) => {
    if (request.headers.host !== config.host) return null;
    const assertion = request.headers['cf-access-jwt-assertion'];
    if (typeof assertion !== 'string' || assertion.length > 16 * 1024) return null;
    try {
      const { payload } = await jwtVerify(assertion, resolver, {
        algorithms: ['RS256'], issuer: config.issuer, audience: config.audience,
        requiredClaims: ['sub', 'iat', 'exp', 'email'],
      });
      if (typeof payload.sub !== 'string' || !payload.sub.trim()
        || typeof payload.email !== 'string' || payload.email.toLowerCase() !== config.ownerEmail
        || payload.iat > Math.floor(Date.now() / 1000)) return null;
      return { subject: payload.sub, email: payload.email };
    } catch { return null; }
  };
}

function within(root, file) {
  const path = relative(root, file);
  return path !== '..' && !path.startsWith(`..${sep}`) && !path.startsWith(sep);
}

async function staticFiles(distDirectory) {
  const root = await realpath(distDirectory);
  const files = new Map();
  const visit = async (directory, prefix = '') => {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || (!prefix && entry.name === 'server')) continue;
      const name = `${prefix}/${entry.name}`;
      const file = join(directory, entry.name);
      // Build output is immutable while served; symlinks are never an asset.
      if (entry.isSymbolicLink()) continue;
      if (entry.isDirectory()) { await visit(file, name); continue; }
      if (!entry.isFile() || !CONTENT_TYPES.has(extname(entry.name))) continue;
      const canonical = await realpath(file);
      if (!within(root, canonical)) continue;
      files.set(name, { file: canonical, type: CONTENT_TYPES.get(extname(entry.name)) });
    }
  };
  await visit(root);
  if (!files.has('/index.html')) throw new Error('Hosted dashboard requires a built index.html');
  return { root, files };
}

export async function createHostedHandler({ config, distDirectory, keyResolver, ...dashboardOptions }) {
  if (!config) throw new Error('Hosted dashboard configuration is required');
  const assets = await staticFiles(distDirectory);
  const authorize = createAccessAuthorizer(config, { keyResolver });
  const principals = new WeakMap();
  const dashboard = createDashboardHandler({ ...dashboardOptions, ownerToken: undefined, trustLoopback: false,
    requestAuthorizer: (request) => principals.get(request), allowedOrigin: config.origin });
  return async (request, response) => {
    response.setHeader('cache-control', 'no-store');
    response.setHeader('x-content-type-options', 'nosniff');
    const principal = await authorize(request);
    if (!principal) return errorResponse(response, 401, 'Owner authentication required');
    principals.set(request, principal);
    try {
      if (!request.url?.startsWith('/') || request.url.startsWith('//')) return errorResponse(response, 400, 'Invalid path');
      const rawPath = request.url.split('?')[0];
      const path = decodeURIComponent(rawPath);
      if (path.includes('\\') || path.includes('\0') || path.split('/').some((part) => ['.', '..'].includes(part))) {
        return errorResponse(response, 400, 'Invalid path');
      }
      if (path === '/api/dashboard' || path.startsWith('/api/dashboard/')) {
        request.url = request.url.slice('/api/dashboard'.length) || '/';
        return await dashboard(request, response);
      }
      if (!['GET', 'HEAD'].includes(request.method)) return errorResponse(response, 405, 'Method not allowed');
      const asset = assets.files.get(path) ?? assets.files.get(`${path.replace(/\/$/, '')}/index.html`);
      if (!asset) return errorResponse(response, 404, 'Not found');
      const canonical = await realpath(asset.file);
      if (canonical !== asset.file || !within(assets.root, canonical)) return errorResponse(response, 404, 'Not found');
      const info = await stat(canonical);
      response.writeHead(200, { 'content-type': asset.type, 'content-length': info.size });
      if (request.method === 'HEAD') return response.end();
      const stream = createReadStream(canonical);
      stream.on('error', () => response.destroy());
      stream.pipe(response);
    } catch {
      if (!response.headersSent) errorResponse(response, 400, 'Invalid request');
      else response.destroy();
    } finally { principals.delete(request); }
  };
}

export async function startHostedDashboardService({ config, distDirectory = resolve('apps/web/dist'), host = '127.0.0.1', port = 4187, ...options }) {
  const server = createServer(await createHostedHandler({ config, distDirectory, ...options }));
  return new Promise((resolveServer, reject) => {
    server.once('error', reject);
    server.listen(port, host, () => resolveServer(server));
  });
}
