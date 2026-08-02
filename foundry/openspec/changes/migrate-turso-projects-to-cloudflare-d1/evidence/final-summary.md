# Fleet Turso to D1 migration summary

All six scoped products now identify Cloudflare D1 as authoritative. Turso resources and any remaining Turso secrets were preserved; no retirement or deletion was performed.

| Project | D1 authority | Retained source | Result | Performance evidence |
|---|---|---|---|---|
| Karte | `linkchat-auth` | Historical `linkchat` state remains unverified; it is not current dependency truth | Reconciled | No retained Turso timing baseline; no before/after percentage claimed |
| Significant Hobbies | `significanthobbies` | Turso `significanthobbies`, rollback-held | Cut over | No retained Turso timing baseline; no before/after percentage claimed |
| Reader | `reader` | Turso `reader`, rollback-held | Cut over | No retained Turso timing baseline; no before/after percentage claimed |
| SWE Interview Prep | `swe-interview-prep` | Turso `swe-interview-prep`, rollback-held | Cut over | No retained Turso timing baseline; no before/after percentage claimed |
| Anime List | `anime-list` | Turso `mal-watchlist`, rollback-held | Cut over | API medians improved 58.4% and 69.6%; page TTFB improved 8.5%, while lab LCP regressed 7.9% |
| Starboard | `starboard` plus Vectorize `starboard-repos` | Turso `starboard`, rollback-held | Cut over | Discover p50 improved 25.0%, health p50 improved 16.9%, weighted page LCP unchanged |

## Residual risk and rollback

- Every cutover receipt preserves the last source-backed release or records the prior D1 reconciliation state.
- No receipt claims Turso retirement approval. Removing a Turso secret or database remains a separate, explicit operation.
- Karte's canonical domain was unresolved during the prior URL audit, so its live domain remains unverified even though repository and provider evidence establish D1 authority.
- Starboard's rapid synthetic discovery burst reached a platform HTTP 429; paced acceptance probes all passed. The production query plans use existing covering indexes, and no speculative write-cost indexes were added.
- Anime List's API/database latency improved materially, but its page-render LCP remains a separate frontend optimization opportunity.
- The scoped six-project Actions and deploy parity checks passed. The broader Fleet deploy sweep also ran and reported 14 unrelated stale deployments plus three unrelated current-main Action warnings outside this migration scope.

Per-project machine-readable evidence is in `evidence/receipts/`.
