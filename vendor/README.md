# Collection package

Site Health consumes the installable `@saas-maker/collect` 0.3.1 package from
SaaS Maker, rather than importing another checkout's source files.

- Source: `sass-maker/saas-maker`, commit `7ec0ac86482f85596284f53944c04ec98d20b9bb`, `tooling/collect`.
- SHA-256: `d105b7158152fa69c532b654325be9d3bf98a95af2176e3ab1d87417b183f829`.
- License: MIT, with original Slow SERP attribution retained in the package.
- The archive contains public code and declarations only, never collected data,
  Chrome profiles, caches, logs or credentials.
- The 0.3.0 archive remains checked in for rollback.

To update, run the package's tests, pack the intended version with
`pnpm --dir tooling/collect pack --pack-destination <site-health>/vendor`,
update the dependency and this source record, then regenerate the consumer
lockfile and run the frozen install and Site Health checks.
