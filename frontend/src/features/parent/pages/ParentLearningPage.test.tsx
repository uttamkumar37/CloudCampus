import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ParentLearningPage } from './ParentLearningPage'

vi.mock('../hooks/useMyChildren', () => ({
  useMyChildren: () => ({
    isLoading: false,
    isError: false,
    data: {
      data: [
        { studentId: 'student-1', firstName: 'Mira', lastName: 'Patel', admissionNo: 'ADM-7001' },
        { studentId: 'student-2', firstName: 'Arjun', lastName: 'Patel', admissionNo: 'ADM-7002' },
      ],
    },
  }),
}))

vi.mock('../../attendance/hooks/useAttendance', () => ({
  useAttendanceByDate: () => ({
    isLoading: false,
    isError: false,
    data: {
      data: [
        { studentId: 'student-1', status: 'PRESENT', attendanceDate: '2026-05-09', remarks: null, classId: 'class-1', sectionId: 'sec-1' },
        { studentId: 'student-2', status: 'LATE', attendanceDate: '2026-05-09', remarks: null, classId: 'class-1', sectionId: 'sec-1' },
      ],
    },
  }),
}))

vi.mock('../../fees/hooks/useFees', () => ({
  useFeeAssignments: () => ({
    isLoading: false,
    data: {
      data: [
        { id: 'fee-1', status: 'OVERDUE' },
        { id: 'fee-2', status: 'PENDING' },
      ],
    },
  }),
}))

describe('ParentLearningPage', () => {
  it('shows a family snapshot with linked child and attendance counts', () => {
    render(<ParentLearningPage />)

    expect(screen.getByText('Family Snapshot')).toBeInTheDocument()
    expect(screen.getByText('2 linked child(ren)')).toBeInTheDocument()
    expect(screen.getAllByText('Children').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Attendance').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Coverage').length).toBeGreaterThan(0)
  })
})
