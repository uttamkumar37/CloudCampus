import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listTenants } from '../api/tenantApi';
import type { TenantStatus } from '../types/tenant';

const PAGE_SIZE = 20;

const STATUS_BADGE: Record<TenantStatus, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  SUSPENDED: 'bg-yellow-100 text-yellow-800',
  ARCHIVED: 'bg-gray-100 text-gray-500',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function TenantListPage() {
  const [offset, setOffset] = useState(0);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['tenants', offset],
    queryFn: () => listTenants(offset, PAGE_SIZE),
  });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const canPrev = offset > 0;
  const canNext = data ? offset + PAGE_SIZE < data.total : false;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Tenants</h1>
          {data && (
            <p className="mt-0.5 text-sm text-gray-500">{data.total} total</p>
          )}
        </div>
        <Link
          to="/super-admin/tenants/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          New Tenant
        </Link>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-500" role="status">
          Loading tenants…
        </p>
      )}

      {isError && (
        <p className="text-sm text-red-600" role="alert">
          Failed to load tenants. Please try again.
        </p>
      )}

      {data && data.items.length === 0 && !isLoading && (
        <p className="text-sm text-gray-500">No tenants yet. Create one to get started.</p>
      )}

      {data && data.items.length > 0 && (
        <>
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.items.map((tenant) => (
                  <tr key={tenant.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{tenant.name}</td>
                    <td className="px-4 py-3 font-mono text-gray-600">{tenant.code}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_BADGE[tenant.status]}`}
                      >
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{formatDate(tenant.createdAt)}</td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/super-admin/tenants/${tenant.id}`}
                        className="rounded px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setOffset(offset - PAGE_SIZE)}
                  disabled={!canPrev}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setOffset(offset + PAGE_SIZE)}
                  disabled={!canNext}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 disabled:opacity-40 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
