## 1. Confirm the final boundary

- [x] 1.1 Search the Fleet workspace for package imports and calls to the hosted
  feedback API/inbox.
- [x] 1.2 Decide that no separate feedback backend is justified without an
  active consumer.
- [x] 1.3 Revise the OpenSpec to a backend-free package contract.

## 2. Build the package-only Fleet component

- [x] 2.1 Move the widget to `fleet-ops/packages/feedback/` with its own package
  manifest, lockfile, README, license, source, and checks.
- [x] 2.2 Replace `projectId` and `apiBaseUrl` with a required `onSubmit`
  callback and a documented structured payload.
- [x] 2.3 Keep Pinpoint structured and return screenshots as local `File`
  objects without uploading them.
- [x] 2.4 Remove API clients, public-board types, project-key concepts, and
  hosted-service URLs from the package.
- [x] 2.5 Update the npm README and bump the unreleased package version for the
  breaking pre-1.0 change.

## 3. Remove hosted feedback from Fleet source

- [x] 3.1 Remove the Cockpit/inbox application, API Worker, migrations,
  contracts, service tests, smoke/development scripts, and deploy configs.
- [x] 3.2 Remove Fleet Feedback as a deployed project and API probe.
- [x] 3.3 Update Fleet component checks, README, and `PROJECT_STATUS.md` for a
  package rather than a service.
- [x] 3.4 Remove maintained documentation and automation references that still
  describe `api.sassmaker.com` or `app.sassmaker.com` as active Fleet surfaces.

## 4. Validate and secure the result

- [x] 4.1 Run package typecheck, build, lint, and pack verification.
- [x] 4.2 Verify the tarball contains README, license, and built package files
  only.
- [x] 4.3 Run Fleet registry, component, spotlight, marketing, and test suites.
- [x] 4.4 Verify active source has no backend URL, Worker, D1/R2, auth, project
  key, or generated build artifact.
- [x] 4.5 Record exact Fleet and SaaS Maker git state.

## 5. Finish repository and external cleanup

- [x] 5.1 Secure the Fleet package changes in its canonical remote.
- [x] 5.2 Remove the standalone SaaS Maker local checkout after Fleet contains
  the package and rollback history is recorded.
- [ ] 5.3 Delete `sass-maker/saas-maker` as authorized. Blocked because the
  current GitHub CLI token lacks repository admin and `delete_repo` scope.
- [ ] 5.4 Delete `saas-maker-home`, `saas-maker-packages`, `saasmaker-api`, and
  `saasmaker-dashboard` only with exact Cloudflare authorization.
- [ ] 5.5 Decide D1/R2 data retention before deleting stored feedback or images.
- [ ] 5.6 Publish the callback-only package and update npm metadata only with
  explicit release approval.
- [ ] 5.7 Archive this OpenSpec change and update Fleet status after all chosen
  external actions are verified.
