# iOS landing template

## Requirements

### Requirement: One config file

An iOS product landing SHALL be generable from `site.config.ts` plus
screenshots. Tokens, copy, legal sections, and TestFlight status SHALL
not be hardcoded in layouts.

#### Scenario: TestFlight stays gated

- **WHEN** `PUBLIC_TESTFLIGHT_URL` is missing or is not an Apple TestFlight URL
- **THEN** the primary CTA links to `/testflight/` and no `testflight.apple.com`
  href is emitted

### Requirement: Agent surfaces ship with the site

The built site SHALL include `/llms.txt`, `/index.md`, `/api/ai`,
`robots.txt`, and `sitemap.xml`.

#### Scenario: Home is readable as markdown

- **WHEN** an agent requests `/index.md`
- **THEN** the response is text/markdown that includes the product name
  and tagline
