import { useSyncExternalStore, type AnchorHTMLAttributes } from 'react';
import { navigateWithinReadiness } from './navigation-state';

const subscribe = (notify: () => void) => {
  window.addEventListener('popstate', notify);
  return () => window.removeEventListener('popstate', notify);
};
const snapshot = () => window.location.search;

// Keep the workspace mounted during drill-down, including tab-only recovery
// state when browser storage is unavailable. Browser Back updates the same view.
export function LocalLink({ onClick, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a {...props} onClick={(event) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey ||
        event.shiftKey || event.altKey || props.download !== undefined ||
        (props.target && props.target !== '_self') || !props.href) return;
    if (navigateWithinReadiness(props.href, window)) event.preventDefault();
  }} />;
}
export function useSearchParams() {
  return new URLSearchParams(useSyncExternalStore(subscribe, snapshot, () => ''));
}
export function useRouter() {
  return { push: (href: string) => {
    if (!navigateWithinReadiness(href, window)) window.location.assign(href);
  } };
}
