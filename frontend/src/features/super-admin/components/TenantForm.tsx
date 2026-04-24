import { useState } from 'react'
import type { FormEvent } from 'react'

import type { CreateTenantRequest } from '../types'

interface TenantFormProps {
  onSubmit: (payload: CreateTenantRequest) => Promise<boolean>
  isSubmitting: boolean
}

const initialState: CreateTenantRequest = {
  tenantId: '',
  schoolName: '',
  schemaName: '',
  logoUrl: '',
  primaryColor: '#10b981',
}

export function TenantForm({ onSubmit, isSubmitting }: TenantFormProps) {
  const [values, setValues] = useState(initialState)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const isSuccess = await onSubmit(values)

    if (isSuccess) {
      setValues(initialState)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_22px_50px_-32px_rgba(15,23,42,0.35)] lg:grid-cols-2"
    >
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Tenant ID</span>
        <input
          value={values.tenantId}
          onChange={(event) => setValues((current: CreateTenantRequest) => ({ ...current, tenantId: event.target.value }))}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          placeholder="sunrise-academy"
          required
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">School Name</span>
        <input
          value={values.schoolName}
          onChange={(event) => setValues((current: CreateTenantRequest) => ({ ...current, schoolName: event.target.value }))}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          placeholder="Sunrise Academy"
          required
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Schema Name</span>
        <input
          value={values.schemaName}
          onChange={(event) => setValues((current: CreateTenantRequest) => ({ ...current, schemaName: event.target.value }))}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          placeholder="sunrise"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Logo URL</span>
        <input
          value={values.logoUrl}
          onChange={(event) => setValues((current: CreateTenantRequest) => ({ ...current, logoUrl: event.target.value }))}
          className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
          placeholder="https://example.com/logo.png"
        />
      </label>
      <label className="space-y-2">
        <span className="text-sm font-semibold text-slate-700">Primary Color</span>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={values.primaryColor}
            onChange={(event) =>
              setValues((current: CreateTenantRequest) => ({ ...current, primaryColor: event.target.value }))
            }
            className="h-12 w-16 rounded-xl border border-slate-300 bg-white p-1"
          />
          <input
            value={values.primaryColor}
            onChange={(event) =>
              setValues((current: CreateTenantRequest) => ({ ...current, primaryColor: event.target.value }))
            }
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
            placeholder="#10b981"
            required
          />
        </div>
      </label>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? 'Creating tenant...' : 'Create Tenant'}
        </button>
      </div>
    </form>
  )
}
