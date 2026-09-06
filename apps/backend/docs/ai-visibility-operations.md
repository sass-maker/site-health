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
