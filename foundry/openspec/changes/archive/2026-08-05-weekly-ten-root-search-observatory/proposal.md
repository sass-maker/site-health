## Why

Fleet has a validated ten-root query contract and one complete 40-query baseline, but the enabled weekly GEO Observatory prompt still asks the agent to measure the legacy 27-project query inventory. The scheduled job therefore does not guarantee a comparable ten-root follow-up, and the recorder currently accepts an incomplete root batch.

## What Changes

- Make the existing `weekly-geo-observatory` job use the canonical active queries in `root-search-queries.json` as its complete scheduled scope: exactly ten roots with brand, exact-domain, category, and problem intent.
- Add an explicit root-contract recording mode that rejects missing, duplicate, extra, historical, text-rewritten, or mixed-date observations before the ledger changes.
- Keep the existing broad GEO configuration and every historical ledger/query identifier intact for manual portfolio evidence and historical reporting.
- Align the GEO Observatory skill, scheduled prompt, job policy, tests, and operator documentation with the focused weekly contract.

## Capabilities

### Modified Capabilities

- `geo-observatory`: The enabled weekly job records one complete, comparable ten-root batch or records nothing.
- `root-search-query-contract`: Active weekly execution is bound to the exact validated ten-root/four-intent contract.

## Impact

- Fleet Ops recorder validation, GEO Observatory skill instructions, and Codex cron prompt/policy.
- Focused Node tests and durable Fleet status documentation.
- Existing ledger contents and legacy query configuration are preserved.
- No dependency, deployment, provider, or local crontab change.
