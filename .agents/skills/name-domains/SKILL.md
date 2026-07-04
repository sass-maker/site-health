---
name: name-domains
description: >
  Generate tasteful, likely-available domain names for a startup idea. Brainstorms
  names, checks availability via public RDAP/DNS curls, scans competitor collision,
  returns a grouped shortlist with live-check links. Use when the user asks for
  domain names, naming help, brandable domains, "name my startup", availability
  checks, or runs /name-domains. No backend, no signup — works out of the box.
---

# Name Domains

Give me an idea. I'll return tasteful, likely-available domains that don't collide with the market.

**Single skill. No backend. No API keys.** Availability checks are public RDAP/DNS curls you run in the shell.

## Setup

**Default: nothing.** Invoke `/name-domains` and go.

**Only ask the user for input** when the brief is incomplete (see step 1). That is the only "login" — no accounts, no Infisical, no wrangler.

**Do not ask for** registrar logins, API keys, or payment details. Purchase is out of scope (live-check links only).

## Workflow

### 1. Collect the brief

Ask only for what's missing:

| Field | Required | Example |
| --- | --- | --- |
| `idea` | Yes | "AI calendar assistant for busy founders" |
| `audience` | No | "solo SaaS founders" |
| `vibe` | No | "minimal, warm, premium" |
| `tlds` | No | `com`, `io` — default `com`, `io`, `co` |
| `avoid` | No | words/substrings to skip |
| `competitors` | No | names or URLs they know |

### 2. Brainstorm 40–60 candidates

Generate wide, then narrow. Use naming directions:

- **compound** — `founderflow`, `calmstack`
- **portmanteau** — `calendly`-style blends from idea words
- **metaphor** — `forge`, `nest`, `pulse`, `beam`
- **abstract** — coined, pronounceable (`velora`, `nimblex`)
- **descriptive** — literal but tasteful (`slotsync`, `dayguide`)
- **playful** — lighter tone if vibe fits

Rules:

- 3–14 chars for the SLD; prefer 5–10
- No hyphens or digits unless user asks
- Honor `avoid` list strictly
- Skip ultra-generic SLDs (`app`, `get`, `my`, `hub` alone)

### 3. Pre-filter before network checks

Drop candidates that:

- Contain `avoid` words
- Exactly match a competitor name (high collision)
- Are obvious dictionary one-word `.com` grabs (`shop`, `cloud`, `data`)

### 4. Check availability (shell curls)

Run these yourself. **Cap at ~30 domains × preferred TLDs** (pre-rank by taste first; do not curl hundreds).

**RDAP by TLD** — `404` = likely available, `200` = likely taken, else `unknown`:

```bash
# .com
curl -sS -o /dev/null -w "%{http_code}" --max-time 5 \
  "https://rdap.verisign.com/com/v1/domain/SLD.com"

# .net
curl -sS -o /dev/null -w "%{http_code}" --max-time 5 \
  "https://rdap.verisign.com/net/v1/domain/SLD.net"

# .io
curl -sS -o /dev/null -w "%{http_code}" --max-time 5 \
  "https://rdap.nic.io/domain/SLD.io"

# .co
curl -sS -o /dev/null -w "%{http_code}" --max-time 5 \
  "https://rdap.nic.co/domain/SLD.co"

# .org
curl -sS -o /dev/null -w "%{http_code}" --max-time 5 \
  "https://rdap.org/domain/SLD.org"

# .dev / .app
curl -sS -o /dev/null -w "%{http_code}" --max-time 5 \
  "https://rdap.nic.google/domain/SLD.dev"
```

**DNS fallback** when RDAP returns non-404/200 or times out:

```bash
curl -sS -H "Accept: application/dns-json" --max-time 5 \
  "https://cloudflare-dns.com/dns-query?name=SLD.com&type=A"
```

`Status: 3` (NXDOMAIN) → `likely_available`. `Answer` present → `likely_taken`.

Batch with modest parallelism (≤12 concurrent curls). If RDAP rate-limits, slow down — do not ask the user to sign up for anything.

### 5. Score taste (0–100)

| Signal | Weight |
| --- | --- |
| Length 5–10 | +high |
| Easy to pronounce | +high |
| Fits vibe + idea | +medium |
| `likely_available` | +12 |
| `likely_taken` | −20 |
| Hyphens / digits | −8 |

### 6. Collision scan (not legal trademark)

Compare SLD to user competitors + obvious market names:

- **high** — exact match, substring overlap, or >82% string similarity
- **medium** — 60–82% similarity
- **low** — otherwise

Always disclaimer: *heuristic only, not trademark clearance.*

### 7. Live-check links (no purchase flow)

Build per domain — do not call registrar APIs:

| Registrar | URL pattern |
| --- | --- |
| Cloudflare | `https://domains.cloudflare.com/?domain={domain}` |
| Namecheap | `https://www.namecheap.com/domains/registration/results/?domain={domain}` |
| Porkbun | `https://porkbun.com/checkout/search?q={domain}` |

## Output format

Return **20–25 names** (up to 50 if asked), grouped by style:

```markdown
# Domain shortlist — {idea} ({vibe} vibe)

> Collision scan is heuristic only — not legal trademark clearance.

**{n}** of **{limit}** look likely available (RDAP/DNS; verify before buying).

## {Style}
| Domain | Taste | Avail | Collision | Why it works | Risk | Check |
| --- | ---: | --- | --- | --- | --- | --- |
| example.com | 82 | likely_available | low | … | … | [CF](…) · [NC](…) · [PB](…) |

## Top picks
1. **name.com** — one-line rationale
2. …

## Not included
- Registrar checkout (use Check links)
- Trademark / social / app-store clearance
```

Offer CSV on request.

## Failure modes

| Situation | Action |
| --- | --- |
| Missing `idea` | Ask user — only required field |
| RDAP timeout | DNS fallback; mark `unknown` |
| All candidates taken | Brainstorm wider; try `.io`/`.co`; say so honestly |
| User wants purchase | Point to live-check links |

## Out of scope (v1)

Purchase flow, registrar APIs, trademark APIs, social handle checks, saved lists, alerts.