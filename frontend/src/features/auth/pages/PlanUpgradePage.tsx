import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { listSubscriptionPlans } from '@/features/super-admin/api/subscriptionApi';

const PLAN_HIGHLIGHT: Record<string, string> = {
  FREE:         'border-gray-200',
  STARTER:      'border-blue-300',
  PROFESSIONAL: 'border-indigo-400 ring-2 ring-indigo-100',
  ENTERPRISE:   'border-amber-400',
};

export function PlanUpgradePage() {
  const { data: plans = [] } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn:  listSubscriptionPlans,
  });

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="mx-auto max-w-4xl text-center">
        <p className="text-4xl" aria-hidden="true">🔒</p>
        <h1 className="mt-3 text-2xl font-semibold text-gray-800">Feature Not Available</h1>
        <p className="mt-2 text-sm text-gray-500">
          This feature is not included in your current plan.
          Contact your administrator to upgrade.
        </p>

        {plans.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.code}
                className={`rounded-xl border-2 bg-white p-5 text-left shadow-sm ${PLAN_HIGHLIGHT[plan.code] ?? 'border-gray-200'}`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{plan.code}</p>
                <p className="mt-1 text-lg font-bold text-gray-900">{plan.displayName}</p>
                <p className="mt-1 text-2xl font-extrabold text-blue-600">
                  {plan.priceMonthlyPaise === 0
                    ? 'Free'
                    : `₹${(plan.priceMonthlyPaise / 100).toLocaleString('en-IN')}`}
                  {plan.priceMonthlyPaise > 0 && (
                    <span className="text-sm font-normal text-gray-400">/mo</span>
                  )}
                </p>
                <p className="mt-3 text-xs text-gray-500">{plan.description}</p>
                <ul className="mt-4 space-y-1.5 text-xs text-gray-600">
                  <li>Up to <strong>{plan.maxStudentsPerSchool.toLocaleString()}</strong> students / school</li>
                  <li>Up to <strong>{plan.maxStaffPerSchool.toLocaleString()}</strong> staff / school</li>
                  <li>Up to <strong>{plan.maxSchools}</strong> {plan.maxSchools === 1 ? 'school' : 'schools'}</li>
                </ul>
              </div>
            ))}
          </div>
        )}

        <Link
          to="/app/dashboard"
          className="mt-10 inline-block rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
