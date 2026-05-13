import { Link } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <p className="text-6xl font-bold text-gray-300" aria-hidden="true">403</p>
      <h1 className="text-xl font-semibold text-gray-800">Access Denied</h1>
      <p className="max-w-sm text-sm text-gray-500">
        You don&apos;t have permission to view this page.
        Contact your administrator if you think this is a mistake.
      </p>
      <Link
        to="/login"
        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Back to Login
      </Link>
    </main>
  );
}
