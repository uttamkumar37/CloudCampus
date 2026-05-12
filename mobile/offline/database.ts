/**
 * database — singleton WatermelonDB instance.
 *
 * Uses SQLiteAdapter for native iOS/Android (hardware-backed SQLite).
 * On web/test environments falls back gracefully via the adapter's
 * built-in platform detection.
 */
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { schema } from './schema/schema';
import { AttendanceRecord } from './models/AttendanceRecord';
import { Student } from './models/Student';

const adapter = new SQLiteAdapter({
  schema,
  // jsi: true enables JSI bridge for ~10x faster queries on new architecture
  jsi: true,
  onSetUpError: (error) => {
    console.error('[WatermelonDB] Setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [AttendanceRecord, Student],
});
