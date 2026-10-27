import { describe, expect, it, vi } from 'vitest';
import { bindReadinessNavigation, navigateWithinReadiness, protectUnsavedWorkspace } from '../../src/features/readiness/navigation-state';

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

describe('static sidebar navigation bridge', () => {
  function click(root: EventTarget, href: string, overrides: Record<string, unknown> = {}, attributes: Record<string, string> = {}) {
    const event = new Event('click', { cancelable: true });
    const attrs = { href, ...attributes };
    Object.defineProperties(event, Object.fromEntries(Object.entries({ button: 0, target: { closest: (selector: string) => selector === 'a[data-readiness-link]' ? { hasAttribute: (key: string) => key in attrs, getAttribute: (key: string) => attrs[key as keyof typeof attrs] ?? null } : null }, ...overrides }).map(([key, value]) => [key, { value }])));
    root.dispatchEvent(event);
    return event;
  }
  it('keeps all six sidebar destinations mounted and Back restores the prior category with the unsaved guard intact', () => {
    const page = browser(); const root = new EventTarget(); const changes: string[] = [];
    page.addEventListener('popstate', () => changes.push(page.location.search));
    const unbind = bindReadinessNavigation(root as unknown as Document, page);
    const unprotect = protectUnsavedWorkspace(page);
    for (const category of ['product', 'design', 'seo', 'geo', 'measurement', 'engineering']) {
      expect(click(root, `/readiness?page=category&category=${category}`).defaultPrevented).toBe(true);
      expect(page.location.search).toContain(`category=${category}`);
    }
    expect(changes).toHaveLength(6);
    page.back(); expect(page.location.search).toContain('category=measurement');
    expect(page.dispatchEvent(new Event('beforeunload', { cancelable: true }))).toBe(false);
    unbind(); expect(click(root, '/readiness').defaultPrevented).toBe(false);
    unprotect();
  });
  it('preserves modifiers, new tabs, downloads, external destinations and already-handled clicks', () => {
    const page = browser(); const root = new EventTarget();
    bindReadinessNavigation(root as unknown as Document, page);
    for (const override of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { defaultPrevented: true }]) click(root, '/readiness?page=category&category=geo', override);
    click(root, '/readiness', {}, { target: '_blank' });
    click(root, '/readiness', {}, { download: '' });
    expect(click(root, 'https://example.com/readiness').defaultPrevented).toBe(false);
    expect(click(root, '/projects').defaultPrevented).toBe(false);
    expect(page.history.pushState).not.toHaveBeenCalled();
  });
});
