import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import { TeachersPage } from './TeachersPage'

vi.mock('../../auth/hooks/useAuth', () => ({
  useAuth: () => ({ role: 'SCHOOL_ADMIN' }),
}))

vi.mock('../hooks/useTeachers', () => ({
  useTeachers: () => ({
    isLoading: false,
    isError: false,
    data: {
      data: {
        content: [
          {
            id: 'teacher-1',
            employeeNo: 'EMP-101',
            firstName: 'Asha',
            lastName: 'Verma',
            email: 'asha.verma@cloudcampus.test',
            phone: '9999999999',
            hireDate: '2024-04-10',
            active: true,
            createdAt: '2024-04-10T00:00:00Z',
            status: 'ACTIVE',
            classTeacherSections: [
              { classId: 'class-1', className: 'Grade 7', sectionId: 'sec-a', sectionName: 'A' },
            ],
          },
          {
            id: 'teacher-2',
            employeeNo: 'EMP-102',
            firstName: 'Rohit',
            lastName: 'Shah',
            email: 'rohit.shah@cloudcampus.test',
            phone: null,
            hireDate: '2023-07-01',
            active: true,
            createdAt: '2023-07-01T00:00:00Z',
            status: 'ON_LEAVE',
            classTeacherSections: [],
          },
          {
            id: 'teacher-3',
            employeeNo: 'EMP-103',
            firstName: 'Neha',
            lastName: 'Joshi',
            email: 'neha.joshi@cloudcampus.test',
            phone: null,
            hireDate: '2022-09-15',
            active: false,
            createdAt: '2022-09-15T00:00:00Z',
            status: 'RESIGNED',
            classTeacherSections: [
              { classId: 'class-2', className: 'Grade 8', sectionId: 'sec-b', sectionName: 'B' },
            ],
          },
        ],
        page: 0,
        totalPages: 1,
        totalElements: 3,
        last: true,
      },
    },
  }),
}))

vi.mock('../hooks/useCreateTeacher', () => ({
  useCreateTeacher: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))

vi.mock('../hooks/useUpdateTeacher', () => ({
  useUpdateTeacher: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))

vi.mock('../hooks/useDeleteTeacher', () => ({
  useDeleteTeacher: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))

vi.mock('../../../utils/toast', () => ({
  showToast: vi.fn(),
}))

describe('TeachersPage', () => {
  it('shows a faculty snapshot above the teachers table', () => {
    render(
      <MemoryRouter>
        <TeachersPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Faculty Snapshot')).toBeInTheDocument()
    expect(screen.getByText('3 teachers in the current view')).toBeInTheDocument()
    expect(screen.getAllByText('Active').length).toBeGreaterThan(0)
    expect(screen.getAllByText('On Leave').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Inactive').length).toBeGreaterThan(0)
    expect(screen.getByText('Class Teachers')).toBeInTheDocument()
    expect(screen.getByText('Asha Verma')).toBeInTheDocument()
    expect(screen.getByText('Rohit Shah')).toBeInTheDocument()
    expect(screen.getByText('Neha Joshi')).toBeInTheDocument()
  })
})