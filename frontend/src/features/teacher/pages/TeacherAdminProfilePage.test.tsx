import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { TeacherAdminProfilePage } from './TeacherAdminProfilePage'

vi.mock('../hooks/useTeacherDetails', () => ({
  useTeacherDetails: () => ({
    isLoading: false,
    isError: false,
    data: {
      data: {
        teacher: {
          id: 'teacher-1',
          firstName: 'Asha',
          lastName: 'Menon',
          employeeNo: 'T-120',
          email: 'asha.menon@cloudcampus.test',
          phone: '99999 11111',
          hireDate: '2022-06-01',
          status: 'ACTIVE',
          classTeacherSections: [{ sectionId: 'sec-1', className: 'Grade 8', sectionName: 'A' }],
        },
        totalAssignedClasses: 3,
        timetable: [
          {
            slotId: 'slot-1',
            dayOfWeek: 1,
            startTime: '09:00',
            endTime: '09:45',
            className: 'Grade 8',
            sectionName: 'A',
            subject: 'Mathematics',
          },
          {
            slotId: 'slot-2',
            dayOfWeek: 3,
            startTime: '11:00',
            endTime: '11:45',
            className: 'Grade 7',
            sectionName: 'B',
            subject: 'Science',
          },
        ],
        homework: [
          {
            id: 'hw-1',
            title: 'Algebra Practice',
            dueDate: '2099-01-01',
            className: 'Grade 8',
            sectionName: 'A',
            createdAt: '2026-05-01T10:00:00Z',
          },
          {
            id: 'hw-2',
            title: 'Revision Notes',
            dueDate: '2020-01-01',
            className: 'Grade 7',
            sectionName: 'B',
            createdAt: '2026-05-02T10:00:00Z',
          },
        ],
      },
    },
  }),
}))

vi.mock('../../academic/hooks/useAcademicData', () => ({
  useAcademicSections: () => ({ data: { data: [] } }),
}))

vi.mock('../../academic/api/academicApi', () => ({
  assignClassTeacher: vi.fn(),
  removeClassTeacher: vi.fn(),
}))

describe('TeacherAdminProfilePage', () => {
  it('shows a teacher load snapshot with the next class and derived counts', () => {
    render(
      <MemoryRouter initialEntries={['/teachers/teacher-1']}>
        <Routes>
          <Route path="/teachers/:id" element={<TeacherAdminProfilePage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.getByText('Teacher Load Snapshot')).toBeInTheDocument()
    expect(screen.getByText('3 assigned section(s)')).toBeInTheDocument()
    expect(screen.getByText(/Next class: Mathematics/)).toBeInTheDocument()
    expect(screen.getAllByText('Sections').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Slots').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Homework').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Open').length).toBeGreaterThan(0)
    expect(screen.getAllByText('3').length).toBeGreaterThan(0)
    expect(screen.getAllByText('2').length).toBeGreaterThan(0)
  })
})
