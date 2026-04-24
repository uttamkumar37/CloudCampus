import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../hooks/useAuth'
import { useLogin } from '../hooks/useLogin'

export function LoginPage() {
  const navigate = useNavigate()
  const { setAuthSession } = useAuth()
  const loginMutation = useLogin()

  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
    tenantId: '',
  })
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setFormError(null)

    try {
      const response = await loginMutation.mutateAsync(formValues)

      if (!response.success) {
        setFormError(response.message || 'Invalid credentials')
        return
      }

      // Prefer tenantId returned from backend; fall back to entered tenantId
      const returnedTenantId = response.data?.tenantId ?? formValues.tenantId

      setAuthSession(response.data, returnedTenantId)
      navigate(response.data.role === 'SUPER_ADMIN' ? '/super-admin/dashboard' : '/dashboard', {
        replace: true,
      })
    } catch {
      setFormError('Unable to sign in. Check credentials and tenant ID.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f8fb] p-4">
      <div className="w-full max-w-md rounded-[34px] border border-slate-200 bg-white p-8 shadow-[0_30px_70px_-40px_rgba(15,23,42,0.35)]">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">CampusCloud</p>
        <h1 className="mt-4 text-3xl font-semibold text-slate-950">Tenant Login</h1>
        <p className="mt-2 text-sm text-slate-600">Use your tenant-bound credentials to enter the school workspace.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Tenant ID</span>
            <input
              type="text"
              value={formValues.tenantId}
              onChange={(event) =>
                setFormValues((previous) => ({ ...previous, tenantId: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none ring-emerald-200 transition focus:ring-2"
              placeholder="sunrise"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Username</span>
            <input
              type="text"
              value={formValues.username}
              onChange={(event) =>
                setFormValues((previous) => ({ ...previous, username: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none ring-emerald-200 transition focus:ring-2"
              placeholder="admin"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Password</span>
            <input
              type="password"
              value={formValues.password}
              onChange={(event) =>
                setFormValues((previous) => ({ ...previous, password: event.target.value }))
              }
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm text-slate-900 outline-none ring-emerald-200 transition focus:ring-2"
              placeholder="••••••••"
              required
            />
          </label>

          {formError ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {formError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/super-admin/login')}
            className="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Super Admin Login
          </button>
        </form>
      </div>
    </div>
  )
}
