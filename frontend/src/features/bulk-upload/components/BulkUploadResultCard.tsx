import { Card } from '../../../components/ui/Card'

import type { BulkUploadSummary } from '../types'

interface BulkUploadResultCardProps {
  summary: BulkUploadSummary
}

export function BulkUploadResultCard({ summary }: BulkUploadResultCardProps) {
  return (
    <Card>
      <div className="flex flex-wrap gap-4">
        {[
          ['Total Rows', summary.totalRows],
          ['Succeeded', summary.successCount],
          ['Failed', summary.failedCount],
        ].map(([label, value]) => (
          <div key={label} className="min-w-[140px] rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{value}</p>
          </div>
        ))}
      </div>

      {summary.errors.length > 0 ? (
        <div className="mt-6">
          <h3 className="text-base font-semibold text-slate-950">Failed Rows</h3>
          <div className="mt-3 space-y-3">
            {summary.errors.map((error, index) => (
              <div
                key={`${error.sheet}-${error.row}-${index}`}
                className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3"
              >
                <p className="text-sm font-semibold text-rose-900">
                  {error.sheet} sheet, row {error.row}
                </p>
                <p className="mt-1 text-sm text-rose-800">{error.message}</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </Card>
  )
}
