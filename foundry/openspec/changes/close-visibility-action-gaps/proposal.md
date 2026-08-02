## Why

Fleet Console currently mixes measurements with a visible action ledger. The
operator already has update controls and does not need completed discovery
changes repeated as row-level chores. Each update should make safe automatic
discovery changes, wait where external systems control propagation, and retain
the resulting measurement.

## What Changes

- Make the existing Search update run changed-URL IndexNow notification,
  bounded Google sitemap submission, canonical-homepage URL Inspection, and
  Search Console measurement in that order.
- Use the existing complete provider-labelled Codex and Claude observations for
  maintained P1 products instead of showing a placeholder collection task.
- Keep Domains, AI Awareness, and Google Search as measurement surfaces: values,
  history where useful, provider detail, and observation dates, without a
  visible change/action column.
- Keep automatic submission results in the bounded run receipt rather than a
  separate change ledger.
- Preserve provider truth: no forced-indexing claim, synthetic AI response, or
  invented backlink evidence.

## Capabilities

### New Capabilities

- `visibility-action-loop`: Defines an automatic change, external wait, and
  measurement cycle without turning owner views into task trackers.

### Modified Capabilities

- `search-action-ledger`: Replaces row-level advice with automatic discovery
  submission and live URL Inspection evidence.
- `portfolio-strength-console`: Keeps domain strength and provider-backed
  core-product AI awareness measurement-first.

## Impact

This affects the Search Console collector and normalized outcome contract,
Founder Control outcome projection, metric-run orchestration, the Domains, AI
Awareness, and Google Search owner views, focused tests, and machine-local
evidence. It uses existing Google ADC and existing provider observations, adds
no production dependency, does not enable a recurring schedule, and does not
deploy or mutate product source automatically.
