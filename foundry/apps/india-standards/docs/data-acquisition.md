# Official data acquisition

Last checked: 2026-07-27

The application database stores only validated aggregates. Authorized survey
files are controlled local ETL inputs under `data/sources/`, which is
gitignored. Do not commit, redistribute, or expose person-level files through
the application.

## Acquisition status

| Source | Public files acquired | Person-level data | Status |
| --- | --- | --- | --- |
| PLFS 2025 | Layout, schedules, field manuals, code list, README, and the official `PLFStxt2csv2025.zip` helper | Not yet | MoSPI requires a free portal login for study data |
| NFHS-5 2019–21 | Public survey reports and dataset inventory are available | Not yet | DHS registration, project request, and approval required |

The PLFS helper downloaded from the official catalog is a ZIP containing a
Windows PyInstaller executable. It passed ZIP integrity checks and has SHA-256:

```text
d4ed5924fdbd6c42c662082b49c6836ab50d5245fe06071b06cbf56fec9ee6f6
```

It was inspected as an archive and was not executed. It contains the conversion
application, not the protected PLFS person-level files.

## PLFS 2025

Study:
<https://microdata.gov.in/NADA/index.php/catalog/284>

Data access:
<https://microdata.gov.in/NADA/index.php/catalog/284/get-microdata>

The data-access page requires the user to log in or register. After access,
download the study's household/person files for all applicable first-visit and
revisit periods into:

```text
data/sources/plfs-2025/microdata/
```

Do not run the supplied Windows converter. The importer should read the source
text files directly using the official layouts, keeping first-visit and revisit
records distinguishable until the panel and earnings rules are validated.

## NFHS-5

Dataset inventory:
<https://dhsprogram.com/data/dataset/India_Standard-DHS_2020.cfm?flag=0>

Registration:
<https://dhsprogram.com/data/new-user-registration.cfm>

Access instructions:
<https://dhsprogram.com/data/Access-Instructions.cfm>

For the smallest adult-height acquisition, request the All-India Stata recodes:

- `IAIR7EDT.ZIP` — Individual Recode for eligible women.
- `IAMR7EDT.ZIP` — Men's Recode for eligible men.

Place approved downloads in:

```text
data/sources/nfhs-5/microdata/
```

The importer must verify the survey-specific codebook before relying on
standard candidates such as age, state/region, urban/rural area, height, sample
weight, cluster, and stratum. Weight scaling and complex-survey design must be
validated against the NFHS report.

Suggested access request:

> Project title: India Standards Calculator — aggregate demographic estimates
> with cross-survey height modelling.
>
> Purpose: Produce non-identifying aggregate conditional height distributions
> by gender, age band, State/UT, and urban/rural area for an educational Indian
> demographic calculator. The calculator will combine these aggregates with
> separately licensed PLFS demographic aggregates. It will not redistribute
> microdata, expose record-level output, identify respondents, predict dating
> success, or make city-level claims. Source files will remain in controlled
> local storage; the runtime product will contain only aggregate model
> parameters, support counts, and uncertainty bounds.

The account holder must supply their own identity, organization, and legitimate
research-purpose details and accept the applicable terms. Do not share DHS
credentials or downloaded microdata with the application repository.
