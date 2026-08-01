## Why

Marketing Studio exposes too many unrelated paths at once, so the operator has to understand workflows, engines, tools, and production internals before making anything. Mashup is an experimental editorial capability for CLI use, not a Fleet product or a browser workflow.

## What Changes

- Add a focused **Video Maker** creation surface inside Fleet Console's existing `/marketing` page.
- Reduce Video Maker's primary flow to a prompt, one action, and optional recipe-based settings.
- Let the operator choose the actual visual production format—such as image slideshow, web motion, ASCII, Blender, or Three.js—while showing runtime, spend class, and current readiness from the existing arsenal contract.
- Make Auto choose only a currently runnable local recipe and reveal the chosen recipe before reporting progress.
- Remove Mashup/podcast editing and internal Tools from every browser-facing navigation and choice set.
- Preserve Mashup under the existing incorporated `editorial/` CLI, including its transcription, enrichment, embedding, sequencing, rendering, and provenance capabilities.
- Keep Fleet Console as the visible shell and Reel Pipeline as the local Video Maker execution service; the standalone Studio route remains a diagnostic surface.
- Add no production dependency and make no publishing, credential, cloud, or deployment change.

## Capabilities

### Modified Capabilities

- `studio-web-ui`: Simplify the general video creation surface and keep Mashup and internal tools out of browser workflows.

## Impact

- Adds one focused Fleet Console marketing creation component.
- Leaves the existing `editorial/` Python package and its pinned `uv` environment available through its CLI; no duplicate web adapter is introduced.
- Simplifies `src/studio/ui.js` without removing existing Studio APIs or tool implementations, while making `/marketing` the primary operator entry point.
- Adds focused server tests, responsive browser evidence, and updated operator documentation.
