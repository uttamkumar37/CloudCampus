export interface TimetableSlot {
  id: string
  classId: string
  sectionId: string | null
  subjectId: string | null
  teacherId: string | null
  dayOfWeek: number
  startTime: string
  endTime: string
  label: string | null
  createdAt: string
}

export interface CreateTimetableSlotRequest {
  classId: string
  sectionId: string    // FIXED: was `string | null` — backend @NotNull requires a value
  subjectId: string    // FIXED: was `string | null` — backend @NotNull requires a value
  teacherId: string | null
  dayOfWeek: number
  startTime: string
  endTime: string
  label: string | null
}
