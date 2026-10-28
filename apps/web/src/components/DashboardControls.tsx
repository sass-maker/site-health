import type { ReactNode,ComponentProps } from 'react';
import { PageHeader as LibraryPageHeader } from '@saas-maker/ui/blocks/app';
import { Button } from '@saas-maker/ui/components/button';
import { NativeSelect } from '@saas-maker/ui/components/native-controls';

export function DashboardHeader({children,actions,...props}: ComponentProps<typeof LibraryPageHeader>&{children?:ReactNode}) {
  return <div className="-mx-5 sm:-mx-8"><LibraryPageHeader {...props} actions={actions??children}/></div>;
}
export function CohortControl() {
  return <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border py-4 text-sm text-muted-foreground" aria-label="Portfolio scope"><span data-cohort-count>Reading current portfolio…</span><label className="flex items-center gap-3">Scope<NativeSelect data-cohort-select aria-label="Portfolio scope" className="w-auto"><option value="active">Current products</option><option value="all">Include inactive identities</option></NativeSelect></label></div>;
}
export function BrandEvidenceControls() {
  return <div className="flex flex-wrap items-center gap-2"><NativeSelect aria-label="Brand evidence project" data-brand-evidence-project className="w-auto"><option value="">Reading profiles</option></NativeSelect><Button type="button" variant="outline" data-brand-evidence-check disabled>Run API check</Button><Button type="button" variant="outline" data-brand-evidence-collect disabled>Refresh web evidence</Button><span role="status" aria-live="polite" data-brand-evidence-status className="text-sm text-muted-foreground"/></div>;
}
export function SeoSourceNav({active}: {active:'web'|'app-store'}) {
  return <nav aria-label="SEO research" className="flex flex-wrap gap-2 border-b border-border py-3"><Button asChild variant={active==='web'?'secondary':'ghost'}><a href="/search" aria-current={active==='web'?'page':undefined}>Web SEO</a></Button><Button asChild variant={active==='app-store'?'secondary':'ghost'}><a href="/search/app-store" aria-current={active==='app-store'?'page':undefined}>App Store SEO</a></Button></nav>;
}
