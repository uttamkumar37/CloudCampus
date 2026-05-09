import { AxiosError } from 'axios'
import { useState } from 'react'

import { PageHeader } from '../../../components/ui/PageHeader'
import { FormInput } from '../../../components/ui/FormInput'
import { Select } from '../../../components/ui/Select'
import { showToast } from '../../../utils/toast'
import type { CreateUserRequest } from '../types'
import { useCreateUser } from '../hooks/useCreateUser'

function SnapshotStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-1 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  )
}

export function UsersPage() {
  const createUserMutation = useCreateUser()
  const [form, setForm] = useState<CreateUserRequest>({
    fullName: '',
    username: '',
    email: '',
    password: '',
    role: 'STUDENT',
  })
  const [submitError, setSubmitError] = useState<string | null>(null)
  const completedCoreFields = [form.fullName, form.email, form.role].filter((v) => v.trim().length > 0).length

  const handleChange = (k: keyof CreateUserRequest, v: string) => setForm((s) => ({ ...s, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)

    try {
      const response = await createUserMutation.mutateAsync(form)

      if (!response.success) {
        setSubmitError(response.message)
        showToast({ title: 'User not created', description: response.message, tone: 'error' })
        return
      }

      showToast({ title: 'User created', description: 'User has been created successfully.', tone: 'success' })
      setForm({ fullName: '', username: '', email: '', password: '', role: 'STUDENT' })
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>
      const msg = axiosError.response?.data?.message ?? 'Unable to create user'
      setSubmitError(msg)
      showToast({ title: 'User not created', description: msg, tone: 'error' })
    }
  }

  return (
    <section className="space-y-8">
      <PageHeader title="User Management" subtitle="Create and manage platform users across tenants." />

      <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-700">User Provisioning Snapshot</p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">{form.role} account setup</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Configure role, identity, and optional tenant mappings before creating a new platform user.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Role" value={form.role} tone="text-slate-900" />
            <SnapshotStat label="Core Fields" value={`${completedCoreFields}/3`} tone="text-emerald-700" />
            <SnapshotStat label="Tenant ID" value={form.tenantId ? 'Set' : 'Open'} tone="text-sky-700" />
            <SnapshotStat label="Submit" value={createUserMutation.isPending ? 'Running' : 'Ready'} tone="text-violet-700" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Provisioning Pulse</p>
            <p className="mt-2 text-sm text-slate-600">Readiness checks for identity fields, role scope, and user creation workflow state.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <SnapshotStat label="Username" value={form.username ? 'Set' : 'Auto'} tone="text-slate-700" />
            <SnapshotStat label="Password" value={form.password ? 'Manual' : 'Auto'} tone="text-violet-700" />
            <SnapshotStat label="Tenant" value={form.tenantId ? 'Mapped' : 'Global'} tone="text-sky-700" />
            <SnapshotStat label="Errors" value={submitError ? 'Present' : 'Clear'} tone="text-emerald-700" />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-[20px] border border-slate-200 bg-white p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput label="Full name" value={form.fullName} onChange={(v) => handleChange('fullName', v)} />
          <FormInput label="Username (optional for auto mode)" value={form.username} onChange={(v) => handleChange('username', v)} />
          <FormInput label="Email" value={form.email} onChange={(v) => handleChange('email', v)} />
          <FormInput label="Password (optional)" type="password" value={form.password ?? ''} onChange={(v) => handleChange('password', v)} />
          <label className="block space-y-2">
            <span className="block text-sm font-medium text-slate-700">Role</span>
            <Select
              value={form.role}
              onChange={(e) => handleChange('role', e.target.value)}
              className="w-full"
            >
              <option value="STUDENT">Student</option>
              <option value="TEACHER">Teacher</option>
              <option value="SCHOOL_ADMIN">School Admin</option>
              <option value="PARENT">Parent</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </Select>
          </label>
          <FormInput label="Tenant ID (optional)" value={form.tenantId ?? ''} onChange={(v) => handleChange('tenantId', v)} />
          <FormInput label="Class ID (optional)" value={form.classId ?? ''} onChange={(v) => handleChange('classId', v)} />
        </div>

        {submitError ? (
          <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{submitError}</div>
        ) : null}

        <p className="mt-4 text-xs text-slate-500">
          If username or password is left empty, CloudCampus will auto-generate default credentials and send them via email/SMS when available.
        </p>

        <div className="mt-3 flex items-center gap-3">
          <button type="submit" className="btn btn-primary" disabled={createUserMutation.isPending}>
            Create User
          </button>
        </div>
      </form>
    </section>
  )
}
