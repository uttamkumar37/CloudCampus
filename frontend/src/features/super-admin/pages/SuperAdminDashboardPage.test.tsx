import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { SuperAdminDashboardPage } from './SuperAdminDashboardPage'

vi.mock('../hooks/useSuperAdminDashboardSummary', () => ({
  useSuperAdminDashboardSummary: () => ({
    isLoading: false,
    isError: false,
    data: {
      data: {
        totalTenants: 8,
        activeTenants: 6,
        tenantsCreatedThisMonth: 2,
        inactiveTenants: 2,
        newestTenants: [
          {
            tenantId: 'tenant-1',
            slug: 'green-valley-school',
            schoolName: 'Green Valley School',
            schemaName: 'tenant_green_valley',
            logoUrl: null,
            primaryColor: '#1D4ED8',
            active: true,
            createdAt: '2026-05-08T10:00:00Z',
          },
          {
            tenantId: 'tenant-2',
            slug: 'sunrise-academy',
            schoolName: 'Sunrise Academy',
            schemaName: 'tenant_sunrise',
            logoUrl: null,
            primaryColor: '#0F766E',
            active: true,
            createdAt: '2026-05-07T10:00:00Z',
          },
        ],
      },
    },
  }),
}))

describe('SuperAdminDashboardPage', () => {
  it('shows a portfolio snapshot with active rate and newest school', () => {
    render(<SuperAdminDashboardPage />)

    expect(screen.getByText('Portfolio Snapshot')).toBeInTheDocument()
    expect(screen.getAllByText((content) => content.includes('75% of schools are active')).length).toBeGreaterThan(0)
    expect(screen.getAllByText('Green Valley School').length).toBeGreaterThan(0)
    expect(screen.getAllByText('tenant_green_valley').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Newest Schools').length).toBeGreaterThan(0)
    expect(screen.getAllByText('6').length).toBeGreaterThan(0)
  })
})