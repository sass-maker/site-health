# Live priority qualification — 8 September 2026

The guest workflow is verified on the hosted product in fresh mobile Chromium and WebKit browsers at the source and Worker version recorded in `release.json`. This does not qualify signed-in owner use.

Actual seven-step onboarding created a synthetic local possibility. An injected IndexedDB transaction abort after request success reproduced the old false-save defect. The deployed repair shows an alert, retains the draft, allows retry and preserves earlier items. Completion and deletion survive reload. These journeys used no onboarding fixture or API interception and emitted no application POSTs. Both mobile layouts fit the viewport; the included WebKit screenshots were visually inspected.

Google handoff now succeeds, but the actual provider screen rejects the canonical callback with `redirect_uri_mismatch`. The OAuth client must retain existing entries and authorize `https://live.significanthobbies.com/api/auth/callback/google`. Signed-in saving, isolation, synchronization and Hub continuity remain unverified.

A post-deploy `/hobbies` cache hit referenced six removed JavaScript assets. Build-specific cache repair 640c7e9 passed CI and is deployed at 100% traffic. Actual `/hobbies` MISS and HIT both resolve all 20 scripts. The HIT response unexpectedly raised browser max-age to 14400 seconds. Follow-up 9a4c9d1 passed quality and browser CI, was deployed at 100% traffic, and now returns max-age=0 on both MISS and HIT. `/hobbies`, `/login` and `/find-your-hobby` return 200 with every referenced script available on both requests. Mobile Chromium and WebKit guest journeys were repeated successfully on this final source. See `cache-final.json`. An extra `/quiz` probe was an invalid route assumption (404), not a missing product route; the quiz lives at `/find-your-hobby`.

GitHub deployment failed its credential-presence gate before publishing. Existing local CLI authentication successfully released the storage and origin repairs without reading or copying credentials. This is separate from restoring GitHub deployment automation.

The open owner-use checklist is [Live issue 14](https://github.com/Significant-Hobbies/live/issues/14).
