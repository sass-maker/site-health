import { DataTable, type DataColumn } from '@saas-maker/ui/components/data-table';
import { LocalLink, useRouter } from './navigation';
import type { ReadinessProduct } from './readiness-framework';

const reading = (product: ReadinessProduct) => product.uiLibrary?.percent == null ? 'Not measured' : `${product.uiLibrary.percent}%`;
const href = (product: ReadinessProduct) => `/readiness?pillar=product&tab=effort&project=${encodeURIComponent(product.id)}`;
function Evidence({ product }: { product: ReadinessProduct }) {
  const coverage = product.uiLibrary;
  if (!coverage) return <p className="text-sm text-muted-foreground">No source scan saved.</p>;
  return <div className="space-y-2 text-sm"><p>{coverage.shared} shared / {coverage.eligible} identified reusable controls</p><p className="text-xs text-muted-foreground">{new Date(coverage.observedAt).toLocaleDateString()} · {coverage.stale ? 'Stale source estimate' : 'Source estimate'}{coverage.dirty ? ' · local changes included' : ''} · {coverage.revision?.slice(0, 8) ?? 'No revision'}</p><p className="text-xs leading-5 text-muted-foreground">{coverage.gap}</p></div>;
}
export function UiLibraryDetail({ product }: { product: ReadinessProduct }) {
  const coverage = product.uiLibrary;
  return <details className="rounded-lg border border-border p-4" aria-label="Shared UI Library adoption"><summary className="cursor-pointer text-sm font-medium">UI Library · {reading(product)} · source coverage</summary><div className="mt-4 space-y-4"><Evidence product={product}/><p className="max-w-[85ch] text-sm leading-6">Shared library controls ÷ identified reusable controls. Typography, layout wrappers, content and product-specific canvases do not enter this denominator. Package installation alone earns no credit. This measures source reuse, not design quality or deployed visual coverage.</p>{coverage?.surfaces.map(surface => <p key={surface.kind} className="text-sm"><span className="font-medium capitalize">{surface.kind}: </span>{surface.percent == null ? 'Not measured' : `${surface.percent}%`} · {surface.shared}/{surface.eligible} controls · {surface.files} source files · {surface.tokenFiles} files with direct token imports · {surface.sharedBlocks} shared shell/footer/template usages</p>)}{coverage && <p className="break-all text-xs text-muted-foreground">Private source evidence: {coverage.evidencePath}</p>}</div></details>;
}
export function UiLibraryOverview({ products }: { products: ReadinessProduct[] }) {
  const router = useRouter();
  const measured = products.filter(p => p.uiLibrary?.percent != null);
  const shared = measured.reduce((sum, p) => sum + p.uiLibrary!.shared, 0), total = measured.reduce((sum, p) => sum + p.uiLibrary!.eligible, 0);
  const columns: DataColumn<ReadinessProduct>[] = [
    { id: 'product', header: 'Product', hideable: false, value: p => p.name, cell: p => <LocalLink className="font-medium hover:underline" href={href(p)}>{p.name}</LocalLink>, compactCell: p => <div className="space-y-3 py-2"><div className="flex justify-between gap-4"><LocalLink className="font-medium hover:underline" href={href(p)}>{p.name}</LocalLink><strong className="tabular-nums">{reading(p)}</strong></div><Evidence product={p}/></div> },
    { id: 'adoption', header: 'Library %', value: p => p.uiLibrary?.percent ?? null, collapseInCompact: true, cell: p => <strong className="tabular-nums">{reading(p)}</strong> },
    { id: 'proof', header: 'Counted coverage / evidence', value: p => p.uiLibrary?.observedAt ?? null, collapseInCompact: true, cell: p => <Evidence product={p}/> },
  ];
  return <section aria-label="UI Library adoption across products" className="space-y-5"><div className="flex flex-wrap items-baseline justify-between gap-3"><h2 className="text-xl font-semibold">Shared UI Library</h2><p className="text-sm text-muted-foreground">{measured.length}/{products.length} products have source estimates{total > 0 ? ` · ${Math.round(1000 * shared / total) / 10}% of identified controls` : ''}</p></div><p className="max-w-[85ch] text-sm leading-6 text-muted-foreground">Shared controls ÷ identified reusable controls, counted in production source. Web, landing and SwiftUI sources are included where available. Installed packages, tokens and unused imports do not earn control credit. Open a product for surface breakdowns and exclusions. This is a reuse estimate, separate from design quality and the effort score.</p><DataTable data={products} columns={columns} getRowId={p => p.id} pageSize={Math.max(products.length, 1)} maxHeight="none" label="UI Library source coverage" className="[&_th:first-child]:w-[28%] [&_th:nth-child(2)]:w-[17%] [&_th:last-child]:w-[55%] [&_table]:table-fixed [&_td]:whitespace-normal [&_td]:break-words [&_th]:whitespace-normal" onRowClick={p => router.push(href(p))}/></section>;
}
