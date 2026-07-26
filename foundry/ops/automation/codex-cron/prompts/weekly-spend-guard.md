Run the minimal weekly Fleet spend guard from the Fleet workspace root.

Read and follow:

- `foundry/ops/skills/cloudflare-spend-guard/SKILL.md`
- `foundry/ops/skills/cloudflare-spend-guard/references/evidence-playbook.md`
- `foundry/ops/skills/cloudflare-spend-guard/references/turso-evidence-playbook.md`
- `foundry/ops/skills/cloudflare-spend-guard/references/recurring-run.md`

Boundaries:

- Keep all Cloudflare and Turso activity read-only.
- Do not deploy, delete, pause, migrate, query application data, change plans,
  alter overage settings, modify credentials, or edit production configuration.
- Do not read credential files or environment values.
- Do not persist raw provider responses, database URLs, SQL, literals, request
  bodies, or payment details.
- If a billing surface rejects authentication or permission, stop retrying it
  and record that provider's monetary state as `unknown`.
- Preserve Cloudflare and Turso billing/reset periods separately.
- Use the tracked Fleet registry and current project status for attribution.
- Create a sanitized input envelope under the ignored
  `foundry/ops/automation/codex-cron/state/spend-guard/` directory and record it
  only through `record-spend-snapshot.mjs`.
- If the recorder returns `warning` or `critical`, emit one deduplicated
  `fleet-notify` event containing only aggregate alert reasons and the
  machine-local report path. Do not page for `ok`.
- Do not commit, push, install cron, or enable this disabled job.

Finish with the overall spend state, material alerts, top recommendation, exact
evidence gaps, and confirmation that no provider or production mutation
occurred.
