import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { MarksHubPage } from './MarksHubPage'

vi.mock('../../academic/hooks/useSchoolDirectory', () => ({
  useSchoolDirectory: () => ({
    classes: [{ id: 'class-1', name: 'Grade 8' }],
    sections: [{ id: 'sec-1', name: 'A', className: 'Grade 8' }],
    subjects: [{ id: 'sub-1', name: 'Mathematics' }],
    students: [{ id: 'student-1', firstName: 'Asha', lastName: 'Verma', admissionNo: 'ADM-1001' }],
    teachers: [],
    classOptions: [{ value: 'class-1', label: 'Grade 8' }],
    sectionOptions: [{ value: 'sec-1', label: 'Grade 8 - Section A' }],
    subjectOptions: [{ value: 'sub-1', label: 'Mathematics' }],
    studentOptions: [{ value: 'student-1', label: 'Asha Verma - ADM-1001' }],
    teacherOptions: [],
    getSectionsForClass: () => [{ value: 'sec-1', label: 'Section A' }],
    isSectionValidForClass: () => true,
    isLoading: false,
    hasError: false,
  }),
}))

vi.mock('../hooks/useExams', () => ({
  useCreateExam: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useCreateExamResult: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useExamsByClass: () => ({
    isLoading: false,
    isError: false,
    data: {
      data: [
        {
          id: 'exam-1',
          title: 'Mid Term Maths',
          examDate: '2026-05-12',
          classId: 'class-1',
          sectionId: 'sec-1',
          subjectId: 'sub-1',
          maxMarks: 100,
          active: true,
          createdAt: '2026-05-01T10:00:00Z',
        },
        {
          id: 'exam-2',
          title: 'Unit Test Science',
          examDate: '2026-05-20',
          classId: 'class-1',
          sectionId: 'sec-1',
          subjectId: 'sub-1',
          maxMarks: 50,
          active: true,
          createdAt: '2026-05-01T10:00:00Z',
        },
      ],
    },
  }),
  useExamResults: () => ({
    isLoading: false,
    isError: false,
    data: {
      data: [
        { id: 'res-1', examId: 'exam-1', studentId: 'student-1', marksObtained: 88, grade: 'A', remarks: null, published: true, createdAt: '2026-05-02T10:00:00Z' },
        { id: 'res-2', examId: 'exam-1', studentId: 'student-1', marksObtained: 45, grade: 'B+', remarks: null, published: false, createdAt: '2026-05-03T10:00:00Z' },
      ],
    },
  }),
}))

describe('MarksHubPage', () => {
  it('shows an exam snapshot with scheduled exams and published results', () => {
    render(<MarksHubPage />)

    expect(screen.getByText('Exam Snapshot')).toBeInTheDocument()
    expect(screen.getByText('2 scheduled exam(s)')).toBeInTheDocument()
    expect(screen.getByText(/Next exam: Mid Term Maths/)).toBeInTheDocument()
    expect(screen.getAllByText('Exams').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Results').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Published').length).toBeGreaterThan(0)
  })
})
