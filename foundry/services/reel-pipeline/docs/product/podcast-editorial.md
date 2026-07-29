# Podcast Editorial Pipeline

Reel Pipeline incorporates the former Mashup product as its structure-aware
editorial subsystem. The planner remains a Python package because its
SQLite-backed stages, model caches, scoring behavior, and FFmpeg multi-clip
renderer are already proven. Product ownership and artifact review now live in
one service.

## Boundary

```text
owned / licensed / public-domain source archive
  → editorial ingestion, transcription, segmentation, enrichment, embedding
  → structure-aware sequence and surfaced score terms
  → fleet.podcast-edit.v1
  → Reel Pipeline podcast-edit adapter
  → MP4 + captions + source headings + watermark + receipt
```

`fleet.podcast-edit.v1` is deliberately not free-form VideoBrief prose. It
retains every clip's source identity and original time range, transcript text,
member segment IDs, visual provenance, all eight score terms, weights,
calibration, rationale, and approval.

## Commands

```bash
# Run the nested compatibility CLI.
npm run editorial -- --help

# Verify the editorial runtime.
npm run editorial:test
npm run editorial:check

# Wrap an existing EDL in the canonical approved contract.
npm run editorial -- export-podcast-edit path/to/edit.json \
  --output path/to/podcast-edit.json \
  --provenance path/to/PROVENANCE.json \
  --approval approved \
  --approved-by operator \
  --watermark-text ZEROPOD

# Render the approved contract through Reel Pipeline.
npm run render:podcast-edit -- --file path/to/podcast-edit.json
```

The adapter verifies local source existence and optional SHA-256 evidence,
materializes the embedded EDL in a collision-free ignored run directory,
invokes the nested multi-clip renderer, and writes a versioned receipt with
input, source, video, and caption hashes.

## Duration modes

`reel-editorial short` is deliberately limited to one source-faithful
30–60 second window. That is a convenience mode, not a pipeline ceiling.
The standard `reel-editorial mashup` planner keeps its configurable duration
target (seven minutes by default in the experiment commands), and approved
multi-clip edits longer than 60 seconds use the same podcast-edit contract and
render adapter.

## Duplicate-content policy

- The planner cannot select two editorial bits that share an underlying member
  segment.
- MMR diversifies retrieval, while the independently surfaced
  `non_repetition` term measures semantic redundancy.
- Export and Node normalization fail before rendering if a hand-edited
  timeline repeats a member segment ID or overlaps planned or rendered audio
  ranges from the same source.
- Boundary snapping may add silence handles, but those handles are trimmed at
  their safe midpoint when they would replay adjacent source audio.
- Revisiting a theme with different source material remains valid; this keeps
  callbacks and longer arguments possible without replaying footage or speech.

## Safety and migration

- Only creator-owned, appropriately licensed, or public-domain filmed and
  photographic media is accepted.
- Procedural non-photoreal visuals are allowed; synthetic speech, voice
  cloning, and deceptive photoreal footage are not.
- Archives, `.mashup/`, `.reel-pipeline/`, models, and render artifacts remain
  ignored local state.
- The former standalone checkout remains available only as a parity fallback.
  It must not be retired until the consolidated tests and a real source-backed
  short render pass.
