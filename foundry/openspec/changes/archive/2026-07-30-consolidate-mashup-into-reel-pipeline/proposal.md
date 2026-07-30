## Why

Mashup and Reel Pipeline currently duplicate the same media-product boundary:
timeline contracts, captions, provenance, visual composition, FFmpeg output,
and reviewable artifacts. Keeping the editorial planner in a separate product
forces adapters and duplicated render behavior around the one capability that
is actually distinct: structure-aware source selection and sequencing.

The consolidation should happen now because the podcast pilot has proven both
the editorial planner and the need for a richer visual system, while Reel
Pipeline already owns Fleet media generation, deterministic composition,
artifact provenance, review evidence, and Postiz draft handoff.

## What Changes

- Make `foundry/marketing/reel-pipeline` the canonical home of the Mashup
  editorial planner, Python runtime, local state contract, tests, and operator
  editor.
- Introduce one versioned podcast-edit interchange contract that preserves
  source clips, original source ranges, transcript text, captions, score terms,
  visual cues, asset provenance, and approval state.
- Add a Reel Pipeline editorial command that runs the preserved Python planner
  without rewriting it into Node or Rust.
- Add a Reel Pipeline podcast-edit adapter that invokes the preserved
  multi-clip Python renderer and emits Reel Pipeline artifact provenance.
- Reject exact content reuse at the contract boundary: member segment IDs and
  source-audio intervals may not appear twice in one edit.
- Preserve both duration classes: the dedicated short command remains bounded
  to 30–60 seconds, while the standard planner and podcast-edit renderer
  continue to support multi-clip long-form targets.
- Keep every scoring term independently surfaced and keep expensive editorial
  stages resumable after the move.
- Preserve the standalone Mashup repository as a historical snapshot after
  parity, move its remaining work into Fleet, and make Reel Pipeline the sole
  maintained source.
- **BREAKING:** the standalone Mashup product boundary is retired; compatibility
  remains available through the preserved `mashup` package and CLI nested
  inside Reel Pipeline.

## Capabilities

### New Capabilities

- `podcast-editorial-pipeline`: A canonical, resumable source-media editorial
  planner and versioned podcast-edit contract inside Reel Pipeline, including
  conversion into deterministic Reel Pipeline render artifacts.

### Modified Capabilities

- `reel-content-handoff`: Reel Pipeline intake also accepts approved,
  source-backed podcast edits without replacing their transcript, source
  timing, score terms, or visual provenance.

## Impact

- Canonical product: `foundry/marketing/reel-pipeline`.
- Imported runtime: the existing Python 3.11+ Mashup package and uv-managed
  dependencies, nested under Reel Pipeline rather than rewritten.
- Existing runtimes retained: Node, Chromium/Canvas, FFmpeg, and Rust watcher.
- New contract and adapter code live in Reel Pipeline; Content Factory and
  Postiz boundaries remain unchanged.
- No deployment, publishing, credential, database migration, or local archive
  removal occurs.
- The standalone Mashup workdir, archive, and local SQLite state remain local
  and are not copied into Foundry. Its public repository remains read-only for
  history and attribution with a direct canonical-source link.
