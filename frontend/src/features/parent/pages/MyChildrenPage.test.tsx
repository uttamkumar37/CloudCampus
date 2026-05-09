import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { MyChildrenPage } from './MyChildrenPage'

vi.mock('../hooks/useMyChildren', () => ({
  useMyChildren: () => ({
    isLoading: false,
    isError: false,
    data: {
      data: [
        { studentId: 'student-1', admissionNo: 'ADM-1001', firstName: 'Aarav', lastName: 'Sharma' },
        { studentId: 'student-2', admissionNo: 'ADM-1002', firstName: 'Diya', lastName: 'Shah' },
      ],
    },
  }),
}))

vi.mock('../../fees/hooks/useFees', () => ({
  useFeeAssignments: (studentId: string) => ({
    isLoading: false,
    data: {
      data:
        studentId === 'student-1'
          ? [
              { id: 'fee-1', feeTitle: 'Tuition', status: 'OVERDUE' },
              { id: 'fee-2', feeTitle: 'Lab Fee', status: 'PENDING' },
            ]
          : [
              { id: 'fee-3', feeTitle: 'Tuition', status: 'PAID' },
            ],
    },
  }),
}))

vi.mock('../../attendance/hooks/useAttendance', () => ({
  useAttendanceByDate: () => ({
    isLoading: false,
    data: {
      data: [
        {
          id: 'att-1',
          studentId: 'student-1',
          classId: 'class-1',
          sectionId: 'sec-a',
          attendanceDate: '2026-05-09',
          status: 'PRESENT',
          remarks: null,
          createdAt: '2026-05-09T08:00:00Z',
        },
        {
          id: 'att-2',
          studentId: 'student-2',
          classId: 'class-1',
          sectionId: 'sec-a',
          attendanceDate: '2026-05-09',
          status: 'PRESENT',
          remarks: null,
          createdAt: '2026-05-09T08:05:00Z',
        },
      ],
    },
  }),
}))

describe('MyChildrenPage', () => {
  it('shows a family snapshot and child-level alerts', () => {
    render(
      <MemoryRouter>
        <MyChildrenPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Family Snapshot')).toBeInTheDocument()
    expect(screen.getByText('2 linked student(s) in one view')).toBeInTheDocument()
    expect(screen.getByText('Linked Students')).toBeInTheDocument()
    expect(screen.getByText('Attendance')).toBeInTheDocument()
    expect(screen.getByText('Fee Alerts')).toBeInTheDocument()
    expect(screen.getByText('Aarav Sharma')).toBeInTheDocument()
    expect(screen.getByText('Diya Shah')).toBeInTheDocument()
    expect(screen.getByText('1 fee(s) overdue')).toBeInTheDocument()
    expect(screen.getAllByText('Action needed').length).toBeGreaterThan(0)
    expect(screen.getAllByText('On track today').length).toBeGreaterThan(0)
  })
})