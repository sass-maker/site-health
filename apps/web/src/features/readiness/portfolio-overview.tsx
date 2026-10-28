import { Button as UiButton } from '@saas-maker/ui/components/button';
import { NativeDisclosure, NativeSummary } from '@saas-maker/ui/components/native-controls';
import { useEffect, useState } from 'react';
import { ArrowUpRight, FileText } from 'lucide-react';
import { Badge } from '@saas-maker/ui/components/badge';
import { Button } from '@saas-maker/ui/components/button';
import { CATEGORY_LABELS, type Lever, type ScoreWorkspace } from './scoreboard';
import styles from './scoreboard-workbench.module.css';

type InventoryProject = { id: string; lifecycle?: { status?: string } };
const dateLabel = (date: string) => new Date(date).toLocaleDateString(undefined, {
  day: 'numeric', month: 'short', year: 'numeric',
});

export function PortfolioOverview({ workspace, queue, waiting, onReview, onOpenLever, onWaiting, compact = false, title }: {
  workspace: ScoreWorkspace;
  compact?: boolean;
  title?: string;
  queue?: Lever;
  waiting: number;
  onReview: () => void;
  onOpenLever: (id: string) => void;
  onWaiting: () => void;
}) {
  const [inventory, setInventory] = useState<InventoryProject[] | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const base = document.querySelector<HTMLMetaElement>('meta[name="dashboard-api-base"]')?.content ?? '/api/dashboard';
    void fetch(`${base}/v1/projects`, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error('Inventory unavailable');
      const projects: InventoryProject[] = await response.json();
      if (!Array.isArray(projects)) throw new Error('Inventory unavailable');
      setInventory(projects.filter((project) => ['primary', 'active'].includes(project.lifecycle?.status ?? '')));
    }).catch(() => { /* Workspace remains useful offline; inventory stays unknown. */ });
    return () => controller.abort();
  }, []);
  const assessedIds = new Set(workspace.snapshot.projects.map((project) => project.id));
  const currentAssessed = inventory?.filter((project) => assessedIds.has(project.id)).length;
  const queueProject = workspace.snapshot.projects.find((project) => project.id === queue?.projectId);
  const queueStatus = queue ? workspace.progress[queue.id]?.status ?? 'queued' : null;
  const plan = queue ? workspace.progress[queue.id]?.plan : undefined;
  return <>
    <header className={styles.portfolioHeading}>
      <div>
        <p className={styles.eyebrow}>Portfolio / readiness</p>
        <h1>{compact ? title : "See the work. Find the next move."}</h1>
        <p>{compact ? `${workspace.snapshot.projects.length} assessed products · ${dateLabel(workspace.snapshot.assessedAt)}` : "Your products, their evidence, and the work that matters next."}</p>
      </div>
      <Button variant="outline" onClick={onReview} aria-label="Review details, import and export">
        <FileText size={15} /> Review & backup
      </Button>
    </header>
    {!compact && <>
    <section className={styles.portfolioSummary} aria-label="Assessment coverage">
      <a href="/projects"><strong>{inventory?.length ?? '—'}</strong><span>{inventory ? 'current products' : 'Inventory unavailable'}</span></a>
      <div><strong>{currentAssessed ?? workspace.snapshot.projects.length}{inventory && <small> / {inventory.length}</small>}</strong><span>assessed{inventory && currentAssessed !== inventory.length ? ` · ${inventory.length - (currentAssessed ?? 0)} pending` : ''}</span></div>
      <UiButton variant="outline" onClick={onWaiting}><strong>{waiting}</strong><span>awaiting evidence</span></UiButton>
      <div className={styles.assessmentDate}><span>Latest assessment</span><b>{dateLabel(workspace.snapshot.assessedAt)}</b><span>Estimates · open a product for context</span></div>
    </section>
    {queue && queueProject ? <section className={styles.queueCard} aria-label="Next in your queue">
      <div className={styles.queueHeading}>
        <span className={styles.eyebrow}>{queueStatus === 'active' ? 'Continue the active lever' : 'Next in your queue'} · {queueProject.name}</span>
        <Badge variant="outline">{queueStatus === 'parked' ? 'Parked · resumable' : queueStatus === 'active' ? 'Active' : 'Ready'} · {queue.priority}</Badge>
      </div>
      <div className={styles.queueAction}><h2>{plan?.title ?? queue.title}</h2><Button variant="outline" onClick={() => onOpenLever(queue.id)}>Open lever <ArrowUpRight size={15} /></Button></div>
      <NativeDisclosure><NativeSummary>{CATEGORY_LABELS[queue.category]} · change and finish line</NativeSummary><p>{plan?.action ?? queue.action}</p><p><strong>Done when:</strong> {plan?.proof ?? queue.proof}</p></NativeDisclosure>
    </section> : <p className={styles.queueEmpty}>No ready lever. Review the queue for awaiting evidence, completed work or prerequisites.</p>}
    </>}
  </>;
}
