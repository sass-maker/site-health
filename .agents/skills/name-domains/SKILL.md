---
name: name-domains
description: >
  Generate tasteful, likely-available domain names for a startup idea. Uses helper
  scripts for taste scoring, collision scan, and RDAP/DNS availability. Reads
  PROJECT_STATUS.md in fleet repos. Use for domain names, brandable domains, naming
  help, "name my startup", availability checks, or /name-domains. No backend or
  signup — works out of the box.
---

# Name Domains

Give me an idea. I'll return tasteful, likely-available domains that don't collide with the market.

**Single skill. No backend. No API keys.**

Skill root: `.agents/skills/name-domains/` (scripts + references below).

## Tools (always use these — do not reimplement)

| Script | Purpose |
| --- | --- |
| `scripts/check-domains.sh` | RDAP/DNS availability → TSV |
| `scripts/score-taste.py` | Mechanical taste score 0–100 |
| `scripts/score-collision.py` | Competitor collision → TSV |
| `references/blocked-slds.txt` | Generic SLDs to skip |
| `references/competitor-seeds-*.txt` | Category competitor seeds |

```bash
SKILL=".agents/skills/name-domains"

# Availability (Pass A: .com only first)
bash "$SKILL/scripts/check-domains.sh" --header sld1 sld2 --tlds com

# Taste
python3 "$SKILL/scripts/score-taste.py" --header --idea "..." --vibe "..." sld1 sld2

# Collision
python3 "$SKILL/scripts/score-collision.py" --header \
  --competitors "Examine,BioDigital" \
  --seeds-file "$SKILL/references/competitor-seeds-health.txt" \
  sld1 sld2
```

## Mandatory checklist

Before returning output, confirm every box:

- [ ] Step 0: checked repo context + existing domain
- [ ] Step 1: brief complete (`idea` minimum)
- [ ] Step 2: ≥50 candidates across ≥4 naming styles
- [ ] Step 3: pre-filtered blocked/generic/collision-high
- [ ] Step 4–5: `score-taste.py` + say-aloud test on top 20
- [ ] Step 6 Pass A: `check-domains.sh --tlds com` on top 20
- [ ] Step 6 Pass B: `--tlds io,co` only on Pass A survivors (max 15 SLDs)
- [ ] Step 7: `score-collision.py` on finalists
- [ ] Step 8: live-check links on every listed domain
- [ ] Output includes Existing name, Top picks (with say-aloud), Taken/skipped

## Workflow

### 0. Project context (fleet repos)

Read before asking questions:

1. `PROJECT_STATUS.md` — Why/What, Products URLs
2. `package.json` — `homepage`, `name`, `description`
3. `README.md` lede if needed

If a domain exists, run `check-domains.sh --header {sld} --tlds com,io` first.

Open with **Keep vs switch**:

- `likely_taken` + `may_be_parked_or_reserved` → *may be yours, parked, or in use — check registrar*
- Recommend **keep** when existing name is short, on-brand, and defensible

### 1. Brief

| Field | Required | Example |
| --- | --- | --- |
| `idea` | Yes | "Evidence-graded herb reference with body explorer" |
| `audience` | No | "health-curious researchers" |
| `vibe` | No | "classy, warm, trustworthy, premium" |
| `tlds` | No | default `com`, `io`, `co` |
| `avoid` | No | `examine`, `diagnose`, substrings |
| `competitors` | No | names/URLs + pick matching `references/competitor-seeds-*.txt` |

### 2. Brainstorm ≥50 candidates

Extract **stems** from idea/audience (use in compounds/portmanteaus):

| Theme | Stems |
| --- | --- |
| Product | body, remedy, herb, plant, phyto, botan, leaf, root, layer |
| Moat | evid, cite, proof, grade, study, graph, compound |
| Tone | calm, clear, wise, true, vital, soma, corpus |

**Styles** (aim for ≥8 names each):

| Style | Pattern |
| --- | --- |
| compound | `{stem}{suffix}` — proof, cite, graph, leaf, forge, atlas |
| portmanteau | blend 2 stems — `evid`+`cite`, `phyto`+`proof` |
| metaphor | grove, forge, proof, pulse — paired with stem |
| abstract | coined 6–9 chars — pronounceable, premium |
| descriptive | literal but tasteful — not generic SEO slugs |
| playful | only if vibe allows |

Skip SLDs in `references/blocked-slds.txt` unless part of a longer compound.

### 3. Pre-filter (no network)

Drop: `avoid` hits; exact competitor match; blocked SLDs; high collision from `score-collision.py` sweep.

### 4. Mechanical taste pre-rank

```bash
python3 "$SKILL/scripts/score-taste.py" --header \
  --idea "{idea}" --vibe "{vibe}" sld1 sld2 ... | sort -t$'\t' -k2 -nr
```

Keep top **20** SLDs. Script starts at 50 and applies fixed bands (length, consonants, vowel ratio, idea/vibe stem hits).

### 5. Say-aloud test

For each top-20 SLD:

> *"I'd introduce this at a dinner party as ______."_

Drop names that mislead (e.g. `herbograph` → photography), confuse, or sound cheap. Backfill from brainstorm pool; re-run taste if needed.

### 6. Two-pass availability

**Pass A** — primary TLD (`.com`):

```bash
bash "$SKILL/scripts/check-domains.sh" --header sld1 ... sld20 --tlds com
```

Keep `likely_available` and `unknown`. Drop `likely_taken` (list under Taken/skipped).

**Pass B** — secondary TLDs for Pass A survivors only (max 15):

```bash
bash "$SKILL/scripts/check-domains.sh" --header sld1 ... --tlds io,co
```

**TLD probes** (in script): `.com/.net/.org` → RDAP then DNS; `.io/.co/.dev/.app` → DNS (+ NS for parked) then RDAP.

| note | Meaning |
| --- | --- |
| `may_be_parked_or_reserved` | DNS/NS exists — parked, live, or **yours** |
| `nxdomain_only_verify_at_registrar` | No DNS — promising, not proof |
| `check_manually` | Probe failed — use live-check links |

**Final taste adjust:** `likely_available` +12, `likely_taken` −20, `unknown` −2.

Prefer listing `.com` in Top picks; show `.io`/`.co` when stronger or `.com` taken.

### 7. Collision on finalists

```bash
python3 "$SKILL/scripts/score-collision.py" --header \
  --competitors "{user list}" \
  --seeds-file "$SKILL/references/competitor-seeds-health.txt" \
  sld1 sld2
```

Drop **high** unless taste ≥70 and user wants stretch options. Always disclaimer: *not trademark clearance.*

### 8. Live-check links

| Registrar | URL |
| --- | --- |
| Cloudflare | `https://domains.cloudflare.com/?domain={domain}` |
| Namecheap | `https://www.namecheap.com/domains/registration/results/?domain={domain}` |
| Porkbun | `https://porkbun.com/checkout/search?q={domain}` |

## Output format

```markdown
# Domain shortlist — {idea} ({vibe} vibe)

> Collision scan is heuristic only — not legal trademark clearance.

## Existing name
**{domain}** — {status} ({note}). **Keep** / **switch** / **backup** — because …

**{n}** of **{limit}** likely available (verify before buying).

## {Style}
| Domain | Taste | Avail | Collision | Say aloud | Why | Risk | Check |
| --- | ---: | --- | --- | --- | --- | --- | --- |

## Top picks
1. **name.com** — rationale; dinner-party: "…"

## Taken / skipped
- `name.com` — likely_taken

## Not included
Registrar checkout · trademark · social handles
```

## Quality bar (Top picks)

A top pick must:

1. Score ≥75 after availability adjust (or ≥82 if `unknown`)
2. Collision ≤ medium
3. Pass say-aloud without explanation creep
4. `likely_available` on at least one preferred TLD
5. Fit vibe — for premium/classy products, prefer abstract/compound over literal SEO

## Failure modes

| Situation | Action |
| --- | --- |
| Missing `idea` | Ask user |
| All `.com` taken | Pass B emphasis; widen abstract coinages |
| RDAP/DNS disagree | Report both; live-check |
| Existing domain is strong | Recommend keep; position others as backups |

## Out of scope

Purchase flow, registrar/trademark/social APIs, saved lists, alerts, backend Worker.