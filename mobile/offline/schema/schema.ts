import { appSchema, tableSchema } from '@nozbe/watermelondb';

/**
 * attendance_records — local SQLite table for offline attendance marking.
 *
 * WatermelonDB manages `id`, `_status`, and `_changed` internally.
 * All columns here are application-level fields.
 */
export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'attendance_records',
      columns: [
        { name: 'student_id', type: 'string', isIndexed: true },
        { name: 'class_id', type: 'string', isIndexed: true },
        { name: 'section_id', type: 'string' },
        { name: 'date', type: 'string', isIndexed: true }, // ISO date YYYY-MM-DD
        { name: 'status', type: 'string' },               // PRESENT | ABSENT | LATE
        { name: 'marked_by', type: 'string' },            // teacher userId
        { name: 'synced_at', type: 'number', isOptional: true }, // epoch ms
        { name: 'local_created_at', type: 'number' },    // epoch ms
      ],
    }),
    tableSchema({
      name: 'students',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'roll_number', type: 'string' },
        { name: 'class_id', type: 'string', isIndexed: true },
        { name: 'section_id', type: 'string' },
        { name: 'cached_at', type: 'number' }, // epoch ms — for staleness check
      ],
    }),
  ],
});
