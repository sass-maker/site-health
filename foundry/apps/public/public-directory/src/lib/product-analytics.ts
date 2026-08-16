const PROJECT_ID = 'fleet-workspace';
const POSTHOG_KEY = 'phc_qgiAarw4Co4pw9fz3Fxj4UJaHmqzFetqs4JrXhGc35Nd';
const POSTHOG_HOST = 'https://us.i.posthog.com';

export function emitPageView(): void {
  if (typeof window === 'undefined') return;
  void fetch(`${POSTHOG_HOST}/i/v0/e/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: POSTHOG_KEY,
      event: 'page_view',
      distinct_id: crypto.randomUUID(),
      properties: { project_id: PROJECT_ID },
    }),
    keepalive: true,
  }).catch(() => {
    // Analytics must never break the page.
  });
}
