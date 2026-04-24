import { PageHeader } from '../../../components/ui/PageHeader'

export function MarksHubPage() {
  return (
    <section className="space-y-4">
      <PageHeader title="Marks & exams" subtitle="Exams and published results." />
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
        <p>
          Backend: <code className="rounded bg-slate-100 px-1">/api/v1/exams</code> and results endpoints. Connect
          teacher upload and student report cards here.
        </p>
      </div>
    </section>
  )
}
