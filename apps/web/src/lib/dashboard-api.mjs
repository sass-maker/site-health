export async function dashboardApi(base, path, options) {
  let response;
  try {
    response = await fetch(`${base}${path}`, {
      ...options,
      headers: { accept: 'application/json', 'content-type': 'application/json', ...options?.headers },
    });
  } catch { throw new Error('Site Health backend is unavailable.'); }
  if (!response.ok) {
    if (response.status >= 400 && response.status < 500) {
      const payload = await response.json().catch(() => null);
      if (typeof payload?.error === 'string' && payload.error.trim()) throw new Error(payload.error);
    }
    throw new Error('Site Health backend is unavailable.');
  }
  return response.json();
}
