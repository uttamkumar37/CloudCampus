import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { forgotPasswordApi } from '../api/authApi';

export function ForgotPasswordPage() {
  const [email, setEmail]       = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { mutate, isPending, isError } = useMutation({
    mutationFn: () => forgotPasswordApi(email),
    onSuccess: () => setSubmitted(true),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (email.trim()) mutate();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        {submitted ? (
          /* ── Success state ── */
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mb-2 text-xl font-semibold text-gray-900">Check your email</h1>
            <p className="mb-6 text-sm text-gray-500">
              If <span className="font-medium text-gray-700">{email}</span> is registered, you'll
              receive a 6-digit reset code within a few minutes.
            </p>
            <Link
              to="/reset-password"
              state={{ email }}
              className="inline-block w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Enter reset code
            </Link>
            <p className="mt-4 text-xs text-gray-400">
              Didn't receive it?{' '}
              <button onClick={() => { setSubmitted(false); }} className="text-blue-600 hover:underline">
                Try again
              </button>
            </p>
          </div>
        ) : (
          /* ── Email form ── */
          <>
            <h1 className="mb-2 text-2xl font-semibold text-gray-900">Forgot password?</h1>
            <p className="mb-6 text-sm text-gray-500">
              Enter your email and we'll send you a reset code.
            </p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  placeholder="you@school.com"
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {isError && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  Something went wrong. Please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={isPending || !email.trim()}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? 'Sending…' : 'Send reset code'}
              </button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-500">
              <Link to="/login" className="text-blue-600 hover:underline">Back to sign in</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
