# Proposal: Reconcile Search Console sitemaps

## Why

Fleet can submit missing project sitemaps, but it does not cover the two
root-domain identities that are not project rows and cannot remove obsolete or
duplicate Search Console submissions. That leaves a misleading green result
while Aliveville and Sarthak Agrawal are absent and retired/error entries remain.

## What changes

- Derive one desired sitemap set from the 27 canonical project hosts plus the
  exact ten root domains.
- Add a preview-first Search Console reconciliation command.
- Submit missing desired sitemaps and remove only provider entries outside the
  reviewed desired set when explicitly applied.
- Return bounded evidence for additions, retained entries, removals, and
  provider errors without retaining credentials.

## Out of scope

- Deploying websites or changing sitemap contents.
- Requesting individual URL indexing.
- Claiming pages are indexed or rankings improved.

