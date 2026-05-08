export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  email: string | null;
  phone: string | null;
  active: boolean;
  createdAt: string;
}

export interface StudentParentContact {
  parentUserId: string;
  parentName: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
}

export interface StudentFeeItem {
  id: string;
  title: string;
  amount: number;
  dueDate: string | null;
  status: string;
}

export interface StudentExamItem {
  resultId: string;
  examTitle: string | null;
  examDate: string | null;
  subject: string | null;
  marksObtained: number;
  grade: string | null;
  published: boolean;
}

export interface StudentAttendanceItem {
  date: string;
  status: string;
  className: string | null;
  sectionName: string | null;
  remarks: string | null;
}

export interface StudentFullDetail {
  student: Student;
  parents: StudentParentContact[];
  fees: StudentFeeItem[];
  exams: StudentExamItem[];
  attendance: StudentAttendanceItem[];
}
