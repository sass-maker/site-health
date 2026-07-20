## Why

The Daily journal currently behaves like a plain form, so it captures a thought but does not make the private record feel tangible or worth returning to. A focused reader with quiet date navigation gives the journal continuity while preserving the product's explicit refusal to score or shame daily practice.

## What Changes

- Present the current journal entry as the primary, spacious surface within `/daily`.
- Let a signed-in user move between journal dates without leaving the Daily ritual.
- Show a compact recent-day timeline where entry presence is visible but never counted, ranked, streaked, or framed as progress.
- Keep today editable and render earlier entries as private, read-only reflections.
- Preserve the existing AM/PM model, save behavior, check-in behavior, and database schema.

## Capabilities

### New Capabilities

- `private-journal-reader`: A private, date-navigable journal reader and today-writing surface within the Daily ritual.

### Modified Capabilities

None.

## Impact

- `src/app/daily/page.tsx` loads a bounded window of the signed-in user's journal history.
- `src/lib/actions/daily.ts` gains a user-scoped, read-only journal-history query.
- `src/components/daily-ritual.tsx` adopts the focused reader, date controls, and non-scoring presence timeline.
- Focused component or utility tests cover date-window and selection behavior.
- No new dependency, route, schema migration, public API, deployment, or production configuration change.
