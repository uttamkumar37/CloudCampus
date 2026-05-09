import { PageHeader } from '../../../components/ui/PageHeader'

import { completedRoadmapFeatures, featureRoadmap, inProgressRoadmapFeatures, totalRoadmapFeatures, type FeatureStatus } from '../data/featureRoadmap'

const statusConfig: Record<FeatureStatus, { label: string; className: string; dotClass: string }> = {
  completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 border border-emerald-200', dotClass: 'bg-emerald-500' },
  'in-progress': { label: 'In Progress', className: 'bg-amber-50 text-amber-700 border border-amber-200', dotClass: 'bg-amber-400' },
  planned: { label: 'Planned', className: 'bg-slate-100 text-slate-500 border border-slate-200', dotClass: 'bg-slate-400' },
}

function StatusBadge({ status }: { status: FeatureStatus }) {
  const cfg = statusConfig[status]
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.className}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotClass}`} />
      {cfg.label}
    </span>
  )
}

export function FeatureRoadmapPage() {
  const plannedFeatures = totalRoadmapFeatures - completedRoadmapFeatures - inProgressRoadmapFeatures
  const completionPct = Math.round((completedRoadmapFeatures / totalRoadmapFeatures) * 100)

  return (
    <section className="space-y-8">
      <PageHeader
        title="Product Roadmap"
        subtitle="A live, in-app reflection of the 100 feature opportunities this platform can grow into."
        badge={{ label: '100 Feature Catalog', tone: 'green' }}
      />

      <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700">Roadmap Snapshot</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{totalRoadmapFeatures} planned capability items</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Present future-ready module expansion in a structured catalog that schools can preview today.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Total</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{totalRoadmapFeatures}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Completed</p>
              <p className="mt-1 text-xl font-bold text-emerald-700">{completedRoadmapFeatures}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">In Progress</p>
              <p className="mt-1 text-xl font-bold text-amber-600">{inProgressRoadmapFeatures}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Planned</p>
              <p className="mt-1 text-xl font-bold text-slate-500">{plannedFeatures}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Completion Progress</p>
            <p className="mt-2 text-sm text-slate-600">{completedRoadmapFeatures} of {totalRoadmapFeatures} features shipped — {completionPct}% complete.</p>
            <div className="mt-3 h-2 w-full max-w-sm overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${completionPct}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Avg / Group</p>
              <p className="mt-1 text-xl font-bold text-sky-700">{Math.round(totalRoadmapFeatures / Math.max(featureRoadmap.length, 1))}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Categories</p>
              <p className="mt-1 text-xl font-bold text-emerald-700">{featureRoadmap.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">% Done</p>
              <p className="mt-1 text-xl font-bold text-violet-700">{completionPct}%</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Remaining</p>
              <p className="mt-1 text-xl font-bold text-amber-700">{totalRoadmapFeatures - completedRoadmapFeatures}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Completed</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-emerald-700">{completedRoadmapFeatures}</p>
          <p className="mt-1 text-sm text-emerald-600">of {totalRoadmapFeatures} total features</p>
        </div>
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">In Progress</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-amber-700">{inProgressRoadmapFeatures}</p>
          <p className="mt-1 text-sm text-amber-600">actively being built</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Planned</p>
          <p className="mt-3 text-4xl font-bold tracking-tight text-slate-700">{plannedFeatures}</p>
          <p className="mt-1 text-sm text-slate-500">queued for future releases</p>
        </div>
      </div>

      <div className="space-y-6">
        {featureRoadmap.map((group, groupIndex) => {
          const groupCompleted = group.items.filter((i) => i.status === 'completed').length
          const groupInProgress = group.items.filter((i) => i.status === 'in-progress').length
          return (
            <article key={group.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_22px_50px_-32px_rgba(15,23,42,0.35)]">
              <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">
                    Group {groupIndex + 1}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">{group.title}</h2>
                  <p className="mt-2 text-sm text-slate-500">{group.summary}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                  <span className="cc-badge cc-badge-blue">{group.items.length} features</span>
                  {groupCompleted > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {groupCompleted} done
                    </span>
                  )}
                  {groupInProgress > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      {groupInProgress} in progress
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {group.items.map((item, itemIndex) => (
                  <div
                    key={item.name}
                    className={`rounded-2xl border p-4 transition hover:-translate-y-0.5 hover:shadow-md ${
                      item.status === 'completed'
                        ? 'border-emerald-200 bg-emerald-50/60'
                        : item.status === 'in-progress'
                          ? 'border-amber-200 bg-amber-50/60'
                          : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                        item.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-700'
                          : item.status === 'in-progress'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-500'
                      }`}>
                        {String(itemIndex + 1).padStart(2, '0')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-1">
                          <h3 className="font-semibold text-slate-950">{item.name}</h3>
                          <StatusBadge status={item.status} />
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}