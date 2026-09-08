# Setline priority qualification — 8 September 2026

Source 0283a79349f0771be72715f2a140499741587693, build 8, repairs three reproduced failures: unsuccessful template writes reported success, overlapping benchmark edits lost one change, and editing after an unreadable load overwrote the original file. Local writes now serialize and expose committed outcomes. Editors retain drafts; failed workout recording or finish retains the active session, and retries survive reload without changing authored templates.

Six isolated storage regressions pass, including goal/check-in failures and explicit backup recovery. Backup preview leaves the original file untouched, confirmed restore establishes the imported document, and later edits and export work. A separate native UI test confirms that an unreadable load offers backup recovery instead of an editable initial document. That UI test uses a fixture; the filesystem regressions use actual temporary files with cloud and Hub connections disabled.

The recovery screen reuses existing import and confirmation controls and hides export of an unread initial document. Settings reads its version from the installed bundle. Automatic benchmark writes do not disable typing. Optional network-backed account restoration now follows local load and is skipped during an active workout. Incoming iCloud results cannot overwrite a document changed while the request was in flight. Real signed-in and two-device convergence remain unqualified.

The first complete test/Release run passed but missed the unchanged 80.60% coverage floor at 80.5569%. Meaningful backup and recovery UI coverage was added; the final native gate passed 182 core, 17 app and 17 UI tests, with one explicit iCloud-credential skip, a successful Release build and 80.9537% production coverage. No coverage threshold was lowered.

[Issue 77](https://github.com/Significant-Hobbies/setline/issues/77) owns the remaining device and release checklist. A development installation is not a physical-workout or public-distribution qualification.

Signed development build 8 was verified with codesign and installed on the physical iPhone. Its fresh launch failed with CoreDeviceError 10002 / FBS Locked. Workout use, interruption/restart on hardware, signed-in sync and public distribution remain unqualified. All local simulators are shut down.

CI follow-up: run 34213847193 timed out at the workout storage test, which reached the real first-use notification permission dialog on a fresh runner. Commit bdc99ddb1586c7e489c21522348378339a05503a injects a recording notifier into that test and asserts matching rest scheduling and cancellation; the app still uses its original production notifier. All six focused storage tests and the complete local gate passed again at 80.9537% coverage. Exact-source CI 34216322092 passed both general and native jobs. The phone installation remains from 0283a79; this dependency-isolation correction has not been reinstalled.
