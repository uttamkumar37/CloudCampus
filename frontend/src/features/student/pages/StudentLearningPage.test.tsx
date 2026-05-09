import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StudentLearningPage } from './StudentLearningPage'

vi.mock('../../dashboard/hooks/useStudentDashboard', () => ({
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
        recentResults: [],
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

describe('StudentLearningPage', () => {
  it('shows a learning snapshot with the next class and workload counts', () => {
    render(<StudentLearningPage />)

    expect(screen.getByText('Learning Snapshot')).toBeInTheDocument()
    expect(screen.getByText('2 class(es) today')).toBeInTheDocument()
    expect(screen.getByText(/Next class: Mathematics/)).toBeInTheDocument()
    expect(screen.getAllByText('Attendance').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Homework').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Overdue').length).toBeGreaterThan(0)
  })
})
