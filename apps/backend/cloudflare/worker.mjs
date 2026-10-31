import { createAccessAuthorizer, hostedConfiguration, AccessKeysUnavailable } from '../lib/dashboard-backend/access-authorization.mjs';
import { readEvidence } from './evidence.mjs';
import { jsonResponse } from './http.mjs';
export { DashboardState, BrandState, AppStoreState } from './objects.mjs';

// Cache only verified configuration and public JWKS state, never a principal
// or an authorization decision from a request.
let authorization;
function authorizer(config) {
  const key = JSON.stringify(config);
  if (authorization?.key !== key) authorization = { key, verify:createAccessAuthorizer(config) };
  return authorization.verify;
}
export default {
  async fetch(request,env) {
    try {
      const config = hostedConfiguration({ ...env, SITE_HEALTH_HOSTED:'1' });
      if (!config || !env.OWNER_STORE_ID) return jsonResponse(503,{error:'Hosted owner configuration unavailable'});
      const url = new URL(request.url);
      if (url.origin !== config.origin) return jsonResponse(403,{error:'Unknown dashboard host'});
      const authorize = authorizer(config);
      const principal = await authorize({headers:{host:url.host,'cf-access-jwt-assertion':request.headers.get('cf-access-jwt-assertion')}});
      if (!principal) return jsonResponse(401,{error:'owner authentication required'});
      if (!['GET','HEAD'].includes(request.method)) {
        if (request.headers.get('origin') !== config.origin || !['same-origin','same-site','none',null].includes(request.headers.get('sec-fetch-site'))) return jsonResponse(403,{error:'Unknown dashboard origin'});
        if (request.headers.get('content-type')?.split(';')[0].trim().toLowerCase() !== 'application/json') return jsonResponse(415,{error:'Browser mutations require application/json'});
      }
      // R2 has no public route. Even an authenticated owner must use an
      // attributed evidence manifest; paths never become arbitrary object keys.
      if (/^\/(?:r2|evidence|internal|migration)(?:\/|$)/.test(url.pathname)) return jsonResponse(404,{error:'route not found'});
      if (url.pathname === '/health' || url.pathname.startsWith('/v1/')) {
        if (url.pathname.startsWith('/v1/seo/app-store/')) return env.APP_STORE.getByName(env.OWNER_STORE_ID).route(request);
        const dashboard = env.DASHBOARD.getByName(env.OWNER_STORE_ID);
        const runtime = await dashboard.runtime();
        if (url.pathname === '/health') return dashboard.route(request,runtime,[]);
        if (!runtime) return jsonResponse(503,{error:'Runtime evidence manifest unavailable'});
        const catalog = (await readEvidence(env.EVIDENCE,runtime.catalog,'catalog')).payload;
        if (!Array.isArray(catalog.projects) || !Array.isArray(catalog.collections)) return jsonResponse(503,{error:'Runtime catalog unavailable'});
        if (url.pathname === '/v1/brand-evidence/projects' || /^\/v1\/projects\/[^/]+\/brand-evidence(?:\/|$)/.test(url.pathname)) return env.BRAND.getByName(env.OWNER_STORE_ID).route(request,catalog.projects);
        return dashboard.route(request,runtime,catalog.projects,catalog.collections);
      }
      if (!['GET','HEAD'].includes(request.method)) return jsonResponse(405,{error:'method not allowed'});
      const asset = await env.ASSETS.fetch(request);
      const headers = new Headers(asset.headers);
      headers.set('cache-control','private, no-store'); headers.set('x-content-type-options','nosniff');
      return new Response(asset.body,{status:asset.status,statusText:asset.statusText,headers});
    } catch (error) {
      if (error instanceof AccessKeysUnavailable) return jsonResponse(503,{error:'Owner authentication temporarily unavailable'});
      // Never return provider exceptions, private paths, credentials or SQL.
      return jsonResponse(error.statusCode ?? 503,{error: error.statusCode && error.statusCode < 500 ? error.message : 'Site Health cloud service unavailable'});
    }
  },
};
