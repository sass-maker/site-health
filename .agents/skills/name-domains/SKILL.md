---
name: name-domains
description: >
  Generate tasteful, likely-available domain names for a startup idea. Brainstorms
  names, checks availability via public RDAP/DNS (scripts/check-domains.sh), scans
  competitor collision, returns a grouped shortlist with live-check links. Use when
  the user asks for domain names, naming help, brandable domains, "name my startup",
  availability checks, or runs /name-domains. No backend, no signup — works out of
  the box. Reads PROJECT_STATUS.md when working in a fleet repo.
---

# Name Domains

Give me an idea. I'll return tasteful, likely-available domains that don't collide with the market.

**Single skill. No backend. No API keys.** Use `scripts/check-domains.sh` for consistent availability probes.

## Setup

**Default: nothing.** Invoke `/name-domains` and go.

**Only ask the user for input** when the brief is incomplete (step 1). No registrar logins, API keys, or payment.

**Helper script** (run from repo root or pass full path):

```bash
bash .agents/skills/name-domains/scripts/check-domains.sh \
  phytoproof evidcite remegram --tlds com,io
# TSV: domain  status  source  note
```

Stdin also works: `printf '%s\n' phytoproof evidcite | bash .../check-domains.sh --tlds com`

## Workflow

### 0. Project context (when in a repo)

Before asking questions, check whether the project is already named:

1. Read `PROJECT_STATUS.md` (Why/What, Products URLs)
2. Read `package.json` → `homepage`, `name`, `description`
3. Read `README.md` first paragraph if needed

If a domain or product name exists (e.g. `materia.io`):

- Run `check-domains.sh` on it **first**
- Open with **"Keep vs switch"** — do not blindly generate 25 alternatives
- If DNS says `likely_taken` with note `may_be_parked_or_reserved`, say: *may be yours, parked, or reserved — check registrar before discarding*

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
| `existing_domain` | No | auto-filled from step 0 if found |

### 2. Brainstorm 50–60 candidates

Generate wide across naming directions:

- **compound** — `founderflow`, `calmstack`
- **portmanteau** — blends from idea words
- **metaphor** — `forge`, `nest`, `pulse`, `grove`
- **abstract** — coined, pronounceable (`velora`, `evinleaf`)
- **descriptive** — literal but tasteful (`evidcite`, `phytoproof`)
- **playful** — only if vibe fits

Rules: SLD 3–14 chars (prefer 5–10); no hyphens/digits unless asked; honor `avoid`; skip bare generics (`app`, `get`, `hub`, `shop`).

### 3. Pre-filter (no network)

Drop candidates that:

- Hit `avoid` words
- Exactly match a competitor (high collision)
- Are obvious one-word `.com` grabs (`cloud`, `data`, `shop`)
- Fail **say-aloud test** — see step 5

### 4. Pre-rank taste (before curls)

Score each survivor 0–100 using **fixed bands** (start at 50, add/subtract):

| Signal | Points |
| --- | ---: |
| Length 5–10 | +15 |
| Length 4 or 11–12 | +5 |
| Length >12 | −10 |
| 4+ consecutive consonants | −12 |
| Triple letter repeat | −8 |
| Hyphen or digit | −8 |
| Pronounceable on first read | +10 |
| Vibe + idea fit (your judgment, 0–3 cues) | +0 to +15 |
| Naming style matches requested vibe | +5 |

Do **not** add availability points yet. Sort descending; keep top **20 SLDs**.

### 5. Say-aloud test (top 20)

For each shortlisted SLD, write one line:

> *"I'd introduce this at a dinner party as ______."_

Drop any that sound wrong, confusing, or like a different product (e.g. `herbograph` → herb photography). Replace from the brainstorm pool and re-rank.

### 6. Two-pass availability check

**Pass A — primary TLD only** (usually `.com`):

```bash
bash .agents/skills/name-domains/scripts/check-domains.sh \
  sld1 sld2 ... sld20 --tlds com
```

Keep SLDs where status is `likely_available` or `unknown`. Drop `likely_taken` unless user wants stretch options.

**Pass B — secondary TLDs** (only for Pass A survivors, max 15 SLDs):

```bash
bash .agents/skills/name-domains/scripts/check-domains.sh \
  sld1 sld2 ... --tlds io,co
```

**TLD strategy** (built into the script):

| TLDs | Primary probe | Fallback |
| --- | --- | --- |
| `com`, `net`, `org` | RDAP | DNS |
| `io`, `co`, `dev`, `app` | DNS (RDAP unreliable) | RDAP |

**Interpreting notes** (TSV column 4):

| note | Meaning |
| --- | --- |
| `may_be_parked_or_reserved` | DNS has records — domain may be parked, in use, or **yours**. Verify at registrar. |
| `nxdomain_only_verify_at_registrar` | No DNS answer — promising but not proof of registration availability. |
| `check_manually` | Probe failed — use live-check links. |

**After checks**, adjust taste score: `likely_available` +12, `likely_taken` −20, `unknown` −2.

Cap final output at **25 domains** (50 if asked). Never curl more than ~35 SLD×TLD pairs total.

### 7. Collision scan (not legal trademark)

Compare SLD to user competitors + obvious market names in the category:

- **high** — exact match, substring overlap, or >82% string similarity
- **medium** — 60–82% similarity
- **low** — otherwise

Drop **high** collision unless taste ≥ 70 and user wants stretch options.

Disclaimer: *heuristic only, not trademark clearance.*

### 8. Live-check links (no purchase flow)

| Registrar | URL |
| --- | --- |
| Cloudflare | `https://domains.cloudflare.com/?domain={domain}` |
| Namecheap | `https://www.namecheap.com/domains/registration/results/?domain={domain}` |
| Porkbun | `https://porkbun.com/checkout/search?q={domain}` |

## Output format

```markdown
# Domain shortlist — {idea} ({vibe} vibe)

> Collision scan is heuristic only — not legal trademark clearance.

## Existing name (if any)
**{existing.domain}** — {status} ({note}). Recommendation: **keep** / **switch** / **backup only** — because …

**{n}** of **{limit}** look likely available (RDAP/DNS; verify before buying).

## {Style}
| Domain | Taste | Avail | Collision | Say aloud | Why | Risk | Check |
| --- | ---: | --- | --- | --- | --- | --- | --- |
| example.com | 82 | likely_available | low | "…" | … | … | [CF](…) · [NC](…) · [PB](…) |

## Top picks
1. **name.com** — rationale + dinner-party line
2. …

## Taken / skipped
- `name.com` — likely_taken
- …

## Not included
- Registrar checkout (use Check links)
- Trademark / social / app-store clearance
```

Offer CSV on request (columns: domain, taste, availability, collision, style, note).

## Failure modes

| Situation | Action |
| --- | --- |
| Missing `idea` | Ask user |
| All `.com` taken | Widen brainstorm; emphasize Pass B `.io`/`.co` survivors |
| RDAP/DNS disagree | Report both; prefer RDAP for `.com`, DNS signal for `.io`; tell user to live-check |
| User owns existing domain | Recommend keep unless new names clearly better |

## Out of scope (v1)

Purchase flow, registrar APIs, trademark APIs, social handle checks, saved lists, alerts, backend Worker.