# India Standards — PROJECT STATUS

Last updated: 2026-07-27

## Why / What

India Standards is a local experiment for an entertaining, defensible
demographic standards calculator for India. It estimates a count range and two
denominators from jointly filterable demographic data, with height explicitly
modelled across datasets.

In scope: gender, age, earned income, marital status, education, State/UT,
urban/rural, and height. Out of scope: children preferences, attractiveness,
hair/eye colour, caste/community, drinking/smoking, obesity, personality,
city-level estimates, dating probability, or mutual compatibility.

## Dependencies

- Next.js and React for the requested local web app.
- DuckDB Node Neo for the embedded local analytical database.
- Official PLFS 2025 microdata and NFHS-5 recode files are not included. PLFS
  requires a portal login; NFHS microdata access is separately governed.
- No cloud services, MotherDuck account, production config, or telemetry.

## Timeline

- 2026-07-27: Product brief and calculator-workbench design direction approved;
  local implementation started.
- 2026-07-27: Local DuckDB experiment completed with a synthetic-only accuracy
  gate, responsive browser evidence, and passing project checks.
- 2026-07-27: Sparse cells changed from categorical coverage failure to
  best-effort widened ranges; result context now uses a reproducible numeric
  range-precision score. Accuracy and filter coverage were prioritized over
  serving-cube compaction.
- 2026-07-27: Public PLFS 2025 layouts, schedules, manuals, code list, README,
  and converter helper acquired and checksummed locally. Person-level PLFS and
  NFHS files remain blocked on the respective authorized account flows.

## Products

- Local Next.js app under `foundry/apps/india-standards`.
- Local generated DuckDB database under `data/` (gitignored).

## Features (shipped)

- Local eight-filter calculator with instant server-side DuckDB queries.
- Rounded ranges, two denominators, reciprocal age-cohort context, modelled
  height disclosure, sparse-cell best-effort widening, and a numeric
  range-precision score.
- Shareable URL state, native share/clipboard fallback, and expandable
  methodology.
- Fail-closed source manifest: official mode cannot serve until source files
  are authoritative and the required validation status is `passed`.
- Test-only data is labelled beside every result and never presented as an
  Indian population estimate.

## Todo / Planned / Deferred / Blocked

1. Planned: add licensed PLFS/NFHS import mappings after the files are supplied.
2. Planned: benchmark lossless DuckDB compaction and validated pre-aggregation
   after the official cube exists; do not reduce joint-filter fidelity.
3. Deferred: MotherDuck or another hosted analytical backend until the local
   experiment demonstrates a need.
4. Blocked: person-level PLFS 2025 requires a logged-in MoSPI portal account;
   NFHS-5 requires a DHS project request and approval. Official survey-backed
   results additionally require a documented variable/weight validation pass.
