/**
 * syncQueue — in-memory queue of pending attendance operations.
 *
 * Each entry is a serialised AttendanceSyncItem. On sync, items are
 * read, POSTed to the backend in a single batch, then cleared. This in-memory
 * version keeps Expo Go usable; persist it in a custom dev build when offline
 * attendance is tested end to end.
 */
import type { AttendanceStatus } from '../models/AttendanceRecord';

let queue: AttendanceSyncItem[] = [];

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
    // Upsert by localId: replace if already queued (teacher corrected a mark)
    queue = queue.filter((i) => i.localId !== item.localId);
    queue.push(item);
  },

  getAll(): AttendanceSyncItem[] {
    return [...queue];
  },

  removeByLocalIds(ids: string[]): void {
    const idSet = new Set(ids);
    queue = queue.filter((i) => !idSet.has(i.localId));
  },

  clear(): void {
    queue = [];
  },

  get length(): number {
    return this.getAll().length;
  },
};
