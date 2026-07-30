import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);
const auditor = new URL(
  '../skills/agent-ready/scripts/agent-index-audit.mjs',
  import.meta.url,
);

test('records public-route Markdown coverage and catalog integrity', async (t) => {
  let origin;
  const server = createServer((request, response) => {
    const accept = String(request.headers.accept ?? '');
    const url = new URL(request.url, origin);
    if (url.pathname === '/llms.txt') {
      return send(response, 'text/plain', '# Fixture\n');
    }
    if (url.pathname === '/api/ai') {
      return send(response, 'application/json', JSON.stringify({
        name: 'fixture',
        llms: `${origin}/llms.txt`,
        sitemap: `${origin}/sitemap.xml`,
        markdown: { suffix: '.md', negotiation: true },
        surfaces: [
          { id: 'home', url: '/', md: '/index.md' },
          { id: 'guide', url: '/guide/', md: '/guide.md' },
          { id: 'people', url: '/person/{id}/', md: '/person/{id}.md' },
        ],
      }));
    }
    if (url.pathname === '/robots.txt') {
      return send(
        response,
        'text/plain',
        `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
      );
    }
    if (url.pathname === '/sitemap.xml') {
      return send(
        response,
        'application/xml',
        `<?xml version="1.0"?><urlset>` +
          `<url><loc>${origin}/</loc></url>` +
          `<url><loc>${origin}/guide/</loc></url>` +
          `<url><loc>${origin}/person/ada/</loc></url>` +
          `</urlset>`,
      );
    }
    if (
      url.pathname === '/index.md'
      || url.pathname === '/guide.md'
      || url.pathname === '/person/ada.md'
    ) {
      return send(response, 'text/markdown', `# ${url.pathname}\n`);
    }
    if (url.pathname === '/' && accept.includes('text/markdown')) {
      return send(response, 'text/markdown', '# Fixture home\n');
    }
    if (url.pathname === '/' || url.pathname === '/guide/' || url.pathname === '/person/ada/') {
      return send(response, 'text/html', '<!doctype html><title>Fixture</title>');
    }
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('not found');
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const address = server.address();
  origin = `http://127.0.0.1:${address.port}`;

  const { stdout } = await execFileAsync(
    process.execPath,
    [auditor.pathname, origin, '--json'],
    { maxBuffer: 2_000_000 },
  );
  const result = JSON.parse(stdout).results[0];

  assert.equal(result.tier, 'S');
  assert.deepEqual(result.checks.route_markdown.data, {
    readable: 3,
    checked: 3,
    total: 3,
    coveragePercent: 100,
    sampled: false,
    failures: [],
  });
  assert.deepEqual(result.checks.catalog_integrity.data, {
    valid: 3,
    configured: 3,
    integrityPercent: 100,
    failures: [],
  });
});

function send(response, contentType, body) {
  response.writeHead(200, { 'content-type': contentType });
  response.end(body);
}
