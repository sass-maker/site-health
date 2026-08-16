# Shared iOS landings repo

## Requirements

### Requirement: Separate sites from one codebase

The factory SHALL build one static site per product id (`kith`,
`setline`, `anchor`, `motion`, `indulge`). Each build SHALL use that
product’s `site.config.ts`, screenshots, canonical URL, privacy page,
and support page.

#### Scenario: Unknown product is rejected

- **WHEN** `PRODUCT` is set to a value that is not one of the five ids
- **THEN** the build fails before writing output

### Requirement: No combined storefront

The factory SHALL NOT emit a homepage that lists all five apps as one
product. Each `dist/<id>` SHALL name only that product.

#### Scenario: Kith build stays Kith

- **WHEN** `PRODUCT=kith` is built
- **THEN** `dist/kith/index.html` includes “Kith” and does not present
  Setline, Anchor, Motion, or Indulge as the page product

### Requirement: Apple and agent surfaces stay gated

Each product site SHALL keep the template’s TestFlight/App Store gates
and SHALL ship `/privacy/`, `/support/`, `/llms.txt`, `/index.md`, and
`/api/ai`.

#### Scenario: No invented TestFlight URL

- **WHEN** `PUBLIC_TESTFLIGHT_URL` is missing
- **THEN** no `testflight.apple.com` href is emitted
