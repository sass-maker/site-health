# Calorie priority qualification — 8 September 2026

Build 12 from 59fecf539853fa402f8085e62e4297994b3468f6 repairs reproduced daily-use defects: failed food saves reported success and closed the sheet; overlapping water logs lost one entry; edits after a failed load overwrote an unread journal. A separate failed-outbox regression replaced a committed 2750 ml target with an older 2500 ml cloud value. A one-off meal doubled to two servings incorrectly retained 300 kcal instead of 600 kcal.

Local journal writes serialize, editors retain drafts on failed commits, delete and undo retain recovery state, and unread files route to existing backup controls. Local launch and successful-save completion no longer wait for optional account/network services. Imports and explicit cloud choices use the same commit path. A durable reconciliation barrier protects the journal until its separate outbox is saved; a pending journal with no retained outbox also requires a choice after relaunch. One-off serving edits scale the logged nutrient snapshot. Tests use temporary journals and stub accounts, not owner data or live accounts.

The repository gate passed without changing its complexity or coverage thresholds. The complete native gate passed 26 core, 32 app and 9 UI tests, a Release build and 66.2357% production coverage (54.30% floor). The gate's outdated hard-coded test-count summary was corrected. A follow-up focused UI assertion explicitly confirms the read-error alert disappears before recovery controls are checked; its complete follow-up gate also passed all 67 tests with the same coverage.

The signed development app was verified with codesign and installed on the physical iPhone. A fresh build-12 launch returned CoreDeviceError 10002 / FBS Locked. Installation does not qualify physical food logging, interruption/relaunch, real account isolation, cross-device sync or public distribution.

The Today screenshot uses a sample fixture and was manually inspected for readable hierarchy, spacing and a reachable logging action. The recovery layout was inspected with its error alert visible. Manual tool taps did not dismiss that alert; the focused XCTest did, and explicitly verified its disappearance. This is limited presentation evidence, not a complete visual or accessibility audit.

[Issue 88](https://github.com/Significant-Hobbies/calorie/issues/88) retains release and owner-use qualification. Shareability remains false. Installed-source CI 34218849801 passed both general and native jobs.

Current source 754fcc800c732c41bd33950509004d5895c870b4 adds only that recovery-dismissal test assertion. Its CI run 34219785217 passed both jobs; installed production code remains the verified 59fecf5 build.

## Build 13: preserve the queue after persistence failure

Source `2c98db238afc67c2f2f9a2663d2d7c66dde35972` repairs Calorie's own sync intent store; it does not use PersonalSyncKit. Queue compaction, acknowledgement and clear now publish their new in-memory value only after the atomic file write succeeds. Failed initial reads remain retryable and cannot silently become an empty loaded queue. Explicit successful queue reset retains its prior behavior.

Four filesystem regressions produced nine failed assertions against the old source, including a retained intent disappearing from memory and an unread queue being overwritten by a later edit. The same four tests pass after repair, with successful retry and reopened-file checks. All 30 core tests pass in a temporary Swift 6 package that copies the repository's core sources and tests. Baseline log: `swift_package_test_2026-09-08T16-14-10-092Z_pid50013_8379bdf2.log`; corrected full-core log: `swift_package_test_2026-09-08T16-14-15-916Z_pid50013_d4acbbc2.log`, in the managed XcodeBuildMCP log directory. Its failure counter reports nine assertions; only four test cases failed.

`pnpm run check` passed. The full local native gate was attempted before and after repair with task-local stable Xcode 26.6, but stopped before tests because it found no available iPhone simulator. These isolated core tests do not establish app/UI, Release or coverage qualification. [Exact-source hosted CI 34249949575](https://github.com/Significant-Hobbies/calorie/actions/runs/34249949575) is running and must supply those gates.

Build 13 has not been installed or distributed. Build 12 remains the last verified physical installation; no current phone-lock observation, signed-in isolation, account round trip or public distribution is claimed. The source change does not alter backend routes or provider configuration, and no owner records were accessed.
