import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ParentLinksAdminPage } from './ParentLinksAdminPage'

const linkParentMock = vi.fn(async () => ({ success: true, message: 'ok' }))
const unlinkParentMock = vi.fn(async () => undefined)
const getUsersMock = vi.fn(async () => ({
  success: true,
  message: 'ok',
  data: {
    content: [
      {
        id: 'parent-user-id',
        username: 'sanjay.patel',
        email: 'sanjay.patel@cloudcampus.demo',
        role: 'PARENT',
      },
      {
        id: 'teacher-user-id',
        username: 'rohit.verma',
        email: 'rohit.verma@cloudcampus.demo',
        role: 'TEACHER',
      },
    ],
  },
}))

vi.mock('../../student/hooks/useStudents', () => ({
  useStudents: () => ({
    isLoading: false,
    data: {
      data: {
        content: [
          {
            id: 'student-id-1',
            admissionNo: 'ADM-7001',
            firstName: 'Mira',
            lastName: 'Patel',
          },
        ],
      },
    },
  }),
}))

vi.mock('../../super-admin/api/usersApi', () => ({
  getUsers: () => getUsersMock(),
}))

vi.mock('../hooks/useParentLinks', () => ({
  useParentLinks: () => ({
    isLoading: false,
    isError: false,
    data: {
      data: [
        {
          linkId: 'link-1',
          parentUserId: 'parent-user-id',
          parentFullName: 'Sanjay Patel',
          parentEmail: 'sanjay.patel@cloudcampus.demo',
          studentId: 'student-id-1',
          admissionNo: 'ADM-7001',
          studentFirstName: 'Mira',
          studentLastName: 'Patel',
          linkedAt: '2026-05-05T00:00:00Z',
        },
      ],
    },
  }),
  useLinkParent: () => ({
    isPending: false,
    mutateAsync: linkParentMock,
  }),
  useUnlinkParent: () => ({
    isPending: false,
    mutateAsync: unlinkParentMock,
  }),
}))

vi.mock('../../../utils/toast', () => ({
  showToast: vi.fn(),
}))

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <ParentLinksAdminPage />
    </QueryClientProvider>,
  )
}

describe('ParentLinksAdminPage', () => {
  it('renders existing links and allows unlinking a parent-student pair', async () => {
    renderPage()

    await waitFor(() => {
      expect(getUsersMock).toHaveBeenCalled()
    })

    expect(screen.getByText('Parent Links')).toBeInTheDocument()
    expect(screen.getByText('Sanjay Patel')).toBeInTheDocument()
    expect(screen.getByText('Mira Patel')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Unlink' }))

    await waitFor(() => {
      expect(unlinkParentMock).toHaveBeenCalledWith('link-1')
    })
  })
})
