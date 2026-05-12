export type ExamType = 'UNIT_TEST' | 'TERM' | 'HALF_YEARLY' | 'ANNUAL' | 'MOCK' | 'PRACTICAL';
export type ExamStatus = 'DRAFT' | 'SCHEDULED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface ExamSubjectResponse {
  id: string;
  examId: string;
  subjectId: string;
  classId: string;
  sectionId: string | null;
  examDate: string;
  startTime: string | null;
  durationMinutes: number | null;
  totalMarks: number;
  passingMarks: number;
  roomNumber: string | null;
  invigilatorId: string | null;
}

export interface ExamResponse {
  id: string;
  tenantId: string;
  schoolId: string;
  academicYearId: string;
  name: string;
  examType: ExamType;
  status: ExamStatus;
  startDate: string;
  endDate: string;
  totalMarks: number;
  passingMarks: number;
  instructions: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  subjects: ExamSubjectResponse[];
}

export interface ExamSubjectRequest {
  subjectId: string;
  classId: string;
  sectionId?: string;
  examDate: string;
  startTime?: string;
  durationMinutes?: number;
  totalMarks: number;
  passingMarks: number;
  roomNumber?: string;
  invigilatorId?: string;
}

export interface ExamCreateRequest {
  academicYearId: string;
  name: string;
  examType: ExamType;
  startDate: string;
  endDate: string;
  totalMarks: number;
  passingMarks: number;
  instructions?: string;
  subjects?: ExamSubjectRequest[];
}
