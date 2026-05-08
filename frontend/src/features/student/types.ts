export interface Student {
  id: string
  admissionNo: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: Gender
  email: string | null
  phone: string | null
  active: boolean
  createdAt: string
  status: StudentStatus
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export type StudentStatus = 'ACTIVE' | 'INACTIVE' | 'ALUMNI' | 'DEBARRED' | 'TC_ISSUED'

export interface CreateStudentRequest {
  admissionNo: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: Gender
  email: string | null
  phone: string | null
}

export interface UpdateStudentRequest {
  firstName?: string
  lastName?: string
  email?: string | null
  phone?: string | null
  status?: StudentStatus
}

export interface StudentFilters {
  search: string
  status: StudentStatus | ''
  gender: Gender | ''
}

export interface StudentParentContact {
  parentUserId: string
  parentName: string | null
  parentEmail: string | null
  parentPhone: string | null
}

export interface StudentFeeItem {
  id: string
  title: string
  amount: number
  dueDate: string | null
  status: string
}

export interface StudentExamItem {
  resultId: string
  examTitle: string | null
  examDate: string | null
  subject: string | null
  marksObtained: number
  grade: string | null
  published: boolean
}

export interface StudentAttendanceItem {
  date: string
  status: string
  className: string | null
  sectionName: string | null
  remarks: string | null
}

export interface StudentHomeworkItem {
  id: string
  title: string
  dueDate: string | null
  className: string | null
  sectionName: string | null
  createdAt: string
}

export interface StudentFullDetail {
  student: Student
  parents: StudentParentContact[]
  fees: StudentFeeItem[]
  exams: StudentExamItem[]
  attendance: StudentAttendanceItem[]
  homework: StudentHomeworkItem[]
}
