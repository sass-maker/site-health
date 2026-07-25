## Consolidated evidence / PR table

Implementation handoff for the `automate-portfolio-identity-toolbox` OpenSpec
change. All tasks closed; see `tasks.md` for the checked-off checklist and
`baseline.md` for the per-repo baseline.

### PRs

| Repo | Branch | PR | Scope |
| --- | --- | --- | --- |
| `sarthakagrawal927/portfolio` | `chore/portfolio-identity-contract-test` | [#10](https://github.com/sarthakagrawal927/portfolio/pull/10) | Portfolio-content contract test (4-product + SaaS Maker directory link) |
| `sarthakagrawal927/rolepatch` | `test/activation-privacy-contract` | [#20](https://github.com/sarthakagrawal927/rolepatch/pull/20) | RolePatch activation privacy contract test |
| `sarthakagrawal927/karte` | `test/activation-privacy-contract` | [#23](https://github.com/sarthakagrawal927/karte/pull/23) | Karte activation privacy contract test |
| `sass-maker/fleet-workspace` | `feat/portfolio-identity-toolbox-automation` | [#5](https://github.com/sass-maker/fleet-workspace/pull/5) | Foundry umbrella evidence schema + bounded quiet experiment definitions + validators + tests |

### Verification evidence

| Repo / surface | Check | Result |
| --- | --- | --- |
| Portfolio | `npm run check` (astro check) | 0 errors / 0 warnings / 0 hints (38 files) |
| Portfolio | `npm run test:contract` (`node --test`) | 4/4 pass |
| Portfolio | `node fleet-ops/scripts/sync-spotlight-products.mjs --check` | OK (5 products) |
| RolePatch | `pnpm biome check __tests__/activation-privacy-contract.test.ts` | clean |
| RolePatch | `pnpm vitest run __tests__/activation-privacy-contract.test.ts` | 6/6 pass |
| Karte | `pnpm biome check tests/activation-privacy-contract.unit.test.mjs` | clean |
| Karte | `pnpm vitest run tests/activation-privacy-contract.unit.test.mjs` | 6/6 pass |
| fleet-ops | `node --test test/portfolio-identity-evidence.test.mjs` | 7/7 pass |
| fleet-ops | `node --test test/portfolio-identity-quiet-experiments.test.mjs` | 9/9 pass |
| fleet-ops | `node scripts/validate-portfolio-identity-evidence.mjs` | OK (3 surfaces, 27 forbidden payload fields) |
| fleet-ops | `node scripts/validate-portfolio-identity-quiet-experiments.mjs` | OK (3 experiments, 0 launch-approved) |

### Live indexing checks (2026-07-19)

| URL | Status | Content-Type |
| --- | --- | --- |
| `https://sarthakagrawal.dev/llms.txt` | 200 | text/plain; charset=utf-8 |
| `https://rolepatch.com/llms.txt` | 200 | text/plain; charset=utf-8 |
| `https://karte.cc/llms.txt` | 200 | text/plain; charset=utf-8 |
| `https://sarthakagrawal.dev/sitemap-index.xml` | 200 | application/xml |
| `https://rolepatch.com/sitemap.xml` | 200 | application/xml |
| `https://karte.cc/sitemap.xml` | 200 | application/xml |
| `https://rolepatch.com/api/ai` | 200 | application/json; charset=utf-8 |
| `https://karte.cc/api/ai` | 200 | application/json; charset=utf-8 |

### What was NOT done (pending explicit approval — task 3.4)

- No marketing publication. Quiet experiment definitions are `launchApproved: false` and `approvalState: draft`.
- No production deploy. No `pnpm deploy`, `wrangler deploy`, or `wrangler pages deploy` was run.
- No portfolio classification changes. The promotion policy is `mayRecommend: true` but `mayNot` includes "change portfolio classification", "create a product roadmap", "publish unsupported claims", and "deploy production without approval".
- No analytics instrumentation added to the static portfolio site (out of scope — static site has no server runtime).
- No replacement campaign created for any expired experiment (`defaults.noReplacementCampaign: true`).

### Pre-existing issues noted (not introduced by this change)

- `fleet-ops/test/marketing-program.test.mjs` fails with "active Fleet project is missing from registry: chess" — pre-existing drift in `marketing-program.json` unrelated to this change.
