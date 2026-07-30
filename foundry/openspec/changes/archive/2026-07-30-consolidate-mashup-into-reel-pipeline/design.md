## Context

Mashup was a standalone Python 3.11+ local editorial system with SQLite-backed stage
outputs, optional local transcription and models, structure-aware planning,
eight surfaced score terms, an EDL, an Astro/React timeline editor, and an
FFmpeg renderer. Reel Pipeline is a Node/Rust/Chromium/FFmpeg media service
with versioned input contracts, deterministic coherent-film composition,
review artifacts, hashes, approval gates, and Postiz draft handoff.

Both systems transform source-backed media into reviewable videos. Their
separate product boundaries created duplicate timeline, caption, provenance,
visual, and render concepts. The migration preserved Mashup's changed working
state, ignored archives, ignored `.mashup/` caches, licensing boundary, and
resumability while avoiding unrelated Foundry work already present in the
monorepo checkout.

## Goals / Non-Goals

**Goals:**

- Make Reel Pipeline the sole canonical Fleet product for editorial planning
  and media rendering.
- Preserve the proven Python planner as a nested runtime, including its uv
  environment, SQLite stage state, CLI, tests, and loopback editor.
- Define one strict `fleet.podcast-edit.v1` interchange document between the
  editorial runtime and Reel Pipeline rendering.
- Preserve source timing, transcript text, member-segment provenance, all eight
  score terms, visual asset provenance, captions, and approval state.
- Render approved podcast edits through a Reel Pipeline adapter without
  regenerating or paraphrasing source speech.
- Prove parity before the standalone Mashup checkout is retired.

**Non-Goals:**

- Rewriting the planner in JavaScript or Rust.
- Copying archives, `.mashup/` caches, rendered output, credentials, model
  weights, or local generated artifacts into Foundry.
- Deploying, publishing, changing Postiz, or changing social credentials.
- Automatically choosing generated photoreal footage or synthesizing speech.
- Removing the standalone checkout in the first migration slice.

## Decisions

### 1. One product, multiple runtimes

The Python package moves intact under
`foundry/marketing/reel-pipeline/editorial/`; Node remains the contract and
render integration layer, and Rust remains process orchestration.

Alternative considered: rewrite Mashup into Node. Rejected because it would
discard the proven planner and stage cache semantics while adding migration
risk without reducing the product boundary.

### 2. A versioned podcast-edit contract is the seam

Reel Pipeline SHALL normalize `fleet.podcast-edit.v1` documents. The contract
contains edit identity, strategy, prompt, target and actual duration, clips,
source locators, transcript text, visual inserts, terms, weights, calibration,
rationale, and approval. Paths remain local and are resolved only during local
rendering.

Alternative considered: put the full EDL into free-form `VideoBrief.body`.
Rejected because the VideoBrief prose contract cannot preserve typed source
ranges, score terms, or asset provenance.

### 3. The first importer is lossless and the existing multi-clip renderer stays intact

The Python runtime exports the contract without selecting a Reel Pipeline
render mode. A Node adapter accepts only an approved podcast edit, materializes
its embedded EDL in a collision-free local run directory, invokes the nested
Python renderer, and hashes the MP4, sidecar captions, input contract, and
source identities into a Reel Pipeline receipt.

Alternative considered: make Mashup call Reel Pipeline internals directly.
Rejected because it couples planning to a renderer and makes editorial tests
require Node/Chromium.

Alternative considered: immediately convert every edit to a coherent-film
manifest. Rejected for the first slice because coherent films currently bind a
single narration asset while Mashup edits can contain many clip ranges from
many sources. The podcast adapter preserves proven multi-source audio behavior;
shared visual primitives can be adopted after artifact parity.

### 4. Visual treatments are coherent-film primitives, not another product

Kinetic type, ASCII signal, cel geometry, licensed images, and source footage
belong in Reel Pipeline's deterministic scene library. Versioned film skills
can constrain combinations later, but the consolidation contract describes
editorial intent rather than a specific implementation effect.

### 5. Compatibility proof precedes retirement

The standalone checkout remained available while the canonical copy was
validated. Retirement required Python tests, Node contract tests, one local
short render, docs, and explicit status changes. Before archival, every changed
implementation, test, and editor file was confirmed identical to the Fleet copy
or strictly behind Fleet's podcast-contract and overlap-safety integration.
The final public snapshot preserved the incorporated work and design evidence,
linked to Fleet, and moved remaining follow-up into Fleet issue #73.

### 6. Exact reuse is invalid; semantic similarity remains scored

The planner already prevents reuse of shared material IDs, MMR diversifies the
candidate pool, and `non_repetition` remains an independently surfaced quality
term. The Python exporter and Node contract validator additionally fail closed
when a hand-edited timeline repeats a member segment ID or uses overlapping
planned or rendered source-audio intervals from the same source.

Semantic similarity is not a hard contract error. A long-form argument may
deliberately return to a topic or callback without replaying the same source
material, so near-duplication remains visible in `non_repetition` rather than
being guessed from text at render time.

### 7. Short form is a mode, not a pipeline ceiling

The explicit `short` command keeps its 30–60 second validation. The standard
planner accepts longer positive targets and the podcast-edit contract imposes
no maximum duration. Both duration classes use the same provenance, approval,
duplicate-content, render, and receipt boundary.

```mermaid
flowchart LR
    A[Owned or public-domain sources] --> B[Editorial Python runtime]
    B --> C[fleet.podcast-edit.v1]
    C --> D[Reel Pipeline contract validator]
    D --> E[Podcast-edit render adapter]
    E --> F[Python multi-clip renderer + visual layers]
    F --> G[FFmpeg artifact + review evidence]
    G --> H[Postiz draft handoff]
```

## Risks / Trade-offs

- **Multi-language service becomes larger** → Keep isolated package managers,
  scoped commands, and contract tests at the boundary.
- **Copying an active dirty checkout loses provenance** → Preserve the current
  working tree exactly in the canonical import, record the source path and
  migration date, and avoid deleting the source.
- **Two copies drift during parity period** → Treat Foundry as canonical after
  the first green import, compare the final working tree before retirement, and
  archive the standalone repository after parity.
- **Local absolute paths leak into committed fixtures** → Contract fixtures use
  repository-relative paths; validators reject remote fetches during local
  render and tests use temporary directories.
- **Visual capability becomes a technique montage** → Keep one dominant
  visual action per scene and encode visual budgets in later film-skill work.
- **A semantic duplicate gate rejects deliberate callbacks** → Hard-reject
  only reused member IDs and overlapping source-audio intervals; keep semantic
  similarity in the surfaced `non_repetition` score.
- **Existing Foundry dirty work is accidentally staged** → Scope changes to
  `services/reel-pipeline` and this OpenSpec change; do not commit or push in
  this pass.

## Migration Plan

1. Create the cross-product OpenSpec change in the Fleet store.
2. Import Mashup source, tests, web editor, uv metadata, and licensing scripts
   under `services/reel-pipeline/editorial/`, excluding all local state and
   generated artifacts.
3. Add the `fleet.podcast-edit.v1` Node validator, JSON fixture, and tests.
4. Add a Python export command that wraps the existing EDL without changing
   planner output.
5. Add a Reel Pipeline command that invokes the nested Python runtime.
6. Add the podcast-edit render adapter and artifact-receipt tests.
7. Run scoped Python, Node, docs, and diff checks; render one short local proof
   when fixture media is available.
8. Update Reel Pipeline status/docs to mark Mashup as an incorporated
   editorial subsystem.
9. Confirm final working-tree parity, preserve the historical snapshot, move
   remaining issues into Fleet, and archive the standalone product without
   deleting operator archives or caches.

Rollback is straightforward during the parity period: keep using the
standalone Mashup checkout. No data migration or production deployment occurs.

## Open Questions

- Whether the loopback Astro editor should ultimately join `/forge` as one
  route or remain a separately started local operator surface.
- Whether cel geometry ships through Three.js SVGRenderer or a Canvas
  implementation on the generation host; WebGL support must be re-proven
  before it becomes a production dependency.
- Whether the canonical podcast contract later moves to Content Factory after
  more than one editorial producer adopts it.
