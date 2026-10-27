type NavigationWindow = Pick<Window, 'history' | 'dispatchEvent'> & {
  location: Pick<Location, 'href' | 'origin' | 'pathname'>;
};

export function navigateWithinReadiness(href: string, browser: NavigationWindow) {
  const next = new URL(href, browser.location.href);
  const currentPath = browser.location.pathname.replace(/\/$/, '');
  if (next.origin !== browser.location.origin || currentPath !== '/readiness' ||
      next.pathname.replace(/\/$/, '') !== currentPath) return false;
  browser.history.pushState(null, '', next);
  browser.dispatchEvent(new Event('popstate'));
  return true;
}

export function protectUnsavedWorkspace(browser: Pick<Window, 'addEventListener' | 'removeEventListener'>) {
  const protect = (event: BeforeUnloadEvent) => {
    event.preventDefault();
    event.returnValue = '';
  };
  browser.addEventListener('beforeunload', protect);
  return () => browser.removeEventListener('beforeunload', protect);
}

/** Bridge the static shell into the same mounted workspace as LocalLink. */
export function bindReadinessNavigation(root: Pick<Document, 'addEventListener' | 'removeEventListener'>, browser: NavigationWindow) {
  const onClick = (event: Event) => {
    const click = event as MouseEvent;
    if (click.defaultPrevented || click.button !== 0 || click.metaKey || click.ctrlKey || click.shiftKey || click.altKey) return;
    const anchor = (click.target as Element | null)?.closest?.('a[data-readiness-link]');
    if (!anchor || anchor.hasAttribute('download') || (anchor.getAttribute('target') && anchor.getAttribute('target') !== '_self')) return;
    const href = anchor.getAttribute('href');
    if (href && navigateWithinReadiness(href, browser)) click.preventDefault();
  };
  root.addEventListener('click', onClick);
  return () => root.removeEventListener('click', onClick);
}
