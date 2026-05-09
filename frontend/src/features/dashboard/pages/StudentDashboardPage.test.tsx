import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { StudentDashboardPage } from './StudentDashboardPage'

vi.mock('../hooks/useStudentDashboard', () => ({
  useStudentDashboard: () => ({
    isLoading: false,
    isError: false,
    data: {
      data: {
        profile: {
          firstName: 'Riya',
          lastName: 'Singh',
          admissionNo: 'ADM-3301',
          email: 'riya.singh@cloudcampus.test',
        },
        attendance: {
          totalDays: 30,
          presentDays: 27,
          presentPercent: 90,
          lastSevenDays: [],
        },
        fees: {
          totalAmount: 12000,
          paidAmount: 9000,
          pendingAmount: 3000,
          totalAssignments: 2,
          pendingAssignments: 1,
        },
        recentResults: [
          { examTitle: 'Mid Term', examDate: '2026-04-20', marksObtained: 180, maxMarks: 200, grade: 'A' },
          { examTitle: 'Unit Test', examDate: '2026-05-02', marksObtained: 88, maxMarks: 100, grade: 'A+' },
        ],
        recentHomework: [
          { id: 'hw-1', title: 'Math Worksheet', dueDate: '2026-05-11', overdue: false },
          { id: 'hw-2', title: 'Science Notes', dueDate: '2026-05-08', overdue: true },
        ],
        todayTimetable: [
          { subjectName: 'Mathematics', startTime: '09:00', endTime: '09:45', label: '1st Period' },
          { subjectName: 'English', startTime: '11:00', endTime: '11:45', label: null },
        ],
      },
    },
  }),
}))

describe('StudentDashboardPage', () => {
  it('shows a study snapshot with the next class and latest result', () => {
    render(
      <MemoryRouter>
        <StudentDashboardPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Study Snapshot')).toBeInTheDocument()
    expect(screen.getByText(/Next class: Mathematics/)).toBeInTheDocument()
    expect(screen.getAllByText('Attendance').length).toBeGreaterThan(0)
    expect(screen.getAllByText('90%').length).toBeGreaterThan(0)
    expect(screen.getByText('Latest result:')).toBeInTheDocument()
    expect(screen.getAllByText('Mid Term').length).toBeGreaterThan(0)
    expect(screen.getByText('Math Worksheet')).toBeInTheDocument()
  })
})