/**
 * syncQueue — MMKV-backed queue of pending attendance operations.
 *
 * Each entry is a serialised AttendanceSyncItem. On sync, items are
 * read, POSTed to the backend in a single batch, then cleared.
 * MMKV is synchronous so queue operations never block async flows.
 */
import { createMMKV } from 'react-native-mmkv';
import type { AttendanceStatus } from '../models/AttendanceRecord';

const storage = createMMKV({ id: 'cc-sync-queue', encryptionKey: 'cc-sync-key' });

const QUEUE_KEY = 'attendance_sync_queue';

export interface AttendanceSyncItem {
  /** WatermelonDB local record ID */
  localId: string;
  studentId: string;
  classId: string;
  sectionId: string;
  date: string;         // YYYY-MM-DD
  status: AttendanceStatus;
  markedBy: string;
  localCreatedAt: number; // epoch ms
}

export const syncQueue = {
  enqueue(item: AttendanceSyncItem): void {
    const current = this.getAll();
    // Upsert by localId: replace if already queued (teacher corrected a mark)
    const filtered = current.filter((i) => i.localId !== item.localId);
    filtered.push(item);
    storage.set(QUEUE_KEY, JSON.stringify(filtered));
  },

  getAll(): AttendanceSyncItem[] {
    const raw = storage.getString(QUEUE_KEY);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as AttendanceSyncItem[];
    } catch {
      return [];
    }
  },

  removeByLocalIds(ids: string[]): void {
    const idSet = new Set(ids);
    const remaining = this.getAll().filter((i) => !idSet.has(i.localId));
    storage.set(QUEUE_KEY, JSON.stringify(remaining));
  },

  clear(): void {
    storage.remove(QUEUE_KEY);
  },

  get length(): number {
    return this.getAll().length;
  },
};
