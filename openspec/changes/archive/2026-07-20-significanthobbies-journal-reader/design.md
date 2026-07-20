## Context

`/daily` currently loads only today's `JournalEntry` and renders the active AM or PM field as a conventional textarea card. The existing table already stores one private AM/PM record per user and calendar date, so the desired journal reader can be built without a schema change. The design must preserve the Daily ritual's no-scoring rule and keep historical writing structurally private.

## Goals / Non-Goals

**Goals:**

- Make the journal the visually dominant, calm reflection surface in the Daily ritual.
- Let users revisit recent days in place and return to today with minimal friction.
- Communicate only whether a day has writing, never a score, streak, completion rate, or entry-length comparison.
- Keep save and AM/PM completion semantics unchanged for today.

**Non-Goals:**

- A full journal archive, search, sharing, export, rich-text editor, or dedicated journal route.
- Editing historical entries.
- Database or authentication changes.
- Reworking habits, commitment streaks, or the rest of the Daily ritual.

## Decisions

### Load a bounded calendar window on the server

The Daily page will query the signed-in user's entries for a recent 21-day calendar window and pass the rows to the client component. This keeps authorization in the existing server-action layer, avoids a client API, and bounds payload size. A full-history query was rejected because this surface only needs a compact recent context and should not make `/daily` progressively heavier.

### Treat today as the only writable date

The selected date is client state. Today renders the existing AM/PM editor and save control; earlier dates render their AM and PM writing as read-only sections. This prevents accidental retroactive edits and avoids expanding the action contract.

### Use presence, not magnitude

The date rail will use one equal-weight mark per calendar day. Filled versus quiet styling means "has writing" versus "no writing"; the selected day also has a text date and distinct marker. Marker height, color intensity, and labels will not encode character count, quality, completion percentage, or consecutive-day behavior.

### Keep navigation local and bounded

Previous/next controls move one day within the loaded window, and individual date marks are buttons. The next control is unavailable on today, and the previous control is unavailable at the start of the window. This is predictable, keyboard-accessible, and needs no additional network round trip.

### Extract date-window logic for focused tests

A small `src/lib/journal.ts` module will build stable ISO-date windows and report whether an AM/PM entry contains meaningful text. Pure tests will cover boundary and presence behavior without requiring an authenticated browser session.

## Risks / Trade-offs

- **Recent history is limited to 21 days** -> Frame the rail as recent context; a full archive remains out of scope.
- **Server and user-local dates can differ near midnight** -> Preserve the existing `today` convention in this change so the redesign does not silently alter date semantics.
- **Empty days can feel evaluative** -> Use neutral copy and no totals, percentages, streaks, or celebratory/punitive states.
- **The journal UI exists separately on `/dashboard`** -> Limit this redesign to the canonical `/daily` ritual; dashboard remains a lightweight today-entry surface.

## Migration Plan

No data migration is needed. The change can be rolled back by reverting the bounded history query, helper, and component rendering; existing journal rows and save behavior remain compatible.

## Open Questions

None for this bounded version.
