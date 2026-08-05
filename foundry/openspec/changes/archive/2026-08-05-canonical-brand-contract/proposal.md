## Why

The ten root domains currently use inconsistent public names across page titles,
headings, structured data, Fleet registries, and search queries. Those conflicts
weaken exact-brand retrieval and make ambiguous names such as Pace, High Signal,
Karte, and SaaS Maker harder for search engines to resolve.

## What Changes

- Add one Fleet-owned contract for each root domain's canonical public name and
  deliberate search aliases.
- Validate that every one of the ten domain-strength roots has exactly one brand
  contract and no alias is silently inferred.
- Teach generated structured data to emit declared `alternateName` values.
- Align affected product titles, primary headings, social metadata, and JSON-LD
  with the contract without keyword stuffing or changing product positioning.
- Add regression checks for the known Pace/HeyPace, High Signal/highsignal,
  SaaS Maker/sassmaker, PostTrainLLM/posttrainllm, and Significant Hobbies/
  SignificantHobbies variants.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `fleet-visibility-remediation`: Generated and project-owned discovery surfaces
  must resolve canonical public brand names and explicit aliases from one
  validated root-domain contract.

## Impact

- Fleet search and agent-surface configuration and validation.
- Generated SaaS Maker JSON-LD.
- Public metadata in the ten root-domain repositories where current source
  disagrees with the contract.
- No dependency, database, API, pricing, or automatic deployment changes.
