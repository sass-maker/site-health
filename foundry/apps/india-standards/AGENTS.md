# India Standards agent instructions

- Read `PROJECT_STATUS.md`, `PRODUCT.md`, and `DESIGN.md` before broad work.
- Keep all estimates explicit about their data mode: `demo` or `official`.
- Never present generated demo records as PLFS or NFHS observations.
- Preserve the product exclusions in `PRODUCT.md`; do not add dating-success,
  attractiveness, caste/community, substance-use, obesity, or city filters.
- Use `pnpm`. Run `pnpm test` before the broader `pnpm check`.
- Keep the database local. Do not add MotherDuck, cloud storage, telemetry, or
  production deployment configuration without explicit approval.
- Do not commit generated DuckDB files.
