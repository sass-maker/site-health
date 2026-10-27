import { useEffect, useMemo, useState } from 'react';
import { Badge } from '@saas-maker/ui/components/badge';
import { Button } from '@saas-maker/ui/components/button';
import { Input } from '@saas-maker/ui/components/input';
import type { DataColumn } from '@saas-maker/ui/components/data-table';
import { CATEGORY_LABELS, productPriority, productPriorityLabel, scoreReading, type Lever, type ScoreCategory, type ScoreMetric, type ScoreProject, type ScoreWorkspace } from './scoreboard';
import { CATEGORY_GUIDANCE } from './category-guidance';
import { categoryProducts, categoryQueue, type CategoryProduct, type CurrentProduct } from './category-model';
import { ScoreboardTable } from './scoreboard-table';
import { ScoreValue, ScorePair } from './scoreboard-evidence';
import { LocalLink, useRouter, useSearchParams } from './navigation';
import styles from './category-workspace.module.css';

const statuses: Record<string, string> = { queued: 'Queued', active: 'Active', awaiting_evidence: 'Awaiting evidence', verified: 'Verified', parked: 'Parked · resumable' };
export function CategoryWorkspace({ category, workspace, orderedLevers, onEvidence, onLever, onReview }: {
  category: ScoreCategory; workspace: ScoreWorkspace; orderedLevers: Lever[];
  onEvidence: (project: ScoreProject, category: ScoreCategory, metric: ScoreMetric) => void;
  onLever: (id: string) => void; onReview: () => void;
}) {
  const guide = CATEGORY_GUIDANCE[category];
  const [inventory, setInventory] = useState<CurrentProduct[] | null>(null);
  const [inventoryError, setInventoryError] = useState(false);
  const [query, setQuery] = useState('');
  const [reload, setReload] = useState(0);
  useEffect(() => { setQuery(''); }, [category]);
  const params = useSearchParams();
  const router = useRouter();
  const tab = ['checklist', 'evidence'].includes(params.get('tab') ?? '') ? params.get('tab') : 'products';
  const href = (tab: string) => `/readiness?page=category&category=${category}${tab === 'products' ? '' : `&tab=${tab}`}`;
  useEffect(() => {
    const controller = new AbortController();
    setInventoryError(false);
    const base = document.querySelector<HTMLMetaElement>('meta[name="dashboard-api-base"]')?.content ?? '/api/dashboard';
    void fetch(`${base}/v1/projects`, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error('Inventory unavailable');
      const data = await response.json();
      if (!Array.isArray(data) || data.some((p) => typeof p.id !== 'string' || typeof p.name !== 'string' || !Array.isArray(p.domains))) throw new Error('Inventory unavailable');
      setInventory(data);
    }).catch((error) => { if (error.name !== 'AbortError') setInventoryError(true); });
    return () => controller.abort();
  }, [reload]);
  const all = useMemo(() => categoryProducts(inventory, workspace.snapshot.projects).sort((a, b) => (a.assessment ? productPriority(a.assessment) : 3) - (b.assessment ? productPriority(b.assessment) : 3) || a.name.localeCompare(b.name)), [inventory, workspace.snapshot.projects]);
  const rows = all.filter((p) => `${p.name} ${p.domains.join(' ')}`.toLowerCase().includes(query.trim().toLowerCase()));
  const assessed = all.filter((p) => p.assessment).length;
  const byLever = new Map(workspace.snapshot.levers.filter((l) => l.category === category).map((l) => [l.projectId, l]));
  const active = Object.values(workspace.progress).find((record) => record?.status === 'active');
  const activeLever = workspace.snapshot.levers.find((l) => l.id === active?.leverId);
  const queue = categoryQueue(orderedLevers, workspace, category, inventory);
  const queueProject = workspace.snapshot.projects.find((p) => p.id === queue?.projectId);
  const activeInactive = inventory !== null && activeLever && !all.some((p) => p.id === activeLever.projectId);
  const queuePlan = queue ? workspace.progress[queue.id]?.plan : undefined;
  const reading = (p: CategoryProduct, metric: ScoreMetric) => p.assessment && scoreReading(p.assessment.scores[category], metric);
  const columns: DataColumn<CategoryProduct>[] = [
    { id: 'product', header: 'Product', value: (p) => p.name, cell: (p) => <div className={styles.identity}><strong>{p.name}</strong>{p.assessment && <Badge variant="outline">{productPriorityLabel(p.assessment)}</Badge>}<span>{p.domains.join(' · ') || 'Internal / native surface'}</span><LocalLink href={p.assessment ? `/readiness?product=${encodeURIComponent(p.id)}&category=${category}` : `/projects/${encodeURIComponent(p.id)}`} onClick={(e) => e.stopPropagation()}>View product →</LocalLink></div> },
    ...(['effort', 'result'] as const).map((metric): DataColumn<CategoryProduct> => ({ id: metric, header: metric === 'effort' ? 'Effort' : 'Result', value: (p) => reading(p, metric)?.value ?? undefined, cell: (p) => p.assessment ? <Button variant="ghost" onClick={(e) => { e.stopPropagation(); onEvidence(p.assessment!, category, metric); }} aria-label={`${p.name}: ${metric} evidence`}><ScoreValue score={reading(p, metric)!} unknownLabel="Unknown" /></Button> : <span className={styles.muted}>Unassessed</span> })),
    { id: 'lever', header: 'Category lever', value: (p) => byLever.get(p.id)?.title ?? '', cell: (p) => {
      const lever = byLever.get(p.id); const progress = lever && workspace.progress[lever.id];
      return lever ? <div className={styles.lever}><Badge variant="outline">{statuses[progress?.status ?? 'queued']}{lever.kind === 'scope' ? ' · Scope decision' : ''}</Badge><span>{progress?.plan.title ?? lever.title}</span><Button variant="outline" onClick={(e) => { e.stopPropagation(); onLever(lever.id); }}>Open lever</Button></div> : <span className={styles.muted}>No assessment or lever recorded</span>;
    } },
  ];
  return <section className={styles.category} aria-label={CATEGORY_LABELS[category]}>
    <header className={styles.heading}><div><p className={styles.eyebrow}>Readiness / {CATEGORY_LABELS[category]}</p><h1>{CATEGORY_LABELS[category]}</h1><p>{guide.goal}</p></div><Button variant="outline" onClick={onReview}>Review & backup</Button></header>
    <div className={styles.meta}><span>{inventory ? `${all.length} current products` : inventoryError ? 'Current inventory unavailable' : 'Loading current inventory…'}</span><span>{assessed} assessed{inventory ? ` · ${all.length - assessed} unassessed` : ' in saved snapshot'}</span><span>Assessment: {new Date(workspace.snapshot.assessedAt).toLocaleDateString()}</span></div>
    {inventoryError && <p role="status">Showing saved assessment rows; current membership could not be verified. <Button variant="ghost" onClick={() => setReload((n) => n + 1)}>Retry inventory</Button></p>}
    {activeLever && activeLever.category !== category && <p className={styles.active}>One lever is active in {CATEGORY_LABELS[activeLever.category]}{activeInactive ? ' · inactive product' : ''}. <Button variant="ghost" onClick={() => onLever(activeLever.id)}>Continue active lever</Button></p>}
    <nav className={styles.tabs} aria-label="Category view">{[['products', 'Products'], ['checklist', 'Five-level checklist'], ['evidence', 'Evidence & sources']].map(([id, label]) => <LocalLink key={id} href={href(id)} aria-current={tab === id ? 'page' : undefined}>{label}</LocalLink>)}</nav>
    {tab === 'products' && <>
      {queue && queueProject ? <section className={styles.queue} aria-label="Category next action"><div><p className={styles.eyebrow}>{workspace.progress[queue.id]?.status === 'active' ? 'Continue active lever' : 'Next ready in this category'} · {queueProject.name}</p><h2>{queuePlan?.title ?? queue.title}</h2><details><summary>Finish line and required proof</summary><p>{queuePlan?.proof ?? queue.proof}</p></details><Badge variant="outline">{statuses[workspace.progress[queue.id]?.status ?? 'queued']}{activeInactive && queue.id === activeLever?.id ? ' · Inactive product' : ''} · {queue.priority}</Badge></div><div className={styles.queueAside}><ScorePair score={queueProject.scores[category]} /><Button onClick={() => onLever(queue.id)}>Open lever</Button></div></section> : <p className={styles.muted}>{inventory === null ? 'Current membership is unavailable; a new category lever cannot be selected from the saved snapshot alone.' : 'No ready current-product lever in this category. Recorded work may be awaiting evidence, verified, blocked or a scope decision.'}</p>}
      <div className={styles.toolbar}><Input aria-label="Find a category product" placeholder="Find a product or domain…" value={query} onChange={(e) => setQuery(e.target.value)} /><span>{rows.length} of {all.length} products</span></div>
      <p className={styles.explainer}>Effort = work quality · Result = demonstrated outcome · Each is out of 10. Open a score for its reason, confidence and dated evidence.</p>
      <ScoreboardTable key={category} data={rows} columns={columns} getRowId={(p) => p.id} label={`${CATEGORY_LABELS[category]} products`} onRowClick={(p) => { if (p.assessment) onEvidence(p.assessment, category, 'result'); else router.push(`/projects/${encodeURIComponent(p.id)}`); }} />
    </>}
    {tab === 'checklist' && <section className={styles.checklist} aria-label="Five-level checklist"><h2>What good looks like</h2><a href="https://github.com/sass-maker/site-health/blob/main/docs/product-readiness-checklist.md" target="_blank" rel="noreferrer">Canonical product readiness checklist →</a><p>{guide.boundary}</p><p className={styles.explainer}>These five levels are review guidance, not recorded attainment. A score out of 10 does not establish a level. Confirm each gate with evidence; preserve explicit exemptions and unknowns.</p>{guide.levels.map((level, index) => <details key={level.title} open={index === 0}><summary><Badge variant="outline">Level {index + 1}</Badge><strong>{level.title}</strong></summary><ul>{level.checks.map((check) => <li key={check}>{check}</li>)}</ul><p><strong>Evidence / finish line:</strong> {level.proof}</p></details>)}</section>}
    {tab === 'evidence' && <section className={styles.sources}><h2>Inspect the source, then judge the outcome</h2><p>{guide.boundary}</p><div className={styles.sourceLinks}>{guide.sources.map((source) => <LocalLink key={source.href} href={source.href}>{source.label} →</LocalLink>)}</div><p>Supporting observations do not automatically change a readiness score. Product evidence keeps its original source, date, confidence, reason and scope.</p><h3>Recorded category assessments</h3>{all.filter((p) => p.assessment).map((p) => <div className={styles.evidenceRow} key={p.id}><strong>{p.name}</strong><ScorePair score={p.assessment!.scores[category]} /><Button variant="outline" onClick={() => onEvidence(p.assessment!, category, 'result')}>Open evidence</Button></div>)}</section>}
  </section>;
}
