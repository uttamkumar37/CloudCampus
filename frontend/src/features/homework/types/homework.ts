export type HomeworkStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED';

export interface HomeworkAssignment {
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
  status: HomeworkStatus;
  attachmentUrls: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HomeworkCreateRequest {
  academicYearId: string;
  classId: string;
  sectionId?: string;
  subjectId: string;
  title: string;
  description?: string;
  dueDate: string;
  publishImmediately: boolean;
}
