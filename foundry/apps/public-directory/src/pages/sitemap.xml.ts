import publicCatalog from '../../../../ops/public/products.json';
import { LEARNINGS } from '../data/learnings';

export const prerender = true;

export function GET() {
  const urls = [
    'https://sassmaker.com/',
    'https://sassmaker.com/privacy',
    'https://sassmaker.com/terms',
    'https://sassmaker.com/changelog',
    'https://sassmaker.com/learnings',
    ...LEARNINGS.map((learning) => `https://sassmaker.com${learning.href}`),
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
