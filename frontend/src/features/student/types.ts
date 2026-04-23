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
}

export type Gender = 'MALE' | 'FEMALE' | 'OTHER'

export interface CreateStudentRequest {
  admissionNo: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: Gender
  email: string | null
  phone: string | null
}
