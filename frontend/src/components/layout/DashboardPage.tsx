import { Link } from 'react-router-dom'

import { PageHeader } from '../ui/PageHeader'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { sanitizeCssColor } from '../../utils/sanitize'
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
  const { role, username } = useAuth()
  const primaryColor = sanitizeCssColor(summary?.branding?.primaryColor)

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

  if (role === 'TEACHER') {
    return (
      <section className="space-y-8">
        <PageHeader
          title={`${summary.branding.schoolName} — Teacher Dashboard`}
          subtitle={`Welcome, ${username ?? 'Teacher'}. Manage your classes, homework, attendance, and marks.`}
        />

        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          <DashboardKpiCard
            title="School Attendance"
            value={`${summary.attendancePercentage.toFixed(1)}%`}
            accent={primaryColor}
            hint="School-wide attendance last 7 days"
          />
          <DashboardKpiCard
            title="Total Students"
            value={summary.totalStudents.toLocaleString()}
            accent="#0f172a"
            hint="Enrolled students in your school"
          />
          <DashboardKpiCard
            title="Total Teachers"
            value={summary.totalTeachers.toLocaleString()}
            accent="#2563eb"
            hint="Faculty currently onboarded"
          />
        </div>

        <DashboardChartCard
          title="Attendance Trend"
          subtitle="Daily attendance quality over the last 7 days"
        >
          <LineTrendChart data={summary.attendanceTrend} strokeColor={primaryColor} />
        </DashboardChartCard>

        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_22px_50px_-32px_rgba(15,23,42,0.35)]">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Quick Actions</h2>
          <p className="text-sm text-slate-500 mb-5">Jump into your most common teaching tasks.</p>
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              { to: '/attendance', label: 'Mark Attendance', desc: 'Track today\'s class', accent: primaryColor },
              { to: '/homework', label: 'Homework', desc: 'Assign & review', accent: '#2563eb' },
              { to: '/marks', label: 'Enter Marks', desc: 'Exam results', accent: '#7c3aed' },
              { to: '/timetable', label: 'Timetable', desc: 'Your weekly schedule', accent: '#0f172a' },
            ].map((item) => (
              <QuickActionCard key={item.to} title={item.label} subtitle={item.desc} to={item.to} accent={item.accent} />
            ))}
          </div>
        </div>

        <ActivityFeed items={summary.recentActivity} />
      </section>
    )
  }

  if (role === 'STUDENT') {
    return (
      <section className="space-y-8">
        <PageHeader
          title={`${summary.branding.schoolName} — Student Dashboard`}
          subtitle={`Welcome back, ${username ?? 'Student'}. Here's everything in one place.`}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { to: '/student/learning', label: 'My Learning Snapshot', desc: 'Homework, timetable, attendance, and results' },
            { to: '/fees', label: 'Fees', desc: 'Balances & payment status' },
            { to: '/change-password', label: 'Security', desc: 'Update your password' },
            { to: '/profile', label: 'Profile', desc: 'Your account details' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              style={{ borderTopColor: primaryColor, borderTopWidth: 3 }}
            >
              <p className="text-lg font-semibold text-slate-900">{item.label}</p>
              <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>
    )
  }

  if (role === 'PARENT') {
    return (
      <section className="space-y-8">
        <PageHeader
          title={`${summary.branding.schoolName} — Parent Dashboard`}
          subtitle={`Welcome, ${username ?? 'Parent'}. Stay connected with your children's school life.`}
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { to: '/my-children', label: 'My Children', desc: 'View linked student profiles' },
            { to: '/fees', label: 'Fees', desc: 'Pending & paid fees' },
            { to: '/profile', label: 'Profile', desc: 'Account details and contact info' },
            { to: '/change-password', label: 'Security', desc: 'Update your password' },
            { to: '/parent/learning', label: 'Parent Home', desc: 'Open your personalized parent dashboard' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              style={{ borderTopColor: primaryColor, borderTopWidth: 3 }}
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
          accent={primaryColor}
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
          <LineTrendChart data={summary.attendanceTrend} strokeColor={primaryColor} />
        </DashboardChartCard>

        <DashboardChartCard
          title="Monthly Fee Collection"
          subtitle="Collected payments in the last 6 months"
        >
          <MonthlyBarChart data={summary.monthlyFeeCollection} barColor={primaryColor} />
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
                accent={primaryColor}
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
                  style={{ backgroundColor: primaryColor }}
                >
                  {summary.branding.schoolName.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div className="space-y-1">
                <p className="text-base font-semibold text-slate-900">{summary.branding.schoolName}</p>
                <p className="text-sm text-slate-500">Theme color: {primaryColor}</p>
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
