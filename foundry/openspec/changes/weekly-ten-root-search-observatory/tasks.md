## 1. Scheduled contract

- [x] 1.1 Add a root-contract completeness validator for exactly one same-date observation per active query
- [x] 1.2 Expose the validator through an explicit recorder mode without changing generic/historical recording
- [x] 1.3 Update the weekly prompt, skill protocol, job policy, and cron documentation to use only the canonical active root contract

## 2. Verification

- [x] 2.1 Add focused tests for a valid 40-query batch and missing, extra, duplicate, mixed-date, historical, and rewritten entries
- [x] 2.2 Verify legacy generic validation/report behavior remains intact
- [x] 2.3 Run targeted tests, Fleet contracts, cron portability checks, and strict OpenSpec validation

## 3. Delivery

- [ ] 3.1 Archive this OpenSpec change and update `PROJECT_STATUS.md` with durable shipped truth
- [x] 3.2 Record the completed Fleet skill run if the installed recorder is available
- [ ] 3.3 Commit, push, and open a pull request with `Closes #192`
- [x] 3.4 Confirm whether the installed weekly runner's configured checkout will contain the merged revision; do not modify local cron
