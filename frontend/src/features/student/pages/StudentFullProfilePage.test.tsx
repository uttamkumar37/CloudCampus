import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { StudentFullProfilePage } from './StudentFullProfilePage'

vi.mock('../hooks/useMyStudentDetails', () => ({
  useMyStudentDetails: () => ({
    isLoading: false,
    isError: false,
    data: {
      data: {
        student: {
          id: 'student-1',
          admissionNo: 'ADM-1001',
          firstName: 'Aarav',
          lastName: 'Sharma',
          dateOfBirth: '2012-04-01',
          gender: 'MALE',
          email: 'aarav@example.com',
          phone: '9999999999',
          active: true,
          createdAt: '2025-04-01T00:00:00Z',
          status: 'ACTIVE',
        },
        parents: [],
        fees: [
          { id: 'fee-1', title: 'Term 1 Tuition', amount: 10000, dueDate: '2026-06-10', status: 'PENDING' },
        ],
        exams: [
          { resultId: 'result-1', examTitle: 'Unit Test 1', examDate: '2026-03-01', subject: 'Mathematics', marksObtained: 88, grade: 'A', published: true },
          { resultId: 'result-2', examTitle: 'Unit Test 2', examDate: '2026-04-01', subject: 'Science', marksObtained: 92, grade: 'A+', published: true },
        ],
        attendance: [
          { date: '2026-04-01', status: 'PRESENT', className: 'Grade 8', sectionName: 'A', remarks: null },
          { date: '2026-04-02', status: 'PRESENT', className: 'Grade 8', sectionName: 'A', remarks: null },
          { date: '2026-04-03', status: 'ABSENT', className: 'Grade 8', sectionName: 'A', remarks: null },
          { date: '2026-04-04', status: 'PRESENT', className: 'Grade 8', sectionName: 'A', remarks: null },
        ],
        homework: [],
      },
    },
  }),
}))

describe('StudentFullProfilePage', () => {
  it('shows the certificate snapshot and report card preview', () => {
    render(
      <MemoryRouter>
        <StudentFullProfilePage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Certificate Snapshot')).toBeInTheDocument()
    expect(screen.getByText('Ready for issue')).toBeInTheDocument()
    expect(screen.getByText('Published Exams')).toBeInTheDocument()
    expect(screen.getByText('Average Marks')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Exams & Results' }))

    expect(screen.getByText('Report Card Preview')).toBeInTheDocument()
    expect(screen.getByText('Published')).toBeInTheDocument()
    expect(screen.getByText('90%')).toBeInTheDocument()
    expect(screen.getByText('2/2 subjects passed')).toBeInTheDocument()
  })
})
