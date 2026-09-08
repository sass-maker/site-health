# Kinetic release and live verification — 8 September 2026

Production was two commits behind the account-scoped mailbox-cache repair. The isolated mailbox verifier passed with real browser IndexedDB and synthetic messages/embeddings, including colliding IDs across accounts, separate cursors and a delayed prior-account response. The checked repair was published, then live route testing found a separate regression in public discovery: GET session/mailbox requests were intercepted with 404, and the advertised OpenAPI route fell through to static assets.

Three tests against the exported Worker entry point reproduced those failures. The repair limits discovery to public documents and its catalog, preserves product API routing, and places discovery before static fallback. Full quality passed 103 tests and unchanged code-health/coverage gates; 45 Markdown files passed validation. Current runbooks use `pnpm run deploy` because bare `pnpm deploy` invoked pnpm's separate built-in command and failed before publication.

Exact-source CI 34223394319 passed. Worker version c8900fd9-0d92-4973-b2dd-7e1509427081 is tagged 210e6ad02d9ea4e1e6ee8daae9e1addc103b6de6 and receives 100% traffic in deployment 1cd0620c-d582-4262-a00c-070fda259190. The separate logged-out browser context returned health/session/catalog/OpenAPI 200 and mailbox 401. OpenAPI parsed as 3.1.0. The public hero was visually inspected at 390px; the rendered Terms route had matching 390px viewport/document width.

The canonical Google button reaches the account form without a redirect mismatch. Owner sign-in is pending in the retained Kinetic tab. This does not prove OAuth callback completion, mailbox search, account switching, sender/digest workflows or real ONNX model quality. No mailbox contents or unsubscribe actions were accessed. Test tabs were closed; the owner sign-in tab remains. Shareability stays false and issue 54 remains open.

## Browser model loading repair

Source 9e4cca9c956311946b5aa3659065568c4068a139 supersedes the release above.
CI 34225523012 passed, including 104 tests and the production build. The app CSP
previously blocked the current HF CDN redirect and locked ONNX runtime. The
repair allows the observed host, exact runtime CDN path and cached blob factory.
The repeatable local browser verifier passes actual 384-dimensional normalized
embeddings with zero CSP violations. No dependency or auth configuration changed.

Worker c94fa462-d536-4080-a12a-f51976d25e90 carries that exact source at 100% in
deployment c8acbcec-3c3e-4e33-884e-a871aaf4d56e. A fresh production browser confirms
/app 200 and the repaired policy; health/session 200 and mail 401. Importing the
deployed Transformers bundle and using the app's MiniLM fp32 configuration on
synthetic text also passed: 384 finite dimensions, norm 0.9999997353, no CSP
violations, 6195 ms loading plus inference. This verifies the deployed library
and policy, not the signed-in indexing UI or real mailbox search. Model disposed
and test tab closed; owner login tabs preserved.

The bounded eight-message comparison found three missed flight queries out of
ten with MiniLM. BGE small q8 ranked all ten intended targets first with a smaller
model download, but this is not a broad benchmark. Production model unchanged;
model-tagged cache migration and wider retrieval qualification remain necessary
before replacement. See the owning repository's
[model evidence](https://github.com/Significant-Hobbies/email-manager/blob/9e4cca9c956311946b5aa3659065568c4068a139/docs/knowledge/learnings/browser-model-2026-09-08.md).
