import { generateText } from 'ai';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { analyzeAnswer } from './analysis.mjs';
import { BrandEvidenceError } from './store.mjs';

// API model checks run each saved prompt once through an OpenAI-compatible
// endpoint. The default is Fleet's free-ai gateway (model `auto`). The key is
// read from the process environment at run time and is never stored, logged,
// or returned. Consumer-assistant coverage comes from captured web-UI answers
// and is recorded separately; it is never produced by this runner.

export const DEFAULT_GATEWAY_URL = 'https://ai-gateway.sassmaker.com/v1';
export const GATEWAY_PROJECT_ID = 'site-health';
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ANSWER_CHARS = 8_000;

function customKeyVariable(projectId) {
  return `BRAND_EVIDENCE_ENDPOINT_KEY_${projectId.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
}

export function resolveCheckSource(profile, env = process.env) {
  if (!profile?.brandName) return { ready: false, reason: 'Save a brand profile before running AI checks.' };
  const provider = profile.provider ?? { mode: 'free-ai' };
  if (provider.mode === 'custom-endpoint') {
    const apiKey = env[customKeyVariable(profile.projectId)];
    if (!apiKey) {
      return {
        ready: false,
        reason: `Custom endpoint key unavailable; provide ${customKeyVariable(profile.projectId)} to the backend environment.`,
      };
    }
    let providerName = 'custom-endpoint';
    try {
      providerName = new URL(provider.endpointUrl).hostname;
    } catch {}
    return {
      ready: true,
      provider: providerName,
      endpointUrl: provider.endpointUrl,
      model: provider.model,
      apiKey,
      gateway: false,
    };
  }
  const apiKey = env.AI_GATEWAY_API_KEY || env.GATEWAY_API_KEY;
  if (!apiKey) return { ready: false, reason: 'free-ai gateway key unavailable; provide AI_GATEWAY_API_KEY to the backend environment.' };
  const base = (env.AI_GATEWAY_URL || DEFAULT_GATEWAY_URL).replace(/\/$/, '');
  return {
    ready: true,
    provider: 'free-ai',
    endpointUrl: `${base}/chat/completions`,
    model: 'auto',
    apiKey,
    gateway: true,
  };
}

export function safeProviderError(error) {
  if (error?.name === 'TimeoutError' || error?.name === 'AbortError') return 'Provider request timed out';
  if (error?.statusCode >= 300 && error?.statusCode < 400) return 'Provider refused redirect';
  const status = error?.statusCode ?? error?.status;
  if (Number.isInteger(status)) return `Provider returned an error (${status})`;
  if (error?.code === 'redirect') return 'Provider refused redirect';
  return 'Provider request failed';
}

export async function askProvider(source, promptText, fetchImpl, { maxTokens = 1024, systemPrompt = null, json = false } = {}) {
  const started = Date.now();
  const provider = createOpenAICompatible({
    name: source.provider, baseURL: new URL(source.endpointUrl).origin,
    apiKey: source.apiKey,
    fetch: async (_url, init) => {
      const headers = Object.fromEntries(new Headers(init.headers).entries());
      const body = JSON.parse(init.body);
      return fetchImpl(source.endpointUrl, {
        ...init, redirect: 'manual',
        headers: { ...headers, ...(source.gateway ? { 'x-gateway-project-id': GATEWAY_PROJECT_ID } : {}) },
        body: JSON.stringify({ ...body, ...(json ? { response_format: { type: 'json_object' } } : {}), ...(source.gateway ? { project_id: GATEWAY_PROJECT_ID } : {}) }),
      });
    },
  });
  const result = await generateText({
    model: provider.chatModel(source.model), prompt: promptText,
    ...(systemPrompt ? { system: systemPrompt } : {}),
    maxOutputTokens: maxTokens, maxRetries: 0, abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });
  return {
    answer: result.text.slice(0, MAX_ANSWER_CHARS),
    model: result.response.modelId || source.model,
    latencyMs: Date.now() - started,
  };
}

export async function runApiModelCheck({
  store,
  projectId,
  trigger = 'manual',
  env = process.env,
  fetchImpl = fetch,
  now = () => new Date().toISOString(),
}) {
  const profile = store.getProfile(projectId);
  const prompts = store.listPrompts(projectId);
  const source = resolveCheckSource(profile, env);
  if (!source.ready) return { status: 'skipped', reason: source.reason };
  if (prompts.length === 0) return { status: 'skipped', reason: 'Add at least one prompt before running AI checks.' };

  const checkId = store.createCheck({ projectId, channel: 'api-model', trigger, startedAt: now() });
  let completed = 0;
  let failed = 0;
  let mentioned = 0;
  for (const prompt of prompts) {
    const observedAt = now();
    try {
      const result = await askProvider(source, prompt.promptText, fetchImpl);
      if (!result.answer.trim()) {
        failed += 1;
        store.recordObservation({
          projectId, checkId, channel: 'api-model', provider: source.provider, model: result.model,
          promptId: prompt.id, promptText: prompt.promptText, status: 'unavailable',
          errorMessage: 'Provider returned an empty answer', latencyMs: result.latencyMs, observedAt,
        });
        continue;
      }
      const analysis = analyzeAnswer(result.answer, {
        brandName: profile.brandName,
        aliases: profile.aliases,
        brandUrl: profile.brandUrl,
        competitors: profile.competitors,
      });
      store.recordObservation({
        projectId, checkId, channel: 'api-model', provider: source.provider, model: result.model,
        promptId: prompt.id, promptText: prompt.promptText, status: 'completed', answerText: result.answer,
        analysis, latencyMs: result.latencyMs, observedAt,
      });
      completed += 1;
      if (analysis.brandMentioned) mentioned += 1;
    } catch (error) {
      failed += 1;
      store.recordObservation({
        projectId, checkId, channel: 'api-model', provider: source.provider, model: source.model,
        promptId: prompt.id, promptText: prompt.promptText, status: 'error',
        errorMessage: safeProviderError(error), observedAt,
      });
    }
  }
  const status = completed === 0 ? 'failed' : failed > 0 ? 'partial' : 'completed';
  const mentionRate = completed > 0 ? mentioned / completed : null;
  const summary = completed > 0
    ? `Brand mentioned in ${mentioned}/${completed} available answers; ${failed} provider ${failed === 1 ? 'call was' : 'calls were'} unavailable.`
    : `Provider unavailable for all ${failed} attempted prompts.`;
  store.finishCheck(checkId, {
    status, attempted: prompts.length, completed, failed, mentionRate, summary, finishedAt: now(),
  });
  return { status, checkId, attempted: prompts.length, completed, failed, mentionRate, summary };
}

// MentionPilot's cron semantics: daily runs skip a project checked within 23h;
// weekly runs only on UTC Mondays and skip one checked within 6 days.
export function dueProjects(store, { now = new Date().toISOString() } = {}) {
  const current = Date.parse(now);
  return store.listProfiles().filter((profile) => {
    if (!profile.schedule) return false;
    if (profile.schedule === 'weekly' && new Date(current).getUTCDay() !== 1) return false;
    const last = store.lastCheck(profile.projectId);
    if (!last) return true;
    const elapsed = current - Date.parse(last.startedAt);
    return profile.schedule === 'daily' ? elapsed >= 23 * 3_600_000 : elapsed >= 6 * 86_400_000;
  }).map((profile) => profile.projectId);
}

export function assertKnownProject(projectId, projects) {
  if (!projects.some((project) => project.id === projectId)) {
    throw new BrandEvidenceError('project not found', 404);
  }
}
