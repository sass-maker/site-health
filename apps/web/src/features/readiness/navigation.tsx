import type { AnchorHTMLAttributes } from 'react';

// Site Health is an owner-local Astro app. Native navigation retains URL state
// while the existing workspace store preserves edits across route loads.
export function LocalLink(props: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} />;
}
export function useSearchParams() {
  return new URLSearchParams(window.location.search);
}
export function useRouter() {
  return { push: (href: string) => { window.location.assign(href); } };
}
