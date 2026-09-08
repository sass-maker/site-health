# Kith priority qualification — 8 September 2026

Source 59f4e313792f24389f1ba95d72dfdef96c07280e prepares build 8. Two regression tests failed against the previous source: failed writes reported a saved person and dismissed the editor, and a failed load allowed mutation over an unreadable document. The repair waits for atomic local persistence before publishing state, closing editors, advancing onboarding or enqueueing Hub changes. Local transactions serialize against the latest committed document, including incoming sync changes. Editors retain drafts and display errors; unreadable files get a retry surface.

Five focused regressions now pass: failed person save/retry, failed load preservation, note/deletion failure and retry with prior records, concurrent saves, and onboarding commit gating. All filesystem faults are injected into temporary synthetic documents with cloud and Hub connections disabled. The complete native gate passed 9 core, 8 app and 8 UI tests plus unsigned Release compilation. Exact-source [native CI 34210896238](https://github.com/Significant-Hobbies/kith/actions/runs/34210896238) also passed. Existing UI journeys use demo documents; they do not establish real phone persistence or signed-in sync.

Build 8 was development-signed, verified with codesign, and installed on the connected iPhone. Launching the newly installed build still failed with CoreDeviceError 10002 / FBS Locked. Physical add-person/note/restart/edit/delete and optional account/sync journeys remain unqualified. No TestFlight or public distribution is implied.

[Issue 27](https://github.com/Significant-Hobbies/kith/issues/27) retains the owner-use checklist. Site Health's old ignored-Actions policy has been corrected to active in accordance with the owner's explicit priority.
