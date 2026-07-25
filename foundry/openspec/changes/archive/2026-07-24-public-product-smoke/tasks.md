## 1. Skill scaffold

- [x] 1.1 Initialize the `public-product-smoke` Fleet skill with current skill metadata.
- [x] 1.2 Write the bounded browser workflow, classifications, stopping rules, and report contract.
- [x] 1.3 Add the production-safe interaction policy reference.

## 2. Canonical manifest

- [x] 2.1 Implement a dependency-free manifest builder over the Fleet project registry.
- [x] 2.2 Support project IDs, live public-domain filtering, policy exclusions, and explicit `--exclude`.
- [x] 2.3 Add representative manifest self-tests for default and Fleet Workspace-excluded scopes.

## 3. Fleet integration

- [x] 3.1 Route public usability requests from the `site-health` parent skill.
- [x] 3.2 Route fleet-wide public journey requests from the `fleet-ops` parent skill.
- [x] 3.3 Generate matching `agents/openai.yaml` metadata.

## 4. Verification and handoff

- [x] 4.1 Validate the OpenSpec change and the new skill folder.
- [x] 4.2 Run the manifest for the current repair scope excluding Fleet Workspace.
- [x] 4.3 Archive the completed OpenSpec change and update Fleet Workspace product status.
