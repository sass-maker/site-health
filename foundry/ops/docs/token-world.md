# Tokens Spent for the World

`sassmaker.com` publishes one static, privacy-safe cumulative token snapshot.
It does not fetch live telemetry and never estimates missing usage.

## Accounting

The launch baseline comes from CodeVetter's local `cc_sessions` table:

```text
SUM(total_input_tokens + total_output_tokens)
```

`total_input_tokens` already includes cache-read and cache-creation tokens.
Never add either cache column again. The latest-day total follows CodeVetter's
existing `cc_session_days` proportional attribution. CodeVetter stores no
geography, so its baseline supplies no country or locality pulse.

## Daily seed

Keep the private seed outside git under `.fleet-local/token-world/`. Export the
current CodeVetter aggregate read-only:

```bash
node foundry/ops/scripts/export-codevetter-token-seed.mjs \
  --database "$HOME/Library/Application Support/com.codevetter.desktop/codevetter.db" \
  --output .fleet-local/token-world/seed.json
```

Before adding another product or any geography, confirm:

- every token value is provider-reported or comes from an authoritative product
  store;
- project totals sum exactly to the lifetime total;
- the daily value belongs to the snapshot date;
- `lastUpdatedAt` is the authoritative source refresh time with an explicit timezone;
- no prompt, completion, identity, IP address, or precise coordinate appears;
- every locality bucket represents at least the configured number of events;
- sparse locations are omitted or promoted to a broader country aggregate.

Generate the tracked public projection:

```bash
node foundry/ops/scripts/generate-token-world.mjs \
  --seed .fleet-local/token-world/seed.json
```

The expected diff is limited to
`saas-maker/apps/showcase/src/data/tokenWorld.json`. Review that
file, then run:

```bash
node --test foundry/ops/test/token-world.test.mjs
pnpm run check:public
```

Normal generation rejects decreasing totals and conflicting same-day seeds. A
real source correction requires `--correction-note "<reason>"`; preserve that
reason in the change or issue that publishes the corrected snapshot.
