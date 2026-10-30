import { useEffect, useState } from 'react';
import { Button } from '@saas-maker/ui/components/button';
import { PERFORMANCE_TARGET } from '../../../../backend/lib/dashboard-backend/performance-policy.mjs';

type MetricRun = { runId: string; state: 'running' | 'succeeded' | 'failed' | 'unavailable'; summary: string; progress?: { completed: number } | null };
const pendingKey = 'site-health.performance-run';
const apiBase = () => document.querySelector<HTMLMetaElement>('meta[name="dashboard-api-base"]')?.content ?? '/api/dashboard';

export function PerformanceRefresh({ count, onMeasured }: { count: number; onMeasured: () => Promise<void> }) {
  const [runId, setRunId] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState('');
  useEffect(() => { setRunId(sessionStorage.getItem(pendingKey)); }, []);
  useEffect(() => {
    if (!runId) return;
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout>;
    let lastIndex = 0;
    async function poll() {
      try {
        const response = await fetch(`${apiBase()}/v1/metric-runs/${encodeURIComponent(runId!)}`, { signal: controller.signal });
        if (response.status === 404) {
          sessionStorage.removeItem(pendingKey); setRunId(null);
          setMessage('The measurement was interrupted or is no longer available. Previous readings are retained.');
          return;
        }
        if (!response.ok) throw new Error('Could not read measurement progress');
        const run: MetricRun = await response.json();
        setMessage(run.summary);
        if (run.state === 'running') {
          if (run.progress && run.progress.completed > lastIndex) { lastIndex = run.progress.completed; if (lastIndex > 0) void onMeasured().catch(() => {}); }
          timer = setTimeout(poll, 2000);
        }
        else {
          sessionStorage.removeItem(pendingKey); setRunId(null);
          try { await onMeasured(); }
          catch { setMessage(`${run.summary} Reload the page to read the latest evidence.`); }
        }
      } catch (error) {
        if (controller.signal.aborted) return;
        setMessage('Connection interrupted. Reconnecting to the same measurement; previous readings stay visible.');
        timer = setTimeout(poll, 5000);
      }
    }
    void poll();
    return () => { controller.abort(); clearTimeout(timer); };
  }, [runId, onMeasured]);
  async function start() {
    setStarting(true); setMessage('Starting desktop and mobile measurements…');
    try {
      const response = await fetch(`${apiBase()}/v1/metric-runs`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ family: 'psi', scope: 'portfolio' }) });
      const run = await response.json();
      if (!response.ok) throw new Error(run.error ?? 'Could not start performance measurement');
      setMessage(run.summary);
      if (run.state === 'running') { sessionStorage.setItem(pendingKey, run.runId); setRunId(run.runId); }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Measurement unavailable'); }
    finally { setStarting(false); }
  }
  return <div className="space-y-2">
    <Button variant="outline" disabled={starting || !!runId || count === 0} onClick={() => void start()}>{starting || runId ? 'Measuring performance…' : `Measure all external (${count})`}</Button>
    <p className="text-xs leading-5 text-muted-foreground">{PERFORMANCE_TARGET.samplesPerPreset} runs per device · desktop + mobile · free local Lighthouse</p>
    {message && <p role="status" aria-live="polite" className="max-w-xl text-sm leading-6">{message}</p>}
  </div>;
}
