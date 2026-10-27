import { useEffect, useState } from 'react';
import { PageHeader } from '@saas-maker/ui/blocks/app';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@saas-maker/ui/components/accordion';
import { Badge } from '@saas-maker/ui/components/badge';
import { Button } from '@saas-maker/ui/components/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@saas-maker/ui/components/card';
import { DataTable, type DataColumn } from '@saas-maker/ui/components/data-table';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@saas-maker/ui/components/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@saas-maker/ui/components/tabs';
import { ArrowRight } from 'lucide-react';
import { LocalLink, useRouter, useSearchParams } from './navigation';
import { READINESS_AREAS, EFFORT_REQUIREMENTS, RESULT_METRICS, VISIBILITY_LEVELS, LEVEL_STRUCTURE, frameworkHref, frameworkRoute, type FrameworkView, type ReadinessArea, type ResultMetric } from './readiness-framework';

type Product = { id: string; name: string; lifecycle?: { status?: string } };
const historicalHref = '/readiness?page=legacy&mode=history';

function ScorePlaceholder({ label }: { label: string }) {
  return <div><p className="text-sm font-medium">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight">— <span className="text-base font-normal text-muted-foreground">/10</span></p><p className="mt-2 text-sm text-muted-foreground">Not assessed in this framework</p></div>;
}

function Levels() {
  const columns: DataColumn<typeof LEVEL_STRUCTURE[number]>[] = [
    { id: 'level', header: 'Level', value: r => r.name, sortable: false, hideable: false, compactCell: r => <div className="space-y-2"><strong>{r.name} · {r.possiblePoints} possible points</strong><p className="text-sm text-muted-foreground">{r.gate}</p><p className="text-sm text-muted-foreground">Unlocks: {r.unlock}</p></div> },
    { id: 'gate', header: 'Pass conditions', value: r => r.gate, sortable: false, collapseInCompact: true, className: 'whitespace-normal' },
    { id: 'points', header: 'Possible points', value: r => r.possiblePoints, sortable: false, collapseInCompact: true },
    { id: 'unlock', header: 'Unlock', value: r => r.unlock, sortable: false, collapseInCompact: true, className: 'whitespace-normal' },
  ];
  return <section className="space-y-4" aria-label="Five-level scoring structure"><h2 className="text-xl font-semibold">Five levels · 10 possible points</h2><p className="max-w-[70ch] text-sm leading-6 text-muted-foreground">Each verified level earns two points and unlocks the next. Exact pass conditions and required proof are not defined yet. No levels are marked complete.</p><DataTable data={LEVEL_STRUCTURE} columns={columns} getRowId={r => r.id} label="Five-level scoring structure" /></section>;
}

function Effort({ area }: { area: ReadinessArea }) {
  return <div className="space-y-9"><section className="space-y-4"><div><h2 className="text-xl font-semibold">The work we expect</h2><p className="mt-2 max-w-[70ch] text-sm leading-6 text-muted-foreground">Done means shipped and verified, with dated evidence. Measurement and maintenance are included here. These requirements have not yet been assigned to scoring levels.</p></div><Accordion type="multiple" className="rounded-xl border border-border bg-card px-5" defaultValue={['requirement-0']}>
    {EFFORT_REQUIREMENTS[area].map((item, i) => <AccordionItem value={`requirement-${i}`} key={item.title}><AccordionTrigger className="text-base">{item.title}</AccordionTrigger><AccordionContent className="max-w-[75ch] text-[15px] leading-7 text-muted-foreground">{item.detail}</AccordionContent></AccordionItem>)}
  </Accordion></section><Levels /></div>;
}

function Results({ area }: { area: ReadinessArea }) {
  return <div className="space-y-9"><section className="space-y-4"><h2 className="text-xl font-semibold">{area === 'product' ? 'Four Product metrics' : 'Three SEO & growth metrics'}</h2><div className="grid gap-4 md:grid-cols-2">{RESULT_METRICS[area].map(metric => <Card key={metric.id} className="shadow-none"><CardHeader><div className="flex flex-wrap items-center justify-between gap-3"><CardTitle role="heading" aria-level={3}>{metric.name}</CardTitle><Badge variant="outline">Awaiting baseline</Badge></div><CardDescription className="max-w-[65ch] text-sm leading-6">{metric.definition}</CardDescription></CardHeader><CardContent><p className="text-xs font-medium text-muted-foreground">BEFORE MEASUREMENT</p><p className="mt-2 text-sm leading-6">{metric.needs}</p></CardContent></Card>)}</div></section>
    {area === 'growth' && <section className="space-y-4" aria-label="Five question intent levels"><h2 className="text-xl font-semibold">Five question intent levels</h2><p className="max-w-[75ch] text-sm leading-6 text-muted-foreground">Test Google and AI across these intents. Google position, AI mention, recommendation, citation and factual accuracy stay separate. Intent levels describe the questions; they are not passed score levels.</p><ol className="divide-y divide-border rounded-xl border border-border bg-card px-5">{VISIBILITY_LEVELS.map((level, i) => <li key={level.name} className="flex gap-4 py-4"><span className="grid size-7 shrink-0 place-items-center rounded-full border border-border text-xs">{i + 1}</span><div><h3 className="font-medium">{level.name}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">Example: {level.question}</p></div></li>)}</ol></section>}
    <section className="rounded-xl bg-muted/50 p-5 text-sm leading-6"><h2 className="font-semibold">Results follow measurement and effort</h2><p className="mt-2 max-w-[75ch] text-muted-foreground">Set a verified baseline, target and evaluation window before assigning a Result score. Missing measurements stay unknown. Internal growth exemptions and revenue applicability must be recorded per product.</p></section></div>;
}

function Benchmarks({ area }: { area: ReadinessArea }) {
  return <section className="space-y-5" aria-label="Benchmark setup"><div><h2 className="text-xl font-semibold">Definitions ready. Benchmarks not set.</h2><p className="mt-2 max-w-[75ch] text-sm leading-6 text-muted-foreground">Each metric needs its own baseline, numeric target, source, evaluation window and score thresholds. These fields are intentionally empty; previous estimates have not been converted.</p></div><Accordion type="multiple" className="rounded-xl border border-border bg-card px-5">{RESULT_METRICS[area].map((metric: ResultMetric) => <AccordionItem key={metric.id} value={metric.id}><AccordionTrigger className="text-base"><span className="flex flex-wrap items-center gap-3">{metric.name}<Badge variant="outline">Not set</Badge></span></AccordionTrigger><AccordionContent><dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">{['Applicability & qualifying definition','Verified baseline','Numeric target','Source & evidence','Evaluation window & review date','Five scoring thresholds'].map(field => <div key={field} className="contents"><dt className="text-muted-foreground">{field}</dt><dd>Not set</dd></div>)}</dl><p className="mt-5 max-w-[75ch] text-sm leading-6 text-muted-foreground">Required definition: {metric.needs}</p></AccordionContent></AccordionItem>)}</Accordion><Levels /></section>;
}

export function ReadinessFramework({ onImport, onExport }: { onImport: () => void; onExport?: () => void }) {
  const params = useSearchParams();
  const route = frameworkRoute(params);
  const router = useRouter();
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setError(false);
    const base = document.querySelector<HTMLMetaElement>('meta[name="dashboard-api-base"]')?.content ?? '/api/dashboard';
    void fetch(`${base}/v1/projects`, { signal: controller.signal }).then(async response => {
      if (!response.ok) throw new Error('Inventory unavailable');
      const data: unknown = await response.json();
      if (!Array.isArray(data) || data.some(p => !p || typeof p.id !== 'string' || typeof p.name !== 'string')) throw new Error('Invalid inventory');
      setProducts((data as Product[]).filter(p => ['primary', 'active'].includes(p.lifecycle?.status ?? '')).sort((a, b) => a.name.localeCompare(b.name)));
    }).catch(e => { if (e.name !== 'AbortError') setError(true); });
    return () => controller.abort();
  }, [retry]);
  const project = products?.find(p => p.id === params.get('project'));
  const area = READINESS_AREAS.find(a => a.id === route.area);
  const controls = <div className="flex flex-wrap gap-2">{onExport && <Button variant="outline" onClick={onExport}>Export saved workspace</Button>}<Button variant="ghost" onClick={onImport}>Import previous data</Button></div>;
  return <section className="space-y-7" aria-label="Two-category readiness framework">
    <PageHeader title={area?.label ?? 'Product readiness'} description={area?.description ?? 'Two categories. Separate Effort and Results. Measure first, then assess.'} actions={controls} />
    <div className="mx-auto max-w-[1200px] space-y-7 px-1 pb-10 sm:px-3">
      <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex flex-wrap gap-2"><Badge variant="outline">2 categories</Badge><Badge variant="outline">Effort /20 · Results /20</Badge><Badge variant="outline">New benchmarks not entered</Badge></div><Button variant="ghost" asChild><LocalLink href={historicalHref}>Previous assessments <ArrowRight className="size-4" /></LocalLink></Button></div>
      {!area ? <><div className="grid items-stretch gap-5 lg:grid-cols-2">{READINESS_AREAS.map(item => <Card key={item.id} className="shadow-none"><CardHeader><CardTitle role="heading" aria-level={2} className="text-2xl">{item.label}</CardTitle><CardDescription className="max-w-[60ch] leading-6">{item.description}</CardDescription></CardHeader><CardContent className="space-y-6"><div className="grid gap-4 sm:grid-cols-2"><ScorePlaceholder label="Effort" /><ScorePlaceholder label="Results" /></div><p className="text-sm leading-6 text-muted-foreground">{item.id === 'product' ? 'Results: DAU, high-intent actions, revenue and churn.' : 'Results: discoverability, visits and AI & Google answers.'}</p><div className="flex flex-wrap gap-2"><Button asChild><LocalLink href={frameworkHref(item.id, 'effort')}>Effort checklist</LocalLink></Button><Button variant="outline" asChild><LocalLink href={frameworkHref(item.id, 'results')}>Result metrics</LocalLink></Button></div></CardContent></Card>)}</div><section className="rounded-xl bg-muted/50 p-6"><h2 className="text-lg font-semibold">The sequence</h2><ol className="mt-4 space-y-3 text-sm leading-6"><li><strong>1. Measurement:</strong> define sources and verify the baseline.</li><li><strong>2. Effort:</strong> finish one bounded change, verify it and retain the proof.</li><li><strong>3. Results:</strong> compare observed outcomes against targets frozen in advance.</li></ol><p className="mt-4 text-sm text-muted-foreground">Exact effort gates and Result scoring thresholds still need definition. Earlier six-category assessments remain in Previous assessments.</p></section></> : <>
        <div className="flex flex-wrap items-end justify-between gap-4"><div><label className="mb-2 block text-sm font-medium" id="framework-product-label">Product scope</label><Select value={project?.id ?? 'all'} onValueChange={id => router.push(frameworkHref(area.id, route.view, id === 'all' ? '' : id))}><SelectTrigger className="w-full sm:w-72" aria-labelledby="framework-product-label"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All current products</SelectItem>{products?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div><p className="text-sm text-muted-foreground">{error ? 'Current inventory unavailable' : products ? `${products.length} current products · ${project?.name ?? 'portfolio framework'}` : 'Loading current products…'}</p></div>
        {error && <p role="status" className="text-sm">Current product membership could not be verified. <Button variant="ghost" onClick={() => setRetry(n => n + 1)}>Retry inventory</Button></p>}
        {params.get('project') && products && !project && <p role="status" className="text-sm">That product is not in the current inventory. Showing the portfolio framework.</p>}
        <div className="grid gap-5 rounded-xl border border-border bg-card p-5 sm:grid-cols-2"><ScorePlaceholder label="Effort" /><ScorePlaceholder label="Results" /></div>
        <Tabs value={route.view} onValueChange={value => router.push(frameworkHref(area.id, value as FrameworkView, project?.id))}><TabsList variant="line" className="h-auto max-w-full flex-wrap justify-start"><TabsTrigger value="effort">Effort checklist</TabsTrigger><TabsTrigger value="results">Result metrics</TabsTrigger><TabsTrigger value="benchmarks">Benchmark setup</TabsTrigger></TabsList><TabsContent value="effort" className="pt-5"><Effort area={area.id} /></TabsContent><TabsContent value="results" className="pt-5"><Results area={area.id} /></TabsContent><TabsContent value="benchmarks" className="pt-5"><Benchmarks area={area.id} /></TabsContent></Tabs>
      </>}
    </div>
  </section>;
}
