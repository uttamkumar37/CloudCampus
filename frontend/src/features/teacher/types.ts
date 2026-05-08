export type TeacherStatus = 'ACTIVE' | 'INACTIVE' | 'RESIGNED' | 'ON_LEAVE'

export interface ClassTeacherSection {
  sectionId: string
  sectionName: string
  classId: string
  className: string
}

export interface Teacher {
  id: string
  employeeNo: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  hireDate: string
  active: boolean
  createdAt: string
  status: TeacherStatus
  classTeacherSections: ClassTeacherSection[]
}

export interface TeacherDetailResponse {
  teacher: Teacher
  totalAssignedClasses: number
  timetable: TimetableItem[]
  homework: HomeworkItem[]
}

export interface TimetableItem {
  slotId: string
  dayOfWeek: number
  startTime: string
  endTime: string
  className: string | null
  sectionName: string | null
  subject: string | null
}

export interface HomeworkItem {
  id: string
  title: string
  dueDate: string | null
  className: string | null
  sectionName: string | null
  createdAt: string
}

export interface CreateTeacherRequest {
  employeeNo: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  hireDate: string
}

export interface UpdateTeacherRequest {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string | null
  status?: TeacherStatus
}
