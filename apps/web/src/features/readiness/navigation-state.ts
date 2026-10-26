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
