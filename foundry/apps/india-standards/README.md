# India Standards

A local-only experiment for a playful, transparent India demographic standards
calculator. The interface is real; the bundled model is synthetic.

## Try it

Requirements: Node.js 22+ and pnpm 10.

```bash
pnpm install
pnpm db:seed
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

The first result must show `Test-only`, `not survey-backed`, and
`Not a population estimate`. If it does not, stop: the interface must never
imply that generated data is an official survey estimate.

## What is implemented

- Joint filters for gender, age, annual earned income, marital status,
  education, demo State/UT, and urban/rural area.
- A separate conditional height model, labelled `Modelled across datasets`.
- Weighted test ranges, two denominators, reciprocal age-cohort context, and a
  0–100 range-precision score derived from relative range width. It is not the
  probability that an estimate is correct.
- Best-effort output for sparse cells, with an increasingly wider range and an
  explicit modelled-basis notice below 30 direct matching records.
- Shareable URL state and native-share/clipboard behavior.
- Embedded DuckDB queried only from the Next.js server route.

## Data boundary

`pnpm db:seed` creates `data/india-standards.duckdb` from deterministic generated
aggregates. It does not download, reproduce, or impersonate PLFS or NFHS
microdata. The database and its WAL are gitignored.

The serving database does not need person-level survey rows. The current exact
demo cube has 249,744 joint demographic cells plus 220 height-model cells and
occupies about 20 MB locally. Authorized PLFS/NFHS files are needed only as
controlled ETL inputs to calculate validated weighted cells and uncertainty;
they are not part of the application database and are never exposed by its API.

Keeping the joint cells matters because age, income, education, marital status,
state, and urban/rural area are correlated. Storage may be reduced later only
through output-equivalent compression or aggregation validated against the
full cube—not by multiplying independent marginal percentages.

Official PLFS 2025 metadata lists 1,148,634 person cases and the joint variables
needed by this experiment, but downloading the microdata requires a portal
login. NFHS recode access must also be obtained and used under its applicable
terms. See [docs/data-contract.md](docs/data-contract.md) before replacing the
demo model.

Sources:

- [PLFS 2025 catalog and data dictionary](https://microdata.gov.in/NADA/index.php/catalog/284/data-dictionary/F2)
- [NFHS-5 India fact sheet](https://dhsprogram.com/pubs/pdf/OF43/India_National_Fact_Sheet.pdf)
- [CBDT income-return statistics, AY 2023–24](https://www.incometaxindia.gov.in/w/income-tax-return-statistics-for-assessment-year-2023-24-1)

CBDT tables are a high-income-tail sanity check only. They cannot create the
required age–gender–height joint distribution.

Current official-data acquisition status and the exact authorized download
steps are documented in
[docs/data-acquisition.md](docs/data-acquisition.md).

## Checks

```bash
pnpm test
pnpm typecheck
pnpm build
```

`pnpm check` runs all three in that order.

## Not included

No children preference, attractiveness, hair/eye colour, caste/community,
drinking/smoking, obesity, personality, city-level estimate, dating-success
probability, MotherDuck integration, cloud deployment, telemetry, or raw-data
API.
