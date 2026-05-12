import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTenant,
  suspendTenant,
  activateTenant,
  listAllFeatures,
  listTenantFeatures,
  enableFeature,
  disableFeature,
} from '../api/tenantApi';
import type { FeatureType, TenantStatus } from '../types/tenant';

const STATUS_BADGE: Record<TenantStatus, string> = {
  ACTIVE:    'bg-green-100 text-green-700',
  SUSPENDED: 'bg-yellow-100 text-yellow-800',
  ARCHIVED:  'bg-gray-100 text-gray-500',
};

const TYPE_BADGE: Record<FeatureType, string> = {
  CORE:     'bg-blue-100 text-blue-700',
  OPTIONAL: 'bg-gray-100 text-gray-600',
  PREMIUM:  'bg-amber-100 text-amber-700',
  BETA:     'bg-purple-100 text-purple-700',
};

export function TenantDetailPage() {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const queryClient = useQueryClient();

  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant', id],
    queryFn:  () => getTenant(id!),
    enabled:  !!id,
  });

  const { data: allFeatures = [] } = useQuery({
    queryKey: ['features'],
    queryFn:  listAllFeatures,
  });

  const { data: tenantFeatures = [] } = useQuery({
    queryKey: ['tenant-features', id],
    queryFn:  () => listTenantFeatures(id!),
    enabled:  !!id,
  });

  const featureMap = new Map(tenantFeatures.map((tf) => [tf.featureKey, tf]));

  const invalidateTenant = () => {
    queryClient.invalidateQueries({ queryKey: ['tenant', id] });
    queryClient.invalidateQueries({ queryKey: ['tenants'] });
    queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] });
  };

  const suspendMutation  = useMutation({ mutationFn: () => suspendTenant(id!),  onSuccess: invalidateTenant });
  const activateMutation = useMutation({ mutationFn: () => activateTenant(id!), onSuccess: invalidateTenant });

  const invalidateFeatures = () => queryClient.invalidateQueries({ queryKey: ['tenant-features', id] });
  const enableMutation  = useMutation({ mutationFn: (key: string) => enableFeature(id!, key),  onSuccess: invalidateFeatures });
  const disableMutation = useMutation({ mutationFn: (key: string) => disableFeature(id!, key), onSuccess: invalidateFeatures });

  if (isLoading) return <div className="p-6 text-sm text-gray-500">Loading…</div>;
  if (!tenant)   return <div className="p-6 text-sm text-red-600">Tenant not found.</div>;

  const isBusy         = suspendMutation.isPending || activateMutation.isPending;
  const isTogglingBusy = enableMutation.isPending  || disableMutation.isPending;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <button
          onClick={() => navigate('/super-admin/tenants')}
          className="text-xs text-gray-400 hover:text-gray-600"
        >
          ← Back
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-gray-900">{tenant.name}</h1>
          <p className="mt-0.5 font-mono text-sm text-gray-500">{tenant.code}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_BADGE[tenant.status]}`}>
          {tenant.status}
        </span>
        {tenant.status === 'ACTIVE' && (
          <button
            onClick={() => suspendMutation.mutate()}
            disabled={isBusy}
            className="rounded-lg border border-orange-200 px-4 py-1.5 text-sm font-medium text-orange-600 hover:bg-orange-50 disabled:opacity-60"
          >
            {suspendMutation.isPending ? 'Suspending…' : 'Suspend'}
          </button>
        )}
        {tenant.status === 'SUSPENDED' && (
          <button
            onClick={() => activateMutation.mutate()}
            disabled={isBusy}
            className="rounded-lg border border-green-200 px-4 py-1.5 text-sm font-medium text-green-600 hover:bg-green-50 disabled:opacity-60"
          >
            {activateMutation.isPending ? 'Activating…' : 'Activate'}
          </button>
        )}
      </div>

      {/* Info card */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs font-medium text-gray-400">Tenant ID</dt>
            <dd className="mt-0.5 break-all font-mono text-xs text-gray-600">{tenant.id}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400">Code</dt>
            <dd className="mt-0.5 font-mono text-sm text-gray-700">{tenant.code}</dd>
          </div>
          <div>
            <dt className="text-xs font-medium text-gray-400">Created</dt>
            <dd className="mt-0.5 text-sm text-gray-700">
              {new Date(tenant.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric',
              })}
            </dd>
          </div>
        </dl>
      </div>

      {/* Feature toggles */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-700">Feature Flags</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            CORE features are always enabled and cannot be toggled.
          </p>
        </div>
        <div className="divide-y divide-gray-50">
          {allFeatures.map((feature) => {
            const tf        = featureMap.get(feature.key);
            const isCore    = feature.type === 'CORE';
            const isEnabled = isCore || (tf?.enabled ?? false);

            return (
              <div key={feature.key} className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-800">{feature.name}</span>
                    <span className={`rounded px-1.5 py-0.5 text-xs font-semibold ${TYPE_BADGE[feature.type]}`}>
                      {feature.type}
                    </span>
                  </div>
                  {feature.description && (
                    <p className="mt-0.5 truncate text-xs text-gray-400">{feature.description}</p>
                  )}
                </div>

                {/* Toggle switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isEnabled}
                  disabled={isCore || isTogglingBusy}
                  onClick={() => {
                    if (isCore) return;
                    if (isEnabled) disableMutation.mutate(feature.key);
                    else           enableMutation.mutate(feature.key);
                  }}
                  className={[
                    'relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors',
                    isCore          ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                    isEnabled       ? 'bg-blue-600' : 'bg-gray-200',
                    isTogglingBusy  ? 'opacity-60' : '',
                  ].filter(Boolean).join(' ')}
                >
                  <span
                    className={[
                      'h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform',
                      isEnabled ? 'translate-x-4' : 'translate-x-1',
                    ].join(' ')}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
