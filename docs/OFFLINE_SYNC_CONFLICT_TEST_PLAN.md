# Offline Sync Conflict Test Plan

Last updated: 2026-05-19

## Purpose

This test plan defines the mobile offline sync conflict coverage needed before CloudCampus offline workflows are production-ready.

The current mobile app uses WatermelonDB for local attendance records, an MMKV-backed sync queue, and a sync engine that flushes pending attendance marks when the device reconnects, returns to foreground, or receives a silent sync notification.

## Current Offline Baseline

| Area | Current behavior |
|---|---|
| Local database | WatermelonDB tables for `attendance_records` and cached `students`. |
| Queue | MMKV queue `attendance_sync_queue` stores pending attendance operations. |
| Queue upsert | `syncQueue.enqueue` replaces an existing queued item with the same WatermelonDB `localId`. |
| Flush trigger | `useSyncTrigger` flushes on app foreground and network reconnect. |
| Push trigger | Notification listener can trigger attendance sync from silent sync notifications. |
| Batch endpoint | `POST /v1/attendance/sync` receives queued records. |
| Partial success | Synced and conflict IDs are removed from queue; failed IDs remain queued. |
| Conflict note | Current engine treats returned `conflictIds` as synced after last-write-wins is applied server-side. |

## Test Scope

Initial scope is offline attendance marking. The same pattern should later be reused for homework, assignments, notices, leave requests, fee acknowledgements, and student profile edits.

| Operation | Current or future | Required conflict coverage |
|---|---|---|
| Create | Current for offline attendance mark creation. | Duplicate create, stale roster, same student/date created from two devices. |
| Update | Current for correcting an unsynced attendance mark. | Local update vs remote update, multiple local updates before sync. |
| Delete | Future for offline-capable records. | Local delete vs remote update, remote delete vs local update, tombstone replay. |
| Retry | Current for network errors and partial success. | Queue retention, idempotent replay, bounded retries. |
| Duplicate prevention | Current for localId replacement; future for server idempotency keys. | No duplicate attendance rows or duplicate user-visible actions. |
| User-visible resolution | Future for non-last-write-wins domains. | Clear conflict messages and recovery actions. |

## Conflict Model

Each offline mutation should carry enough metadata to make resolution deterministic:

| Field | Purpose |
|---|---|
| `localId` | WatermelonDB record ID and local queue key. |
| `clientMutationId` | Future idempotency key for create/update/delete replay. |
| `entityType` | Attendance, homework, notice, leave, fee, or future domain. |
| `entityId` | Server ID when known. |
| `operation` | Create, update, delete, or restore. |
| `baseVersion` | Server version the local edit was based on. |
| `localUpdatedAt` | Client timestamp for ordering and UI explanation. |
| `actorUserId` | User who made the local change. |
| `tenantId/schoolId` | Server-derived or JWT-derived scope, never trusted from client alone. |

Attendance can use last-write-wins only when the business rule explicitly says the teacher's latest mark wins. More sensitive domains should require server-side conflict records and user-visible resolution.

## Unit Test Matrix

| Component | Test |
|---|---|
| `syncQueue.enqueue` | Adds a new operation when queue is empty. |
| `syncQueue.enqueue` | Replaces an existing item with the same `localId` so corrected marks do not duplicate. |
| `syncQueue.removeByLocalIds` | Removes only acknowledged IDs and preserves failed IDs. |
| `syncQueue.getAll` | Returns an empty queue for missing or malformed JSON. |
| `flushAttendanceSync` | Does nothing when offline. |
| `flushAttendanceSync` | Does nothing when another flush is already running. |
| `flushAttendanceSync` | Posts all pending records when online. |
| `flushAttendanceSync` | Marks WatermelonDB records synced for `syncedIds` and `conflictIds`. |
| `flushAttendanceSync` | Leaves queue intact on network/server error. |
| `flushAttendanceSync` | Removes only acknowledged records on partial success. |
| `useSyncTrigger` | Calls flush on foreground transition. |
| `useSyncTrigger` | Calls flush when NetInfo reconnects. |

## Attendance Conflict Scenarios

| Scenario | Setup | Expected result |
|---|---|---|
| Create offline, sync online | Teacher marks student present offline. | Server stores one attendance row, local record gets `synced_at`, queue drains. |
| Correct before sync | Teacher marks absent, then changes to present before reconnect. | Queue contains one item with final status only. |
| Duplicate tap | Teacher taps same status repeatedly. | One local record and one queued item remain. |
| Two devices same student/date | Device A marks present; Device B marks absent later. | Server applies configured conflict policy and returns one conflict or synced result. |
| Remote already has mark | Local offline mark reaches server after remote mark exists. | Server returns conflict; mobile marks local item synced or shows resolution according to policy. |
| Stale roster | Student removed/transferred while teacher is offline. | Server rejects or maps with a clear reason; mobile leaves item pending or marks conflict-visible. |
| Unauthorized scope | User tries to sync after role/school access changes. | Server rejects; mobile does not silently drop unsynced data. |
| App killed during sync | Flush starts then process exits. | Queue replay is idempotent on next launch. |

## Create/Update/Delete Conflict Scenarios

Future offline-capable domains must cover:

| Conflict | Expected behavior |
|---|---|
| Create/create duplicate | Server deduplicates by `clientMutationId` or natural key and returns the canonical record. |
| Create after remote delete | Server rejects or creates a new record according to domain policy; user sees the outcome. |
| Update/update | Server compares `baseVersion`; auto-merges safe fields or returns conflict details. |
| Update after remote delete | Mobile shows "This item was deleted elsewhere" and offers discard or recreate where allowed. |
| Delete after remote update | Server applies delete only if policy permits; otherwise returns conflict requiring confirmation. |
| Delete/delete | Idempotent success; second delete does not error as user-visible failure. |
| Restore after delete | Requires explicit domain policy and audit trail. |

## Retry and Backoff Tests

| Case | Expected behavior |
|---|---|
| No network | Queue remains unchanged. |
| 5xx response | Queue remains unchanged for retry. |
| 4xx validation error | Item moves to conflict/error state instead of retrying forever. |
| Partial success | Acknowledged IDs are removed; failed IDs remain. |
| Duplicate replay | Server handles the same mutation ID exactly once. |
| Rapid triggers | Foreground, reconnect, and push triggers do not run overlapping flushes. |
| Long queue | Batch size, timeout, and memory usage stay within mobile limits. |
| Token refresh during sync | 401 refresh queue replays once without duplicate sync submission. |

## User-Visible Resolution

For conflicts that cannot be silently resolved:

| UI state | Requirement |
|---|---|
| Pending sync | Show count and avoid implying data is already on the server. |
| Sync failed | Show retry affordance and non-destructive error. |
| Conflict | Show affected item, local value, server value, and recommended action. |
| Resolved | Show success and update local WatermelonDB state to canonical server state. |
| Discarded | Keep audit-friendly local metadata long enough for support diagnosis. |

Attendance can keep a compact "pending sync" count, but future domains with destructive edits must show item-level conflict details.

## Integration Test Matrix

Run on simulator/emulator and at least one physical device before release:

| Flow | Required proof |
|---|---|
| Offline attendance | Mark multiple students offline, reconnect, confirm server and local synced state. |
| Partial failure | Mock server returns mixed `syncedIds` and failed IDs; queue retains failed records. |
| Conflict response | Mock server returns `conflictIds`; local records are marked synced or conflict-visible per policy. |
| App restart | Queue persists through app kill/relaunch and syncs once. |
| Token expiry | Sync survives access-token expiry and refreshes once. |
| Silent sync push | Notification listener triggers sync without foreground UI breakage. |
| Database migration future | WatermelonDB migration preserves pending queue and unsynced records. |

## Backend Contract Tests

The sync endpoint should prove:

1. Batch sync is tenant/school scoped from authenticated context.
2. Duplicate `clientMutationId` or equivalent idempotency key does not create duplicate rows.
3. Same student/date/class conflict returns deterministic conflict response.
4. Invalid student/class/section returns item-level error, not a whole-batch data loss.
5. Partial success response is stable and can be safely replayed.
6. Server timestamps and canonical record IDs are returned for local reconciliation.
7. Audit events are written for conflict resolution and destructive sync actions.

## Data Fixtures

| Fixture | Purpose |
|---|---|
| Cached class roster | Offline attendance happy path. |
| Stale roster | Student transferred or deleted during offline period. |
| Existing server attendance | Local create collides with remote record. |
| Pending queue with repeated localId | Duplicate prevention. |
| Malformed queue JSON | Recovery from storage corruption. |
| Expired access token | Refresh/replay behavior. |
| Server 500/timeout | Retry preservation. |

## Acceptance Criteria

Offline sync is production-ready only when:

1. Create, update, and future delete conflicts have automated tests.
2. WatermelonDB records and MMKV queue survive app restart and network changes.
3. Retried mutations are idempotent and do not create duplicates.
4. Partial success removes only acknowledged items.
5. Validation errors and authorization errors do not silently delete unsynced work.
6. Conflict responses are either safely auto-resolved by policy or visible to the user.
7. Backend sync contracts are tenant/school scoped and replay-safe.

## Validation

TASK-048 validation command:

```bash
rg -n "offline sync|conflict|WatermelonDB" docs mobile PRODUCTION_READY_ROADMAP.md
```
