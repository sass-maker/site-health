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
  groups events by product in PostHog Insights.

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

Products not listed here should define their core action before instrumenting.

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
   read-only Insights access. It never writes events. The D1 collector uses
   `wrangler d1 execute --remote` with read-only COUNT queries.

4. **Numeric validation.** The visibility-outcome store rejects any
   `user-metrics` observation where a metric value is not a non-negative
   finite number. Free-text user content cannot enter the ledger.

5. **No cross-product user tracking.** Each product's PostHog events are
   grouped by `project_id`. The collector does not join users across
   products. D1 queries are per-product with no cross-database joins.

## Collector scripts

| Script | Source | Provider |
|---|---|---|
| `posthog-outcomes-collect.mjs` | PostHog Insights API | `posthog-insights` |
| `d1-outcomes-collect.mjs` | Cloudflare D1 (wrangler) | `d1-aggregate` |

Both scripts append observations to the private visibility-outcome ledger
(`visibility-outcomes.jsonl`) via the shared `appendVisibilityOutcomeBundle`
function, which validates every observation against the family contract.

## Fleet Console projection

The `/product-analytics` page in the Fleet Console projects `user-metrics`
observations from the ledger via the founder-control service
(`/v1/outcomes/user-metrics`). Products with no evidence show "Not measured"
explicitly — never inferred as zero.
