import { analyzeMentionResponse } from "./analysis.js";
import { buildMentionJudgePrompt, parseMentionVerdict } from "./judge.js";
import type {
  AttemptStatus,
  BrandSubject,
  ExecutionHooks,
  ExecutionPolicy,
  JudgeAdapter,
  MentionAnalysis,
  PromptDefinition,
  ProviderAdapter,
  VisibilityAttempt,
  VisibilityRun,
} from "./types.js";

export const DEFAULT_ANALYZER_FINGERPRINT = "ai-visibility:0.1.0";

export class ProviderUnavailableError extends Error {
  override name = "ProviderUnavailableError";
}

export class RetryableProviderError extends Error {
  override name = "RetryableProviderError";
}

class ProviderTimeoutError extends Error {
  override name = "ProviderTimeoutError";
}

interface WorkItem {
  prompt: PromptDefinition;
  provider: ProviderAdapter;
}

function stableFingerprint(value: unknown): string {
  const serialized = JSON.stringify(value, (_key, item: unknown) => {
    if (item && typeof item === "object" && !Array.isArray(item)) {
      return Object.fromEntries(
        Object.entries(item as Record<string, unknown>).sort(([left], [right]) =>
          left.localeCompare(right),
        ),
      );
    }
    return item;
  });
  let hash = 14_695_981_039_346_656_037n;
  for (let index = 0; index < serialized.length; index++) {
    hash ^= BigInt(serialized.charCodeAt(index));
    hash = BigInt.asUintN(64, hash * 1_099_511_628_211n);
  }
  return `av-${hash.toString(16).padStart(16, "0")}`;
}

export function createCacheFingerprint(input: {
  subject: BrandSubject;
  prompt: PromptDefinition;
  providerId: string;
  model: string;
  analyzerFingerprint?: string;
}): string {
  return stableFingerprint({
    subject: input.subject,
    prompt: input.prompt,
    providerId: input.providerId,
    model: input.model,
    analyzerFingerprint: input.analyzerFingerprint ?? DEFAULT_ANALYZER_FINGERPRINT,
  });
}

function validatePolicy(policy: ExecutionPolicy): void {
  const positiveIntegers: Array<[string, number]> = [
    ["maxCalls", policy.maxCalls],
    ["maxConcurrency", policy.maxConcurrency],
    ["timeoutMs", policy.timeoutMs],
    ["retryAttempts", policy.retryAttempts],
  ];
  for (const [name, value] of positiveIntegers) {
    if (!Number.isInteger(value) || value < 1) {
      throw new Error(`${name} must be a positive integer`);
    }
  }
  if (policy.maxEstimatedCostUsd !== undefined && policy.maxEstimatedCostUsd < 0) {
    throw new Error("maxEstimatedCostUsd cannot be negative");
  }
}

async function withTimeout<T>(
  timeoutMs: number,
  execute: (signal: AbortSignal) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      execute(controller.signal),
      new Promise<never>((_resolve, reject) => {
        timer = setTimeout(() => {
          controller.abort();
          reject(new ProviderTimeoutError(`provider timed out after ${timeoutMs}ms`));
        }, timeoutMs);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function classifyError(error: unknown): {
  status: Exclude<AttemptStatus, "completed" | "cached">;
  retryable: boolean;
  message: string;
} {
  const message = error instanceof Error ? error.message : String(error);
  if (error instanceof ProviderUnavailableError) {
    return { status: "unavailable", retryable: false, message };
  }
  if (error instanceof ProviderTimeoutError || (error instanceof Error && error.name === "AbortError")) {
    return { status: "timed_out", retryable: true, message };
  }
  return {
    status: "failed",
    retryable: error instanceof RetryableProviderError,
    message,
  };
}

async function analyzeWithOptionalJudge(input: {
  subject: BrandSubject;
  prompt: PromptDefinition;
  responseText: string;
  judge?: JudgeAdapter;
  timeoutMs: number;
}): Promise<MentionAnalysis> {
  if (input.judge && input.responseText.trim()) {
    try {
      const raw = await withTimeout(input.timeoutMs, (signal) =>
        input.judge!.judge({
          subject: input.subject,
          responseText: input.responseText,
          prompt: buildMentionJudgePrompt(input.subject, input.responseText),
          signal,
        }),
      );
      const verdict = parseMentionVerdict(raw, input.subject.competitors ?? []);
      if (verdict) return verdict;
    } catch {
      // A missing or failed optional judge must not turn a provider result into
      // a failed attempt. The provenance label makes the fallback explicit.
    }
  }
  return analyzeMentionResponse({ ...input.subject, text: input.responseText });
}

async function executeWorkItem(input: {
  item: WorkItem;
  subject: BrandSubject;
  policy: ExecutionPolicy;
  judge?: JudgeAdapter;
  cache?: {
    adapter: NonNullable<
      Parameters<typeof executeVisibilityRun>[0]["cache"]
    >["adapter"];
    nowMs: number;
  };
  analyzerFingerprint: string;
}): Promise<VisibilityAttempt> {
  const { item, subject, policy } = input;
  const idempotencyKey = createCacheFingerprint({
    subject,
    prompt: item.prompt,
    providerId: item.provider.id,
    model: item.provider.model,
    analyzerFingerprint: input.analyzerFingerprint,
  });
  if (input.cache && (policy.cacheTtlMs ?? 0) > 0) {
    const entry = await input.cache.adapter.get(idempotencyKey);
    const storedAt = entry ? Date.parse(entry.storedAt) : Number.NaN;
    if (
      entry &&
      Number.isFinite(storedAt) &&
      input.cache.nowMs - storedAt <= (policy.cacheTtlMs ?? 0)
    ) {
      return {
        ...entry.value,
        status: "cached",
        observedCostUsd: 0,
        latencyMs: 0,
        error: null,
        retryable: false,
        cached: true,
      };
    }
  }

  const startedAt = Date.now();
  let finalError: ReturnType<typeof classifyError> | null = null;
  for (let attempt = 1; attempt <= policy.retryAttempts; attempt++) {
    try {
      const response = await withTimeout(policy.timeoutMs, (signal) =>
        item.provider.execute({
          prompt: item.prompt,
          signal,
          idempotencyKey,
        }),
      );
      const responseText = response.text.slice(0, policy.maxResponseCharacters ?? 12_000);
      const analysis = await analyzeWithOptionalJudge({
        subject,
        prompt: item.prompt,
        responseText,
        ...(input.judge ? { judge: input.judge } : {}),
        timeoutMs: policy.timeoutMs,
      });
      const result: VisibilityAttempt = {
        idempotencyKey,
        promptId: item.prompt.id,
        promptText: item.prompt.text,
        persona: item.prompt.persona ?? null,
        providerId: item.provider.id,
        model: response.model || item.provider.model,
        status: "completed",
        responseText,
        analysis,
        latencyMs: Date.now() - startedAt,
        observedCostUsd: response.observedCostUsd ?? 0,
        error: null,
        retryable: false,
        cached: false,
      };
      if (input.cache) {
        await input.cache.adapter.set(idempotencyKey, {
          value: result,
          storedAt: new Date(input.cache.nowMs).toISOString(),
        });
      }
      return result;
    } catch (error) {
      finalError = classifyError(error);
      if (!finalError.retryable || attempt === policy.retryAttempts) break;
    }
  }

  return {
    idempotencyKey,
    promptId: item.prompt.id,
    promptText: item.prompt.text,
    persona: item.prompt.persona ?? null,
    providerId: item.provider.id,
    model: item.provider.model,
    status: finalError?.status ?? "failed",
    responseText: null,
    analysis: null,
    latencyMs: Date.now() - startedAt,
    observedCostUsd: 0,
    error: finalError?.message ?? "provider failed",
    retryable: finalError?.retryable ?? false,
    cached: false,
  };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  execute: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let cursor = 0;
  async function worker(): Promise<void> {
    while (cursor < items.length) {
      const index = cursor++;
      const item = items[index];
      if (item !== undefined) results[index] = await execute(item);
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(concurrency, Math.max(items.length, 1)) }, () => worker()),
  );
  return results;
}

export async function executeVisibilityRun(input: {
  subject: BrandSubject;
  prompts: PromptDefinition[];
  providers: ProviderAdapter[];
  policy: ExecutionPolicy;
  judge?: JudgeAdapter;
  cache?: { adapter: import("./types.js").CacheAdapter; now?: () => number };
  hooks?: ExecutionHooks;
  analyzerFingerprint?: string;
}): Promise<VisibilityRun> {
  validatePolicy(input.policy);
  const work: WorkItem[] = input.prompts.flatMap((prompt) =>
    input.providers.map((provider) => ({ prompt, provider })),
  );
  if (work.length > input.policy.maxCalls) {
    throw new Error(
      `visibility matrix requires ${work.length} calls, exceeding maxCalls ${input.policy.maxCalls}`,
    );
  }

  const estimatedCostUsd = work.reduce(
    (total, { prompt, provider }) => total + (provider.estimateCostUsd?.(prompt) ?? 0),
    0,
  );
  if (
    input.policy.maxEstimatedCostUsd !== undefined &&
    estimatedCostUsd > input.policy.maxEstimatedCostUsd
  ) {
    throw new Error(
      `estimated cost $${estimatedCostUsd.toFixed(6)} exceeds limit $${input.policy.maxEstimatedCostUsd.toFixed(6)}`,
    );
  }

  const analyzerFingerprint =
    input.analyzerFingerprint ?? DEFAULT_ANALYZER_FINGERPRINT;
  const nowMs = input.cache?.now?.() ?? Date.now();
  const attempts = await mapWithConcurrency(
    work,
    input.policy.maxConcurrency,
    (item) =>
      executeWorkItem({
        item,
        subject: input.subject,
        policy: input.policy,
        ...(input.judge ? { judge: input.judge } : {}),
        ...(input.cache ? { cache: { adapter: input.cache.adapter, nowMs } } : {}),
        analyzerFingerprint,
      }),
  );

  let progressed = 0;
  for (const attempt of attempts) {
    await input.hooks?.onAttempt?.(attempt);
    await input.hooks?.onCostReceipt?.({
      promptId: attempt.promptId,
      providerId: attempt.providerId,
      model: attempt.model,
      estimatedCostUsd:
        work
          .find(
            ({ prompt, provider }) =>
              prompt.id === attempt.promptId && provider.id === attempt.providerId,
          )
          ?.provider.estimateCostUsd?.(
            work.find(({ prompt }) => prompt.id === attempt.promptId)!.prompt,
          ) ?? 0,
      observedCostUsd: attempt.observedCostUsd,
      cached: attempt.cached,
    });
    progressed++;
    await input.hooks?.onProgress?.({ completed: progressed, total: attempts.length });
  }

  const count = (status: AttemptStatus): number =>
    attempts.filter((attempt) => attempt.status === status).length;
  return {
    analyzerFingerprint,
    attempts,
    coverage: {
      configured: attempts.length,
      completed: count("completed"),
      cached: count("cached"),
      unavailable: count("unavailable"),
      timedOut: count("timed_out"),
      failed: count("failed"),
    },
    cost: {
      estimatedUsd: estimatedCostUsd,
      observedUsd: attempts.reduce((sum, attempt) => sum + attempt.observedCostUsd, 0),
      providerCalls: attempts.filter((attempt) => !attempt.cached).length,
      cacheHits: attempts.filter((attempt) => attempt.cached).length,
    },
  };
}
