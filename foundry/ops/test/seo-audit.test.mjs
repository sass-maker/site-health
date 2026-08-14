import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:http';
import { promisify } from 'node:util';
import test from 'node:test';
import { resolve } from 'node:path';

const execFileAsync = promisify(execFile);
const fleetRoot = resolve(import.meta.dirname, '../../..');
const auditScript = resolve(
  fleetRoot,
  'foundry/ops/skills/seo-audit/scripts/seo-audit.sh',
);

async function serveFixture(t, html) {
  const server = createServer((_request, response) => {
    response.setHeader('content-type', 'text/html; charset=utf-8');
    response.end(html);
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(
    () =>
      new Promise((resolveClose, rejectClose) => {
        server.close((error) => (error ? rejectClose(error) : resolveClose()));
      }),
  );

  const address = server.address();
  assert.equal(typeof address, 'object');
  return `http://127.0.0.1:${address.port}/`;
}

test('SEO audit parses multiline tags and attribute order without false failures', async (t) => {
  const description =
    'A complete product description that is deliberately long enough for the SEO audit metadata floor.';
  const url = await serveFixture(t, `<!doctype html>
      <html lang="en">
        <head>
          <title>A complete multiline metadata fixture</title>
          <meta
            content="${description}"
            name="description"
          />
          <link
            href="http://example.test/"
            rel="canonical"
          />
          <meta content="Fixture title" property="og:title" />
          <meta
            content="${description}"
            property="og:description"
          />
          <meta property="og:image" content="http://example.test/share.png" />
          <meta content="summary_large_image" name="twitter:card" />
          <script nonce="fixture" type="application/ld+json">
            {"@context":"https://schema.org","@type":"WebSite"}
          </script>
        </head>
        <body>
          <h1>Fixture heading</h1>
          <h2>Fixture section</h2>
          <p>Visible fixture copy.</p>
        </body>
      </html>`);
  const { stdout } = await execFileAsync('bash', [auditScript, url], {
    cwd: fleetRoot,
  });

  assert.match(stdout, /meta-description\s+PASS/);
  assert.match(stdout, /canonical\s+PASS/);
  assert.match(stdout, /og:title\s+PASS/);
  assert.match(stdout, /og:description\s+PASS/);
  assert.match(stdout, /og:image\s+PASS/);
  assert.match(stdout, /twitter:card\s+PASS/);
  assert.match(stdout, /json-ld\s+PASS/);
  assert.match(stdout, /hreflang\s+PASS\s+none declared/);
  assert.match(stdout, /1 warnings/);
  assert.match(stdout, /all critical checks passed/);
});

test('SEO audit rejects application markup without rating or review evidence', async (t) => {
  const url = await serveFixture(t, `<!doctype html>
    <html lang="en">
      <head>
        <title>Application rich result fixture</title>
        <script type="application/ld+json">
          {"@context":"https://schema.org","@type":"SoftwareApplication","name":"Fixture app","offers":{"@type":"Offer","price":"0"}}
        </script>
      </head>
      <body><h1>Fixture app</h1></body>
    </html>`);

  await assert.rejects(
    execFileAsync('bash', [auditScript, url], { cwd: fleetRoot }),
    (error) => {
      assert.match(error.stdout, /json-ld\s+FAIL\s+1 application nodes lack aggregateRating or review/);
      return true;
    },
  );
});

test('SEO audit rejects malformed JSON-LD', async (t) => {
  const url = await serveFixture(t, `<!doctype html>
    <html lang="en">
      <head>
        <title>Malformed structured data fixture</title>
        <script type="application/ld+json">{"@type":"WebSite",}</script>
      </head>
      <body><h1>Fixture site</h1></body>
    </html>`);

  await assert.rejects(
    execFileAsync('bash', [auditScript, url], { cwd: fleetRoot }),
    (error) => {
      assert.match(error.stdout, /json-ld\s+FAIL\s+1 of 1 blocks contain invalid JSON/);
      return true;
    },
  );
});

test('SEO audit fails when the page cannot be fetched', async () => {
  const server = createServer();
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.equal(typeof address, 'object');
  await new Promise((resolveClose, rejectClose) => {
    server.close((error) => (error ? rejectClose(error) : resolveClose()));
  });

  const url = `http://127.0.0.1:${address.port}/`;
  await assert.rejects(
    execFileAsync('bash', [auditScript, url], { cwd: fleetRoot }),
    (error) => {
      assert.match(error.stdout, /fetch\s+FAIL/);
      assert.match(error.stdout, /Pages with failures:/);
      assert.match(error.stdout, new RegExp(url.replaceAll('.', '\\.')));
      return true;
    },
  );
});
