## Context

See `proposal.md` for motivation. Founder Control already joins canonical maintained public projects with normalized marketing receipts, but its Marketing projection reduces receipts to newest/count while also carrying traffic and recommendation data. Fleet Console then renders that payload as a seven-column sortable table. The existing prompt-first video maker and gallery are separate components and remain unchanged.

## Goals / Non-Goals

**Goals:**

- Make the primary ledger read as project → posts at desktop and mobile widths.
- Keep post data sanitized and bounded at the Founder Control projection boundary.
- Preserve project filtering and the existing Fleet Console visual system.
- Reduce DOM size and client work compared with the analytics table.

**Non-Goals:**

- Changing video creation, scheduling, posting, analytics collection, or provider integrations.
- Creating a second Marketing product or a new data store.
- Exposing unpublished body copy or raw provider payloads.

## Decisions

### Return a bounded `posts` array per project

Founder Control will map at most 20 newest normalized outcomes into an allowlisted shape: stable ID, title, platform/provider, state, observed time, and public URL when present. The full internal receipt object will not cross the outcome endpoint. This is preferred over returning the existing raw outcome list because the API remains an explicit privacy boundary.

### Render a semantic disclosure list instead of a table

Each project will be a native `details` disclosure with the project identity and post count in its summary. The expanded region will contain simple post rows. This is preferred over a two-column table because post counts vary, the relationship is hierarchical, and native disclosure behavior works across narrow widths without horizontal scrolling.

### Default projects with posts open

Projects containing receipts will start expanded so the page immediately shows its useful content. Empty projects remain collapsed but retain a visible `No posts yet` summary. Project filtering continues to use the shared filter and will redraw the list.

### Remove Cloudflare refresh from this page

The header refresh control exists only for traffic evidence, which the new Marketing view no longer consumes. Removing it avoids implying that Cloudflare produces post receipts; other metrics pages retain their provider-specific refresh controls.

## Risks / Trade-offs

- **Large historical receipt sets could recreate page bloat** → cap each project at 20 newest posts and expose the retained count honestly.
- **Some normalized receipts may lack titles or platforms** → fall back to a stable `Post` label and provider name without inventing content.
- **Existing consumers may expect traffic fields in the Marketing endpoint** → retain the endpoint and core row identity while changing only the page-focused projection under a tested contract; no known external consumer uses it.

## Migration Plan

Ship the projection and Fleet Console renderer together. Rollback is a source revert; no stored data or migration changes are involved.
