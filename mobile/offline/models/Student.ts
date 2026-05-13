import { Model } from '@nozbe/watermelondb';
import { text, field } from '@nozbe/watermelondb/decorators';

export class Student extends Model {
  static table = 'students';

  @text('name') name!: string;
  @text('roll_number') rollNumber!: string;
  @text('class_id') classId!: string;
  @text('section_id') sectionId!: string;
  @field('cached_at') cachedAt!: number;
}
