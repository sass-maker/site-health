## Context

The existing service already has a Cloudflare Worker and R2 bucket for durable
reel intake/artifacts plus a pull-based Rust watcher on a generation host.
Local Video Forge needs the same split-host shape, but its unit of work is one
approved keyframe and one 3–5 second shot rather than a complete marketing
reel.

The hosted machine must stay useful when the Mac is offline, and both machines
must be able to create work. The Mac must not require an inbound port, shared
filesystem, or SSH access from the hosted machine.

## Goals / Non-Goals

**Goals**

- One source of truth for tasks created from either machine.
- One-at-a-time, resumable generation on eligible Apple Silicon workers.
- Exact prompt, seed, model revision, dimensions, frames, steps, timing, and
  host metadata for every variant.
- The first real command turns one explicitly approved keyframe into three
  reviewable MP4 variants.
- Fail closed when the pinned MLX runtime, the keyframe, disk space, or memory headroom is
  unavailable.

**Non-Goals**

- A nonlinear editor, public product, automatic posting, final-shot rerenders,
  cloud-provider adapters, LoRA training, or automatic shot planning.
- Concurrent workers for the same task or parallel model execution.
- Installing model weights on the permanently hosted machine unless it is also
  an eligible Apple Silicon generation host.

## Decisions

### Hosted coordinator, pull-based workers

The existing Worker/R2 surface owns task and asset records. Either machine uses
the same authenticated CLI to submit a task. Eligible workers poll and claim
tasks; the Mac never accepts inbound connections.

Tasks use conditional R2 writes with the current object ETag for lease/status
transitions. A lease has a worker id and expiry. A worker may renew its own
lease, and an expired task may be reclaimed. This is sufficient for the MVP's
single-render concurrency without adding D1, Durable Objects, or Cloudflare
Queues.

### JSON manifest first

The durable manifest is JSON in v0.1. JSON satisfies the PRD's YAML-or-JSON
requirement while avoiding a new Node production dependency. The contract can
gain YAML input later without changing the normalized record.

### Separate Python tool environment

The setup script pins `ltx-2-mlx` by Git commit and installs it under the
ignored `.reel-pipeline/engines/` directory for the default LTX-2.3 int4 path
that fits the 48 GB host. The separately pinned `tools/mlx-video/` environment
remains a benchmark lane because its current LTX-2.3 snapshot downloads an
unreferenced duplicate transformer and does not provide a complete runnable
model/text-encoder bundle by itself. `uv sync` creates ignored tool
environments; neither enters the Node application dependency graph. Model
repositories and their resolved revisions are captured in each render record.

### Direct and queued execution share one runner

The local `variants` command and the queued `work` command call the same runner:

1. validate manifest and explicit keyframe approval;
2. check Apple Silicon, disk, MLX runtime, and memory headroom;
3. create a collision-free run directory;
4. generate seeds serially;
5. write progress and per-variant metadata after every transition;
6. emit a review manifest containing the three MP4 paths.

Queued work downloads the keyframe to the run directory and streams completed
MP4s back to the coordinator before marking the task complete.

### Phase 0 is a release gate

Automation is not called proven until this Mac completes one LTX text-to-video,
one image-to-video, and one two-stage HQ generation. The proof receipts record
which MLX runtime produced each output; the MLX-Video lane remains a benchmark,
not a gate when its current packaging cannot fit or run. Tests may use an
injected command runner, but mock artifacts must be labelled as contract tests
rather than generation proof.

## Failure handling

- Readiness failure: do not claim or render; return an actionable reason.
- Render failure: persist stderr/timing, retry the task once, then mark it
  failed.
- Worker crash: lease expires and another eligible worker can reclaim it.
- Upload failure: retain local output and keep the task leased/retryable.
- Existing output: never overwrite; resume completed seeds and render only
  missing variants.

## Verification

- Unit tests for manifest validation, keyframe approval, command construction,
  memory refusal, collision-free/resumable output, and metadata.
- Worker tests for authenticated submit/list/claim/progress/complete flows,
  capability filtering, lease ownership, and conditional claim races.
- CLI dry-run test for one keyframe and three seeds.
- Real Phase 0 proof on this Mac recorded outside git under `.reel-pipeline/`.
