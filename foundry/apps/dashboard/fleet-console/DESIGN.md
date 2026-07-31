# Design

## Direction

The console is a quiet private workspace used under ordinary indoor light. Its
visual system stays dark and restrained because the existing Fleet identity is
already near-black, but hierarchy comes from typography, whitespace, grouping,
and state language rather than decorative cards.

## Tokens

- Canvas: `#090b0c`
- Primary surface: `#101416`
- Raised surface: `#151a1c`
- Hairline: `#2b302d`
- Primary text: `#f3f6f4`
- Secondary text: `#aeb7b1`
- Accent/action: `#79dcc8`
- Success: `#91e49e`
- Warning/stale: `#f2c14e`
- Critical: `#ff8e8e`
- Informational: `#9aa7ff`

All states combine text or icons with color. Focus rings use the accent at a
minimum 2 px visible outline.

## Typography

Use Avenir Next when available, followed by the system UI stack. It brings a
humanist shape to an otherwise restrained operational surface without requiring
a hosted font or extra runtime dependency. Keep a compact product scale: 12 px
metadata, 14 px supporting UI, 16 px body, 20–24 px section headings, and 36 px
page titles on desktop. Use one family throughout. Monospace is reserved for
immutable identifiers and source revisions.

## Layout

- Maximum content width: 1,240 px.
- A persistent, collapsible left sidebar groups Domains, AI Awareness, and
  Performance under a visible Metrics heading; repository taxonomy does not
  appear in primary navigation.
- Projects, Marketing, and Feedback remain standalone tabs below Metrics. Their
  selected project scope follows the operator between views in the URL. The three
  portfolio-wide Metrics views do not expose a project filter.
- Domains answers whether every owned registrable root is becoming stronger.
  AI Awareness is limited to maintained P1 products and provider-backed model
  outcomes. Marketing shows coverage for every maintained product, while
  Performance treats PSI and LCP as a pass/fail guardrail for every maintained
  public product. Projects remains the canonical secondary directory with
  explicit website, changelog, source, and project-detail destinations.
  Skill uses and System Map remain secondary diagnostic surfaces.
  Search Console, crawlability, agent readiness, design review, and full metric
  histories stay inside project detail.
- Use bordered rows and section bands for related records; reserve cards for a
  genuinely independent decision or recommendation.
- Technical evidence appears in expandable detail or on mission detail pages.
- At mobile widths, the sidebar becomes a modal drawer and split layouts become
  one column without shrinking type.

## Components

- `OwnerSection`: heading, count/freshness note, honest empty/error state.
- `DecisionRow`: exact question, project, consequence, freshness, bounded
  responses.
- `MissionRow`: outcome, project, actor, lifecycle state, latest verified event.
- `EvidenceLink`: provider, verification state, observation time, external link.
- `HistoryChart`: one comparable metric in its native unit, with start, current,
  absolute and percentage change, observation count, and date range. The compact
  Domains variant is a no-dot line that exposes exact dated D-Rank observations
  on pointer movement and keyboard focus.
- `StateBadge`: icon/text/color treatment for active, blocked, stale, complete,
  awaiting verification, and unavailable.
- `ActionButton`: solid accent for one primary action; bordered neutral for
  secondary actions; destructive actions are never exposed without a dedicated
  confirmation flow.

## Interaction

Transitions stay within 150–200 ms and only communicate selection, disclosure,
or state changes. Reduced-motion mode removes transforms and nonessential
transitions. Loading uses short skeleton rows; unavailable services produce an
explanatory state with the exact recovery command or boundary.
