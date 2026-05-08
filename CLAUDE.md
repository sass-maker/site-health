# Fleet Claude Instructions

@AGENTS.md

This file is the Claude-facing entrypoint for the Fleet workspace. Keep durable
cross-agent policy in `AGENTS.md`; use this file only to bridge Claude Code into
that shared policy and to add Claude-specific notes when needed.

Fleet-level Claude skills live in `.claude/skills/`. Child projects opt in by
linking those skills into their own `.claude/skills/` directory with
`scripts/link-project-agent-assets.sh`.
