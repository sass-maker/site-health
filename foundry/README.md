# Foundry

Foundry is the canonical home for all Fleet-owned source.

- `apps/` — deployable interfaces
- `services/` — helper runtimes and production services
- `packages/` — reusable libraries
- `tools/` — operator and analysis tools
- `ops/` — Fleet policy, registries, automation, scripts, skills, and runbooks
- `openspec/` — cross-project specifications
- `assets/` — shared visual assets

The parent directory remains the workspace and agent entrypoint so independent
product repositories can sit beside `foundry/`. After cloning from a new
machine, run:

```bash
./foundry/ops/scripts/agent-stack.sh install-skills
```

That command exposes the canonical skills in root `.agents/skills/` without
duplicating their source.
