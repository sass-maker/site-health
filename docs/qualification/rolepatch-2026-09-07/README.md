# RolePatch qualification — 7 September 2026

The current verdict is **shareable as a guest resume-tailoring experiment**.
[The export qualification](export/README.md) supersedes the historical failures
below; account and broader feature qualification remain open.

## Browser evidence

A fresh logged-out Chrome context created a synthetic resume through the UI,
saved it, reloaded it, and retained byte-exact source in browser storage. The
manual pasted-job fallback saved a synthetic job and opened the tailoring page.
Actual generation on runtime `a2e4a336` returned HTTP 500 and digest `40954145`.
[Before](tailor-before.png) shows the generic production error.

A separate seeded diagnostic used only invented job/resume content and an
`x-fleet-probe` header to limit provider logs to that request. It reproduced the
same failure. The header is diagnostic instrumentation, not ordinary guest
acceptance or an authentication bypass.

Runtime `bcab384d` now returns the expected safe failure as a serializable value
(HTTP 200 transport, unsuccessful action). [After](tailor-safe-error.png) shows
the friendly error with the original resume retained. This is **not successful
generation**. Sanitized diagnostics identify `AI_APICallError` caused by `AiError`;
no provider messages, resume text, response bodies, headers or credentials are
logged by the new diagnostic helper.

The guest cover-letter route initially returned HTTP 500 even after its local
job lookup was restored. A separately tagged GET established `EvalError: Code
generation from strings disallowed` in production: the imported scraper used
module-scope `new Function()`. Source `93ba59b` replaces that helper with literal
bundled imports; the real HTML-parser fallback regression and all 460 tests pass.
Final deployment [34140001776](https://github.com/Significant-Hobbies/rolepatch/actions/runs/34140001776) succeeded. Worker `6247f781-e933-4104-99ec-d38b4b74d505` serves exact source `93ba59bb241e02b2e11c668ec2013944a9197dcb` at 100%. The live guest route opens the synthetic job, and [mobile inspection](cover-letter-mobile.png) shows no horizontal overflow. Actual tailoring still returns the safe failure; even the adapter numeric code is absent. Rollback predecessor is `3f1e2245-f710-41f1-9c1f-6892ac247ed9` (source `bcab384d`); the pre-exercise version is `4a926a7e-2b63-470f-a56a-73ff745f282a`.

## Limits

No signed-in account, account isolation, general output-truthfulness guarantee, export,
real application, outreach, payment, or cloud-sync pass is claimed. All browser
data was synthetic; disposable contexts are closed after each qualification pass. Broad AI model
coverage remains unqualified. Mobile review scrolling is verified below.

The source still contains a separate module-scope dynamic import helper in file
import; that optional import path needs its own Worker qualification. The PDF
renderer has a Node fallback after its Worker browser-binding path. Neither
observation establishes a passing import or export journey.

Open work lives in [RolePatch #68](https://github.com/Significant-Hobbies/rolepatch/issues/68).
The error-value repair follows [Next.js expected-error guidance](https://nextjs.org/docs/app/getting-started/error-handling).

## Native AI diagnosis and bounded generation

The old default `@cf/meta/llama-3.1-8b-instruct` rejected even a one-word
request through an isolated Worker using the real remote AI binding. Its
[model card](https://developers.cloudflare.com/workers-ai/models/llama-3.1-8b-instruct/)
records retirement on 2026-05-30. This establishes the earlier provider failure;
a generic JSON Mode capability listing did not establish continued availability.

Supported Llama 3.3 70B FP8 returned valid schema-constrained JSON in 1.1 seconds.
Source `1df7f0bb` selected it and deployed successfully in
[run 34141582290](https://github.com/Significant-Hobbies/rolepatch/actions/runs/34141582290),
Worker `6fa2a6f1-40c2-4914-9bb0-ad9f3efdf5d0` at 100%. Two actual hosted
tailoring requests still reached the 90-second timeout. A direct native request
completed in 24.3 seconds but produced excessive, inaccurate change descriptions.
Timing varied across probes; an SDK adapter defect was not established.

Source `18c041f4c795af5281d6c82ef96e75c775acac3b` bounds output tokens and edit
metadata, removes the forced edit quota, restores HTML line breaks to Markdown,
and filters explanation snippets absent from the result or already present in
the original. Two real-binding SDK probes completed in 5.6 and 6.7 seconds.
Synthetic dates and 240/160 ms metrics survived, and unsupported AWS/Kubernetes
skills were omitted. These are sample observations, not general factual guarantees.
All 467 tests and the full local quality pipeline passed.

The guest export endpoint was independently requested for the synthetic saved
resume and returned HTTP 404. Source confirms it requires a signed-in user,
while the guest editor still points at that endpoint. The tailoring view has
no export control. Export remains an actual blocker, not an untested assumption.
The regular browser automation bridge failed to start; signed-in qualification
remains unavailable in this pass. No authentication bypass was attempted.

## Hosted generation recovered

[Deployment 34143940332](https://github.com/Significant-Hobbies/rolepatch/actions/runs/34143940332)
succeeded. Worker `fe163417-64ed-462a-80c5-a4b8d7cf99f5` serves source
`18c041f4c795af5281d6c82ef96e75c775acac3b` at 100%. Actual generation completed
in 6377 ms. Accept & Save persisted the exact tailored source and restored the
diff after reload. Synthetic dates, education, employer and 240/160 ms metrics
remained intact; unsupported AWS/Kubernetes skills were absent. The output
reframed API/test experience and reordered existing skills. No general factual
correctness guarantee follows from this sample.

[Desktop output](tailor-generated-desktop.png) was visually inspected. There is
no document-level horizontal overflow at 1440px or 390px. The
[mobile view](tailor-generated-mobile.png) clipped the lower diff; inspection
found a 360px hidden wrapper around 846px of content. Temporarily setting the
flex child's minimum height to zero allowed the diff to scroll to its bottom
(307px viewport, 793px content, 486px scroll offset). This browser-only check
establishes the CSS repair, not a deployed mobile pass.

The confirmed export 404 remains the largest core blocker. Rollback predecessor
for this release is Worker `6fa2a6f1-40c2-4914-9bb0-ad9f3efdf5d0` (source `1df7f0bb`).

## Final mobile release and cleanup

Source `1cf2c875a6e3ffd27dc3ea85884106e92a7a73d0` passed CI34144569758 and
Docs34144569768. [Deployment 34144865225](https://github.com/Significant-Hobbies/rolepatch/actions/runs/34144865225)
succeeded. Worker `f5303141-f245-4ad7-aa39-2ae208ea0cb2` serves the exact tag at
100%. A fresh reload confirmed the class fix with no inline style override;
ordinary wheel scrolling reached the final Skills section (307px viewport,
793px content, 486px scroll offset). [The deployed mobile result](tailor-mobile-scroll-fixed.png)
was visually inspected, with no document-level horizontal overflow or page errors.
This release changes layout and documentation; the generation receipt above
belongs to its preceding source. No redundant generation request was run.

[The synthetic input/output](synthetic-workflow.json) and [bounded AI probe results](ai-probes.json)
are retained for repeatable export qualification. The disposable browser was
closed and the local AI probe server stopped. No real application, account write,
outreach or payment occurred. Rollback predecessor is Worker
`fe163417-64ed-462a-80c5-a4b8d7cf99f5` (source `18c041f4`).

## Correction and current export verdict

The earlier direct export endpoint probe returned 404, but subsequent source
and live UI inspection confirmed that guests already had browser Print and did
not call that protected route. The 404 was expected authorization behavior, not
an observed guest UI export defect. The real missing tailored export control is
now repaired and verified; see [the final export receipt](export/README.md).
