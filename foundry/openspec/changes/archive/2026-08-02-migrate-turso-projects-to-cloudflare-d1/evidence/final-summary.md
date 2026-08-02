# Fleet Turso to D1 migration summary

All eight scoped products now identify Cloudflare D1 as authoritative. After explicit approval and post-cutover acceptance, all eight Turso databases were deleted on 2026-08-02 and the Turso database inventory was verified empty. Credential cleanup remains a separate operation.

| Project | D1 authority | Retired source | Result | Performance evidence |
|---|---|---|---|---|
| Karte | `linkchat-auth` | `linkchat` deleted | Reconciled | No retained Turso timing baseline; no before/after percentage claimed |
| Significant Hobbies | `significanthobbies` | `significanthobbies` deleted | Cut over | No retained Turso timing baseline; no before/after percentage claimed |
| Reader | `reader` | `reader` deleted | Cut over | No retained Turso timing baseline; no before/after percentage claimed |
| SWE Interview Prep | `swe-interview-prep` | `swe-interview-prep` deleted | Cut over | No retained Turso timing baseline; no before/after percentage claimed |
| Anime List | `anime-list` | `mal-watchlist` deleted | Cut over | API medians improved 58.4% and 69.6%; page TTFB improved 8.5%, while lab LCP regressed 7.9% |
| Starboard | `starboard` plus Vectorize `starboard-repos` | `starboard` deleted | Cut over | Discover p50 improved 25.0%, health p50 improved 16.9%, weighted page LCP unchanged |
| Open Historia | `open-historia` | `open-historia` deleted | Cut over | No retained Turso timing baseline; no before/after percentage claimed |
| TrueHire | `truehire` | `truehire` deleted | Cut over | No retained Turso timing baseline; no before/after percentage claimed |

## Residual risk

- Turso is no longer a rollback option. Recovery now depends on the authoritative D1 data and normal source-controlled releases.
- Turso credential cleanup remains separate; the database resources themselves are gone.
- Starboard's rapid synthetic discovery burst reached a platform HTTP 429; paced acceptance probes all passed. The production query plans use existing covering indexes, and no speculative write-cost indexes were added.
- Anime List's API/database latency improved materially, but its page-render LCP remains a separate frontend optimization opportunity.
- The original six projects' current-main Actions passed. Open Historia and TrueHire CI passed, and their production workflows now validate credentials and smoke-test their live custom domains. Those two manual deploy workflows still require repository-scoped Cloudflare secrets before GitHub can execute a production deployment; the accepted production releases were deployed locally with exact Git SHA tags.

Per-project machine-readable evidence is in `evidence/receipts/`.
