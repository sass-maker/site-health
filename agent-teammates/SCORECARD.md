# Agent teammate scorecard

Shared outcome log for delegated agent work (`call-codex`, `call-grok`,
`call-claude-code`, `call-devin`). Routing notes: [ROSTER.md](ROSTER.md).
The parent agent appends **one line per delegation** and skims relevant rows
before delegating a similar task — past rejects are the routing signal.

Format (one table row per delegation):

- **date** — YYYY-MM-DD
- **teammate** — codex | grok | claude-code | devin
- **task type** — implement | refactor | test-fix | review | other
- **repo/scope** — repo name or short scope tag
- **verdict** — accepted | accepted-with-fixes | rejected | failed | blocked
- **note** — one short clause: why the verdict, or the lesson

| date | teammate | task type | repo/scope | verdict | note |
| --- | --- | --- | --- | --- | --- |
| 2026-07-03 | codex | test-fix | scratch e2e validation | accepted | minimal in-scope diff, honest schema result, independent test passed; ~80k input tok (76% cached) for a 3-turn task |
| 2026-07-03 | grok | test-fix | scratch e2e validation | accepted | correct minimal diff + honest JSON, but took 3 config attempts: acceptEdits runs end silently Cancelled (exit 0) → needs --always-approve; headless -w mutated main checkout |
| 2026-07-04 | grok | test-fix | scratch (--allow experiment) | failed | Claude-Code-style --allow rules + acceptEdits still Cancelled before first edit; --always-approve remains the only working headless recipe |
| 2026-07-04 | devin | test-fix | scratch e2e validation | accepted | first live run: minimal diff, honest fenced JSON, --export transcript worked; gotcha: --sandbox ignores --permission-mode (forces autonomous) |
| 2026-07-04 | cursor | test-fix | scratch e2e validation | accepted | ~11 s, minimal diff, JSON envelope w/ usage tokens; -w worktree isolation verified real (branch + registered worktree, main untouched) |
