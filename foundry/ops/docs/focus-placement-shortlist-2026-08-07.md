# Focus-set placement shortlist — 2026-08-07

Legitimate distribution only. **Not** a bulk-directory or programmatic spam map.

**Scope:** Pace, CodeVetter, PostTrainLLM, High Signal (focus set).  
**Goal:** relevant third-party mentions that cite a real asset (repo, guide, benchmark, comparison)—not raw homepage spam.

## Rules

1. One placement per venue; match the venue’s format and topic.
2. Lead with an **owned asset** (guide, comparison, benchmark), not a bare “check out my SaaS” link.
3. Prefer **open PRs / forms with review** over auto-submit.
4. Do not invent features, scores, or competitor claims.
5. Track status in the ledger table at the bottom; never re-blast rejected venues.
6. If a maintainer says no, leave a thank-you and stop.

## Priority order (effort)

| Priority | Product | Why |
| --- | --- | --- |
| P0 | **PostTrainLLM** | Highest GSC volume (~1.2k impr / ~3 clicks); train-intent pages now live |
| P1 | **Pace** | Comparison set already ranks for competitor names |
| P1 | **CodeVetter** | Position ~8 with zero clicks; needs proof + list presence |
| P2 | **High Signal** | Low search volume; quality placements only (not volume) |

---

## PostTrainLLM

**Canonical:** https://posttrainllm.com  
**Assets to cite:**  
- https://posttrainllm.com/how-to-train-your-own-llm  
- https://posttrainllm.com/fine-tune-llm-on-mac  
- https://posttrainllm.com/docs/learn/competitive-landscape  
- https://github.com/PostTrainLLM/posttrainllm  

| # | Venue | Why it fits | Action | Link target |
| --- | --- | --- | --- | --- |
| PT1 | [raullenchai/awesome-mlx](https://github.com/raullenchai/awesome-mlx) | MLX training/tools list | Open PR under training/fine-tuning | repo + train guide |
| PT2 | [akdeb/awesome-mlx](https://github.com/akdeb/awesome-mlx) | Notable MLX projects | Open PR | repo |
| PT3 | [antranapp/awesome-mlx](https://github.com/antranapp/awesome-mlx) | MLX resources | Open PR if section fits | repo |
| PT4 | [rafska/awesome-local-llm](https://github.com/rafska/awesome-local-llm) | Local LLM platforms/tools | Open PR under fine-tuning / Mac | repo + how-to |
| PT5 | [msb-msb/awesome-local-ai](https://github.com/msb-msb/awesome-local-ai) | Local AI on consumer HW | Open PR | repo |
| PT6 | [janhq/awesome-local-ai](https://github.com/janhq/awesome-local-ai) | Local AI meta-list | Open PR if accepted format | repo |
| PT7 | [ml-explore/mlx discussions #654](https://github.com/ml-explore/mlx/discussions/654) | Official community projects thread | Comment with one-line + links | repo + site |
| PT8 | [ml-explore/mlx-swift discussions](https://github.com/ml-explore/mlx-swift/discussions) if Swift path is true | Swift community projects | Only if Swift surface is accurate | repo |
| PT9 | r/LocalLLaMA or r/MachineLearning (Show & Tell) | Audience for local train | Manual post when you have a measured result | how-to + artifacts |
| PT10 | Hugging Face / Discord MLX channels | Practitioners | Manual share of train guide | how-to |

### Draft — awesome-list PR body (PostTrainLLM)

```markdown
## Add PostTrainLLM

**What:** Mac-local specialist factory for post-training / evaluating open LLMs
(LoRA–QLoRA, real eval gates, MLX packaging). Open source (MIT).

**Why this list:** Runs on Apple Silicon; training + eval oriented (not only chat UIs).

**Links**
- Repo: https://github.com/PostTrainLLM/posttrainllm
- Site: https://posttrainllm.com
- How to train your own LLM (honest pre-train vs post-train): https://posttrainllm.com/how-to-train-your-own-llm
- Competitive landscape notes: https://posttrainllm.com/docs/learn/competitive-landscape

**Suggested line**
- [PostTrainLLM](https://github.com/PostTrainLLM/posttrainllm) - Train, evaluate, and package specialist LLMs on one Mac (MLX / local post-training).
```

### Draft — MLX community discussion comment

```text
PostTrainLLM — Mac-local post-training + eval factory (specialists, report cards, MLX packaging).
Repo: https://github.com/PostTrainLLM/posttrainllm
Guide: https://posttrainllm.com/how-to-train-your-own-llm
Happy to adjust the blurb if you want a shorter line.
```

---

## Pace (HeyPace)

**Canonical:** https://heypace.app  
**Assets to cite:**  
- https://heypace.app/compared  
- https://heypace.app/private-voice-assistant-mac  
- https://heypace.app/screen-aware-ai-assistant-mac  

| # | Venue | Why it fits | Action | Link target |
| --- | --- | --- | --- | --- |
| PA1 | [jaywcjlove/awesome-mac](https://github.com/jaywcjlove/awesome-mac) | Large macOS app list | PR under AI / Productivity if section exists | site + compared |
| PA2 | Awesome lists for “macOS automation” / “AI agents” (search live for maintained lists) | Screen-aware Mac agents | One PR each after reading CONTRIBUTING | compared |
| PA3 | r/MacOS / r/MacApps (Show Off) | Mac users | Manual when demo/GIF is ready | site |
| PA4 | Hacker News Show HN | Privacy-local agent story | Manual launch post | compared + privacy page |
| PA5 | Lobsters | Technical audience | Manual if you have a technical angle | compared |
| PA6 | Product Hunt | Launch day | One intentional launch | site |
| PA7 | Relevant “local AI agent” GitHub topics / roundup blogs | Discovery | Pitch authors with compared page | compared |
| PA8 | WWDC / Apple Silicon community threads that collect local agents | Thematic fit | Comment only when on-topic | private-voice guide |

### Draft — awesome-mac / Mac AI list line

```markdown
- [Pace](https://heypace.app) - On-device macOS voice agent that can see the screen and take actions locally (comparison of the field: https://heypace.app/compared).
```

### Draft — Show HN (when ready)

```text
Show HN: Pace – private Mac voice agent (screen-aware, on-device)

I built a local-first voice agent for macOS that stays on-device. Instead of
another “AI assistant” landing page, I published a field comparison of Mac
agents by data path, actions, and approval model:

https://heypace.app/compared

Site: https://heypace.app
Happy to answer questions about privacy boundaries and what we still do badly.
```

---

## CodeVetter

**Canonical:** https://codevetter.com  
**Assets to cite:**  
- https://codevetter.com/benchmark  
- https://codevetter.com/coding-agent-verification  
- https://codevetter.com/ai-code-review-vs-verification  
- https://github.com/Codevetter/codevetter  

| # | Venue | Why it fits | Action | Link target |
| --- | --- | --- | --- | --- |
| CV1 | Awesome lists for “code review” / “AI coding tools” (maintained only) | Category fit | PR with verification angle | benchmark + repo |
| CV2 | awesome-selfhosted-ish / desktop tools lists | Offline desktop product | PR if desktop tools section | site |
| CV3 | r/programming / r/MachineLearning / r/LocalLLaMA (tool share) | Developers shipping agent code | Manual post with benchmark honesty | benchmark |
| CV4 | Hacker News Show HN | Evidence-backed local verification | Manual when benchmark story is clear | benchmark |
| CV5 | CodeRabbit / Greptile comparison blogs (author outreach) | Your vs pages are honest | Email authors with link to vs pages | vs CodeRabbit / Greptile |
| CV6 | Dev.to / Hashnode article | Long-form “review vs verification” | Publish once | comparison guide |
| CV7 | GitHub topics: `code-review`, `ai-code-review` | Discovery | Ensure repo topics + README link assets | repo |
| CV8 | Engineering Slack/Discord communities (with permission) | Staff eng audience | Manual share of methodology | coding-agent-verification |

### Draft — list line

```markdown
- [CodeVetter](https://codevetter.com) - Desktop, local-first verification for agent-written code (public recognition benchmark: https://codevetter.com/benchmark).
```

### Draft — Show HN / tool post

```text
CodeVetter – local verification for agent-written code (desktop)

Most AI “code review” tools score diffs. We focus on task → change → executable
checks → evidence. Public v1 recognition benchmark (synthetic, limitations stated):

https://codevetter.com/benchmark

Review vs verification: https://codevetter.com/ai-code-review-vs-verification
Repo: https://github.com/Codevetter/codevetter
```

---

## High Signal

**Canonical:** https://highsignal.app  
**Assets to cite:**  
- https://highsignal.app/daily-intelligence-brief  
- https://highsignal.app/compared  
- https://highsignal.app/track-record  
- https://highsignal.app/methodology  

| # | Venue | Why it fits | Action | Link target |
| --- | --- | --- | --- | --- |
| HS1 | Indie Hackers / founder newsletters tip forms | Founder audience | One tip email with track-record link | track-record + brief |
| HS2 | Product Hunt | Launch if product is ready | One launch | site |
| HS3 | Hacker News (Show HN or relevant thread) | Technical founders | Manual; lead with methodology | methodology + track-record |
| HS4 | “Daily brief / market intel” roundups | Category | Pitch editors with cite-or-kill rule | daily-intelligence-brief |
| HS5 | Twitter/X founder lists (organic) | Distribution | Share real briefs with sources, not ads | signal pages |
| HS6 | Relevant podcasts / guest posts | Authority | Long cycle; only with unique data | track-record |
| HS7 | awesome “startup tools” lists (high bar) | Discovery | PR only if product is clearly useful free | site |
| HS8 | LinkedIn founder posts | Audience | Human voice + one brief sample | brief |

### Draft — tip / pitch

```text
High Signal is a free daily tech/startup/finance brief with a hard rule:
every claim needs ≥2 independent sources or it does not ship. Public
track record for matured calls: https://highsignal.app/track-record
Category writeup: https://highsignal.app/daily-intelligence-brief
Compared to other briefs: https://highsignal.app/compared
```

---

## Cross-product portfolio (use sparingly)

| Venue | Use for | Notes |
| --- | --- | --- |
| https://sassmaker.com product pages | Portfolio discovery | Already owned; keep accurate |
| Personal site / README | All four | One portfolio section with honest one-liners |
| GitHub profile pin | 1–2 best repos | Prefer CodeVetter + PostTrainLLM or Pace |

Do **not** submit all four products to the same generic directory in one batch.

---

## Submission drafts — one-liners by product

| Product | One-liner |
| --- | --- |
| Pace | On-device macOS voice agent that can understand the screen and take actions—field comparison at heypace.app/compared. |
| CodeVetter | Local desktop verification for agent-written code with a public (limited) recognition benchmark. |
| PostTrainLLM | Mac-local factory to post-train and evaluate specialist LLMs with evidence, not vibes. |
| High Signal | Daily tech/startup/finance brief where claims need two sources or they don’t ship. |

---

## Execution ledger (fill as you go)

| ID | Venue | Product | Status | Date | URL / PR | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| PT1 | raullenchai/awesome-mlx | PostTrainLLM | submitted | 2026-08-07 | https://github.com/raullenchai/awesome-mlx/pull/22 | PR open |
| PT2 | akdeb/awesome-mlx | PostTrainLLM | submitted | 2026-08-07 | https://github.com/akdeb/awesome-mlx/pull/1 | PR open |
| PT4 | rafska/awesome-local-llm | PostTrainLLM | submitted | 2026-08-07 | https://github.com/rafska/awesome-local-llm/pull/170 | PR open |
| PT7 | mlx discussions #654 | PostTrainLLM | todo | | | |
| PA1 | awesome-mac | Pace | todo | | | |
| PA4 | Show HN | Pace | blocked | | | Need sharp demo story |
| CV1 | code-review awesome list | CodeVetter | todo | | | Pick maintained list first |
| CV4 | Show HN | CodeVetter | blocked | | | Lead with benchmark honesty |
| HS1 | Indie Hackers tip | High Signal | todo | | | |
| HS3 | HN | High Signal | blocked | | | Wait for a real brief win |

**Statuses:** `todo` · `drafted` · `submitted` · `accepted` · `rejected` · `blocked`

---

## What I will not do from this list

- Auto-submit scripts across directories  
- Comment spam on unrelated threads  
- Buy links / PBNs / profile farms  
- Re-submit after reject without material product change  

## Suggested next agent steps (when you say go)

1. Open **PT1 + PT2 + PT4** GitHub PRs with the draft above.  
2. Post **PT7** community comment.  
3. Open **PA1** only after confirming the right section in awesome-mac.  
4. Draft **CV** awesome PR after identifying one maintained code-review tools list.  
5. Update the ledger when each lands.
