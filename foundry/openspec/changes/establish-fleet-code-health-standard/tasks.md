## 1. Policy and configuration

- [x] 1.1 Add the durable Fleet Code Health Standard with scope, profiles, blocking targets, ratchets, exception rules, trend metrics, and review rubric.
- [x] 1.2 Add a validated code-health policy overlay that assigns every maintained project an explicit profile without duplicating canonical project identity.
- [x] 1.3 Correct dependency-scan lifecycle filtering so past projects are reported as excluded and never inspected as maintained.

## 2. Fleet-wide evidence

- [x] 2.1 Implement dependency-free capability discovery for package scripts, lint/format/type/test/coverage/Knip configuration, language-native manifests, and repository hygiene.
- [x] 2.2 Implement deterministic project classification and normalized `pass`, `fail`, `warning`, `unavailable`, `not-applicable`, and `excluded` coverage evidence.
- [x] 2.3 Add decision-first human output, stable JSON, project filtering, and strict exit behavior without an aggregate quality score.
- [x] 2.4 Validate profile coverage, capability ids, target values, project references, and time-bounded exception metadata.

## 3. Verification and integration

- [x] 3.1 Add focused fixtures and unit tests for every profile, lifecycle exclusion, unavailable checkout, missing required evidence, explicit equivalent, expired exception, deterministic output, and strict exit behavior.
- [x] 3.2 Add repository scripts for human reporting and strict policy validation, and include the strict coverage contract in the smallest appropriate Fleet check.
- [x] 3.3 Run focused tests, OpenSpec strict validation, project-catalog validation, and the full Fleet operational test suite.

## 4. Adoption and cleanup

- [x] 4.1 Run the code-health inventory against every maintained local project and retain explicit numeric observations through the Fleet skill-run boundary.
- [x] 4.2 Derive and publish the sequential focus → active → secondary project order from the canonical catalog, preserving owner overrides.
- [ ] 4.3 Fix small behavior-preserving Fleet-owned quality-coverage gaps found by the inventory and rerun the smallest relevant checks.
- [ ] 4.4 Complete the first independent project pass in an isolated clean worktree when needed, verify its native checks, and classify or track every residual finding before advancing.
- [ ] 4.5 Continue the same one-project-at-a-time loop until every maintained project has a current verified result or valid repository-owned baseline/follow-up.
- [ ] 4.6 Confirm no past, parked, out-of-fleet, or non-product checkout was modified by the adoption pass.

## 5. Durable handoff

- [x] 5.1 Update Fleet agent guidance and `PROJECT_STATUS.md` with the shipped code-health capability and current evidence boundary.
- [ ] 5.2 Archive the OpenSpec change so the new and modified requirements become main specifications.
- [ ] 5.3 Commit and push the isolated branch and open a pull request linked with `Closes #310`, without deploying or changing production configuration.
