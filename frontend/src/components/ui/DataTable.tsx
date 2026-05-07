import type { ReactNode } from 'react'

import { EmptyState } from './EmptyState'

export interface DataTableColumn<T> {
  key: string
  header: string
  cell: (row: T) => ReactNode
  className?: string
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[]
  rows: T[]
  rowKey: (row: T) => string
  emptyText?: string
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyText = 'No records found.',
}: DataTableProps<T>) {
  if (!rows.length) {
    return <EmptyState title="Nothing here yet" description={emptyText} />
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 ${column.className ?? ''}`}
                >
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, idx) => (
              <tr
                key={rowKey(row)}
                className={`transition hover:bg-slate-50/70 ${idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'}`}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-5 py-3.5 text-sm text-slate-700">
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
