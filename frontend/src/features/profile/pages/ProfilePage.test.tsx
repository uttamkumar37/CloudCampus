import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ProfilePage } from './ProfilePage'

vi.mock('../../auth/hooks/useCurrentProfile', () => ({
  useCurrentProfile: () => ({
    isLoading: false,
    isError: false,
    data: {
      success: true,
      data: {
        fullName: 'Asha Menon',
        username: 'asha.menon',
        email: 'asha.menon@cloudcampus.test',
        role: 'TEACHER',
        schoolName: 'CloudCampus International School',
        tenantSlug: 'cloudcampus-demo',
      },
    },
  }),
}))

describe('ProfilePage', () => {
  it('shows an account snapshot with role and workspace details', () => {
    render(<ProfilePage />)

    expect(screen.getByText('Account Snapshot')).toBeInTheDocument()
    expect(screen.getAllByText('Teacher').length).toBeGreaterThan(0)
    expect(screen.getAllByText('/cloudcampus-demo').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Email').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Username').length).toBeGreaterThan(0)
  })
})
