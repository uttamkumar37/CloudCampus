import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { TeacherDashboardPage } from './TeacherDashboardPage'

vi.mock('../hooks/useTeacherDashboard', () => ({
  useTeacherDashboard: () => ({
    isLoading: false,
    isError: false,
    data: {
      data: {
        profile: {
          firstName: 'Ananya',
          lastName: 'Iyer',
          employeeNo: 'EMP-204',
          email: 'ananya.iyer@cloudcampus.test',
        },
        assignedClasses: [
          { classId: 'class-1', className: 'Grade 7', sectionId: 'sec-a', sectionName: 'A' },
          { classId: 'class-2', className: 'Grade 8', sectionId: 'sec-b', sectionName: 'B' },
        ],
        recentHomework: [
          { id: 'hw-1', title: 'Geometry Worksheet', dueDate: '2026-05-12', className: 'Grade 7 A' },
        ],
        recentExams: [
          { id: 'ex-1', title: 'Unit Test 1', examDate: '2026-05-18', className: 'Grade 8 B' },
        ],
        todayTimetable: [
          {
            subjectName: 'Mathematics',
            className: 'Grade 7',
            sectionName: 'A',
            startTime: '09:00',
            endTime: '09:45',
            label: '1st Period',
          },
          {
            subjectName: 'Science',
            className: 'Grade 8',
            sectionName: 'B',
            startTime: '11:00',
            endTime: '11:45',
            label: '3rd Period',
          },
        ],
      },
    },
  }),
}))

describe('TeacherDashboardPage', () => {
  it('shows a teaching snapshot with the next scheduled period', () => {
    render(
      <MemoryRouter>
        <TeacherDashboardPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Teaching Snapshot')).toBeInTheDocument()
    expect(screen.getByText(/Next period: Mathematics/)).toBeInTheDocument()
    expect(screen.getAllByText((content) => content.includes('1st Period')).length).toBeGreaterThan(0)
    expect(screen.getByText('Classes Today')).toBeInTheDocument()
    expect(screen.getAllByText('2').length).toBeGreaterThan(0)
    expect(screen.getByText('Homework')).toBeInTheDocument()
    expect(screen.getAllByText('Exams').length).toBeGreaterThan(0)
  })
})