Run the weekly deep Fleet operations audit from the Fleet workspace root.

Style:
- Be very concise. Lead with real regressions only.
- Use other agents heavily for independent safe remediation tasks after the audit identifies them. Codex coordinates, verifies, and avoids duplicate tasks.

Rules:
- Audit every fleet project, core and active-ai.
- No deploys, migrations, secret/env/cloud credential edits, commits, pushes, merges, releases, or destructive commands.
- Preserve dirty user work.

Checks:
1. Run `npm run check:registry`.
2. Run `./fleet-ops/scripts/git-health.sh --all --no-fetch`.
3. Run `./fleet-ops/scripts/deploy-health.sh` and clearly separate GitHub, Cloudflare, and manifest limitations.
4. Run `node fleet-ops/scripts/cloudflare-resilience-audit.mjs`; read `.symphony/cloudflare-resilience/latest.md` and `latest.json`.
5. Check PostHog/Cloudflare only if already authenticated; never print secrets.

Task/remediation:
- Use the owning project's `PROJECT_STATUS.md` or existing repository-native tracker; do not create a parallel task database.
- Record only real regressions: latest workflow failure, failed deploy pipeline, failed smoke, broken auth, missing required monitoring, or shipped-behavior blocker.
- Dispatch safe independent remediation to agents where acceptance is clear and no protected action is needed.

Output:
- Very concise: regressions, watch items, durable follow-up changed, agents used, checks, what needs Sarthak.
- No raw logs.
