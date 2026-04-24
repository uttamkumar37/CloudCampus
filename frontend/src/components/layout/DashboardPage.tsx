import { Link } from 'react-router-dom'

import { PageHeader } from '../ui/PageHeader'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { ActivityFeed } from '../../features/dashboard/components/ActivityFeed'
import { DashboardChartCard } from '../../features/dashboard/components/DashboardChartCard'
import { DashboardKpiCard } from '../../features/dashboard/components/DashboardKpiCard'
import { LineTrendChart } from '../../features/dashboard/components/LineTrendChart'
import { MonthlyBarChart } from '../../features/dashboard/components/MonthlyBarChart'
import { QuickActionCard } from '../../features/dashboard/components/QuickActionCard'
import { useTenantDashboardSummary } from '../../features/dashboard/hooks/useTenantDashboardSummary'

export function DashboardPage() {
  const summaryQuery = useTenantDashboardSummary()
  const summary = summaryQuery.data?.data
  const { role } = useAuth()

  if (summaryQuery.isLoading) {
    return (
      <section className="space-y-6">
        <PageHeader title="Dashboard" subtitle="Loading your tenant intelligence workspace." />
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-36 animate-pulse rounded-[28px] border border-slate-200 bg-white/70"
            />
          ))}
        </div>
      </section>
    )
  }

  if (summaryQuery.isError || !summary) {
    return (
      <section className="space-y-6">
        <PageHeader title="Dashboard" subtitle="Unable to load tenant dashboard data." />
        <div className="rounded-[28px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">
          Dashboard data could not be loaded. Please verify your tenant session and try again.
        </div>
      </section>
    )
  }

  if (role === 'STUDENT' || role === 'PARENT') {
    return (
      <section className="space-y-8">
        <PageHeader
          title={role === 'PARENT' ? 'Family dashboard' : 'Student dashboard'}
          subtitle="Jump to homework, timetable, fees, and more. Your school branding follows you in the sidebar."
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { to: '/homework', label: 'Homework', desc: 'Assignments by class' },
            { to: '/timetable', label: 'Timetable', desc: 'Weekly schedule' },
            { to: '/attendance', label: 'Attendance', desc: 'Your records' },
            { to: '/fees', label: 'Fees', desc: 'Balances & payments' },
            { to: '/marks', label: 'Marks', desc: 'Exams & results' },
            { to: '/profile', label: 'Profile', desc: 'Account details' },
            ...(role === 'PARENT' ? [{ to: '/my-children', label: 'My children', desc: 'Linked students' }] : []),
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300 hover:shadow-md"
            >
              <p className="text-lg font-semibold text-slate-900">{item.label}</p>
              <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title={`${summary.branding.schoolName} Dashboard`}
        subtitle="Premium operating view for your school with live KPIs, trends, and recent activity."
      />

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <DashboardKpiCard
          title="Total Students"
          value={summary.totalStudents.toLocaleString()}
          accent={summary.branding.primaryColor}
          hint="Active learners across the tenant"
        />
        <DashboardKpiCard
          title="Total Teachers"
          value={summary.totalTeachers.toLocaleString()}
          accent="#0f172a"
          hint="Faculty currently onboarded"
        />
        <DashboardKpiCard
          title="Attendance %"
          value={`${summary.attendancePercentage.toFixed(1)}%`}
          accent="#2563eb"
          hint="Last 7 days attended rate"
        />
        <DashboardKpiCard
          title="Fees Collected"
          value={`₹${summary.feesCollected.toLocaleString()}`}
          accent="#7c3aed"
          hint="Collected over the current 6-month window"
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <DashboardChartCard
          title="Attendance Trend"
          subtitle="Daily attendance quality over the last 7 days"
        >
          <LineTrendChart data={summary.attendanceTrend} strokeColor={summary.branding.primaryColor} />
        </DashboardChartCard>

        <DashboardChartCard
          title="Monthly Fee Collection"
          subtitle="Collected payments in the last 6 months"
        >
          <MonthlyBarChart data={summary.monthlyFeeCollection} barColor={summary.branding.primaryColor} />
        </DashboardChartCard>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-5">
          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_22px_50px_-32px_rgba(15,23,42,0.35)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Quick Actions</h2>
                <p className="mt-1 text-sm text-slate-500">Jump into your most common admin tasks.</p>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <QuickActionCard
                title="Add Student"
                subtitle="Create a new enrollment record"
                to="/students"
                accent={summary.branding.primaryColor}
              />
              <QuickActionCard
                title="Add Teacher"
                subtitle="Onboard a faculty member"
                to="/teachers"
                accent="#0f172a"
              />
              <QuickActionCard
                title="Mark Attendance"
                subtitle="Track the school day"
                to="/dashboard"
                accent="#2563eb"
              />
            </div>
          </div>

          <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_22px_50px_-32px_rgba(15,23,42,0.35)]">
            <h2 className="text-lg font-semibold text-slate-900">Tenant Branding</h2>
            <div className="mt-4 flex items-center gap-4 rounded-[24px] bg-slate-50 p-4">
              {summary.branding.logoUrl ? (
                <img
                  src={summary.branding.logoUrl}
                  alt={summary.branding.schoolName}
                  className="h-16 w-16 rounded-2xl object-cover"
                />
              ) : (
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold text-white"
                  style={{ backgroundColor: summary.branding.primaryColor }}
                >
                  {summary.branding.schoolName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-900">{summary.branding.schoolName}</p>
                <p className="text-sm text-slate-500">Theme color: {summary.branding.primaryColor}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {summary.quickInsights.map((insight) => (
                    <span
                      key={insight}
                      className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white"
                    >
                      {insight}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <ActivityFeed items={summary.recentActivity} />
      </div>
    </section>
  )
}
