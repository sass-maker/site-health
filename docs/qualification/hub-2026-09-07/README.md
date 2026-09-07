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
