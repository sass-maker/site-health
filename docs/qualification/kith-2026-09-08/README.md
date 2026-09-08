# Kith priority qualification — 8 September 2026

## Download commit recovery — build 10

Kith source `a225208055cd236b0d2efb2f498284232617827b` pins PersonalSyncKit
`e52fc1cffbb86b4a04f10ec2799f5bb7ed024b17`. The new apply callback commits
downloaded people and notes before the shared coordinator advances its cursor.
The coordinator serializes overlapping attempts; bookkeeping actors publish
their new in-memory state only after atomic file persistence succeeds.

Four shared bookkeeping regressions failed before repair. The application-save
regression also reproduced a skipped download after reopening sync state.
All 25 Swift tests and 53 Worker tests passed in
[shared-package CI 34242998549](https://github.com/Significant-Hobbies/significanthobbies/actions/runs/34242998549).
Coverage includes failed local apply/restart, partial multi-page download,
cursor-write failure after app commit, concurrent sync and failed state writes.

Kith's native integration test injects a failed app-file write, verifies that
the cursor remains zero, retries the same person and note, reopens the local
document and verifies replay creates no duplicates. The complete local gate
passed 19 unit tests, 8 UI tests and unsigned Release compilation. Local result:
`Test-Kith-2026.09.08_20-41-35-+0530.xcresult` in `/tmp/kith-ios-derived/Logs/Test/`.
[Exact-source native CI 34243385917](https://github.com/Significant-Hobbies/kith/actions/runs/34243385917)
passed all 19 unit tests, 8 UI tests and Release compilation. All fault injection
uses synthetic records and temporary files.

Build 10 has not been installed or distributed. Build 8 remains the last
verified phone installation. Physical signed-in synchronization is unqualified.
The return-only shared sync API remains deprecated; other consumers must migrate
before they gain the app-commit guarantee. See
[Hub issue 155](https://github.com/Significant-Hobbies/significanthobbies/issues/155).

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

## Current phone installation

Build 10 was built with task-local stable Xcode 26.6, its bundle identifier/version inspected, and `codesign --verify --deep --strict` passed. XcodeBuildMCP CLI 2.7.0 device installation returned `SUCCEEDED` on the connected iPhone. The fresh launch was denied with CoreDeviceError 10002 / FBS Locked. This replaces the earlier last-installed-build statements above; hands-on use, real-account round trips and public distribution remain unqualified. No owner records were edited.

The combined build-and-run tool labeled the overall attempt “Build failed,” but the build log explicitly reports `BUILD SUCCEEDED`; its diagnostic identifies the failure as the locked-device launch. A separate installation receipt confirmed success, so build, installation and launch are recorded independently. The main checkout remains clean; later README-only documentation updates do not change the installed binary.

## Build 11: durable deletion recovery

Source `5f2fa818c2790b8bb7420780fd048573bf452bba` repairs a reproduced restart failure: an old Hub download restored a deleted note or a deleted person with their notes after the only durable local IDs had been removed. Two synthetic tests failed with three assertions before repair (`swift_package_test_2026-09-08T17-27-56-933Z_pid50013_0353d1ba.log`).

Deletion markers now commit in the same atomic document. Reconnect reconstructs delete operations after a stopped task or failed outbox write; fingerprints avoid duplicate staging. Older Hub records cannot resurrect deleted IDs, and previously unseen notes for a deleted person acquire their own markers. iCloud document selection and writes merge retained markers instead of dropping them with an older snapshot. Sync queues the saved current document, and conflicts retry at learned server versions with a three-pass bound.

All 25 core/app tests pass in a temporary Mac harness using actual app/core/shared sources; only temporary-file iOS protection flags are omitted on that host. The first full native run failed an unstable serialized-dictionary comparison; the assertion now verifies IDs and whole-second dates. The final repo-local `ios/scripts/check.sh` passed unit/UI tests and unsigned Release with stable Xcode 26.6 on the configured simulator `127D7C7E-7BE8-4E38-BA9B-778770E01577`. This simulator worked through the explicit repository destination despite earlier discovery-tool availability reports. Production iOS file protection remains unchanged.

[Exact-source CI 34258378181](https://github.com/Significant-Hobbies/kith/actions/runs/34258378181) passed its native test and Release gate. Signed build 11 was verified with codesign and installed successfully using XcodeBuildMCP. Its fresh launch was denied with CoreDeviceError 10002 / FBS Locked. Actual phone deletion/restart, real signed-in isolation/convergence and public distribution remain unqualified in issue 27. No owner records or cloud provider settings were changed by the synthetic tests. Shareability stays false.

## Landing copy checkpoint

ios-landings source `61118ebcf20539d9defb7b494138adab913236ec` removes stale current-source build 7 claims from the private beta pages. The Kith-specific and full factory checks passed, as did exact-source CI 34259137764. Publication has not occurred: the deploy guard recognizes the Kith target but reports `unknown: no successful source-backed build/test push workflow`. No bypass or domain/provider configuration change was made.
