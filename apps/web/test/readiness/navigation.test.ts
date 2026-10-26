import { describe, expect, it, vi } from 'vitest';
import { navigateWithinReadiness, protectUnsavedWorkspace } from '../../src/features/readiness/navigation-state';

function browser() {
  const events = new EventTarget();
  let location = new URL('http://127.0.0.1:4321/readiness');
  const backStack: URL[] = [];
  return {
    get location() { return location; },
    history: {
      pushState: vi.fn((_state: unknown, _unused: string, href?: string | URL | null) => {
        backStack.push(location);
        location = new URL(String(href), location);
      }),
    } as unknown as History,
    dispatchEvent: events.dispatchEvent.bind(events),
    addEventListener: events.addEventListener.bind(events) as Window['addEventListener'],
    removeEventListener: events.removeEventListener.bind(events) as Window['removeEventListener'],
    back() { location = backStack.pop()!; events.dispatchEvent(new Event('popstate')); },
  };
}

describe('readiness navigation with tab-only recovery', () => {
  it('updates drill-down and Back in place while the unload guard protects unsaved data', () => {
    const page = browser();
    const views: string[] = [];
    page.addEventListener('popstate', () => views.push(page.location.search));
    const removeGuard = protectUnsavedWorkspace(page);
    expect(navigateWithinReadiness('/readiness?product=example&category=design', page)).toBe(true);
    expect(page.history.pushState).toHaveBeenCalledOnce();
    expect(views).toEqual(['?product=example&category=design']);
    // The guard survives drill-down and browser Back; no document navigation occurs.
    page.back();
    expect(views).toEqual(['?product=example&category=design', '']);
    const exit = new Event('beforeunload', { cancelable: true });
    expect(page.dispatchEvent(exit)).toBe(false);
    expect(exit.defaultPrevented).toBe(true);
    removeGuard();
    expect(page.dispatchEvent(new Event('beforeunload', { cancelable: true }))).toBe(true);
  });

  it('leaves actual document destinations to native navigation and its unload guard', () => {
    const page = browser();
    expect(navigateWithinReadiness('/projects', page)).toBe(false);
    expect(navigateWithinReadiness('https://example.com/readiness', page)).toBe(false);
    expect(page.history.pushState).not.toHaveBeenCalled();
  });
});
