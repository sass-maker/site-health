// Shared operational steward worker: serves the fleet IndexNow key on
// /{key}.txt for every eligible product domain. Routes in wrangler.jsonc are
// path-exact per domain, so product workers keep owning everything else.
const KEY = 'bdeaa89dd1f1f7869584f50121c6e7da';

export default {
  /** @param {Request} request */
  async fetch(request) {
    if (!['GET', 'HEAD'].includes(request.method)) {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    const url = new URL(request.url);
    if (url.pathname !== `/${KEY}.txt`) return new Response('Not found', { status: 404 });
    return new Response(KEY, {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'public, max-age=300',
        'x-content-type-options': 'nosniff',
      },
    });
  },
};
