---
target: Disconnected local-agent setup
total_score: 33
max_score: 40
na_heuristics: ''
p0_count: 0
p1_count: 0
timestamp: 2026-08-12T22-28-22Z
slug: web-src-components-disconnectedpanel-tsx
---
Method: dual-agent (A: quick_check_design_review · B: quick_check_detector_review)

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---:|---|
| 1 | Visibility of system status | 3 | The connection result is visible, but failure diagnosis remains terse. |
| 2 | Match system / real world | 3 | The sequence is natural; Git, Corepack, and origin still assume developer fluency. |
| 3 | User control and freedom | 3 | Returning users can skip installation and retry connection. |
| 4 | Consistency and standards | 4 | Headings, numbered steps, commands, controls, and focus states are cohesive. |
| 5 | Error prevention | 4 | Supported versions, verification commands, working directory, generated origin, and success signal are explicit. |
| 6 | Recognition rather than recall | 4 | Every command and the expected terminal state remain visible at the point of use. |
| 7 | Flexibility and efficiency | 3 | Copy actions and the step-three shortcut support experienced users. |
| 8 | Aesthetic and minimalist design | 3 | The four-step composition is calm; mobile is necessarily tall and code-heavy. |
| 9 | Error recognition and recovery | 3 | Copy failure is recoverable; connection troubleshooting could be more specific. |
| 10 | Help and documentation | 3 | Task help and public source are inline, but no targeted troubleshooting path exists. |
| **Total** |  | **33/40** | **Good** |

## Design Specificity Verdict

The disconnected state is strongly product-specific. Its local-controller explanation, Lighthouse prerequisites, Node constraint, page-derived `--origin`, public psi-swarm source, and exact terminal success signal could not be transplanted unchanged into an unrelated product. The automated detector returned `[]` for `DisconnectedPanel.tsx` and its `RunDashboard.tsx` integration. Browser checks at 390, 768, and 1440 pixels found no document overflow or console errors, and verified semantic headings/list structure, focus-visible keyboard traversal, 44-pixel controls, dynamic origin, copy feedback, and absence of the broken npm command.

No user-visible detector overlay was created because the available browser surface did not support mutable injection. The fallback was the clean CLI scan plus fresh DOM geometry, semantic, keyboard, copy-state, command, and console evidence.

## Overall Impression

The old dead-end command has become a credible setup path. The strongest improvement is error prevention: users now see the supported runtime, exact public source, exact build path, correct origin for the current page, and the terminal state that means it is safe to connect. The main remaining opportunity is richer recovery when the agent still cannot connect.

## What's Working

- Four bounded steps turn an infrastructure requirement into a predictable sequence with a single focus at each stage.
- Copy buttons have specific accessible names, independent success state, live-region confirmation, visible focus, and a manual-selection fallback.
- The generated origin and “leave the terminal open” guidance prevent the two most likely connection failures.

## Priority Issues

- **P2 — Connection failure recovery is shallow.** The raw last-error line does not distinguish an agent that is stopped from an origin or port mismatch. Add a concise diagnosis with technical detail under disclosure. Suggested command: `$impeccable harden`.
- **P2 — Horizontally clipped mobile commands have no visible scroll cue.** Copy is the primary path and document width remains correct, but users who inspect the command may not realize it scrolls. Add a restrained edge fade or an explicit cue without competing with Copy. Suggested command: `$impeccable polish`.
- **P3 — The public distribution path is heavier than expected.** A source clone and build are transparent and verified, but a supported package or release binary would reduce first-use friction. This is a distribution follow-up rather than a defect in the setup UI. Suggested command: `$impeccable distill` after distribution exists.

## Persona Red Flags

- **Jordan (first-timer):** The version checks now make prerequisites actionable, but Corepack and allowed-origin language still assumes some command-line knowledge. The numbered order and exact commands keep the flow completable.
- **Sam (accessibility-dependent):** Semantic headings/list structure, specific control names, live copy announcements, focus rings, and full-size targets are strong. Horizontally scrollable code remains an extra navigation stop at high zoom.
- **Casey (distracted mobile user):** The flow is long because it crosses browser and terminal, but each stage is recoverable, copy avoids typing, and the final full-width action lands at the end of the reading path.

## Minor Observations

- The cyan numbered rail creates rhythm without adding visual noise.
- “Already installed? Skip to step 3” is an effective power-user escape hatch.
- The public-source link now announces that it opens a new tab.
- Cognitive load is low: seven of eight checks pass; only the unavoidable browser-to-terminal context switch taxes working memory.

## Questions to Consider

- When a connection fails, can the controller identify whether port, origin, or process state is wrong without exposing raw implementation detail first?
- Once a supported public package exists, which of the current source-build details can disappear from the primary path?

Questions skipped: the remaining findings are straightforward, non-blocking follow-ups and the release scope is already explicit.
