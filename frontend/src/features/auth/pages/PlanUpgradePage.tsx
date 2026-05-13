import { Link } from 'react-router-dom';

export function PlanUpgradePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <p className="text-5xl" aria-hidden="true">🔒</p>
      <h1 className="text-xl font-semibold text-gray-800">Feature Not Available</h1>
      <p className="max-w-sm text-sm text-gray-500">
        This feature is not included in your current plan.
        Upgrade your plan to unlock it.
      </p>
      <Link
        to="/app/dashboard"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Back to Dashboard
      </Link>
    </main>
  );
}
