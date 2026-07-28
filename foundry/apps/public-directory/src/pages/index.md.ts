import publicCatalog from '../../../../ops/public/products.json';
import { LEARNINGS } from '../data/learnings';
export const prerender = true;
export function GET() {
  const products = publicCatalog.products.flatMap((product) => {
    const links = product as typeof product & {
      changelogUrl?: string;
      roadmapUrl?: string;
      repositoryUrl?: string;
    };
    return [
      `## ${product.name}`,
      '',
      product.description,
      '',
      `- Product: ${product.url}`,
      ...(links.changelogUrl ? [`- Changelog: ${links.changelogUrl}`] : []),
      ...(links.roadmapUrl ? [`- Roadmap: ${links.roadmapUrl}`] : []),
      ...(links.repositoryUrl ? [`- Source: ${links.repositoryUrl}`] : []),
      '',
    ];
  });
  const pastProjects = publicCatalog.pastProjects.flatMap((project) => [
    `## ${project.name}`,
    '',
    project.description,
    '',
    `- Source: ${project.repositoryUrl}`,
    '- Lifecycle: past project',
    '',
  ]);
  const body = [
    '# SaaS Maker',
    '',
    'Public directory for maintained products and explicitly public past repositories, generated from Fleet’s privacy-checked projection.',
    '',
    '# Learnings',
    '',
    ...LEARNINGS.flatMap((learning) => [
      `## ${learning.title}`,
      '',
      learning.description,
      '',
      `- Article: https://sassmaker.com${learning.href}`,
      `- Published: ${learning.publishedAt}`,
      `- Author: ${learning.author}`,
      '',
    ]),
    ...products,
    '# Past projects',
    '',
    ...pastProjects,
  ].join('\n');
  return new Response(body, { headers: { 'Content-Type': 'text/markdown; charset=utf-8' } });
}
