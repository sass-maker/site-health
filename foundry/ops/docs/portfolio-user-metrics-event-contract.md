# Portfolio user-metrics event contract

> Shared 5-event taxonomy for product analytics across every maintained Fleet
> product. Implemented by PostHog instrumentation and D1 aggregate queries,
> collected into the visibility-outcome store under the `user-metrics` family.

## Event taxonomy

Every product that emits product analytics uses exactly these five events.
No product should emit a sixth event or rename these.

| Event | Trigger | PostHog property | D1 equivalent |
|---|---|---|---|
| `page_view` | Any page load (SPA route change or full navigation) | `project_id` | N/A (PostHog-only) |
| `signup` | Account created (server-confirmed, not form submit) | `project_id` | `user.createdAt` within period |
| `activated` | First core action within 24h of signup | `project_id` | N/A (PostHog-only) |
| `core_action` | Primary product action (per-product definition below) | `project_id`, `action` | N/A (PostHog-only) |
| `returned` | User with prior signup triggers any event ≥ 1 day later | `project_id` | N/A (PostHog-only) |

### Required property

- `project_id` (string): The canonical Fleet project ID (e.g. `rolepatch`,
  `karte`, `drank`). This is the only required property on every event. It
  groups events by product in the shared PostHog project.

Live RolePatch and Karte events still use historical values (`resume-tailor`,
`linkchat`). The Query API collector reads those aliases until the products
emit the catalog ids.

### Current instrumentation (2026-08-17)

Hosted web surfaces emit `page_view` with a catalog `project_id`. RolePatch and
Karte still also emit historical ids (`resume-tailor`, `linkchat`); the Query
API collector reads those aliases. Kith and Mashup have no hosted web surface.

### Optional property

- `action` (string): Sub-classification for `core_action` events (e.g.
  `journal-saved`, `link-sent`, `roast-generated`). Each product defines its
  own action labels.

## Per-product core action definitions

| Product | Core action | `action` values |
|---|---|---|
| RolePatch | Resume tailored | `resume-tailored` |
| Karte | Link sent | `link-sent` |
| Drank | Audit run | `audit-run` |
| Calorie | Journal entry saved | `journal-saved` |
| Setline | Workout completed | `workout-completed` |
| SignificantHobbies | Hobby tracked | `hobby-tracked` |
| Reader | Article saved | `article-saved` |
| Starboard | Star added | `star-added` |
| Anime List | Anime rated | `anime-rated` |
| SWE Interview Prep | Practice session completed | `practice-completed` |
| LoopTV | Video watched | `video-watched` |
| High Signal | Brief read | `brief-read` |
| India Standards | Calculation run | `calculation-run` |
| CodeVetter | Review completed | `review-completed` |
| App Health | Health check run | `check-run` |
| Motion | Game played | `game-played` |
| Free AI | Generation requested | `generation-requested` |
| What It Takes to Win | Article read | `article-read` |
| Induldge | Indulgence logged | `indulgence-logged` |
| Field Track | Field session logged | `session-logged` |
| Pace | Lesson completed | `lesson-completed` |
| Knowledge Base | Query answered | `query-answered` |
| ChatGPT Memory Insights | Memory graph viewed | `graph-viewed` |
| PostTrainLLM | Training run completed | `run-completed` |

Products not listed here should define their core action before instrumenting.
Products without web frontends (e.g. reddit-insights) are exempt from
PostHog instrumentation.

## Metric labels

The `user-metrics` outcome family maps events to these metric labels:

| Metric label | Source | Unit | Direction |
|---|---|---|---|
| Visitors | PostHog `page_view` unique users | visitors | higher-is-better |
| Identified users | PostHog all events unique users | users | higher-is-better |
| Accounts | PostHog `signup` count / D1 total `user` rows | accounts | higher-is-better |
| New accounts | D1 `user.createdAt` within period | accounts | higher-is-better |
| Activation rate | PostHog `activated` / `signup` × 100 | percent (0-100) | higher-is-better |
| D1 retention | PostHog `returned` / `signup` × 100 (1-day) | percent (0-100) | higher-is-better |
| D7 retention | PostHog `returned` / `signup` × 100 (7-day) | percent (0-100) | higher-is-better |
| Core actions | PostHog `core_action` total count | actions | higher-is-better |

## Privacy model

1. **No PII in the ledger.** The PostHog collector reads aggregate counts
   (`unique_user_count`, `total_event_count`) only. Distinct IDs, person
   UUIDs, emails, and raw event payloads are never stored. D1 queries use
   `COUNT(*)` only — no `SELECT *`, no row-level data.

2. **Credential-free bundles.** Observations written to the visibility-outcome
   ledger contain only: project ID, family, provider, scope (domain),
   observed-at timestamp, period, and metric labels with numeric values. No
   API keys, cookies, or auth tokens appear in stored observations.

3. **Read-only access.** The PostHog collector uses a personal API key with
   read-only Query API access. It never writes events. The D1 collector uses
   `wrangler d1 execute --remote` with read-only COUNT queries.

4. **Numeric validation.** The visibility-outcome store rejects any
   `user-metrics` observation where a metric value is not a non-negative
   finite number. Free-text user content cannot enter the ledger.

5. **No cross-product user tracking.** Each product's PostHog events are
   grouped by `project_id`. The collector does not join users across
   products. D1 queries are per-product with no cross-database joins.

## Traffic filtering

The PostHog collector applies property filters to exclude non-production
traffic so development, CI, and synthetic monitoring events cannot
contaminate the aggregate user-metrics ledger:

| Filter | Property | Operator | Excluded values |
|---|---|---|---|
| Non-production environment | `$environment` | `is_not` | `production` |
| Test/CI library markers | `$lib` | `is_not` | `test`, `ci` |
| Synthetic monitoring | `synthetic_monitor` | `is_not` | `true` |

Products should set `$environment` to `production` or `development` via
the PostHog init config. Synthetic monitors should set
`synthetic_monitor: true` on their events.

## Cost guardrail

The PostHog collector includes a configurable event-volume guardrail
(`maxEventsPerProject`, default 100,000). When a project's total event
count across all metrics exceeds the threshold, the collector emits a
`costWarning` in the result but still returns the observation. This
provides early warning before PostHog billing limits are exceeded.

## Cross-source disagreement

When both PostHog and D1 provide data for the same metric (e.g.
`Accounts`), the Fleet Console surfaces the disagreement rather than
silently choosing one value. The `buildUserMetricsRows` function
compares the latest PostHog and D1 observations and flags discrepancies
where values differ by more than 10%. The Console renders a warning
indicator with both values and the variance percentage.

## Collector scripts

| Script | Source | Provider |
|---|---|---|
| `posthog-outcomes-collect.mjs` | PostHog Query API | `posthog-insights` |
| `d1-outcomes-collect.mjs` | Cloudflare D1 (wrangler) | `d1-aggregate` |

Both scripts append observations to the private visibility-outcome ledger
(`visibility-outcomes.jsonl`) via the shared `appendVisibilityOutcomeBundle`
function, which validates every observation against the family contract.

## Fleet Console projection

The `/product-analytics` page in the Fleet Console projects `user-metrics`
observations from the ledger via the founder-control service
(`/v1/outcomes/user-metrics`). Products with no evidence show "Not measured"
explicitly — never inferred as zero.
