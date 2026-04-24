import { PageHeader } from '../../../components/ui/PageHeader'

export function AttendanceHubPage() {
  return (
    <section className="space-y-4">
      <PageHeader title="Attendance" subtitle="View and record attendance for your classes." />
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        <p>
          Backend: <code className="rounded bg-slate-100 px-1">GET/POST /api/v1/attendances</code>. Teacher and admin
          flows can be wired here with date pickers and class rosters.
        </p>
      </div>
    </section>
  )
}
