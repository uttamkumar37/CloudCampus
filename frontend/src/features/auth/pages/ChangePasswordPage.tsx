import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { changePasswordApi, revokeAllSessionsApi } from '../api/authApi';
import { listDevicesApi, revokeDeviceApi } from '../api/deviceApi';

function isStrongPassword(pw: string): boolean {
  return pw.length >= 8
    && /[A-Z]/.test(pw)
    && /[a-z]/.test(pw)
    && /\d/.test(pw)
    && /[^a-zA-Z\d]/.test(pw);
}

export function ChangePasswordPage() {
  const navigate   = useNavigate();
  const user       = useAuthStore((s) => s.user);
  const isForced   = user?.requiresPasswordChange ?? false;

  const [current, setCurrent]     = useState('');
  const [next, setNext]           = useState('');
  const [confirm, setConfirm]     = useState('');
  const [fieldError, setFieldError] = useState('');
  const [done, setDone]           = useState(false);

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => changePasswordApi(current, next),
    onSuccess: () => {
      setDone(true);
      // Update the store so the forced-change banner disappears on next navigation.
      useAuthStore.setState((s) => ({
        user: s.user ? { ...s.user, requiresPasswordChange: false } : s.user,
      }));
    },
  });

  const qc = useQueryClient();

  const { data: devices, isLoading: devicesLoading } = useQuery({
    queryKey: ['my-devices'],
    queryFn:  listDevicesApi,
    enabled:  !isForced,
  });

  const { mutate: revokeDevice } = useMutation({
    mutationFn: revokeDeviceApi,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['my-devices'] }),
  });

  const logout = useAuthStore((s) => s.clearAuth);
  const { mutate: revokeAll, isPending: isRevoking, isSuccess: revoked } = useMutation({
    mutationFn: revokeAllSessionsApi,
    onSuccess: () => {
      logout();
      navigate('/login', { replace: true });
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldError('');

    if (!isStrongPassword(next)) {
      setFieldError('Password must be at least 8 characters and include uppercase, lowercase, digit, and special character.');
      return;
    }
    if (next !== confirm) {
      setFieldError('Passwords do not match.');
      return;
    }
    mutate();
  }

  function roleHome() {
    const role = user?.role;
    if (role === 'STUDENT')      return '/student/dashboard';
    if (role === 'TEACHER')      return '/teacher/dashboard';
    if (role === 'SCHOOL_ADMIN') return '/school-admin/dashboard';
    if (role === 'PARENT')       return '/parent/dashboard';
    if (role === 'SUPER_ADMIN')  return '/super-admin/dashboard';
    return '/login';
  }

  const serverError =
    error instanceof Error
      ? (error as { response?: { data?: { message?: string } } }).response?.data?.message ?? error.message
      : null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
        {done ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mb-2 text-xl font-semibold text-gray-900">Password updated</h1>
            <p className="mb-6 text-sm text-gray-500">Your new password is active.</p>
            <button
              onClick={() => navigate(roleHome(), { replace: true })}
              className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Continue to dashboard
            </button>
          </div>
        ) : (
          <>
            <h1 className="mb-1 text-2xl font-semibold text-gray-900">Change password</h1>
            {isForced && (
              <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
                You must set a new password before continuing.
              </p>
            )}
            {!isForced && (
              <p className="mb-6 text-sm text-gray-500">Enter your current password and choose a new one.</p>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="current" className="block text-sm font-medium text-gray-700">
                  Current password
                </label>
                <input
                  id="current"
                  type="password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  autoComplete="current-password"
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="new" className="block text-sm font-medium text-gray-700">
                  New password
                </label>
                <input
                  id="new"
                  type="password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  autoComplete="new-password"
                  required
                  minLength={8}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Min 8 chars · uppercase · lowercase · digit · special character
                </p>
              </div>

              <div>
                <label htmlFor="confirm" className="block text-sm font-medium text-gray-700">
                  Confirm new password
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {(fieldError || serverError) && (
                <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                  {fieldError || serverError}
                </p>
              )}

              <button
                type="submit"
                disabled={isPending || !current || !next || !confirm}
                className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending ? 'Saving…' : 'Update password'}
              </button>
            </form>

            {!isForced && (
              <p className="mt-4 text-center text-sm text-gray-500">
                <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">
                  Cancel
                </button>
              </p>
            )}
          </>
        )}

        {!isForced && !done && devices && devices.length > 0 && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="mb-3 text-sm font-semibold text-gray-900">Active devices</h2>
            {devicesLoading ? (
              <p className="text-xs text-gray-400">Loading…</p>
            ) : (
              <ul className="space-y-2">
                {devices.map((d) => (
                  <li key={d.id} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{d.deviceName}</p>
                      <p className="text-xs text-gray-400">{d.ipAddress} · last seen {new Date(d.lastSeenAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <button
                      onClick={() => revokeDevice(d.id)}
                      className="ml-3 rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Revoke
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {!isForced && !done && (
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h2 className="mb-1 text-sm font-semibold text-gray-900">Sign out from all devices</h2>
            <p className="mb-3 text-xs text-gray-500">
              Immediately invalidates all active sessions. Use this if your account may have been compromised or you signed in on a shared device.
            </p>
            <button
              onClick={() => revokeAll()}
              disabled={isRevoking || revoked}
              className="w-full rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50"
            >
              {isRevoking ? 'Signing out…' : 'Sign out from all devices'}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
