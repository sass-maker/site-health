# Kith priority qualification — 8 September 2026

## Local startup follow-up — build 9

Source `070697d7f62cae8ce077954e9832f80b60515ed8` is pushed to main.
Inspection found that `AppModel.load()` held the root loading screen until
iCloud availability, account restoration and Hub synchronization completed.
It now publishes the opened local document and configures onboarding before
awaiting that optional network work. Sync entry points also wait for a
successfully opened local document.

The new suspended-iCloud test failed on the earlier loading behavior with
`XCTAssertFalse failed - Local use must not wait for iCloud`. With the fix,
it verifies local readiness, existing-owner orientation, editing a person,
adding a note and reopening both from disk while cloud availability is held
by a continuation. No cloud account or owner records are used in that test.
`ios/scripts/check.sh` passed 18 unit tests, 8 UI tests and unsigned Release
compilation using Xcode 27 beta 4 and the local iOS 26.5 simulator.
Local result: `Test-Kith-2026.09.08_20-21-13-+0530.xcresult` in the existing
`/tmp/kith-ios-derived/Logs/Test/` directory.

[Exact-source CI 34241153787](https://github.com/Significant-Hobbies/kith/actions/runs/34241153787)
passed all 18 unit tests, 8 UI tests and Release compilation. Build 9 has not
been installed or distributed. Build 8 remains
the last verified phone installation below. This session exposes no physical
device workflow tools, so the earlier lock observation has not been refreshed.
Physical use, authenticated synchronization and public distribution remain open.

Follow-up source inspection found a separate sync-recovery defect: pinned
PersonalSyncKit's `SyncCoordinator.synchronize` persists the pull cursor before
returning changes, while Kith commits them afterwards. If the local write fails,
the next pull can skip the unapplied records. This is recorded in issue 27 for a
shared-package regression and repair; build 9 does not fix that boundary.

## Earlier save-integrity and installation checkpoint — build 8

Source 59f4e313792f24389f1ba95d72dfdef96c07280e prepares build 8. Two regression tests failed against the previous source: failed writes reported a saved person and dismissed the editor, and a failed load allowed mutation over an unreadable document. The repair waits for atomic local persistence before publishing state, closing editors, advancing onboarding or enqueueing Hub changes. Local transactions serialize against the latest committed document, including incoming sync changes. Editors retain drafts and display errors; unreadable files get a retry surface.

Five focused regressions now pass: failed person save/retry, failed load preservation, note/deletion failure and retry with prior records, concurrent saves, and onboarding commit gating. All filesystem faults are injected into temporary synthetic documents with cloud and Hub connections disabled. The complete native gate passed 9 core, 8 app and 8 UI tests plus unsigned Release compilation. Exact-source [native CI 34210896238](https://github.com/Significant-Hobbies/kith/actions/runs/34210896238) also passed. Existing UI journeys use demo documents; they do not establish real phone persistence or signed-in sync.

Build 8 was development-signed, verified with codesign, and installed on the connected iPhone. Launching the newly installed build still failed with CoreDeviceError 10002 / FBS Locked. Physical add-person/note/restart/edit/delete and optional account/sync journeys remain unqualified. No TestFlight or public distribution is implied.

[Issue 27](https://github.com/Significant-Hobbies/kith/issues/27) retains the owner-use checklist. Site Health's old ignored-Actions policy has been corrected to active in accordance with the owner's explicit priority.
