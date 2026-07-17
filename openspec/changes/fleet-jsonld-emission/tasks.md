# Tasks: fleet-jsonld-emission

- [x] 1. Extract shared registry helpers to `fleet-ops/scripts/lib/registry.mjs`
      (loadRegistry, productOrigin preference chain); consume from
      indexnow-submit.mjs and agent-index-audit.mjs. Verify: both scripts'
      `--dry-run`/`--all` output unchanged.
- [x] 2. Add `buildJsonLd(product, registry)` + unit-style check script
      (`node fleet-ops/scripts/apply-agent-surfaces.mjs --jsonld --dry-run`)
      printing per-product JSON. Verify: JSON.parse on all 24 outputs.
- [x] 3. Add `headFile` (+ optional `schemaType`, `sameAs`) to registry for the
      12 non-opennext products; verify each path exists on disk.
- [x] 4. Implement marked-block injection + post-write safety checks
      (parse-back, head balance, restore-on-fail).
- [x] 5. Pilot: codevetter — remove duplicate hand-written blocks, inject,
      build the site locally, validate with Google Rich Results test HTML.
- [x] 6. Roll out to remaining head-file products, one commit per repo;
      re-run `--dry-run` to confirm idempotence (zero diff on second run).
- [ ] 7. opennext products: emit `fleet-ops/out/jsonld/<id>.html` snippets;
      insert into each Next layout by hand; commit per repo.
- [ ] 8. Add reported `jsonld` check to agent-index-audit.mjs; run `--all`.
- [ ] 9. Docs: one section in `fleet-ops/docs/agent-indexing-standard.md`
      (canonical home); pointer from geo-dr-outcomes.md. Update
      PROJECT_STATUS.md entries on ship; archive this change.

Note: file writes land in product repos; production deploys remain manual per
fleet policy — JSON-LD goes live per product at its next deploy.
