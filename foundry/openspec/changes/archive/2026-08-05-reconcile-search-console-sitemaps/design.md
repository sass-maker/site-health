# Design: Search Console sitemap reconciliation

## Desired set

The canonical project registry remains the source for all maintained primary
project hosts. The root-brand contract contributes the exact ten registrable
domains. The union is deduplicated by HTTPS sitemap URL and assigned to the
closest accessible Search Console property.

## Safety boundary

The command previews by default. Mutation requires `--apply`. A deletion is
eligible only when the provider entry belongs to a selected accessible property,
is a credential-free HTTPS URL, and is absent from the complete desired set for
that property. The command never deletes properties or pages.

## Evidence

Output contains only property identifiers, sitemap URLs, action states, and
bounded provider errors. OAuth tokens are process-local and never printed or
written. A second preview after apply must contain no additions or removals.

