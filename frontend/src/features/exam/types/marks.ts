// ── Response shapes ───────────────────────────────────────────────────────────

export interface StudentMarkResponse {
  id: string;
  examId: string;
  examSubjectId: string;
  studentId: string;
  marksObtained: number | null;
  isAbsent: boolean;
  remarks: string | null;
  enteredBy: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Request shapes ────────────────────────────────────────────────────────────

export interface MarksEntryRequest {
  studentId: string;
  marksObtained: number | null;
  isAbsent: boolean;
  remarks?: string;
}

export interface BulkMarksEntryRequest {
  entries: MarksEntryRequest[];
}
