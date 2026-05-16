import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { createTenant } from '../api/tenantApi';
import { listSubscriptionPlans, assignTenantPlan } from '../api/subscriptionApi';
import type { SubscriptionPlan } from '../api/subscriptionApi';

// ── Schemas ───────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  code: z
    .string()
    .min(1, 'Code is required')
    .regex(
      /^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/,
      'Lowercase letters, digits and hyphens only; cannot start or end with a hyphen',
    ),
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(200, 'Name must be at most 200 characters'),
});

type Step1Values = z.infer<typeof step1Schema>;

const BILLING_ANNUAL_DISCOUNT = 0.17;

// ── Plan card ─────────────────────────────────────────────────────────────────

function PlanCard({
  plan,
  selected,
  billing,
  onSelect,
}: {
  plan: SubscriptionPlan;
  selected: boolean;
  billing: 'MONTHLY' | 'ANNUAL';
  onSelect: () => void;
}) {
  const monthlyPrice = plan.priceMonthlyPaise / 100;
  const effectivePrice =
    billing === 'ANNUAL' ? Math.round(monthlyPrice * (1 - BILLING_ANNUAL_DISCOUNT)) : monthlyPrice;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        'relative w-full rounded-xl border-2 p-4 text-left transition-all',
        selected
          ? 'border-blue-500 bg-blue-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-gray-50',
      ].join(' ')}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs text-white">
          ✓
        </span>
      )}
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{plan.code}</p>
      <p className="mt-0.5 text-base font-bold text-gray-900">{plan.displayName}</p>
      <p className="mt-1 text-xl font-extrabold text-blue-600">
        {plan.priceMonthlyPaise === 0 ? (
          'Free'
        ) : (
          <>
            ₹{effectivePrice.toLocaleString('en-IN')}
            <span className="text-sm font-normal text-gray-400">/mo</span>
          </>
        )}
      </p>
      <p className="mt-2 text-xs text-gray-500">{plan.description}</p>
      <ul className="mt-3 space-y-1 text-xs text-gray-600">
        <li>
          <strong>{plan.maxStudentsPerSchool.toLocaleString()}</strong> students / school
        </li>
        <li>
          <strong>{plan.maxStaffPerSchool.toLocaleString()}</strong> staff / school
        </li>
        <li>
          <strong>{plan.maxSchools}</strong> {plan.maxSchools === 1 ? 'school' : 'schools'}
        </li>
      </ul>
    </button>
  );
}

// ── Stepper ───────────────────────────────────────────────────────────────────

const STEPS = ['Identity', 'Plan', 'Review'];

function Stepper({ current }: { current: number }) {
  return (
    <ol className="mb-8 flex items-center gap-0">
      {STEPS.map((label, i) => {
        const done    = i < current;
        const active  = i === current;
        return (
          <li key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <span
                className={[
                  'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold',
                  done   ? 'bg-blue-600 text-white'
                  : active ? 'border-2 border-blue-600 bg-white text-blue-600'
                           : 'border-2 border-gray-200 bg-white text-gray-400',
                ].join(' ')}
              >
                {done ? '✓' : i + 1}
              </span>
              <span
                className={`mt-1 text-xs font-medium ${active ? 'text-blue-600' : done ? 'text-gray-600' : 'text-gray-400'}`}
              >
                {label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`mx-2 h-px flex-1 ${done ? 'bg-blue-400' : 'bg-gray-200'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function TenantCreatePage() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [step, setStep]               = useState(0);
  const [identity, setIdentity]       = useState<Step1Values | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<string>('FREE');
  const [billing, setBilling]         = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [planNotes, setPlanNotes]     = useState('');
  const [globalError, setGlobalError] = useState<string | null>(null);

  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn:  listSubscriptionPlans,
  });

  const chosenPlan = plans.find((p) => p.code === selectedPlan) ?? null;

  // ── Step 1 form ─────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Values>({ resolver: zodResolver(step1Schema) });

  const handleStep1 = (values: Step1Values) => {
    setIdentity(values);
    setStep(1);
  };

  // ── Final submit ─────────────────────────────────────────────────────────────
  const { mutate: doCreate, isPending } = useMutation({
    mutationFn: async () => {
      const tenant = await createTenant(identity!);
      await assignTenantPlan(tenant.id, {
        planCode:     selectedPlan,
        billingCycle: billing,
        notes:        planNotes || undefined,
      });
      return tenant;
    },
    onSuccess: (tenant) => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-stats'] });
      navigate(`/super-admin/tenants/${tenant.id}`);
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ??
        (err instanceof Error ? err.message : 'Failed to create tenant. Please try again.');
      setGlobalError(msg);
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => (step === 0 ? navigate('/super-admin/tenants') : setStep((s) => s - 1))}
          className="mb-2 text-xs text-gray-400 hover:text-gray-600"
        >
          ← {step === 0 ? 'Back to tenants' : 'Back'}
        </button>
        <h1 className="text-xl font-semibold text-gray-900">New Tenant</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Provision a new school tenant. A default MAIN school is created automatically.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        <Stepper current={step} />

        {globalError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {globalError}
            <button className="ml-2 font-semibold underline" onClick={() => setGlobalError(null)}>
              Dismiss
            </button>
          </div>
        )}

        {/* ── Step 0: Identity ─────────────────────────────────────────── */}
        {step === 0 && (
          <form
            onSubmit={handleSubmit(handleStep1)}
            className="rounded-xl border border-gray-200 bg-white p-6"
            noValidate
          >
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Tenant Identity</h2>

            <div className="mb-5">
              <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-gray-700">
                Tenant Code
              </label>
              <input
                id="code"
                type="text"
                autoComplete="off"
                placeholder="e.g. springfield-high"
                {...register('code')}
                aria-invalid={!!errors.code}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 font-mono text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 aria-[invalid=true]:border-red-400"
              />
              <p className="mt-1 text-xs text-gray-400">
                Lowercase letters, digits, hyphens — cannot start or end with a hyphen.
              </p>
              {errors.code && (
                <p className="mt-1 text-xs text-red-600">{errors.code.message}</p>
              )}
            </div>

            <div className="mb-6">
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
                Organisation Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="e.g. Springfield High School"
                {...register('name')}
                aria-invalid={!!errors.name}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 aria-[invalid=true]:border-red-400"
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Next: Select Plan →
              </button>
              <button
                type="button"
                onClick={() => navigate('/super-admin/tenants')}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {/* ── Step 1: Plan ─────────────────────────────────────────────── */}
        {step === 1 && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-1 text-sm font-semibold text-gray-700">Subscription Plan</h2>
            <p className="mb-4 text-xs text-gray-400">
              Select a plan and billing cycle. You can change this later from the tenant detail page.
            </p>

            {/* Billing toggle */}
            <div className="mb-5 flex gap-4">
              {(['MONTHLY', 'ANNUAL'] as const).map((cycle) => (
                <label key={cycle} className="flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="radio"
                    name="billing"
                    value={cycle}
                    checked={billing === cycle}
                    onChange={() => setBilling(cycle)}
                    className="accent-blue-600"
                  />
                  {cycle === 'MONTHLY' ? 'Monthly' : 'Annual'}
                  {cycle === 'ANNUAL' && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                      Save 17%
                    </span>
                  )}
                </label>
              ))}
            </div>

            {plansLoading ? (
              <p className="text-sm text-gray-400">Loading plans…</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.code}
                    plan={plan}
                    selected={selectedPlan === plan.code}
                    billing={billing}
                    onSelect={() => setSelectedPlan(plan.code)}
                  />
                ))}
              </div>
            )}

            <div className="mt-4">
              <label className="mb-1 block text-xs font-medium text-gray-600">
                Notes (optional)
              </label>
              <input
                value={planNotes}
                onChange={(e) => setPlanNotes(e.target.value)}
                placeholder="e.g. Trial extension, promotional pricing…"
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setStep(2)}
                disabled={!selectedPlan}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                Next: Review →
              </button>
              <button
                onClick={() => setStep(0)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Review ───────────────────────────────────────────── */}
        {step === 2 && identity && (
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Review & Create</h2>

            <div className="mb-6 divide-y divide-gray-100 rounded-lg border border-gray-100">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs font-medium text-gray-400">Tenant Code</span>
                <span className="font-mono text-sm text-gray-800">{identity.code}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs font-medium text-gray-400">Organisation Name</span>
                <span className="text-sm text-gray-800">{identity.name}</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs font-medium text-gray-400">Plan</span>
                <span className="text-sm font-semibold text-blue-600">
                  {chosenPlan?.displayName ?? selectedPlan}
                </span>
              </div>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-xs font-medium text-gray-400">Billing Cycle</span>
                <span className="text-sm text-gray-800">{billing}</span>
              </div>
              {chosenPlan && chosenPlan.priceMonthlyPaise > 0 && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs font-medium text-gray-400">Monthly Rate</span>
                  <span className="text-sm text-gray-800">
                    ₹
                    {billing === 'ANNUAL'
                      ? Math.round(
                          (chosenPlan.priceMonthlyPaise / 100) * (1 - BILLING_ANNUAL_DISCOUNT),
                        ).toLocaleString('en-IN')
                      : (chosenPlan.priceMonthlyPaise / 100).toLocaleString('en-IN')}
                    /mo
                  </span>
                </div>
              )}
              {planNotes && (
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-xs font-medium text-gray-400">Notes</span>
                  <span className="text-sm text-gray-600">{planNotes}</span>
                </div>
              )}
              <div className="px-4 py-3">
                <p className="text-xs text-gray-400">
                  A default <strong>MAIN</strong> school will be created automatically.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => doCreate()}
                disabled={isPending}
                className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                {isPending ? 'Creating…' : 'Create Tenant'}
              </button>
              <button
                onClick={() => setStep(1)}
                disabled={isPending}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-60"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
