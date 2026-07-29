# Reel Pipeline editorial agent instructions

Also follow the Reel Pipeline instructions at `../AGENTS.md` and the shared
Fleet instructions at `../../../../../AGENTS.md`.

## Runtime

- Python 3.11+ managed with uv.
- Astro + React editor under `web/`, managed with pnpm.
- FFmpeg and SQLite remain local runtime dependencies.

## Verify

```bash
uv sync
uv run pytest -q
uv run ruff check .
uv run ruff format --check .
cd web && pnpm install && pnpm check && pnpm build
```

## Boundaries

- This directory is the canonical home of the former standalone Mashup
  product. Keep `mashup` as the Python package and compatibility CLI while the
  migration is active.
- Only creator-owned, appropriately licensed, or public-domain filmed and
  photographic media may enter an edit. Preserve provenance.
- Procedural non-photoreal motion, typography, diagrams, shaders, and ASCII are
  allowed. Synthetic speech, voice cloning, and deceptive photoreal footage
  are not.
- Keep transcription, enrichment, embedding, boundary review, and render
  intermediates resumable.
- Keep all eight score terms separate and surfaced in every exported edit.
- Do not copy or commit `archive/`, `.mashup/`, `output/`, model payloads,
  credentials, or generated artifacts.
- The standalone checkout remains a parity fallback until Reel Pipeline status
  explicitly records retirement.
