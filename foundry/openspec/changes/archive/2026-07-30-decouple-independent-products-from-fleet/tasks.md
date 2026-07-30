## 1. Audit

- [x] 1.1 Inspect git state, nearest agent instructions, durable status, and native release commands across every affected standalone repository.
- [x] 1.2 Record the complete tracked reverse-dependency baseline without reading secrets or production configuration.

## 2. Product Decoupling

- [x] 2.1 Remove App Health's sibling Fleet deploy-guard call while preserving its native checks, explicit production approval, and SHA-tagged manual deployment.
- [x] 2.2 Remove Setline's sibling Fleet deploy-guard call while preserving its native check and SHA-tagged manual deployment.
- [x] 2.3 Remove What It Takes to Win's sibling Fleet deploy-guard call while preserving its native readiness gate and manual Pages deployment.
- [x] 2.4 Replace required parent/private Fleet instruction dependencies across the eighteen affected agent bootloaders with complete repo-local tracked guidance.
- [x] 2.5 Update only the affected products' durable status documentation.

## 3. Fleet Boundary Enforcement

- [x] 3.1 Implement a read-only independent-product boundary scanner with explicit pass, fail, and skipped results.
- [x] 3.2 Add fixture tests for clean products, private Fleet path dependencies, private instruction links, and missing checkouts.
- [x] 3.3 Add the scanner to the relevant Fleet validation command and document the one-way orchestration boundary.

## 4. Verification and Delivery

- [x] 4.1 Run each product's smallest native standalone validation and confirm no tracked reverse dependency remains.
- [x] 4.2 Run Fleet boundary tests, project/catalog checks, strict OpenSpec validation, and diff checks.
- [x] 4.3 Commit and push each affected repository independently without deploying or staging unrelated work.
- [x] 4.4 Archive this completed change and update durable Fleet status.
