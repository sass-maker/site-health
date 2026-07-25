## 1. Build the Fleet feedback component

- [ ] 1.1 Create `fleet-ops/services/feedback/` as a self-contained pnpm
  workspace containing only the widget, inbox, API, contracts, tests, required
  configs, and retained smoke/development scripts.
- [ ] 1.2 Replace the Cockpit's single `@saas-maker/ui` import with local UI
  primitives and remove the private UI/Storybook package from the retained
  workspace.
- [ ] 1.3 Remove the Cockpit Astro marketing overlay and make the existing
  Worker serve the functional login/inbox entrypoint directly.
- [ ] 1.4 Consolidate installation, props, Pinpoint, screenshot, project-key,
  and compatibility guidance into the package README included by `npm pack`.
- [ ] 1.5 Update package metadata and relative build/deploy/smoke paths for the
  Fleet location without changing the npm name, Worker names, domains,
  bindings, or runtime contract.
- [ ] 1.6 Keep existing migration history available for production
  reproducibility while documenting that retired D1 tables are not active
  application scope.

## 2. Integrate Feedback into Fleet

- [ ] 2.1 Add the feedback component to Fleet structural and component-native
  checks.
- [ ] 2.2 Update Fleet's project registry to remove the directory and docs
  release units and represent the existing API/inbox as a Fleet-owned private
  feedback service.
- [ ] 2.3 Remove SaaS Maker from public products, spotlight membership,
  marketing programs, directory synchronization, project sites, and generated
  product artifacts while preserving unrelated `sassmaker.com` subdomains.
- [ ] 2.4 Revise the `spotlight-products` contract and synchronized profile/readme
  references so no maintained surface requires the SaaS Maker directory.
- [ ] 2.5 Update Fleet README and `PROJECT_STATUS.md` to describe the Feedback
  component and remove the standalone SaaS Maker boundary and cache blocker.
- [ ] 2.6 Update affected Fleet tests and regenerate deterministic outputs.

## 3. Reduce the standalone repository

- [ ] 3.1 Remove the showcase, Blume application, checked-in public catalog,
  hosted-doc configuration, static-site workflows, and their root scripts from
  the standalone repository.
- [ ] 3.2 Remove retained package/API/inbox source after verifying the Fleet copy
  is complete, leaving only a concise retirement README, license, and status
  pointer until repository archival.
- [ ] 3.3 Record the last known-good pre-retirement commit and rollback commands
  without creating a second status ledger.

## 4. Validate the non-destructive migration

- [ ] 4.1 Run feedback API tests and retained boundary tests from Fleet.
- [ ] 4.2 Run component typechecks plus widget and inbox production builds from
  Fleet.
- [ ] 4.3 Pack the npm package and verify the tarball contains built artifacts,
  README, license, and no private or unrelated Fleet files.
- [ ] 4.4 Run Fleet component, registry, public-product, spotlight, marketing,
  documentation, and generated-output checks.
- [ ] 4.5 Run the reduced production smoke suite against the existing API and
  app; confirm no new Worker or Cloudflare resource was created.
- [ ] 4.6 Verify both repositories contain no secrets or generated build output
  and report their exact clean/dirty state.

## 5. Finalize production retirement with explicit gates

- [ ] 5.1 After explicit npm-release approval, publish the validated feedback
  package from Fleet and upgrade active consumers.
- [ ] 5.2 After explicit deploy approval, deploy the existing API and inbox
  Workers from Fleet and prove production parity with the reduced smoke suite.
- [ ] 5.3 Audit inbound links and, after explicit DNS/config approval, redirect
  `sassmaker.com` to the npm package without creating a Worker.
- [ ] 5.4 After explicit Cloudflare deletion approval, delete only
  `saas-maker-home` and `saas-maker-packages`; keep the two existing Workers and
  all D1/R2 data.
- [ ] 5.5 After explicit repository-archive approval, archive
  `sass-maker/saas-maker` and update the package metadata or public source
  pointer chosen during release finalization.
- [ ] 5.6 Archive this OpenSpec change and update Fleet `PROJECT_STATUS.md` after
  all approved finalization steps are complete.
