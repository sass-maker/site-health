# Collection package

Site Health consumes the installable \`@saas-maker/collect\` 0.3.0 package from
SaaS Maker, rather than importing another checkout's source files.

- Source: \`sass-maker/saas-maker\`, commit \`a7a9b552\`, \`tooling/collect\`.
- SHA-256: \`af5bee8c9324b9a39efeb1fb7b05b5b59c2aad293afebf8437e6aea523a3e6d2\`.
- License: MIT, with original Slow SERP attribution retained in the package.
- The archive contains public code and declarations only, never collected data,
  Chrome profiles, caches, logs or credentials.

To update, run the package's tests, pack the intended version with
\`pnpm --dir tooling/collect pack --pack-destination <site-health>/vendor\`,
update the dependency and this source record, then regenerate the consumer
lockfile and run the frozen install and Site Health checks.
