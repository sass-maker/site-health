## 1. Preflight and Cloudflare

- [x] 1.1 Verify the existing `email-manager` Worker custom domain, target zone, and new-hostname availability.
- [x] 1.2 Attach `mail.significanthobbies.com` to the existing Worker without deploying a new script.
- [x] 1.3 Verify TLS, landing, `/app`, and `/api/health` on the new hostname while retaining the old hostname.

## 2. Canonical URL Migration

- [x] 2.1 Replace Email Manager runtime, Worker route, auth fallback, landing metadata, agent surfaces, monitoring, and public files with the new origin.
- [x] 2.2 Update current operational and product documentation, including the new exact Google OAuth callback.
- [x] 2.3 Update Fleet project, site, agent, automation, and generated public projections to the new canonical domain.
- [x] 2.4 Record Google OAuth redirect registration as a manual blocker until externally confirmed.

## 3. Fleet Catalog and Console Cleanup

- [x] 3.1 Remove Mobile Dev Cockpit and Reel Pipeline standalone project identities while preserving their system-bucket component paths.
- [x] 3.2 Make metric-family sections collapsible and give live status the success-green treatment.
- [x] 3.3 Regenerate project surfaces and verify the Console project/filter counts.

## 4. Verification and Cutover

- [x] 4.1 Run Email Manager typecheck/build and focused docs or URL checks.
- [x] 4.2 Run Fleet catalog, Founder Control, public-product, Console build, and strict OpenSpec validation.
- [ ] 4.3 After Google OAuth callback verification, detach `mail.sassmaker.com`; otherwise keep the compatibility domain and report the blocker.
