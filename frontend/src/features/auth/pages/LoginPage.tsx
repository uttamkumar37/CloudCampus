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

      setAuthSession(response.data.accessToken, formValues.tenantId)
      navigate('/dashboard', { replace: true })
    } catch {
      setFormError('Unable to sign in. Check credentials and tenant ID.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Sign in to EduTenant</h1>
        <p className="mt-2 text-sm text-slate-600">Use your tenant-bound credentials to continue.</p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-700">Tenant ID</span>
            <input
              type="text"
              value={formValues.tenantId}
              onChange={(event) =>
                setFormValues((previous) => ({ ...previous, tenantId: event.target.value }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-200 transition focus:ring-2"
              placeholder="school-tenant-001"
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
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-200 transition focus:ring-2"
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
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none ring-emerald-200 transition focus:ring-2"
              placeholder="••••••••"
              required
            />
          </label>

          {formError ? (
            <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {formError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="inline-flex w-full items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
          >
            {loginMutation.isPending ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
