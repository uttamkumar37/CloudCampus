import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { DashboardPage } from './DashboardPage'

vi.mock('../../features/dashboard/hooks/useTenantDashboardSummary', () => ({
  useTenantDashboardSummary: () => ({
    isLoading: false,
    isError: false,
    data: {
      data: {
        branding: {
          tenantId: 'tenant-1',
          schoolName: 'CloudCampus International School',
          logoUrl: null,
          primaryColor: '#0f766e',
        },
        totalStudents: 420,
        totalTeachers: 32,
        attendancePercentage: 93.4,
        feesCollected: 125000,
        attendanceTrend: [],
        monthlyFeeCollection: [],
        recentActivity: [],
        quickInsights: ['Attendance is strong', 'Fees are healthy'],
      },
    },
  }),
}))

vi.mock('../../features/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    role: 'SCHOOL_ADMIN',
    username: 'admin.user',
    logout: vi.fn(),
    schoolName: 'CloudCampus International School',
  }),
}))

vi.mock('../../features/dashboard/components/ActivityFeed', () => ({
  ActivityFeed: () => <div>Activity Feed</div>,
}))
vi.mock('../../features/dashboard/components/DashboardChartCard', () => ({
  DashboardChartCard: ({ title, children }: { title: string; children: React.ReactNode }) => <div><h2>{title}</h2>{children}</div>,
}))
vi.mock('../../features/dashboard/components/DashboardKpiCard', () => ({
  DashboardKpiCard: ({ title, value }: { title: string; value: string }) => <div><p>{title}</p><p>{value}</p></div>,
}))
vi.mock('../../features/dashboard/components/LineTrendChart', () => ({
  LineTrendChart: () => <div>Trend Chart</div>,
}))
vi.mock('../../features/dashboard/components/MonthlyBarChart', () => ({
  MonthlyBarChart: () => <div>Bar Chart</div>,
}))
vi.mock('../../features/dashboard/components/QuickActionCard', () => ({
  QuickActionCard: ({ title }: { title: string }) => <div>{title}</div>,
}))

describe('DashboardPage', () => {
  it('shows a workspace snapshot with school health metrics', () => {
    render(<DashboardPage />)

    expect(screen.getByText('Workspace Snapshot')).toBeInTheDocument()
    expect(screen.getAllByText('CloudCampus International School').length).toBeGreaterThan(0)
    expect(screen.getAllByText('420').length).toBeGreaterThan(0)
    expect(screen.getAllByText('32').length).toBeGreaterThan(0)
    expect(screen.getAllByText('93.4%').length).toBeGreaterThan(0)
    expect(screen.getAllByText('2').length).toBeGreaterThan(0)
  })
})
