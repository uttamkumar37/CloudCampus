export type AssignmentStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';
export type SubmissionStatus = 'PENDING' | 'SUBMITTED' | 'LATE' | 'GRADED';

export interface Assignment {
  id: string;
  schoolId: string;
  academicYearId: string;
  classId: string;
  sectionId: string | null;
  subjectId: string;
  assignedBy: string | null;
  title: string;
  description: string | null;
  dueDate: string;
  maxMarks: number | null;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  status: SubmissionStatus;
  textResponse: string | null;
  submittedAt: string | null;
  marksObtained: number | null;
  feedback: string | null;
  gradedBy: string | null;
  gradedAt: string | null;
}

export interface AssignmentCreateRequest {
  academicYearId: string;
  classId: string;
  sectionId?: string;
  subjectId: string;
  title: string;
  description?: string;
  dueDate: string;
  maxMarks?: number;
  publishImmediately: boolean;
}

export interface GradeSubmissionRequest {
  marksObtained: number;
  feedback?: string;
}
