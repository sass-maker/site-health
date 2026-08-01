## Why

Fleet already retains tracked web-search observations and both lab and real-user performance evidence, but the portfolio pages do not connect those signals into a concise diagnosis. The owner should get that context from the existing expanded rows without another page, column, or score.

## What Changes

- Add the configured target-query observations to each Google Search project expansion, separate from Search Console's observed query rows.
- Add one deterministic lab-versus-field interpretation to each Performance project expansion.
- Reuse the current row disclosures and evidence payloads; add no navigation, portfolio columns, collectors, dependencies, or combined scores.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `geo-observatory`: Expose each project's latest configured target-query class and observation date in the Google Search project expansion.
- `cloudflare-outcome-evidence`: Interpret compatible lab and field LCP evidence inside the existing Performance project expansion while preserving their distinct scopes.

## Impact

- Founder Control's bounded Search outcome projection gains configured target-query observations already present in the connection model.
- Fleet Console's Google Search and Performance expansion renderers gain compact supporting evidence.
- Existing provider collection, storage, navigation, and top-level tables remain unchanged.
