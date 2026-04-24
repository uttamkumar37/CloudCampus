import { useQuery } from '@tanstack/react-query'

import { apiClient } from '../../../api/client'
import { ENDPOINTS } from '../../../api/endpoints'
import { PageHeader } from '../../../components/ui/PageHeader'
import type { ApiResponse } from '../../../types/api'

interface Child {
  studentId: string
  admissionNo: string
  firstName: string
  lastName: string
}

async function fetchChildren() {
  const { data } = await apiClient.get<ApiResponse<Child[]>>(ENDPOINTS.parent.myChildren)
  return data
}

export function MyChildrenPage() {
  const q = useQuery({ queryKey: ['parent', 'children'], queryFn: fetchChildren })

  return (
    <section className="space-y-6">
      <PageHeader title="My children" subtitle="Students linked to your parent account in this school." />
      {q.isLoading ? <div className="h-24 animate-pulse rounded-[28px] bg-white/80" /> : null}
      {q.isError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          Unable to load children. Ensure your user has role PARENT and links exist in parent_students.
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {q.data?.data?.map((c) => (
          <div key={c.studentId} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-lg font-semibold text-slate-900">
              {c.firstName} {c.lastName}
            </p>
            <p className="text-sm text-slate-500">Admission {c.admissionNo}</p>
            <p className="mt-2 font-mono text-xs text-slate-400">{c.studentId}</p>
          </div>
        ))}
      </div>
      {q.data?.success && (q.data.data?.length ?? 0) === 0 ? (
        <p className="text-sm text-slate-500">No linked students yet.</p>
      ) : null}
    </section>
  )
}
