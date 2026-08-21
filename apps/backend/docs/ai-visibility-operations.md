# Site Health AI Awareness

AI Awareness measures whether configured products are mentioned, recommended,
ranked, and cited in provider answers. Its dedicated configuration is
`config/ai-visibility.json`; it does not depend on a marketing program,
automation registry, or analytics collector.

Direct live provider execution is disabled. The backend accepts either bounded
fixtures for local verification or explicitly supplied provider observations.
Raw answers are analyzed in memory and are not retained.

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

Google Search evidence is collected separately through
`scripts/search-console-collect.mjs`. DRANK and PSI evidence come from their
independent sibling services.
