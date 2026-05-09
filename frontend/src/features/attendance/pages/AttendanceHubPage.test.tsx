import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { AttendanceHubPage } from './AttendanceHubPage'

vi.mock('../../academic/hooks/useSchoolDirectory', () => ({
  useSchoolDirectory: () => ({
    students: [
      { id: 'student-1', firstName: 'Aarav', lastName: 'Sharma', admissionNo: 'ADM-1001' },
    ],
    studentOptions: [
      { value: 'student-1', label: 'Aarav Sharma - ADM-1001', searchText: 'Aarav Sharma ADM-1001' },
    ],
    classes: [
      { id: 'class-1', name: 'Grade 8' },
    ],
    sections: [
      { id: 'section-a', name: 'A', classId: 'class-1' },
    ],
    classOptions: [
      { value: 'class-1', label: 'Grade 8' },
    ],
    getSectionsForClass: () => [{ value: 'section-a', label: 'Section A' }],
    isSectionValidForClass: () => true,
    isLoading: false,
    hasError: false,
  }),
}))

vi.mock('../hooks/useAttendance', () => ({
  useAttendanceByDate: () => ({
    isLoading: false,
    isError: false,
    data: {
      data: [
        { id: 'att-1', studentId: 'student-1', classId: 'class-1', sectionId: 'section-a', attendanceDate: '2026-05-09', status: 'PRESENT', remarks: null, createdAt: '2026-05-09T08:00:00Z' },
        { id: 'att-2', studentId: 'student-2', classId: 'class-1', sectionId: 'section-a', attendanceDate: '2026-05-09', status: 'ABSENT', remarks: null, createdAt: '2026-05-09T08:05:00Z' },
        { id: 'att-3', studentId: 'student-3', classId: 'class-1', sectionId: 'section-a', attendanceDate: '2026-05-09', status: 'LATE', remarks: 'Bus delay', createdAt: '2026-05-09T08:06:00Z' },
        { id: 'att-4', studentId: 'student-4', classId: 'class-1', sectionId: 'section-a', attendanceDate: '2026-05-09', status: 'EXCUSED', remarks: 'Medical leave', createdAt: '2026-05-09T08:07:00Z' },
      ],
    },
    refetch: vi.fn(),
  }),
  useMarkAttendance: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))

vi.mock('../../../utils/toast', () => ({
  showToast: vi.fn(),
}))

describe('AttendanceHubPage', () => {
  it('shows a daily attendance snapshot for staff', () => {
    render(<AttendanceHubPage />)

    expect(screen.getByText('Daily Attendance Snapshot')).toBeInTheDocument()
    expect(screen.getByText('Attendance register is populated for this date.')).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getAllByText('Present').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Absent').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Late').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Excused').length).toBeGreaterThan(0)
  })
})
