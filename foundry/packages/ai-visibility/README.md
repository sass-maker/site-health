# `@saas-maker/ai-visibility`

Provider-independent execution and analysis for AI mentions, recommendations,
ranking, sentiment, citations, competitors, personas, share of voice, and
visibility trends.

The package is headless. It does not import a web framework, database client,
provider SDK, scheduler, credential store, auth system, or product model. The
consumer supplies provider and optional judge adapters and owns persistence.
There are no runtime dependencies.

## Contract

```ts
import {
  executeVisibilityRun,
  type ProviderAdapter,
} from "@saas-maker/ai-visibility";

const providers: ProviderAdapter[] = [{
  id: "configured-provider",
  model: "configured-model",
  execute: async ({ prompt, signal, idempotencyKey }) => ({
    text: await callConfiguredProvider(prompt.text, { signal, idempotencyKey }),
  }),
}];

const run = await executeVisibilityRun({
  subject: {
    brandName: "Acme",
    brandUrl: "https://acme.example",
    competitors: [{ name: "Globex" }],
  },
  prompts: [{ id: "category", text: "What is the best tool?", persona: "developer" }],
  providers,
  policy: {
    maxCalls: 4,
    maxConcurrency: 2,
    timeoutMs: 30_000,
    retryAttempts: 2,
    cacheTtlMs: 86_400_000,
    maxEstimatedCostUsd: 0.05,
  },
});
```

The prompt-provider matrix fails closed before any request when it exceeds the
call or estimated-cost ceiling. Each result records completed, cached,
unavailable, timed-out, or failed state. Aggregates should use only completed
and cached results; missing providers are coverage gaps, not zero-visibility
answers.

## High Signal adapter

High Signal owns its connected-brand/customer model, provider configuration,
D1 schema, HTTP routes, auth, schedules, Daily Brief, Mentions UI, and reports.
Its adapter resolves configured providers, passes them to
`executeVisibilityRun`, then maps attempts into the existing D1 rows. The
package never receives owner IDs or a database handle.

## Foundry adapter

Foundry should resolve canonical project identity from its registry, supply a
manual bounded provider set, and store normalized attempts and cost receipts in
its private evidence ledger. This package does not activate a schedule or write
to the ledger itself.

## Judge and fallback

An optional judge adapter receives the package-built grading prompt and returns
raw JSON. Invalid, unavailable, or timed-out judge output falls back to the
deterministic analyzer and is labeled `deterministic-fallback`; it is never
presented as AI-judged.

## Storage and privacy

The consumer decides whether raw responses may be retained. Prefer normalized
results and evidence pointers. Never pass credentials, customer identifiers,
private draft content, or provider telemetry into cache keys or persistence
hooks.

## Free-first operation

Provider selection remains a consumer policy. Prefer already-configured or free
providers, keep schedules disabled until a reviewed canary proves output and
cost, and set explicit call, concurrency, timeout, retry, cache, and cost
limits for every run.

## Local verification

```bash
pnpm install --frozen-lockfile
pnpm check
```

`pnpm check` builds and tests the package, packs it, installs the tarball into a
clean temporary project, and typechecks and runs a consumer without workspace
imports.
