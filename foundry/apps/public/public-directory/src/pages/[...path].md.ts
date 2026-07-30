import type { APIRoute, GetStaticPaths } from 'astro';
import { CHANGELOG } from '../data/changelog';
import { LEARNINGS } from '../data/learnings';
import { PAGED_PRODUCTS, type RegistryProduct } from '../data/registry';

type MarkdownPage = {
  path: string;
  body: string;
};

const fixedPages: MarkdownPage[] = [
  {
    path: 'privacy',
    body: `# SaaS Maker privacy policy

Last updated: July 24, 2026

## What this site is

sassmaker.com is a static directory for maintained products. It does not require an account and does not collect form submissions on this domain.

## What we may collect

- Cloudflare may log standard request metadata such as IP address, user agent, and path at the edge.
- Individual products and package documentation have their own policies.

## Contact

- Email: sarthakagrawal927@gmail.com
- Website: https://sarthakagrawal.dev
`,
  },
  {
    path: 'terms',
    body: `# SaaS Maker terms of use

Last updated: July 24, 2026

## Use of this site

sassmaker.com describes open-source and personal projects maintained by Sarthak Agrawal. Content is provided as-is for informational purposes. Linked products may have separate terms.

## No warranty

Software and documentation are provided without warranty. You use linked products and repositories at your own risk.

## Contact

- Email: sarthakagrawal927@gmail.com
- Website: https://sarthakagrawal.dev
`,
  },
  {
    path: 'changelog',
    body: [
      '# SaaS Maker changelog',
      '',
      'A product-owned history of meaningful changes shipped by SaaS Maker.',
      '',
      ...CHANGELOG.flatMap((entry) => [
        `## ${entry.label} — ${entry.title}`,
        '',
        entry.summary,
        '',
        ...entry.changes.map((change) => `- ${change}`),
        '',
      ]),
    ].join('\n'),
  },
  {
    path: 'learnings',
    body: [
      '# SaaS Maker learnings',
      '',
      'First-party notes from building products, agent workflows, and the systems around them.',
      '',
      ...LEARNINGS.flatMap((learning) => [
        `## ${learning.title}`,
        '',
        learning.description,
        '',
        `- Published: ${learning.publishedAt}`,
        `- Read: https://sassmaker.com${learning.href}`,
        `- Markdown: https://sassmaker.com${learning.href}.md`,
        '',
      ]),
    ].join('\n'),
  },
  ...LEARNINGS.map((learning) => ({
    path: learning.href.replace(/^\//, ''),
    body: [
      `# ${learning.title}`,
      '',
      learning.description,
      '',
      `- Published: ${learning.publishedAt}`,
      `- Author: ${learning.author}`,
      `- Reading time: ${learning.readingTime}`,
      '',
      'This Markdown surface carries the published article summary and canonical human-readable route. The full article is available at:',
      '',
      `https://sassmaker.com${learning.href}`,
      '',
    ].join('\n'),
  })),
  ...PAGED_PRODUCTS.map((product) => ({
    path: `p/${product.id}`,
    body: productMarkdown(product),
  })),
];

export const getStaticPaths = (() =>
  fixedPages.map((page) => ({
    params: { path: page.path },
    props: { body: page.body },
  }))) satisfies GetStaticPaths;

export const GET: APIRoute<{ body: string }> = ({ props }) =>
  new Response(props.body.endsWith('\n') ? props.body : `${props.body}\n`, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });

function productMarkdown(product: RegistryProduct): string {
  const links = product.productLinks ?? [];
  return [
    `# ${product.name}`,
    '',
    product.summary,
    '',
    '## Canonical product',
    '',
    product.url,
    '',
    ...(links.length > 0
      ? [
          '## Public evidence',
          '',
          ...links.map(
            (link) =>
              `- [${link.title}](${link.url})${link.description ? ` — ${link.description}` : ''}`,
          ),
          '',
        ]
      : []),
    '## Directory boundary',
    '',
    `This SaaS Maker directory page points to ${product.name}'s canonical home. Product behavior and release evidence remain owned by the linked product and repository.`,
    '',
  ].join('\n');
}
