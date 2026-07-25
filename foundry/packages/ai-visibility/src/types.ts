export type MentionSentiment = "positive" | "neutral" | "negative";

export interface Competitor {
  name: string;
  url?: string | null;
}

export interface BrandSubject {
  brandName: string;
  brandAliases?: string[];
  brandUrl?: string | null;
  competitors?: Competitor[];
}

export interface CompetitorMention {
  name: string;
  mentioned: boolean;
  position: number | null;
}

export interface MentionAnalysis {
  brandMentioned: boolean;
  brandRecommended: boolean;
  brandSentiment: MentionSentiment | null;
  brandPosition: number | null;
  competitorsMentioned: CompetitorMention[];
  citations: string[];
  brandCited: boolean;
  reasoning: string;
  provenance: "judge" | "deterministic-fallback";
}

export interface PromptDefinition {
  id: string;
  text: string;
  persona?: string | null;
}

export interface ProviderResponse {
  text: string;
  model?: string;
  observedCostUsd?: number;
  providerRequestId?: string;
}

export interface ProviderAdapter {
  id: string;
  model: string;
  grounded?: boolean;
  estimateCostUsd?: (prompt: PromptDefinition) => number;
  execute: (input: {
    prompt: PromptDefinition;
    signal: AbortSignal;
    idempotencyKey: string;
  }) => Promise<ProviderResponse>;
}

export interface JudgeAdapter {
  id: string;
  model?: string;
  judge: (input: {
    subject: BrandSubject;
    responseText: string;
    prompt: string;
    signal: AbortSignal;
  }) => Promise<string>;
}

export type AttemptStatus =
  | "completed"
  | "cached"
  | "unavailable"
  | "timed_out"
  | "failed";

export interface VisibilityAttempt {
  idempotencyKey: string;
  promptId: string;
  promptText: string;
  persona: string | null;
  providerId: string;
  model: string;
  status: AttemptStatus;
  responseText: string | null;
  analysis: MentionAnalysis | null;
  latencyMs: number | null;
  observedCostUsd: number;
  error: string | null;
  retryable: boolean;
  cached: boolean;
}

export interface CacheEntry {
  value: VisibilityAttempt;
  storedAt: string;
}

export interface CacheAdapter {
  get: (fingerprint: string) => Promise<CacheEntry | null>;
  set: (fingerprint: string, entry: CacheEntry) => Promise<void>;
}

export interface ExecutionPolicy {
  maxCalls: number;
  maxConcurrency: number;
  timeoutMs: number;
  retryAttempts: number;
  cacheTtlMs?: number;
  maxEstimatedCostUsd?: number;
  maxResponseCharacters?: number;
}

export interface CostReceipt {
  promptId: string;
  providerId: string;
  model: string;
  estimatedCostUsd: number;
  observedCostUsd: number;
  cached: boolean;
}

export interface VisibilityRun {
  analyzerFingerprint: string;
  attempts: VisibilityAttempt[];
  coverage: {
    configured: number;
    completed: number;
    cached: number;
    unavailable: number;
    timedOut: number;
    failed: number;
  };
  cost: {
    estimatedUsd: number;
    observedUsd: number;
    providerCalls: number;
    cacheHits: number;
  };
}

export interface ExecutionHooks {
  onAttempt?: (attempt: VisibilityAttempt) => Promise<void> | void;
  onProgress?: (progress: { completed: number; total: number }) => Promise<void> | void;
  onCostReceipt?: (receipt: CostReceipt) => Promise<void> | void;
}
