# Setline priority qualification — 8 September 2026

Source 0283a79349f0771be72715f2a140499741587693, build 8, repairs three reproduced failures: unsuccessful template writes reported success, overlapping benchmark edits lost one change, and editing after an unreadable load overwrote the original file. Local writes now serialize and expose committed outcomes. Editors retain drafts; failed workout recording or finish retains the active session, and retries survive reload without changing authored templates.

Six isolated storage regressions pass, including goal/check-in failures and explicit backup recovery. Backup preview leaves the original file untouched, confirmed restore establishes the imported document, and later edits and export work. A separate native UI test confirms that an unreadable load offers backup recovery instead of an editable initial document. That UI test uses a fixture; the filesystem regressions use actual temporary files with cloud and Hub connections disabled.

The recovery screen reuses existing import and confirmation controls and hides export of an unread initial document. Settings reads its version from the installed bundle. Automatic benchmark writes do not disable typing. Optional network-backed account restoration now follows local load and is skipped during an active workout. Incoming iCloud results cannot overwrite a document changed while the request was in flight. Real signed-in and two-device convergence remain unqualified.

The first complete test/Release run passed but missed the unchanged 80.60% coverage floor at 80.5569%. Meaningful backup and recovery UI coverage was added; the final native gate passed 182 core, 17 app and 17 UI tests, with one explicit iCloud-credential skip, a successful Release build and 80.9537% production coverage. No coverage threshold was lowered.

[Issue 77](https://github.com/Significant-Hobbies/setline/issues/77) owns the remaining device and release checklist. A development installation is not a physical-workout or public-distribution qualification.

Signed development build 8 was verified with codesign and installed on the physical iPhone. Its fresh launch failed with CoreDeviceError 10002 / FBS Locked. Workout use, interruption/restart on hardware, signed-in sync and public distribution remain unqualified. All local simulators are shut down.

CI follow-up: run 34213847193 timed out at the workout storage test, which reached the real first-use notification permission dialog on a fresh runner. Commit bdc99ddb1586c7e489c21522348378339a05503a injects a recording notifier into that test and asserts matching rest scheduling and cancellation; the app still uses its original production notifier. All six focused storage tests and the complete local gate passed again at 80.9537% coverage. Exact-source CI 34216322092 passed both general and native jobs. The phone installation remains from 0283a79; this dependency-isolation correction has not been reinstalled.

## Build 9: durable Hub downloads and preserved native history

Source `d4c3dc2a90701d6fa508eed89ee528d26b496b1e` pins PersonalSyncKit `e52fc1cffbb86b4a04f10ec2799f5bb7ed024b17`. The regression reproduced a returning Hub summary erasing a nine-step native workout. Both sync entry points now apply downloaded history through an atomic local commit before the shared coordinator acknowledges its cursor. An active workout defers that commit. Native and untagged legacy records cannot be replaced or deleted by a Hub summary.

New imports carry optional `hubRecordID` provenance, accept replay/update/delete, and cannot be exported again under a second identity. History labels them as Hub summaries with unavailable set details. Older JSON without provenance still decodes; existing legacy records are not silently reclassified.

Five new integration regressions cover detailed native history preservation, imported summary replay/update/delete without re-export, failed filesystem writes followed by cursor-zero retry and successful reopen, active-workout deferral, and legacy decoding. Synthetic transport and temporary documents exercise the real app model, local store and shared coordinator without owner data or account access.

`pnpm run check` passed. The full `pnpm quality:native` gate passed with task-local Xcode 26.6: 182 core plus 22 app tests, 17 UI tests, one explicit simulator-iCloud credential skip, and Release compilation. Coverage was 11598/14338 production lines (80.8899%), above the unchanged 80.60% floor. The xcresult is `setline-code-health-ios-derived/Logs/Test/Test-Setline-2026.09.08_21-15-14-+0530.xcresult` under the machine temporary directory.

[Product-source CI 34247640551](https://github.com/Significant-Hobbies/setline/actions/runs/34247640551) and [current-head CI 34247853312](https://github.com/Significant-Hobbies/setline/actions/runs/34247853312) both passed general and native gates. Hosted current-head logs confirm 204 unit tests, 17 passing UI tests, one iCloud-credential skip, Release compilation and 81.2247% coverage (11646/14338 lines); the 80.60% floor is unchanged. Current head `e111e2c86398b8838d995086a6475263b05eb9ea` adds only a README correction separating installed build 8 from tested build 9. Build 9 has not been installed on the phone. Build 8 remains the last verified installation; the earlier locked-device observation has not been revalidated. Real-account convergence, a physical workout and public distribution remain unqualified.

The canonical public landing returned HTTP 200 with title “Setline — Follow your training plan. Record the truth.” No landing deployment or provider configuration changed.
