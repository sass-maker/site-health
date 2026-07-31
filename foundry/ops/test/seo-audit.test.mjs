import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { promisify } from 'node:util';
import test from 'node:test';

const execFileAsync = promisify(execFile);
const audit = new URL('../skills/seo-audit/scripts/seo-audit.sh', import.meta.url);

test('reads multiline metadata regardless of attribute order', async (t) => {
  let origin;
  const server = createServer((request, response) => {
    const url = new URL(request.url, origin);
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
        `<?xml version="1.0"?><urlset><url><loc>${origin}/</loc></url></urlset>`,
      );
    }
    if (url.pathname === '/') {
      return send(
        response,
        'text/html',
        `<!doctype html>
        <html lang="en">
          <head>
            <title>
              Multiline metadata fixture
            </title>
            <meta
              content="A sufficiently descriptive fixture summary that proves multiline metadata is parsed without depending on line layout."
              name="description"
            />
            <link
              href="${origin}/"
              rel="canonical"
            />
            <meta content="Fixture title" property="og:title" />
            <meta
              property="og:description"
              content="A useful social description for the multiline fixture."
            />
            <meta
              content="${origin}/preview.png"
              property="og:image"
            />
            <meta content="summary_large_image" name="twitter:card" />
            <script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage"}</script>
          </head>
          <body>
            <main><h1>Fixture home</h1><h2>What it verifies</h2><p>Metadata parsing.</p></main>
          </body>
        </html>`,
      );
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
    'bash',
    [audit.pathname, `${origin}/`, '--site', origin],
    { maxBuffer: 2_000_000 },
  );

  assert.match(stdout, /meta-description\s+PASS/);
  assert.match(stdout, /canonical\s+PASS/);
  assert.match(stdout, /og:description\s+PASS/);
  assert.match(stdout, /og:image\s+PASS/);
  assert.match(stdout, /twitter:card\s+PASS/);
  assert.doesNotMatch(stdout, /meta-description\s+FAIL/);
});

test('fails closed when an audited page cannot be fetched', async (t) => {
  let origin;
  const server = createServer((request, response) => {
    const url = new URL(request.url, origin);
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
        `<?xml version="1.0"?><urlset><url><loc>${origin}/</loc></url></urlset>`,
      );
    }
    response.writeHead(404, { 'content-type': 'text/plain' });
    response.end('not found');
  });

  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => server.close());
  const address = server.address();
  origin = `http://127.0.0.1:${address.port}`;

  await assert.rejects(
    execFileAsync(
      'bash',
      [audit.pathname, `${origin}/missing`, '--site', origin],
      { maxBuffer: 2_000_000 },
    ),
    (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /FETCH FAILED/);
      assert.match(error.stdout, /Pages with failures/);
      assert.match(error.stdout, new RegExp(`${origin}/missing`));
      return true;
    },
  );
});

function send(response, contentType, body) {
  response.writeHead(200, { 'content-type': contentType });
  response.end(body);
}
