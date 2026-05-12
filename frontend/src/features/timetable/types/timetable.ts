export type DayOfWeek =
  | 'MONDAY'
  | 'TUESDAY'
  | 'WEDNESDAY'
  | 'THURSDAY'
  | 'FRIDAY'
  | 'SATURDAY';

export const DAYS_OF_WEEK: DayOfWeek[] = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
];

export interface TimetableSlot {
  id: string;
  schoolId: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  staffId: string | null;
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  startTime: string | null;
  endTime: string | null;
}

export interface TimetableSlotCreateRequest {
  academicYearId: string;
  classId: string;
  sectionId: string;
  subjectId: string;
  staffId?: string;
  dayOfWeek: DayOfWeek;
  periodNumber: number;
  startTime?: string;
  endTime?: string;
}
