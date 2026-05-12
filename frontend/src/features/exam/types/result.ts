// CC-1103/CC-1104 — Result generation + Report card types

export interface SubjectResultLine {
  examSubjectId: string;
  /** Subject UUID (frontend resolves display name from subject catalog) */
  subjectName: string;
  totalMarks: number;
  marksObtained: number;
  isAbsent: boolean;
  passed: boolean;
}

export interface ExamResultResponse {
  id: string;
  examId: string;
  studentId: string;
  schoolId: string;
  totalMarksObtained: number;
  totalMarksPossible: number;
  percentage: number;
  grade: string;
  rank: number | null;
  passed: boolean;
  generatedAt: string;
  /** Null in list view; populated in report-card detail view */
  subjects: SubjectResultLine[] | null;
}
