# Hub owner-use readiness, 7 September 2026

Kith 7, Setline 7, Calorie 11 and Anchor 22 were built, signed with Apple
Development, and installed on the owner's iPhone. These are local development
installations, not TestFlight availability or public distribution receipts.
Physical launch was blocked by the locked phone, so actual installed journeys
and signed-in synchronization remain unverified.

Kith's repository iOS check passed. Setline's complete native gate passed with
80.6850% coverage; Calorie's complete native gate passed with 64.6356% coverage.
Both gates include unit/UI checks and Release compilation. Calorie's summary
prints obsolete hardcoded test counts, so no count is inferred from that text.
Anchor's 185 package tests and three focused iPhone simulator journeys pass;
stable-Xcode development build 22 is installed. Its full hosted native gate is
[run 34151609977](https://github.com/Significant-Hobbies/anchor/actions/runs/34151609977),
which was running when this receipt was written. Complete source evidence is in
Anchor's `docs/qualification/simple-day-2026-09-07/`.

Mac Anchor remains installed build 21 until the two additive project-reference
fields are promoted to Production CloudKit. The Apple Console is at sign-in.
Development schema is prepared; no owner records were changed or deleted.

Live remains the web application. Its qualified public quiz does not establish
signed-in mobile saving/history or the authenticated Hub journey. The Hub's
maintained lineup is Anchor, Calorie, Kith, Live and Setline; Journal is removed.

Mac build 22 now has a stable-Xcode ReleaseDirect archive and a verified
Developer ID-signed DMG with hardened runtime, no debug entitlement and
Production CloudKit entitlements. Notarization could not start because the
repository's documented `anchor-notary` Keychain profile is missing. The package
is prepared, not notarized, released or installed. See the adjacent signed
artifact receipt and sanitized release log. The local stable-Xcode Mac UI retry
also failed before runner connection; the hosted suite remains authoritative
for the outstanding synthetic interaction check.

A fresh Production schema reread still contains zero `CD_projectID` fields;
promotion remains pending. The full hosted run finished with 8/8 iPhone tests and the Watch build passing,
but 3/14 Mac tests failing. Its continue-on-error step conclusion was not a
pass; the final gate correctly failed. Interim correction run 34153521511 was
superseded by the final source checkpoint below. Setline setup/sync documentation is corrected
and pushed at `f59f01b8df9815f4536717e5ae41da437ba9fe5c`; local checks pass,
and its complete hosted native gate 34152489065 now passes.

Actual hosted iPhone simulator screenshots were exported from the passing
8-test xcresult and visually inspected: `anchor-iphone-copy-day.png` and
`anchor-iphone-scheduled-habit.png`. They show native iOS controls and the
persisted schedule, unlike the earlier macOS offscreen phone-width catalog.
Those initial captures exposed a tall Today header, corrected and retested in
the final checkpoint below. They do not prove a physical-device journey.

## Final prepared source checkpoint

The final product source is `fdde4e577567db2ced30ab8b0159dbd2acb6cfcb`; current validation
head `12bd3079a00105fa38ecd41a08649327d2c9feea` adds only Mac test/receipt corrections.
The compact-header iPhone copy/persistence test passes, the actual native
screenshot is inspected, and the rebuilt development build 22 is installed.
`anchor-iphone-compact-day.png` shows the final view. The earlier tall-header
captures remain comparison evidence, not the current layout.

The final Mac DMG is rebuilt, signed and recorded by hash in the JSON receipt;
its earlier signed iteration is preserved separately. Notarization was not
retried against the known missing profile. Production schema still needs the
two additive fields. Current hosted run: [34154195520](https://github.com/Significant-Hobbies/anchor/actions/runs/34154195520).
It supersedes interim runs started before the final layout and observed-role
correction; no full Mac pass is claimed until its final gate succeeds.


Final run 34154195520 has now failed its authoritative gate. iPhone passes
8/8 and Watch builds; Mac passes12/14, with weekday scheduling failing at
line249 and the habit-edit query timing out at line221. The mini-timer test
now passes. Inspect the saved xcresult before another correction; no new
Mac suite pass or release is claimed.
