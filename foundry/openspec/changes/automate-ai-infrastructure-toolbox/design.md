## Context

Free AI is an OpenAI-compatible multi-provider gateway; Knowledge Base provides
private RAG/search over project corpora through Worker/app/storage surfaces.
They are stable maintenance infrastructure, but downstream products depend on
auth, provider, index, storage and background-path health.

## Goals / Non-Goals

**Goals:** auth-safe health, structured errors/latency, provider/cost/quota
visibility, bounded job lifecycle, storage durability/reconstruction, privacy
and quiet Foundry evidence.

**Non-Goals:** feature expansion, provider-spend change, universal request
logging, private prompt/corpus capture, rate-limit changes, data migration or
automatic production deploy.

## Decisions

- Use auth-only/metadata health endpoints or synthetic zero-sensitive probes;
  avoid provider-token spend where possible.
- Correlate requests with sanitized IDs and outcome/latency/provider class, not
  prompts, completions, retrieved chunks or authorization headers.
- Model provider degradation separately from total service outage.
- Inventory all ingestion/indexing/queue/scheduled paths with bounds,
  idempotency, freshness and failure state.
- Classify D1/KV/R2/vector/corpus state by authoritative and reconstructable
  ownership; retain existing providers and deployment boundaries.

## Risks / Trade-offs

- **Health probe spends tokens** → Prefer auth/metadata routes and bounded cheap
  synthetic probes only when necessary.
- **Provider failure causes retry cost storm** → Bound retries and expose
  quota/degradation state.
- **RAG logs leak private corpora** → Store metadata/status only.
- **Maintenance alerts become noisy** → Digest provider degradation unless all
  paths fail or data/security risk exists.
