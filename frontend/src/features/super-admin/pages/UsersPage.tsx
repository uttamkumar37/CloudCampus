import { AxiosError } from 'axios'
import { useState } from 'react'

import { PageHeader } from '../../../components/ui/PageHeader'
import { FormInput } from '../../../components/ui/FormInput'
import { Select } from '../../../components/ui/Select'
import { showToast } from '../../../utils/toast'
import type { CreateUserRequest } from '../types'
import { useCreateUser } from '../hooks/useCreateUser'

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
