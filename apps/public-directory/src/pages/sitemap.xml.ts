import publicCatalog from '../../../../fleet-ops/public/products.json';

export const prerender = true;

export function GET() {
  const urls = [
    'https://sassmaker.com/',
    'https://sassmaker.com/privacy',
    'https://sassmaker.com/terms',
    ...publicCatalog.products
      .filter((product) => product.id !== 'personal-website')
      .map((product) => `https://sassmaker.com/p/${product.id}`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls
    .map((url) => `  <url><loc>${url}</loc></url>`)
    .join('\n')}\n</urlset>\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
