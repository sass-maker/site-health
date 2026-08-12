## Context

See `proposal.md` for motivation. The current browser controller renders all run controls at equal prominence and calls the existing local agent with a free-form `{ url, runs, presets, parallel, tag }` body. The server already supports every configuration needed for both a quick smoke test and the default PSI swarm, so this change does not need a new endpoint, persistence shape, dependency, or hosted execution path.

The UI must preserve psi-swarm's deep-navy, cyan-accented performance-console identity and its distributional positioning. A two-run result is useful for activation and diagnosis, but it is not statistically stable enough to claim a reliable p75 or p99 distribution.

## Goals / Non-Goals

**Goals:**

- Make URL-to-first-result a single obvious decision.
- Keep the distinction between directional evidence and a trustworthy swarm explicit throughout the run and result states.
- Preserve expert configurability without requiring it for first use.
- Put a concise standards-based outcome before the detailed evidence.

**Non-Goals:**

- Hosted or multi-region execution, public result storage, scheduling, or alerting.
- A custom 0-100 score, total-load-time score, or Larm-compatible measurement.
- Changes to CLI defaults, the local-agent API, SQLite schema, Lighthouse configuration, or the static deployment model.
- A per-resource network waterfall.

## Decisions

### Represent run intent as an explicit plan

The dashboard will define three run plans: `quick`, `full`, and `custom`. The run-start function will accept a complete plan instead of mutating React state and then reading potentially stale values. Quick maps to two serial desktop audits; full maps to five serial PSI-group audits; custom maps to the advanced form state.

Alternative considered: add a `mode` field to the local-agent API. Rejected because the API already expresses the required behavior, and UI intent is not server-domain state.

### Make quick and full peer actions, with clear hierarchy

The URL field will be followed by a primary Quick check action and a secondary Full swarm action. Each action includes its audit count and honest time/quality framing. Existing controls move into a native `details` disclosure with a separate custom-run action.

Alternative considered: silently change the existing defaults to two desktop runs. Rejected because users would lose visibility into the evidence level and returning users could mistake the quicker result for the established swarm.

### Match visible precision to the evidence level

Quick checks will show median LCP, CLS, TBT, and TTFB in the overview and omit the distribution table so two samples are not dressed up as stable p75, p90, or p99 evidence. Full and custom swarms will derive the slowest preset from p75 LCP, show p75 metrics using the controller's existing thresholds, and retain the detailed percentile tables immediately below. Every overview will expose sample size and failed-run count.

Alternative considered: create a custom composite performance score similar to Larm. Rejected because combining DCL or load-event timing with CWV produces a product-specific number that is easy to over-trust and cannot be compared with PSI or CrUX.

### Graduate quick users in context

After a quick result, a concise confirmation action will start the full swarm for the same URL. It will use the same run-start path, resetting prior progress and results normally.

Alternative considered: automatically start the full swarm after quick completion. Rejected because it would spend several minutes of local compute without an explicit user action.

### Keep initiation and interruption recoverable

The URL and run actions will be a semantic form, so submitting from the URL field starts the default Quick check. If local-agent completion polling fails, the controller will remove its run subscription, return to the form, and show a plain-language alert with a retry path instead of leaving a stale running view.

## Risks / Trade-offs

- **Two samples can produce unstable percentile labels** → Call the result directional, display `n`, and make the full swarm the confirmation action.
- **Two primary actions can still create choice friction** → Make Quick check visually primary and describe Full swarm as the confidence path rather than an equivalent unexplained mode.
- **Advanced settings can become less discoverable** → Use a visible native disclosure with a short summary, not a hidden settings icon or modal.
- **Responsive result tables can overflow narrow screens** → Preserve the data table but contain horizontal scrolling locally and validate at 390, 768, and 1440 pixels.

## Migration Plan

The change is additive and local to the static browser controller. Build and inspect the web app, then ship through the existing manual deployment path when approved. Rollback is a source revert of the dashboard and documentation changes; no data rollback is needed.
