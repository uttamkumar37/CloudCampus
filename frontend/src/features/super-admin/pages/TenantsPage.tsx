import { AxiosError } from 'axios'
import { useState } from 'react'

import { PageHeader } from '../../../components/ui/PageHeader'
import { DataTable, type DataTableColumn } from '../../../components/ui/DataTable'
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog'
import type { ApiResponse } from '../../../types/api'
import { showToast } from '../../../utils/toast'

import { TenantForm } from '../components/TenantForm'
import { useCreateTenant } from '../hooks/useCreateTenant'
import { useTenants } from '../hooks/useTenants'
import { useUpdateTenantStatus } from '../hooks/useUpdateTenantStatus'
import type { CreateTenantRequest, Tenant } from '../types'

export function TenantsPage() {
  const tenantsQuery = useTenants()
  const createTenantMutation = useCreateTenant()
  const updateTenantStatusMutation = useUpdateTenantStatus()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [tenantPendingDeactivation, setTenantPendingDeactivation] = useState<Tenant | null>(null)
  const [deactivationSlugInput, setDeactivationSlugInput] = useState('')

  const columns: DataTableColumn<Tenant>[] = [
    {
      key: 'school',
      header: 'School',
      cell: (tenant) => (
        <div className="flex items-center gap-3">
          {tenant.logoUrl ? (
            <img src={tenant.logoUrl} alt={tenant.schoolName} className="h-10 w-10 rounded-xl object-cover" />
          ) : (
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white"
              style={{ backgroundColor: tenant.primaryColor }}
            >
              {tenant.schoolName.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-slate-900">{tenant.schoolName}</p>
            <p className="text-xs text-slate-500">/{tenant.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'schema',
      header: 'Schema',
      cell: (tenant) => tenant.schemaName,
    },
    {
      key: 'theme',
      header: 'Primary Color',
      cell: (tenant) => (
        <div className="flex items-center gap-2">
          <span
            className="h-4 w-4 rounded-full border border-slate-300"
            style={{ backgroundColor: tenant.primaryColor }}
          />
          {tenant.primaryColor}
        </div>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created',
      cell: (tenant) =>
        new Intl.DateTimeFormat('en-IN', { dateStyle: 'medium', timeStyle: 'short' }).format(
          new Date(tenant.createdAt),
        ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (tenant) => (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            tenant.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-700'
          }`}
        >
          {tenant.active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      cell: (tenant) => (
        <button
          type="button"
          onClick={() => void handleToggleTenantStatus(tenant)}
          disabled={updateTenantStatusMutation.isPending}
          className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
            tenant.active
              ? 'bg-rose-100 text-rose-700 hover:bg-rose-200'
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          } disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {tenant.active ? 'Deactivate' : 'Activate'}
        </button>
      ),
    },
  ]

  const handleToggleTenantStatus = async (tenant: Tenant) => {
    if (tenant.active) {
      setTenantPendingDeactivation(tenant)
      setDeactivationSlugInput('')
      return
    }

    await updateTenantStatus(tenant, true)
  }

  const updateTenantStatus = async (tenant: Tenant, active: boolean) => {
    try {
      const response = await updateTenantStatusMutation.mutateAsync({
        tenantId: tenant.tenantId,
        active,
      })

      if (!response.success) {
        showToast({ title: 'Tenant status not updated', description: response.message, tone: 'error' })
        return
      }

      showToast({
        title: `Tenant ${response.data.active ? 'activated' : 'deactivated'}`,
        description: `${response.data.schoolName} is now ${response.data.active ? 'active' : 'inactive'}.`,
        tone: 'success',
      })
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      showToast({
        title: 'Tenant status not updated',
        description: axiosError.response?.data?.message ?? 'Unable to update tenant status',
        tone: 'error',
      })
    }
  }

  const handleConfirmDeactivation = async () => {
    if (!tenantPendingDeactivation || deactivationSlugInput !== tenantPendingDeactivation.slug) {
      return
    }

    await updateTenantStatus(tenantPendingDeactivation, false)
    setTenantPendingDeactivation(null)
    setDeactivationSlugInput('')
  }

  const handleCreateTenant = async (payload: CreateTenantRequest) => {
    setSubmitError(null)

    try {
      const response = await createTenantMutation.mutateAsync(payload)

      if (!response.success) {
        setSubmitError(response.message)
        showToast({ title: 'Tenant not created', description: response.message, tone: 'error' })
        return false
      }

      showToast({
        title: 'Tenant created',
        description: `${response.data.schoolName} and school admin ${payload.schoolAdminUsername} are now provisioned.`,
        tone: 'success',
      })
      return true
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>
      setSubmitError(axiosError.response?.data?.message ?? 'Unable to create tenant')
      showToast({
        title: 'Tenant not created',
        description: axiosError.response?.data?.message ?? 'Unable to create tenant',
        tone: 'error',
      })
      return false
    }
  }

  return (
    <section className="space-y-8">
      <PageHeader
        title="Tenant Management"
        subtitle="Provision new schools, define slugs, set branding defaults, and monitor the tenant list."
      />

      <TenantForm onSubmit={handleCreateTenant} isSubmitting={createTenantMutation.isPending} />

      {submitError ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {submitError}
        </div>
      ) : null}

      <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_22px_50px_-32px_rgba(15,23,42,0.35)]">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-slate-950">Tenant List</h2>
          <p className="mt-1 text-sm text-slate-500">Every onboarded school in the public CloudCampus registry.</p>
        </div>

        {tenantsQuery.isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            Failed to fetch tenants.
          </div>
        ) : null}

        {tenantsQuery.data ? (
          <DataTable
            columns={columns}
            rows={tenantsQuery.data.data}
            rowKey={(tenant) => tenant.slug}
            emptyText="No tenants found."
          />
        ) : null}
      </div>

      <ConfirmDialog
        isOpen={tenantPendingDeactivation !== null}
        title="Deactivate tenant?"
        description={
          tenantPendingDeactivation
            ? `${tenantPendingDeactivation.schoolName} users will not be able to log in until the tenant is activated again. Type slug "${tenantPendingDeactivation.slug}" to confirm.`
            : ''
        }
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        isDangerous
        isLoading={updateTenantStatusMutation.isPending}
        isConfirmDisabled={
          !tenantPendingDeactivation || deactivationSlugInput !== tenantPendingDeactivation.slug
        }
        onConfirm={() => {
          void handleConfirmDeactivation()
        }}
        onCancel={() => {
          if (!updateTenantStatusMutation.isPending) {
            setTenantPendingDeactivation(null)
            setDeactivationSlugInput('')
          }
        }}
      >
        <div className="mt-3">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-700">Confirm Tenant Slug</span>
            <input
              value={deactivationSlugInput}
              onChange={(event) => setDeactivationSlugInput(event.target.value.trim())}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-900"
              placeholder={tenantPendingDeactivation?.slug ?? ''}
            />
          </label>
        </div>
      </ConfirmDialog>
    </section>
  )
}
