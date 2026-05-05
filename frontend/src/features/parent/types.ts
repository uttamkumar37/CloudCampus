export interface Child {
  studentId: string
  admissionNo: string
  firstName: string
  lastName: string
}

export interface LinkParentRequest {
  parentUserId: string
  studentId: string
}

export interface ParentStudentLink {
  linkId: string
  parentUserId: string
  parentFullName: string
  parentEmail: string
  studentId: string
  admissionNo: string
  studentFirstName: string
  studentLastName: string
  linkedAt: string
}
