/**
 * syncEngine — flushes the MMKV sync queue to the backend.
 *
 * Call flow (triggered by NetInfo / AppState / push notification):
 *  1. Check connectivity — bail out if offline.
 *  2. Read all pending items from syncQueue.
 *  3. POST /v1/attendance/sync (batch).
 *  4. On success: mark each WatermelonDB record as synced, drain queue.
 *  5. On partial failure: remove only successfully synced IDs from queue.
 *  6. On network error: leave queue intact for next trigger.
 *
 * Conflict resolution: last-write-wins (teacher's device wins, per EUP-051).
 */
import NetInfo from '@react-native-community/netinfo';
import axiosInstance from '@/shared/api/axiosInstance';
import { database } from '../database';
import { AttendanceRecord } from '../models/AttendanceRecord';
import { syncQueue, type AttendanceSyncItem } from './syncQueue';

interface SyncBatchRequest {
  records: AttendanceSyncItem[];
}

interface SyncBatchResult {
  syncedIds: string[];   // localIds successfully persisted on server
  conflictIds: string[]; // localIds that had conflicts (last-write-wins applied)
}

let _syncing = false;

export async function flushAttendanceSync(): Promise<void> {
  // Guard: one flush at a time
  if (_syncing) return;

  const net = await NetInfo.fetch();
  if (!net.isConnected) return;

  const pending = syncQueue.getAll();
  if (pending.length === 0) return;

  _syncing = true;
  try {
    const { data } = await axiosInstance.post<SyncBatchResult>(
      '/v1/attendance/sync',
      { records: pending } satisfies SyncBatchRequest,
    );

    const syncedSet = new Set([...data.syncedIds, ...data.conflictIds]);
    const now = Date.now();

    // Mark synced in WatermelonDB
    const collection = database.get<AttendanceRecord>('attendance_records');
    await database.write(async () => {
      for (const localId of syncedSet) {
        try {
          const record = await collection.find(localId);
          await record.markSynced(now);
        } catch {
          // Record may have been deleted locally — skip
        }
      }
    });

    // Remove synced items from queue
    syncQueue.removeByLocalIds([...syncedSet]);
  } finally {
    _syncing = false;
  }
}
