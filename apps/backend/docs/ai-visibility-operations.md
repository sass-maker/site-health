# Site Health AI Awareness

AI Awareness measures whether configured products are mentioned, recommended,
ranked, and cited in provider answers. Its dedicated configuration is
`config/ai-visibility.json`; it does not depend on a marketing program,
automation registry, or analytics collector.

Direct live provider execution is disabled. The backend accepts either bounded
fixtures for local verification or explicitly supplied provider observations.
Raw answers are analyzed in memory and are not retained.

The current reading from the frozen `baseline-panel-v1` panel lives in
[`docs/ai-visibility-baseline-latest.md`](../../../docs/ai-visibility-baseline-latest.md).

## Fixture canary

```bash
node apps/backend/scripts/ai-visibility-canary.mjs \
  --project pace \
  --fixture apps/backend/test/fixtures/ai-visibility/providers-v1.json
```

Fixture results are labeled `evidenceMode: fixture` and must not be presented as
live visibility.

## Provider observations

```bash
node apps/backend/scripts/ai-visibility-provider-observations.mjs \
  --input /path/to/private-provider-observations.json
```

Use `--require-all` for exact coverage of every project currently configured in
`config/ai-visibility.json`. The command reads no credential, performs no
network request, and retains only normalized aggregates, status, cost, and
provenance summaries. Keep the input outside Git.

## Route A capture kit

`scripts/ai-visibility-capture-kit.mjs` prepares the input the command above
consumes, for the case where a person runs the frozen panel by hand in the
provider web UIs. It reads no credential and makes no network request.

```bash
# every expanded prompt x every frozen engine, as fillable slots
node apps/backend/scripts/ai-visibility-capture-kit.mjs template --out /private/capture.json

# fold filled captures into a provider-observations bundle
node apps/backend/scripts/ai-visibility-capture-kit.mjs build \
  --input /private/capture.json --out /private/bundle.json

# run the ingest validation without writing to the ledger
node apps/backend/scripts/ai-visibility-capture-kit.mjs validate --input /private/bundle.json
```

The frozen engine set lives in `config/ai-visibility.json` under
`baselinePanel.engines`. Engines are frozen for the same reason prompts are: a
month-over-month trend only holds if the prompt set and the engine set both stay
fixed. Adding or dropping either is an amendment.

`--allow-partial` omits still-pending captures from the bundle. A prompt you
never ran is not an observation, so it is not recorded as `unavailable`.

Capture in fresh sessions with no prior context. Provider personalization and
memory otherwise inflate your own visibility, and the panel measures the account
instead of the market. Keep filled captures and bundles outside Git — they
contain raw provider text.

Google Search evidence is collected separately through
`scripts/search-console-collect.mjs`. DRANK and PSI evidence come from their
independent sibling services.

## Brand evidence (absorbed from MentionPilot)

AI Awareness also holds per-project *brand evidence*, absorbed from MentionPilot
(`High-Signal-App/mentionpilot` at `4d7a23e`). Unlike the aggregate panel above,
it deliberately keeps the original prompt, answer, citations, provider, model,
observation time, and explicit failure for each call, plus Hacker News/Reddit
findings and the follow-ups they led to. It lives in a separate private SQLite
store beside the ledger:

```text
~/Library/Application Support/Fleet Ops/founder-control/brand-evidence.sqlite
```

Override it with `SITE_HEALTH_BRAND_EVIDENCE_DB`. It is never committed, never
included in the event-ledger backup, and never projected into a public artifact.

Rules the store enforces:

- A failed or unavailable provider call keeps status `error`/`unavailable` and
  carries no mention verdict (a schema `CHECK`), so it never counts as a missing
  mention or dilutes the mention rate.
- `api-model` checks and `consumer-assistant` captures are separate channels and
  are summarized separately.
- Every read and write is scoped to one catalog project id; an action can cite
  only evidence from its own project.
- Provider settings never hold a credential. A custom endpoint keeps its URL and
  model; its key comes from `BRAND_EVIDENCE_ENDPOINT_KEY_<PROJECT_ID>` at run time.

```bash
node apps/backend/scripts/brand-evidence.mjs profiles
node apps/backend/scripts/brand-evidence.mjs profile <project> --input /private/profile.json
node apps/backend/scripts/brand-evidence.mjs prompt <project> "best uptime tools for indie founders?"
AI_GATEWAY_API_KEY=… node apps/backend/scripts/brand-evidence.mjs check <project>
node apps/backend/scripts/brand-evidence.mjs due [--run]
node apps/backend/scripts/brand-evidence.mjs capture <project> --input /private/captures.json
```

`check` runs each saved prompt once through the free-ai gateway (`model: auto`,
project id `site-health`). `due` applies MentionPilot's schedule semantics
(daily: 23 h since the last check; weekly: UTC Mondays, 6 days); nothing runs
unattended until the owner wires `due --run` to a scheduler. `capture` records
consumer-assistant answers (`site-health.brand-evidence-captures.v1`).

### MentionPilot transfer

The transfer is reversible and reads an owner-made export of `mentionpilot-db`
(`wrangler d1 export mentionpilot-db --remote --output /private/mp.sql`). The
export contains credentials; the tool never reads auth tables and never copies
a key — it records only that one existed. Keep the export outside Git and trash
it after verification.

```bash
node apps/backend/scripts/brand-evidence.mjs transfer plan   --export /private/mp.sql --mapping /private/mapping.json
node apps/backend/scripts/brand-evidence.mjs transfer apply  --export /private/mp.sql --mapping /private/mapping.json
node apps/backend/scripts/brand-evidence.mjs transfer verify --export /private/mp.sql --batch <batch-id>
node apps/backend/scripts/brand-evidence.mjs transfer revert --batch <batch-id>
```

The mapping is `{"schema":"site-health.mentionpilot-mapping.v1","projects":{"<mentionpilot project id or slug>":"<site-health project id>"}}`.
Unmapped projects are reported and skipped; two source projects may not map to
one target. Every imported row carries its batch id and MentionPilot record id;
re-applying is idempotent, and an observation identical to one already stored
is linked rather than duplicated. `verify` checks per-entity counts, project
isolation, and that failures stayed failures. `revert` removes exactly the
batch's rows and refuses if Site Health work has since been attached to them.
