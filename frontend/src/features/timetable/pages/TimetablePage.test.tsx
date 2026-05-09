import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { TimetablePage } from './TimetablePage'

vi.mock('../../academic/hooks/useSchoolDirectory', () => ({
  useSchoolDirectory: () => ({
    classes: [],
    sections: [],
    subjects: [
      { id: 'sub-1', name: 'Mathematics' },
      { id: 'sub-2', name: 'Science' },
    ],
    students: [],
    teachers: [
      { id: 'teacher-1', firstName: 'Ravi', lastName: 'Sharma', employeeNo: 'T-11', email: 'ravi.sharma@test' },
    ],
    classOptions: [{ value: 'class-1', label: 'Grade 8' }],
    sectionOptions: [{ value: 'sec-1', label: 'Grade 8 - Section A' }],
    subjectOptions: [{ value: 'sub-1', label: 'Mathematics' }],
    studentOptions: [],
    teacherOptions: [{ value: 'teacher-1', label: 'Ravi Sharma - T-11' }],
    getSectionsForClass: () => [{ value: 'sec-1', label: 'Section A' }],
    isSectionValidForClass: () => true,
    isLoading: false,
    hasError: false,
  }),
}))

vi.mock('../hooks/useTimetable', () => ({
  useTimetable: () => ({
    isLoading: false,
    isError: false,
    data: {
      data: [
        {
          id: 'slot-1',
          classId: 'class-1',
          sectionId: 'sec-1',
          subjectId: 'sub-1',
          teacherId: 'teacher-1',
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '09:45',
          label: 'Period 1',
          createdAt: '2026-05-01T10:00:00Z',
        },
        {
          id: 'slot-2',
          classId: 'class-1',
          sectionId: 'sec-1',
          subjectId: 'sub-2',
          teacherId: 'teacher-1',
          dayOfWeek: 3,
          startTime: '11:00',
          endTime: '11:45',
          label: 'Period 2',
          createdAt: '2026-05-01T10:00:00Z',
        },
      ],
    },
  }),
  useCreateTimetableSlot: () => ({ mutateAsync: vi.fn(), isPending: false }),
}))

describe('TimetablePage', () => {
  it('shows a timetable snapshot with the next slot', () => {
    render(<TimetablePage />)

    expect(screen.getByText('Timetable Snapshot')).toBeInTheDocument()
    expect(screen.getByText('2 loaded slot(s)')).toBeInTheDocument()
    expect(screen.getByText(/Next class: Monday/)).toBeInTheDocument()
    expect(screen.getAllByText('Slots').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Days').length).toBeGreaterThan(0)
  })
})
