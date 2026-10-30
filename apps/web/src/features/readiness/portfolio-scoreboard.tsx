import { projectAudiencePriorityLabel, projectPrioritySortValue, projectTypeLabel } from '../../lib/project-directory.mjs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@saas-maker/ui/components/accordion';
import { ChevronRight } from 'lucide-react';
import { NativeDisclosure, NativeSummary } from '@saas-maker/ui/components/native-controls';
import { Button } from '@saas-maker/ui/components/button';
import { DataTable, type DataSort, type DataColumn } from '@saas-maker/ui/components/data-table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@saas-maker/ui/components/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@saas-maker/ui/components/sheet';
import { CHECKLIST_ITEMS, frameworkHref, hasRequirementAssessment, requirementCompletion, metricScore, benchmarkFreshness, type ReadinessArea, type ReadinessProduct, type Requirement } from './readiness-framework';
import { measurementContextText } from '../../../../backend/lib/dashboard-backend/measurement-contract.mjs';
import { effortCell, observationText, currentReadingValue, summarizePortfolioProduct } from './portfolio-scoreboard-summary';
import { LocalLink, useRouter } from './navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';

const dateText = (date: string | null | undefined) => date ? new Date(date).toLocaleDateString() : 'No observation';
const estimate = (value: number | null) => value === null ? 'Not estimated' : `${value / 10}/10`;
const resultText = (product: ReadinessProduct, area: ReadinessArea, summary: ReturnType<typeof summarizePortfolioProduct>['productResults']) => {
  const applicability = product.state.applicability[area].state;
  if (applicability !== 'applicable') return applicability === 'exempt' ? 'Exempt' : 'Scope unknown';
  return `${summary.score === null ? 'Unscored' : `${summary.score}/10`} (${summary.qualified}/${summary.total})`;
};

function ObservationReading({ row, label }: { row: ReadinessProduct['evidence'][number] | null; label: string }) {
  return <div><p className="font-medium tabular-nums">{observationText(row)}</p>{row && <p className="text-xs text-muted-foreground">{row.label}</p>}<p className="text-xs text-muted-foreground">{row ? `${dateText(row.observedAt)} · ${row.qualification}` : `${label} unavailable`}</p>{row && <p className="mt-1 text-xs leading-5 text-muted-foreground">{measurementContextText(row)}</p>}</div>;
}

function RequirementEvidence({ entry }: { entry?: Requirement }) {
  if (!entry || !hasRequirementAssessment(entry)) return <p className="text-sm text-muted-foreground">No assessment saved.</p>;
  return <div className="space-y-2"><p className="text-sm leading-6">{entry.note || 'No work note recorded.'}</p><p className="text-xs text-muted-foreground">{entry.status.replaceAll('-', ' ')} · {entry.confidence ?? 'Unrecorded'} confidence</p>{entry.evidenceRefs.length ? <ul className="space-y-1 text-xs text-muted-foreground">{entry.evidenceRefs.map((proof, index) => <li key={`${proof.ref}-${index}`} className="break-all">{dateText(proof.observedAt)} · {proof.ref}</li>)}</ul> : <p className="text-xs text-muted-foreground">No dated evidence.</p>}</div>;
}

function checklistScore(product: ReadinessProduct, area: ReadinessArea, entry?: Requirement) {
  if (product.state.applicability[area].state === 'exempt' || entry?.status === 'exempt') return 'Exempt';
  const completion = requirementCompletion(entry);
  return completion === null ? 'Not estimated' : `${completion / 10}/10`;
}

type ReviewSection = 'product' | 'growth' | 'performance' | 'results' | 'library' | 'sources';
type ReviewTarget = { id: string; section: ReviewSection; item?: string };

function ChecklistReview({ product, area, itemId }: { product: ReadinessProduct; area: ReadinessArea; itemId?: string }) {
  const scope = product.state.applicability[area];
  if (scope.state !== 'applicable') return <p className="text-sm leading-6 text-muted-foreground">{scope.state === 'exempt' ? 'Exempt' : 'Scope unknown'}: {scope.reason || 'No scope reason recorded.'}</p>;
  return <div className="space-y-5">
    <div className="space-y-2"><p className="text-xs font-medium text-muted-foreground">NEXT LEVER</p><p className="text-sm leading-6">{product.state.nextLevers[area] || 'Not selected'}</p></div>
    <Accordion type="multiple" defaultValue={itemId ? [itemId] : []}>
      {CHECKLIST_ITEMS[area].map(item => <AccordionItem key={item.id} value={item.id}>
        <AccordionTrigger><span className="flex min-w-0 flex-1 items-baseline justify-between gap-3"><span>{item.title}</span><span className="shrink-0 tabular-nums text-muted-foreground">{checklistScore(product, area, product.state.checklist?.[item.id])}</span></span></AccordionTrigger>
        <AccordionContent><RequirementEvidence entry={product.state.checklist?.[item.id]} /></AccordionContent>
      </AccordionItem>)}
    </Accordion>
    <Button asChild variant="outline"><LocalLink href={frameworkHref(area, 'effort', product.id)}>Open full {area === 'product' ? 'product' : 'growth'} checklist</LocalLink></Button>
  </div>;
}

function ProductDetail({ product, target }: { product: ReadinessProduct; target: ReviewTarget }) {
  const s = summarizePortfolioProduct(product);
  const metrics = Object.entries(product.state.benchmarks);
  return <div className="space-y-5 px-6 pb-8">
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-border pb-5"><p className="text-sm text-muted-foreground">{projectAudiencePriorityLabel(product)} · {projectTypeLabel(product)}</p><p className="text-xl font-semibold tabular-nums">{s.effortTotal}<span className="ml-2 text-xs font-normal text-muted-foreground">effort</span></p></div>
    <p className="text-sm leading-6 text-muted-foreground">Expand a section, then an individual item to review its work, confidence and dated proof. Effort estimates and measured outcomes stay separate.</p>
    <Accordion type="multiple" defaultValue={[target.section]}>
      {(['product', 'growth'] as const).map(area => <AccordionItem key={area} value={area}>
        <AccordionTrigger><span className="flex flex-1 items-baseline justify-between gap-3"><span>{area === 'product' ? 'Product & design' : 'SEO & growth'}</span><span className="text-muted-foreground tabular-nums">{effortCell(area === 'product' ? s.productEffort : s.growthEffort)}</span></span></AccordionTrigger>
        <AccordionContent className="pt-2"><ChecklistReview product={product} area={area} itemId={target.item}/>{area === 'growth' && <div className="mt-6 space-y-3 border-t border-border pt-5"><h4 className="font-medium">Technical SEO evidence</h4>{!s.seoPass && !s.seoFail && <p className="text-sm text-muted-foreground">No dated technical audit reading.</p>}{[s.seoPass, s.seoFail, s.seoWarn, s.seoChecks].filter(Boolean).map(row => <ObservationReading key={row!.id} row={row} label="SEO checks" />)}</div>}</AccordionContent>
      </AccordionItem>)}
      <AccordionItem value="performance"><AccordionTrigger>Performance readings</AccordionTrigger><AccordionContent><p className="mb-4 text-sm text-muted-foreground">Speed work: {estimate(s.speedEffort)}. PSI is lab evidence /100, not a saved result score.</p><div className="grid gap-5 sm:grid-cols-2">{[[s.desktop, 'Desktop PSI'], [s.mobile, 'Mobile PSI']].map(([row, label]) => <div key={label as string}><h4 className="mb-2 font-medium">{label as string}</h4><ObservationReading row={row as typeof s.desktop} label={label as string}/></div>)}</div></AccordionContent></AccordionItem>
      <AccordionItem value="results"><AccordionTrigger>Results & measurement</AccordionTrigger><AccordionContent><div className="space-y-5"><p className="text-sm leading-6">Qualified benchmarks: Product {resultText(product, 'product', s.productResults)} · Growth {resultText(product, 'growth', s.growthResults)}.</p><div className="grid gap-5 sm:grid-cols-2"><div><h4 className="mb-2 font-medium">Google clicks</h4><ObservationReading row={s.clicks} label="Search clicks"/></div><div><h4 className="mb-2 font-medium">30-day activity proxy</h4><ObservationReading row={s.browserProxy} label="30-day activity proxy"/></div></div>{metrics.map(([id, metric]) => <div key={id} className="space-y-1 border-t border-border pt-3 text-sm"><p className="font-medium">{id}</p><p>{metric.applicability === 'exempt' ? `Exempt: ${metric.reason || 'Scope reason not recorded'}` : metric.value === null ? 'Unknown reading' : `${metric.value.toLocaleString()} ${metric.unit} · ${benchmarkFreshness(metric)} · ${metric.qualification}`}</p><p className="break-words text-xs leading-5 text-muted-foreground">{metric.definition} · {metric.source || 'Source not recorded'} · {metric.window || 'Window not recorded'}</p><p className="text-xs text-muted-foreground">{metricScore(metric) === null ? 'Unscored' : `${metricScore(metric)}/10`} · {dateText(metric.observedAt)}</p></div>)}<p className="text-xs leading-5 text-muted-foreground">Source coverage: {Object.entries(product.measurementCoverage ?? {}).map(([state, count]) => `${count} ${state}`).join(' · ') || 'Not recorded'}. Coverage describes readings, not product quality. Proxies are not qualified active people.</p><Button asChild variant="outline"><LocalLink href={frameworkHref('product', 'results', product.id)}>Open full result metrics</LocalLink></Button></div></AccordionContent></AccordionItem>
      <AccordionItem value="library"><AccordionTrigger>UI Library coverage</AccordionTrigger><AccordionContent>{product.uiLibrary ? <div className="space-y-2"><p>{product.uiLibrary.percent === null ? product.uiLibrary.status.replaceAll('-', ' ') : `${product.uiLibrary.percent}% source estimate`} · {product.uiLibrary.shared}/{product.uiLibrary.eligible} reusable controls</p><p className="text-xs text-muted-foreground">{dateText(product.uiLibrary.observedAt)} · {product.uiLibrary.stale ? 'Stale' : 'Current'} scan · {product.uiLibrary.revision?.slice(0, 8) ?? 'No source revision'}</p><p className="text-sm leading-6 text-muted-foreground">{product.uiLibrary.gap}</p></div> : <p>No source scan saved.</p>}</AccordionContent></AccordionItem>
      <AccordionItem value="sources"><AccordionTrigger>All source observations ({product.evidence.length})</AccordionTrigger><AccordionContent><div className="space-y-5">{product.evidence.map(row => <div key={row.id} className="space-y-2 border-b border-border pb-4"><h4 className="font-medium">{row.label}</h4><ObservationReading row={row} label={row.label}/><p className="break-words text-xs text-muted-foreground">{row.source}{row.window && row.window !== 'null' ? ` · ${row.window}` : ''}</p><p className="text-sm leading-6 text-muted-foreground">{row.gap}</p></div>)}</div></AccordionContent></AccordionItem>
    </Accordion>
  </div>;
}

const numberText = (row: ReadinessProduct['evidence'][number] | null) => row?.value == null ? '—' : row.value.toLocaleString(undefined, { maximumFractionDigits: 1 });
function ReadingState({ rows }: { rows: (ReadinessProduct['evidence'][number] | null)[] }) {
  const states = [...new Set(rows.filter(Boolean).map(row => row?.measurement?.state).filter(state => state && state !== 'current'))];
  return states.length ? <span className="block text-xs text-muted-foreground">{states.join(' · ')}</span> : null;
}

export function PortfolioScoreboard({ products }: { products: ReadinessProduct[] }) {
  const [target, setTarget] = useState<ReviewTarget | null>(null);
  const selected = products.find(product => product.id === target?.id);
  const [sort, setSort] = useState<DataSort>([]);
  const [compact, setCompact] = useState(false);
  const host = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const update = () => setCompact(element.getBoundingClientRect().width < 1060);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const router = useRouter();
  const review = (row: ReadinessProduct, section: ReviewSection = 'product', item?: string) => setTarget({ id: row.id, section, item });
  const orderedProducts = [...products].sort((a, b) => projectPrioritySortValue(a) - projectPrioritySortValue(b) || a.name.localeCompare(b.name));
  const metricButton = (row: ReadinessProduct, section: ReviewSection, label: string, children: ReactNode, item?: string) => <Button variant="ghost" className="h-auto min-h-10 w-full justify-end whitespace-normal px-1 py-1 text-right font-normal tabular-nums" aria-label={`${row.name}: ${label}`} onClick={() => review(row, section, item)}>{children}</Button>;
  const columns: DataColumn<ReadinessProduct>[] = [
    { id: 'product', header: 'Product', hideable: false, value: row => row.name, className: 'whitespace-normal',
      cell: row => <div className="space-y-1"><LocalLink className="font-semibold hover:underline" href={frameworkHref('product', 'effort', row.id)}>{row.name}</LocalLink><p className="text-xs text-muted-foreground">{projectAudiencePriorityLabel(row)} · {projectTypeLabel(row)}</p></div>,
      compactCell: row => { const s = summarizePortfolioProduct(row); return <div className="space-y-4 py-1"><div className="flex items-start justify-between gap-3"><div><LocalLink className="font-semibold hover:underline" href={frameworkHref('product', 'effort', row.id)}>{row.name}</LocalLink><p className="mt-1 text-xs text-muted-foreground">{projectAudiencePriorityLabel(row)} · {projectTypeLabel(row)}</p></div><span className="shrink-0 font-semibold tabular-nums">{s.effortTotal}</span></div><div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm"><div><p className="text-xs text-muted-foreground">Product effort</p>{effortCell(s.productEffort)}</div><div><p className="text-xs text-muted-foreground">Growth effort</p>{effortCell(s.growthEffort)}</div><div><p className="text-xs text-muted-foreground">Design effort</p>{checklistScore(row, 'product', row.state.checklist?.['product-design'])}</div><div><p className="text-xs text-muted-foreground">Lab PSI · desktop / mobile</p>{numberText(s.desktop)} / {numberText(s.mobile)}<ReadingState rows={[s.desktop, s.mobile]}/></div><div><p className="text-xs text-muted-foreground">SEO checks · passed / total</p>{numberText(s.seoPass)} / {numberText(s.seoChecks)}<ReadingState rows={[s.seoPass, s.seoChecks]}/></div><div><p className="text-xs text-muted-foreground">Google clicks</p>{numberText(s.clicks)}<ReadingState rows={[s.clicks]}/></div><div><p className="text-xs text-muted-foreground">30-day activity proxy</p>{numberText(s.browserProxy)} {s.browserProxy?.unit}<ReadingState rows={[s.browserProxy]}/></div></div><Button variant="outline" size="sm" onClick={() => review(row)} aria-label={`Review ${row.name}`}>Review sections <ChevronRight /></Button></div>; } },
    { id: 'effort', header: 'Total effort', align: 'right', value: row => summarizePortfolioProduct(row).effortSortValue, cell: row => { const s = summarizePortfolioProduct(row); const [value, denominator] = s.effortTotal.split('/'); return metricButton(row, 'product', 'review total effort', <span><strong className="block text-base font-semibold">{value}</strong>{denominator && <span className="text-xs text-muted-foreground">/{denominator.replace(' range', '')}{denominator.includes('range') ? ' · range' : ' effort'}</span>}</span>); } },
    { id: 'design', header: 'Design effort', align: 'right', value: row => summarizePortfolioProduct(row).designScore, cell: row => metricButton(row, 'product', 'review design effort', <span>{checklistScore(row, 'product', row.state.checklist?.['product-design'])}</span>, 'product-design') },
    { id: 'performance', header: 'Lab PSI /100', align: 'right', value: row => currentReadingValue(summarizePortfolioProduct(row).desktop), cell: row => { const s = summarizePortfolioProduct(row); return metricButton(row, 'performance', 'review performance', <span><span className="block font-medium">{numberText(s.desktop)} / {numberText(s.mobile)}</span><span className="text-xs text-muted-foreground">desktop / mobile</span><ReadingState rows={[s.desktop, s.mobile]}/></span>); } },
    { id: 'seo', header: 'SEO checks', align: 'right', value: row => { const s = summarizePortfolioProduct(row); const pass = currentReadingValue(s.seoPass), total = currentReadingValue(s.seoChecks); return pass !== null && total !== null && total > 0 ? pass / total : null; }, cell: row => { const s = summarizePortfolioProduct(row); return metricButton(row, 'growth', 'review SEO & growth', <span><span className="block font-medium">{numberText(s.seoPass)}<span className="text-muted-foreground"> / {numberText(s.seoChecks)}</span></span><span className="text-xs text-muted-foreground">{!s.seoPass ? 'Not measured' : `${numberText(s.seoFail)} fail · ${numberText(s.seoWarn)} warn`}</span><ReadingState rows={[s.seoPass, s.seoChecks]}/></span>); } },
    { id: 'clicks', header: 'Google clicks', align: 'right', value: row => currentReadingValue(summarizePortfolioProduct(row).clicks), cell: row => { const s = summarizePortfolioProduct(row); return metricButton(row, 'results', 'review Google clicks', <span><span className="block font-medium">{numberText(s.clicks)}</span><ReadingState rows={[s.clicks]}/></span>); } },
    { id: 'usage', header: '30-day proxy', align: 'right', value: row => currentReadingValue(summarizePortfolioProduct(row).browserProxy), cell: row => { const s = summarizePortfolioProduct(row); return metricButton(row, 'results', 'review activity proxy', <span><span className="block font-medium">{numberText(s.browserProxy)}</span><span className="text-xs text-muted-foreground">{s.browserProxy?.unit ?? 'Not measured'}</span><ReadingState rows={[s.browserProxy]}/></span>); } },
    { id: 'review', header: 'Review', sortable: false, hideable: false, value: () => null, cell: row => <Button variant="ghost" size="icon" aria-label={`Review ${row.name}`} onClick={() => review(row)}><ChevronRight /></Button> },
  ];
  const responsiveColumns = compact ? [{ ...columns[0], cell: columns[0].compactCell, compactCell: undefined }, ...columns.slice(1).map(column => ({ ...column, hidden: true, hideable: false }))] : columns;
  return <section ref={host} className="space-y-4" aria-label="Portfolio scoreboard">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="text-lg font-semibold">{products.length} current products</h2><p className="mt-1 text-sm text-muted-foreground">Compare the numbers. Select a reading to expand its evidence and next lever.</p></div><div className="w-full sm:max-w-xs"><Select value="summary" onValueChange={id => router.push(`/readiness?item=${encodeURIComponent(id)}`)}><SelectTrigger aria-label="Scoreboard view"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="summary">Portfolio scoreboard</SelectItem>{Object.values(CHECKLIST_ITEMS).flat().map(item => <SelectItem key={item.id} value={item.id}>{item.id.startsWith('product-') ? 'Product' : 'Growth'} · {item.title}</SelectItem>)}<SelectItem value="ui-library">UI Library adoption</SelectItem></SelectContent></Select></div></div>
    <NativeDisclosure className="text-sm text-muted-foreground"><NativeSummary className="cursor-pointer py-1">How to read the scores</NativeSummary><p className="max-w-[90ch] py-2 leading-6">Effort is saved implementation completeness: Product /10 plus Growth /10. Exempt categories leave the denominator. Incomplete assessments show a range; total sorting uses the lower bound as a share of applicable points. Design effort describes work, not validated design quality. PSI is lab data /100. SEO shows passed / total checks and sorts by the current pass rate. Google clicks and 30-day activity counts retain their own scopes and windows; activity counts use different labelled proxy units, not qualified active people. Historical readings stay labelled and are excluded from numeric sorting. Open a reading for its dates, scope, qualification and remaining gaps. All {products.length} products fit on one page; pagination adds no value to this review.</p></NativeDisclosure>
    {compact && <div className="flex items-center gap-2"><Select value={sort[0]?.id ?? 'priority'} onValueChange={id => setSort(id === 'priority' ? [] : [{ id, desc: false }])}><SelectTrigger aria-label="Order scoreboard" className="flex-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="priority">Priority order</SelectItem>{columns.filter(column => column.sortable !== false).map(column => <SelectItem key={column.id} value={column.id}>{column.header}</SelectItem>)}</SelectContent></Select><Button variant="outline" disabled={!sort.length} onClick={() => setSort([{ id: sort[0]?.id ?? 'product', desc: !sort[0]?.desc }])}>{sort[0]?.desc ? 'Descending' : 'Ascending'}</Button></div>}
    <DataTable key={String(compact)} sort={sort} onSortChange={setSort} maxHeight="none" pageSize={Math.max(products.length, 1)} className="[&_[role=region]]:rounded-none [&_[role=region]]:border-0 [&_[role=region]]:bg-transparent [&_th]:bg-background [&_table]:table-fixed [&_td]:py-3 [&_td]:whitespace-normal [&_td]:break-words [&_th]:whitespace-normal [&_th_button]:h-auto [&_th_button]:min-h-10 [&_th_button]:whitespace-normal [&_th:first-child]:w-[23%] [&_th:last-child]:w-14" data={orderedProducts} columns={responsiveColumns} getRowId={row => row.id} label="Portfolio scoreboard" onRowClick={row => review(row)} selectedId={selected?.id}/>
    <p className="text-xs leading-5 text-muted-foreground">Effort estimates · lab PSI · SEO passed / total · measured source proxies. Each reading opens its own review section.</p>
    <Sheet open={Boolean(selected)} onOpenChange={open => { if (!open) setTarget(null); }}><SheetContent className="w-full overflow-y-auto sm:max-w-3xl"><SheetHeader><SheetTitle>{selected?.name ?? 'Product review'}</SheetTitle><SheetDescription>Section review · individual checklist scores, evidence and next levers</SheetDescription></SheetHeader>{selected && target && <ProductDetail key={`${selected.id}:${target.section}:${target.item ?? ''}`} product={selected} target={target}/>}</SheetContent></Sheet>
  </section>;
}
