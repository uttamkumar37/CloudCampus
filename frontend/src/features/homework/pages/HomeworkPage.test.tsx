import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { HomeworkPage } from './HomeworkPage'

vi.mock('../../academic/hooks/useSchoolDirectory', () => ({
  useSchoolDirectory: () => ({
    classes: [{ id: 'class-1', name: 'Grade 8' }],
    sections: [{ id: 'sec-1', name: 'A', className: 'Grade 8' }],
    subjects: [],
    students: [],
    teachers: [],
    classOptions: [{ value: 'class-1', label: 'Grade 8' }],
    sectionOptions: [{ value: 'sec-1', label: 'Grade 8 - Section A' }],
    subjectOptions: [],
    studentOptions: [],
    teacherOptions: [],
    getSectionsForClass: () => [{ value: 'sec-1', label: 'Section A' }],
    isSectionValidForClass: () => true,
    isLoading: false,
    hasError: false,
  }),
}))

vi.mock('../hooks/useHomework', () => ({
  useCreateHomework: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useHomeworkByClass: () => ({
    isLoading: false,
    isError: false,
    data: {
      data: [
        {
          id: 'hw-1',
          title: 'Algebra Worksheet',
          description: null,
          classId: 'class-1',
          sectionId: 'sec-1',
          dueDate: '2099-01-10',
        },
        {
          id: 'hw-2',
          title: 'Revision Notes',
          description: null,
          classId: 'class-1',
          sectionId: null,
          dueDate: '2020-01-10',
        },
      ],
    },
  }),
}))

describe('HomeworkPage', () => {
  it('shows a homework snapshot with overdue and next due counts', () => {
    render(<HomeworkPage />)

    expect(screen.getByText('Homework Snapshot')).toBeInTheDocument()
    expect(screen.getByText('2 active assignment(s)')).toBeInTheDocument()
    expect(screen.getByText(/Next due: Grade 8/)).toBeInTheDocument()
    expect(screen.getAllByText('Assignments').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Overdue').length).toBeGreaterThan(0)
  })
})
