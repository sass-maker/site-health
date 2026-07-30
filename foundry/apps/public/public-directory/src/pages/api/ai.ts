import publicCatalog from '../../../../../../ops/public/products.json';
import { PACKAGE_URL } from '../../data/links';
import { LEARNINGS } from '../../data/learnings';
export const prerender = true;
export function GET() {
  return new Response(
    JSON.stringify(
      {
        name: 'SaaS Maker',
        schemaVersion: 1,
        version: '1',
        url: 'https://sassmaker.com',
        llms: 'https://sassmaker.com/llms.txt',
        llmsFull: 'https://sassmaker.com/llms-full.txt',
        sitemap: 'https://sassmaker.com/sitemap.xml',
        markdown: { suffix: '.md', negotiation: false },
        canonical: 'https://sassmaker.com',
        sourceOfTruth: 'SaaS Maker privacy-checked public product catalog',
        surfaces: [
          {
            id: 'directory',
            url: 'https://sassmaker.com/',
            md: 'https://sassmaker.com/index.md',
            kind: 'collection',
            description: 'Software as a specialized service: a living studio of focused products',
          },
          {
            id: 'learnings',
            url: 'https://sassmaker.com/learnings',
            md: 'https://sassmaker.com/learnings.md',
            kind: 'collection',
            description: 'First-party builder notes and agent-tooling learnings',
          },
        ],
        externalResources: [
          {
            id: 'feedback-package',
            url: PACKAGE_URL,
            kind: 'documentation',
            description: 'Published callback-only feedback package and README',
          },
        ],
        auth: { public: true, notes: 'Private Fleet controls are intentionally excluded.' },
        products: publicCatalog.products,
        pastProjects: publicCatalog.pastProjects,
        learnings: LEARNINGS.map((learning) => ({
          ...learning,
          url: `https://sassmaker.com${learning.href}`,
        })),
      },
      null,
      2
    ),
    { headers: { 'Content-Type': 'application/json; charset=utf-8' } }
  );
}
