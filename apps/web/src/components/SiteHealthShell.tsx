import { useEffect, useState, type ReactNode } from 'react';
import { AppShell } from '@saas-maker/ui/blocks/app';
import { Button } from '@saas-maker/ui/components/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@saas-maker/ui/components/select';
import { ClipboardCheck, FolderKanban, Globe, Search, Sparkles, Gauge, Layers, Download, Palette, Blocks } from 'lucide-react';
import { downloadLocalUsageBundle } from '../lib/local-usage.mjs';
import { navigateWithinReadiness } from '../features/readiness/navigation-state';

export default function SiteHealthShell({ active, children }: { active: string; children: ReactNode }) {
  const [query, setQuery] = useState('');
  const [appearance, setAppearance] = useState('system');
  const [collapsed,setCollapsed] = useState(false);
  const [coverage,setCoverage] = useState<{percent:number|null;stale:boolean;current:boolean}|null>(null);
  const [evidenceLabel,setEvidenceLabel] = useState('Private workspace');
  useEffect(()=>{
    try { setCollapsed(localStorage.getItem('dashboard-sidebar-collapsed')==='true'); } catch {}
    const refresh=()=>{void fetch('/api/dashboard/v1/ui-library?summary=1').then(r=>r.ok?r.json():null).then(data=>setCoverage(data?.siteHealth?{percent:data.siteHealth.total.percent,stale:data.siteHealth.stale,current:data.siteHealth.current}:null)).catch(()=>setCoverage(null));};
    refresh();
    const evidence=(event:Event)=>{const label=(event as CustomEvent).detail;if(typeof label==='string')setEvidenceLabel(label.slice(0,120));};
    setEvidenceLabel(document.body.dataset.evidenceStatus??'Private workspace');
    window.addEventListener('site-health:evidence-status',evidence);
    window.addEventListener('site-health:ui-coverage',refresh);
    return()=>{window.removeEventListener('site-health:ui-coverage',refresh);window.removeEventListener('site-health:evidence-status',evidence);};
  },[]);
  useEffect(() => {
    const update = () => {
      setQuery(window.location.search);
      setAppearance(document.documentElement.dataset.appearance ?? 'system');
    };
    update();
    window.addEventListener('popstate', update);
    window.addEventListener('storage', update);
    window.addEventListener('site-health:appearance', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('storage', update);
      window.removeEventListener('site-health:appearance', update);
    };
  }, []);
  const pillar = new URLSearchParams(query).get('pillar');
  const nav = [
    { title: 'Workspace', items: [
      { label: 'Portfolio', href: '/readiness', icon: <ClipboardCheck/>, active: active === 'readiness' && !pillar },
      { label: 'Projects', href: '/projects', icon: <FolderKanban/>, active: active === 'projects' },
    ] },
    { title: 'Improve', items: [
      { label: 'Product & design', href: '/readiness?pillar=product&tab=effort', icon: <Layers/>, active: active === 'readiness' && pillar === 'product' },
      { label: 'SEO & growth', href: '/readiness?pillar=growth&tab=effort', icon: <Sparkles/>, active: active === 'readiness' && pillar === 'growth' },
    ] },
    { title: 'Evidence', items: [
      { label: 'Domains', href: '/domains', icon: <Globe/>, active: active === 'domains' },
      { label: 'SEO', href: '/search', icon: <Search/>, active: active === 'search' },
      { label: 'AI awareness', href: '/ai-awareness', icon: <Sparkles/>, active: active === 'ai-awareness' },
      { label: 'Performance', href: '/performance', icon: <Gauge/>, active: active === 'performance' },
      { label: 'UI Library', href: '/ui-library', icon: <Blocks/>, active: active === 'ui-library' },
    ] },
  ];
  return <AppShell collapsible collapsed={collapsed} onCollapsedChange={next=>{setCollapsed(next);try{localStorage.setItem('dashboard-sidebar-collapsed',String(next));}catch{}}} modalNavigation brand={{ name: 'Site Health', mark: <span className="grid size-7 place-items-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">S</span> }} nav={nav} onNavigate={href => {
    if (!navigateWithinReadiness(href, window)) window.location.assign(href);
  }} secondary={<div className="space-y-3 border-t border-sidebar-border pt-4">
    <Select value={appearance} onValueChange={next => {
      window.dispatchEvent(new CustomEvent('site-health:appearance', { detail: next }));
      setAppearance(next);
    }}><SelectTrigger aria-label="Appearance" className="w-full"><span className="flex items-center gap-2"><Palette className="size-4 text-muted-foreground"/><SelectValue/></span></SelectTrigger><SelectContent><SelectItem value="system">System</SelectItem><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem></SelectContent></Select>
    <Button variant="ghost" size="sm" className="w-full justify-start gap-2" aria-label="Download local 30-day usage summary" onClick={() => downloadLocalUsageBundle(document, window)}><Download className="size-4"/>Export usage summary</Button>
    <p className="px-2 text-xs text-muted-foreground">UI controls · {coverage?.percent==null?(coverage&&!coverage.current?'needs refresh':'not measured'):`${coverage.percent}% shared`}{coverage?.stale?' · stale':''}</p>
    <p data-dashboard-connection role="status" className="px-2 text-xs text-muted-foreground"><span data-dashboard-connection-label>{evidenceLabel}</span></p>
  </div>}>
    <div className="site-health-content mx-auto w-full max-w-[1400px] px-5 pb-12 pt-5 sm:px-8 lg:pt-7">{children}</div>
  </AppShell>;
}
