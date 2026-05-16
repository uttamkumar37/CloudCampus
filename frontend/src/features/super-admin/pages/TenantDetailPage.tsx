import { useState } from 'react';
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
  getTenantConfig,
  setTenantConfig,
} from '../api/tenantApi';
import {
  getTenantSubscription,
  listSubscriptionPlans,
  assignTenantPlan,
} from '../api/subscriptionApi';
import type { AssignPlanRequest } from '../api/subscriptionApi';
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

  const { data: configData, refetch: refetchConfig } = useQuery({
    queryKey: ['tenant-config', id],
    queryFn: () => getTenantConfig(id!),
    enabled: !!id,
  });

  const { data: subscription, refetch: refetchSub } = useQuery({
    queryKey: ['tenant-subscription', id],
    queryFn:  () => getTenantSubscription(id!),
    enabled:  !!id,
  });

  const { data: plans = [] } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn:  listSubscriptionPlans,
  });

  const [subPlanCode, setSubPlanCode]       = useState('');
  const [subBilling, setSubBilling]         = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [subNotes, setSubNotes]             = useState('');
  const [subEditing, setSubEditing]         = useState(false);
  const [subError, setSubError]             = useState<string | null>(null);

  const assignPlanMutation = useMutation({
    mutationFn: (req: AssignPlanRequest) => assignTenantPlan(id!, req),
    onSuccess: () => { refetchSub(); setSubEditing(false); setSubError(null); },
    onError: (err: unknown) => {
      setSubError(
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Failed to assign plan',
      );
    },
  });

  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue]   = useState('');

  const configMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      setTenantConfig(id!, key, value),
    onSuccess: () => { refetchConfig(); setEditingKey(null); },
  });

  const invalidateTenant = () => {
    queryClient.invalidateQueries({ queryKey: ['tenant', id] });
    queryClient.invalidateQueries({ queryKey: ['tenants'] });
    queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] });
  };

  const suspendMutation  = useMutation({ mutationFn: () => suspendTenant(id!),  onSuccess: invalidateTenant });
  const activateMutation = useMutation({ mutationFn: () => activateTenant(id!), onSuccess: invalidateTenant });

  const [featureError, setFeatureError] = useState<string | null>(null);

  const invalidateFeatures = () => {
    queryClient.invalidateQueries({ queryKey: ['tenant-features', id] });
    setFeatureError(null);
  };
  const enableMutation  = useMutation({
    mutationFn: (key: string) => enableFeature(id!, key),
    onSuccess: invalidateFeatures,
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Failed to enable feature';
      setFeatureError(msg);
    },
  });
  const disableMutation = useMutation({
    mutationFn: (key: string) => disableFeature(id!, key),
    onSuccess: invalidateFeatures,
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Failed to disable feature';
      setFeatureError(msg);
    },
  });

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

      {/* Subscription */}
      {subscription && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-gray-700">Subscription</h2>
              <p className="mt-0.5 text-xs text-gray-400">Current plan and billing details.</p>
            </div>
            {!subEditing && (
              <button
                onClick={() => {
                  setSubPlanCode(subscription.plan.code);
                  setSubBilling(subscription.billingCycle);
                  setSubNotes(subscription.notes ?? '');
                  setSubEditing(true);
                  setSubError(null);
                }}
                className="rounded-lg border border-blue-200 px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
              >
                Change Plan
              </button>
            )}
          </div>

          {subError && (
            <div className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {subError}
              <button className="ml-2 font-semibold underline" onClick={() => setSubError(null)}>Dismiss</button>
            </div>
          )}

          {subEditing ? (
            <div className="space-y-4 p-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Plan</label>
                <select
                  value={subPlanCode}
                  onChange={(e) => setSubPlanCode(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {plans.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.displayName} — ₹{(p.priceMonthlyPaise / 100).toLocaleString('en-IN')}/mo
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Billing Cycle</label>
                <div className="flex gap-3">
                  {(['MONTHLY', 'ANNUAL'] as const).map((cycle) => (
                    <label key={cycle} className="flex cursor-pointer items-center gap-2 text-sm">
                      <input
                        type="radio"
                        name="billing"
                        value={cycle}
                        checked={subBilling === cycle}
                        onChange={() => setSubBilling(cycle)}
                        className="accent-blue-600"
                      />
                      {cycle === 'MONTHLY' ? 'Monthly' : 'Annual (save ~17%)'}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes (optional)</label>
                <input
                  value={subNotes}
                  onChange={(e) => setSubNotes(e.target.value)}
                  placeholder="e.g. Promotional pricing, trial extension…"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => assignPlanMutation.mutate({ planCode: subPlanCode, billingCycle: subBilling, notes: subNotes || undefined })}
                  disabled={assignPlanMutation.isPending || !subPlanCode}
                  className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {assignPlanMutation.isPending ? 'Saving…' : 'Save'}
                </button>
                <button
                  onClick={() => setSubEditing(false)}
                  className="rounded-lg border border-gray-200 px-4 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <dl className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
              <div>
                <dt className="text-xs font-medium text-gray-400">Plan</dt>
                <dd className="mt-0.5 text-sm font-semibold text-gray-800">{subscription.plan.displayName}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400">Status</dt>
                <dd className={`mt-0.5 text-sm font-semibold ${subscription.status === 'ACTIVE' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {subscription.status}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400">Billing</dt>
                <dd className="mt-0.5 text-sm text-gray-700">{subscription.billingCycle}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400">Monthly Price</dt>
                <dd className="mt-0.5 text-sm text-gray-700">
                  ₹{(subscription.plan.priceMonthlyPaise / 100).toLocaleString('en-IN')}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400">Max Students / School</dt>
                <dd className="mt-0.5 text-sm text-gray-700">{subscription.plan.maxStudentsPerSchool.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400">Max Staff / School</dt>
                <dd className="mt-0.5 text-sm text-gray-700">{subscription.plan.maxStaffPerSchool.toLocaleString()}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-400">Max Schools</dt>
                <dd className="mt-0.5 text-sm text-gray-700">{subscription.plan.maxSchools}</dd>
              </div>
              {subscription.notes && (
                <div className="col-span-2 sm:col-span-1">
                  <dt className="text-xs font-medium text-gray-400">Notes</dt>
                  <dd className="mt-0.5 text-xs text-gray-500">{subscription.notes}</dd>
                </div>
              )}
            </dl>
          )}
        </div>
      )}

      {/* Configuration */}
      {configData && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-700">Configuration</h2>
            <p className="mt-0.5 text-xs text-gray-400">Per-tenant settings. Click a value to edit.</p>
          </div>
          <div className="divide-y divide-gray-50">
            {Object.entries(configData.config).map(([key, entry]) => (
              <div key={key} className="flex items-start gap-3 px-4 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-500">{key}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{entry.description}</p>
                </div>
                {editingKey === key ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-48 rounded border border-blue-300 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => configMutation.mutate({ key, value: editValue })}
                      disabled={configMutation.isPending}
                      className="rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingKey(null)}
                      className="rounded border border-gray-200 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { setEditingKey(key); setEditValue(entry.value); }}
                    className="min-w-[6rem] rounded border border-gray-200 px-2 py-1 text-left text-sm text-gray-700 hover:bg-gray-50"
                    title="Click to edit"
                  >
                    {entry.value || <span className="text-gray-400 italic">not set</span>}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature toggles */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-700">Feature Flags</h2>
          <p className="mt-0.5 text-xs text-gray-400">
            CORE features are always enabled and cannot be toggled. Enabling a feature
            auto-enables its dependencies.
          </p>
        </div>

        {featureError && (
          <div className="mx-4 mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {featureError}
            <button
              type="button"
              className="ml-2 font-semibold underline"
              onClick={() => setFeatureError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

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
                  {feature.dependencies.length > 0 && (
                    <p className="mt-0.5 text-xs text-amber-600">
                      Requires:{' '}
                      {feature.dependencies.map((dep) => (
                        <span key={dep} className="mr-1 rounded bg-amber-50 px-1 font-mono">
                          {dep}
                        </span>
                      ))}
                    </p>
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
                    setFeatureError(null);
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
