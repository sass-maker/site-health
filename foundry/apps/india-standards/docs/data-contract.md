# Survey data contract

The local app uses the same serving boundary intended for a future official-data
pass: a demographic aggregate cube plus a separate conditional height model.
Official source files are never served to the browser.

Authorized person-level files are controlled ETL inputs, not application
storage. After validation, the serving artifact contains joint weighted cells,
uncertainty bounds, support counts, and source metadata only. The raw files may
be retained or removed according to their license and the reproducibility
policy of the data environment; the product does not depend on them at runtime.

## Source manifest

Every imported dataset must record:

| Field | Meaning |
| --- | --- |
| `data_mode` | `demo` or `official` |
| `source_name` | Survey and file/recode name |
| `source_year` | Survey reference period |
| `source_sha256` | Local input checksum; never the source file itself |
| `row_count` | Imported rows before exclusions |
| `eligible_row_count` | Rows contributing to aggregates |
| `weight_variable` | Exact source weight/multiplier field |
| `created_at` | Import time |
| `validation_status` | `pending`, `passed`, or `failed` |

The UI may say `Survey-backed` only when every active manifest row is
`official`, authoritative, and `passed`. The server fails closed if a database
claims official mode without those fields.

## PLFS normalized fields

| Normalized field | PLFS 2025 metadata candidate | Rule |
| --- | --- | --- |
| `gender` | `sex` | Preserve published codes and labels |
| `age` | `age` | Whole years; enforce the app's supported range |
| `marital_status` | `marst` | Map only documented categories |
| `education` | `gedu_lvl` | Version the mapping table |
| `state` | `st` | State/UT only; discard district for product output |
| `area` | `sec` | Urban/rural |
| `regular_earnings` | `ern_reg` | Confirm reference period and annualization |
| `self_employed_earnings` | `ern_self` | Confirm reference period and annualization |
| `annual_earned_income` | derived | Sum compatible earned-income components only |
| `survey_weight` | `mult` | Apply the published multiplier convention |

The real importer must verify earning reference periods from the schedule and
methodology before annualizing them. Missing versus zero income must remain
distinct during validation.

## NFHS height model fields

Normalize gender, eligible age, State/UT, urban/rural area, measured height,
sample weight, cluster, and stratum. Enforce the published eligible age ranges:
women 15–49 and men 15–54. App ages outside those bounds require an explicit
extrapolation policy and a wider range; they must not silently inherit the
nearest band.

Height probabilities are estimated by gender, age band, State/UT, and area.
Sparse cells must back off in this order:

1. State + area + age band.
2. State + age band.
3. National + area + age band.
4. National + age band.

Every back-off step widens the returned range, lowers its numeric
range-precision score, and is disclosed in the API response.

## Aggregate serving tables

`demographic_cube` contains only joint cells and their unweighted counts,
weighted estimates, and bootstrap bounds. `height_model` contains conditional
distribution parameters/probabilities, sample counts, and bootstrap bounds.

The cube intentionally preserves the joint dimensions rather than multiplying
independent marginals. With the MVP buckets, exact ages, and current State/UT
groups, the deterministic demo contains 249,744 demographic rows and 220 height
rows in a roughly 20 MB DuckDB file. Storage optimization is secondary to
accuracy and coverage: compression, narrower physical types, or coarser
pre-aggregation is acceptable only when representative outputs and intervals
remain unchanged within the documented tolerance.

The estimate API returns only:

- rounded count range;
- two denominator comparisons;
- unweighted matching count;
- height probability and model label;
- numeric range-precision score, formula inputs, and reason;
- data mode and source years.

It never returns source rows, record identifiers, district/city output, or
restricted variables.

## Required validations before official mode

1. Input checksum and row count match the supplied files.
2. Categorical frequencies match published or portal metadata.
3. Weighted national gender/age totals are plausible and documented.
4. Earnings units/reference periods are verified against the schedule.
5. NFHS measured-height exclusions and weight scaling are documented.
6. Bootstrap ranges reproduce fixed representative fixtures.
7. CBDT income slabs are used only as a directional high-tail comparison.
8. The browser shows `Survey-backed` only after the manifest passes.

## Sparse-cell and range-precision policy

A valid filter combination always returns the model's best available range.
Cells with fewer than 30 direct records are not treated as equally reliable:
they use the documented best-effort basis, receive additional sparse-cell
widening, and disclose the direct count. Official mode must use a documented
hierarchical/back-off model when an exact cell has no direct support; it must
not invent an expected cell weight.

The 0–100 range-precision score is computed from the final interval:
`100 / (1 + relative half-width)`, rounded to a whole number, where relative
half-width is `(upper - lower) / (2 × central)`. It is a range-precision index,
not a frequentist coverage probability and not the probability that the answer
is correct. Direct-sample uncertainty, height uncertainty, sparse-cell
widening, and high-income-tail widening affect the score through the interval.
