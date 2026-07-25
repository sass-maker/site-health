## 1. Skill Contract

- [x] 1.1 Initialize the `cloudflare-spend-guard` Fleet skill with scripts, references, and agent UI metadata
- [x] 1.2 Author the concise skill workflow, evidence hierarchy, classifications, safety boundaries, and report contract
- [x] 1.3 Add a retrieval reference for current billing, usage, pricing, attribution, and permission fallbacks

## 2. Deterministic Helpers

- [x] 2.1 Implement a credential-free scanner for tracked Fleet Cloudflare cost surfaces and project mappings
- [x] 2.2 Implement a credential-free normalizer for FOCUS-style Cloudflare billable-usage JSON
- [x] 2.3 Add focused fixtures and Node tests for configuration exposure, missing cost fields, mixed units, and invalid input

## 3. Fleet Integration

- [x] 3.1 Route Cloudflare spend and optimization requests from the `fleet-ops` parent skill
- [x] 3.2 Update Fleet skill discovery documentation and standards snapshots
- [x] 3.3 Update root `PROJECT_STATUS.md` after the completed skill is verified and archived

## 4. Verification

- [x] 4.1 Run helper tests, skill validation, capability catalog doctor, OpenSpec strict validation, and diff checks
- [x] 4.2 Forward-test the skill against a realistic permission-limited billing audit without exposing credentials or mutating Cloudflare
- [x] 4.3 Archive the completed OpenSpec change and verify the resulting main specification
