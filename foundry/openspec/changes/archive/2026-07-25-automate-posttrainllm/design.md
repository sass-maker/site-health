## Context

PostTrainLLM combines a public Astro site/WebGPU playground with local model
training, evaluation, runtime and artifact workflows. The public surface can use
central web/deploy evidence; local data/model operations require provenance and
privacy-safe receipts rather than raw telemetry.

## Goals / Non-Goals

**Goals:** prove public health, local workflow activation, eval/artifact
provenance, scheduled freshness, docs/indexing and release readiness.

**Non-Goals:** data/checkpoint upload, automatic model publication, benchmark
claim inflation, product feature work or automatic production deployment.

## Decisions

- Treat website, WebGPU, local training, evaluation, packaging/download and
  scheduled data paths as separate runtime contracts.
- Record aggregate local outcomes with dataset/model fingerprints only when
  non-sensitive and necessary; never copy payloads into Foundry.
- Require benchmark/eval claims to link exact revision, config and artifact.
- Use existing GitHub/Cloudflare evidence first and add no universal vendor.
- Keep release/model publishing approval manual.

## Risks / Trade-offs

- **Local workflows are centrally invisible** → Accept signed/local receipts or
  explicit unknown state without data upload.
- **Benchmarks become stale claims** → Add freshness/provenance instead of
  automatically rerunning costly work.
- **Artifacts consume storage/cost** → Record ownership/retention and budgets.
