import {
  parseApp,
  compactObservation,
  record,
  type App,
  type Observation,
  type SearchKey,
} from './domain.ts';
import type { AIInput, AIOutput } from './ai-types.ts';
export type Status = {
  apple: { enabled: boolean | null; limitPerMinute: number; cacheMinutes: number };
  ai: { enabled: boolean; reason: string; local: boolean };
  connections: { appleAds: boolean; appStoreConnect: boolean };
};
export class HttpError extends Error {
  status: number;
  retryAfter: number;
  code?: string;
  constructor(message: string, status: number, retryAfter = 0, code?: string) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
    this.code = code;
  }
}
export async function requestJson(path: string, init: RequestInit = {}): Promise<unknown> {
  const response = await fetch(path, init);
  let value: unknown;
  try {
    value = await response.json();
  } catch {
    throw new HttpError(
      'The research service returned an unreadable response.',
      response.status || 502,
    );
  }
  if (!response.ok) {
    const error = record(value);
    throw new HttpError(
      typeof error.error === 'string' ? error.error : 'The request failed.',
      response.status,
      Number(response.headers.get('Retry-After')) || 0,
      typeof error.code === 'string' ? error.code : undefined,
    );
  }
  return value;
}
export type Capture = {
  apps: App[];
  sourceUrl: string;
  fetchedAt: string;
  cache: 'hit' | 'miss';
  expiresAt: string;
  notice?: string;
  cacheNotice?: string;
  observation?: Observation;
};
export async function appleRequest(path: string, signal: AbortSignal): Promise<Capture> {
  const data = record(await requestJson(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}', signal }));
  if (!Array.isArray(data.apps) || !['hit', 'miss'].includes(String(data.cache)))
    throw new Error('Invalid collection response.');
  return {
    apps: data.apps.map((a) => parseApp(a)),
    sourceUrl: String(data.sourceUrl),
    fetchedAt: String(data.fetchedAt),
    expiresAt: String(data.expiresAt),
    notice: typeof data.notice === 'string' ? data.notice : undefined,
    cacheNotice: typeof data.cacheNotice === 'string' ? data.cacheNotice : undefined,
    cache: data.cache as 'hit' | 'miss',
    observation: data.observation ? compactObservation(data.observation) : undefined,
  };
}
export function searchPath(key: SearchKey) {
  return `/api/dashboard/v1/seo/app-store/search?${new URLSearchParams({ term: key.term, country: key.country, platform: key.platform, limit: String(key.limit) })}`;
}
export function pause(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Cancelled', 'AbortError'));
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      reject(new DOMException('Cancelled', 'AbortError'));
    };
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort);
      resolve();
    }, ms);
    signal.addEventListener('abort', abort, { once: true });
  });
}
export async function pacedCapture(
  key: SearchKey,
  signal: AbortSignal,
  onWait: (seconds: number) => void,
): Promise<Capture> {
  const started = Date.now();
  let transient = 0;
  for (;;) {
    try {
      return await appleRequest(searchPath(key), signal);
    } catch (error) {
      if (signal.aborted) throw error;
      const e = error instanceof HttpError ? error : null;
      const wait =
        e?.status === 429
          ? Math.max(1, e.retryAfter)
          : e && [502, 503, 504].includes(e.status) && !['provider_shape', 'platform_mismatch', 'response_too_large'].includes(e.code ?? '') && transient++ < 1
            ? Math.max(5, e.retryAfter)
            : 0;
      if (!wait || Date.now() - started + wait * 1000 > 65000) throw error;
      onWait(wait);
      await pause(wait * 1000, signal);
    }
  }
}
export async function askAI(input: AIInput, signal: AbortSignal): Promise<AIOutput> {
  return (await requestJson('/api/dashboard/v1/seo/app-store/ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
    signal,
  })) as AIOutput;
}
