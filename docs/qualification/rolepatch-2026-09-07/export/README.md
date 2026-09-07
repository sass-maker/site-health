# RolePatch guest export qualification — 7 September 2026

**Verdict: shareable guest resume-tailoring experiment, medium confidence.**
The qualified path is pasted resume + manually pasted job description → real AI
result → human review → local save/reload → document export. It is not a claim
that account sync, every AI feature, URL scraping, file import or application
submission has passed.

## Release

- Source `d28b05a34766aced89c11d138a2d5654c9b568c2`; clean main, synced with origin.
- All 473 tests and full local quality passed. Exact [CI34146323861](https://github.com/Significant-Hobbies/rolepatch/actions/runs/34146323861)
  and [Docs34146323938](https://github.com/Significant-Hobbies/rolepatch/actions/runs/34146323938) succeeded.
- Approved [deployment34146632823](https://github.com/Significant-Hobbies/rolepatch/actions/runs/34146632823)
  succeeded. Worker `faaa3a1f-da95-4009-967c-0f3c3091dda1` at 100%, exact tag independently verified.
- Rollback predecessor: `f5303141-f245-4ad7-aa39-2ae208ea0cb2` (source `1cf2c875`).

## Actual hosted checks

A fresh disposable Chrome context created a synthetic resume through the UI,
saved it and reloaded exact source. A deliberately missing example.com posting
exposed the manual job-description fallback. The synthetic company, role and JD
were entered through the UI. Actual generation completed in **5229 ms** on the
new release. Employer, education, dates and the **240 ms → 160 ms** metric were
retained; unsupported AWS/Kubernetes experience was absent. This is a sample
review, not a universal factual-correctness guarantee.

Accept & Save persisted the result and reload restored it exactly. Real browser
download events produced plain Markdown text, HTML and Word-compatible `.doc`;
text was byte-exact. [Download hashes](downloads.json) and the
[synthetic workflow](workflow.json) retain the observed output. Word .doc is
HTML-compatible, not DOCX; opening it in Microsoft Word was not tested.

Print / Save PDF opened a standalone document. The browser's print engine
produced [the one-page tailored PDF](tailored.pdf), visually inspected in
[its rendered page](tailored-pdf.png): no clipping, app navigation or changed
facts. A separate **8075-character unsaved edit** in the guest editor produced
[a two-page PDF](long-resume.pdf). All 36 numbered items and the final
EXPORT-END-36 section survived. Both [page 1](long-page-1.png) and
[page 2](long-page-2.png) were visually inspected. The saved original remained
unchanged, confirming current in-memory export without an implicit storage write.

The PDF check exercised the real UI popup and Chromium print engine through
Playwright's PDF API. The native operating-system print dialog itself was not
automated. Users select their browser's PDF save destination; blocked pop-ups
have a tested recovery message. This is not a server PDF-download claim.

[The hosted 390px export menu](mobile-export.png) is usable after ordinary page
scrolling, without horizontal overflow. Desktop and mobile output review passed;
no page errors were recorded in the final successful session.

## Security and scope

The shared pure formatter escapes raw HTML, removes unsafe link targets and
external image rendering, constrains CSS configuration and adds a restrictive
content policy. Focused tests cover scripts, event handlers, unsafe URLs, CSS
breakout, exact current-source export, no network/storage writes and blocked
print windows. Existing authenticated server-export ownership checks remain.
No production dependencies, public render endpoint, account writes, outreach,
applications, payment or credential changes were introduced.

Correction: the earlier direct protected export endpoint returned 404, but the
guest editor already offered browser Print and did not call that endpoint.
That was expected authorization behavior, not a guest UI export failure. The
actual missing capability was exporting a tailored result.

An initial disposable Chrome process crashed with macOS display-process errors;
its incomplete post-release pass was discarded. Direct requests returned 200.
The full successful workflow above used a fresh browser with GPU disabled.
The regular signed-in browser bridge still failed to start, so account sync and
isolation remain unverified. Local Turbopack also could not decode the existing
favicon; the temporary local check used Webpack, matching production.

Remaining work is tracked in [RolePatch #68](https://github.com/Significant-Hobbies/rolepatch/issues/68)
and linked from its README. Local servers and disposable browsers are closed at
the end of this pass; only these synthetic receipts are retained.

## Final source and directory parity

The documentation follow-up at `0bd2285c4d59c77626fa39c35c02c93f8b89997b`
is live on Worker `resume-tailor`, at 100% with the exact Git SHA tag. See
`final-worker-parity.json`. SaaS Maker's checked public projection is deployed
from `e2d1bb120a697d74d249c70bc7a94a8d21314672`; all four production directory
checks pass. The browser renders RolePatch's explicit guest limits, and the
22-item JSON directory excludes Chess and Journal. See the adjacent directory
deployment receipt and actual browser snapshot.
