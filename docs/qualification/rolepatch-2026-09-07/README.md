# RolePatch qualification — 7 September 2026

The product remains **not shareable**. This receipt separates working guest
storage, repaired error handling, and the still-failing AI workflow.

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

No signed-in account, account isolation, tailored output, truthfulness, export,
real application, outreach, payment, or cloud-sync pass is claimed. All browser
data was synthetic and the disposable contexts were closed. Broad AI model
coverage and mobile tailoring remain unqualified.

The source still contains a separate module-scope dynamic import helper in file
import; that optional import path needs its own Worker qualification. The PDF
renderer has a Node fallback after its Worker browser-binding path. Neither
observation establishes a passing import or export journey.

Open work lives in [RolePatch #68](https://github.com/Significant-Hobbies/rolepatch/issues/68).
The error-value repair follows [Next.js expected-error guidance](https://nextjs.org/docs/app/getting-started/error-handling).
Cloudflare documents the selected model as supporting [JSON Mode](https://developers.cloudflare.com/workers-ai/features/json-mode/);
the current failure is not evidence that the model lacks that capability.
