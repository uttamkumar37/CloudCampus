import { Model } from '@nozbe/watermelondb';
import { field, text, date, readonly, writer } from '@nozbe/watermelondb/decorators';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE';

export class AttendanceRecord extends Model {
  static table = 'attendance_records';

  @text('student_id') studentId!: string;
  @text('class_id') classId!: string;
  @text('section_id') sectionId!: string;
  @text('date') date!: string;           // YYYY-MM-DD
  @text('status') status!: AttendanceStatus;
  @text('marked_by') markedBy!: string;
  @field('synced_at') syncedAt!: number | null;
  @readonly @date('local_created_at') localCreatedAt!: Date;

  get isPendingSync(): boolean {
    return this.syncedAt == null;
  }

  @writer async markSynced(syncTimestamp: number): Promise<void> {
    await this.update((record) => {
      record.syncedAt = syncTimestamp;
    });
  }
}
