Run the daily Fleet health sentinel from the Fleet workspace root.

Style:
- Be very concise. Report only real regressions, skipped checks, and blockers.
- Use agents only for tiny independent remediation with clear acceptance; otherwise this is read-mostly.

Rules:
- Lightweight daily health check, not product review or cleanup pass.
- No deploys, migrations, secret/env/cloud credential edits, commits, pushes, merges, releases, or destructive commands.
- Preserve dirty user work.

Flow:
1. Run `npm run check:registry`.
2. Run `node foundry/ops/scripts/cloudflare-resilience-audit.mjs`; read the latest artifacts.
3. Check latest default-branch GitHub Actions failures with `gh` where available.
4. Label stale, project-scoped, and network-blocked results clearly; do not treat them as product regressions.
5. Do not create a second task database. Record a durable regression only in the owning project's `PROJECT_STATUS.md` or existing repository-native tracker.

Output:
- Very concise: regressions, skipped checks, durable follow-up changed, what needs Sarthak.
- Include commands/artifact paths, not raw logs.
