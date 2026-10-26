// Runs before the first paint and on every full-page navigation.
export function initializeTheme(window, document) {
  const key = 'site-health-appearance';
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  const valid = (value) => ['light', 'dark', 'system'].includes(value) ? value : 'system';
  let preference = 'system';
  try { preference = valid(window.localStorage.getItem(key)); } catch {}
  const apply = () => {
    const mode = preference === 'system' ? (media.matches ? 'dark' : 'light') : preference;
    root.dataset.mode = mode;
    root.dataset.appearance = preference;
    root.style.colorScheme = mode;
    document.querySelectorAll('[data-theme-select]').forEach((select) => { select.value = preference; });
  };
  apply();
  media.addEventListener('change', apply);
  window.addEventListener('site-health:appearance', (event) => {
    preference = valid(event.detail);
    try { window.localStorage.setItem(key, preference); } catch {}
    apply();
  });
  window.addEventListener('storage', (event) => {
    if (event.key === key || event.key === null) { preference = valid(event.newValue); apply(); }
  });
}

export const themeBootstrap = `(${initializeTheme.toString()})(window, document);`;
