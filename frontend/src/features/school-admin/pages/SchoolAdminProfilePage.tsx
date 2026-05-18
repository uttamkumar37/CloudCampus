import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { changePasswordApi } from '@/features/auth/api/authApi';
import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface MeResponse {
  staffId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  employeeNumber: string;
  staffType: string;
  joiningDate: string | null;
  schoolId: string;
  schoolName: string;
  schoolAddress: string | null;
  schoolPhone: string | null;
  schoolEmail: string | null;
}

async function fetchMe(): Promise<MeResponse> {
  const { data } = await axiosInstance.get<ApiResponse<MeResponse>>('/v1/school-admin/me');
  return data.data!;
}

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ firstName, lastName }: { firstName: string; lastName: string }) {
  const initials = `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase();
  return (
    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow-md">
      {initials}
    </div>
  );
}

// ── Info row ──────────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-2.5">
      <span className="mt-0.5 w-5 text-center text-base text-gray-400">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-gray-800 break-all">{value}</p>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export function SchoolAdminProfilePage() {
  const user = useAuthStore((s) => s.user);

  const { data: me, isLoading, isError } = useQuery({
    queryKey: ['school-admin-me'],
    queryFn: fetchMe,
    enabled: !!user,
    retry: false,
  });

  const [current, setCurrent]   = useState('');
  const [next, setNext]         = useState('');
  const [confirm, setConfirm]   = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError]     = useState('');

  const changePwd = useMutation({
    mutationFn: () => changePasswordApi(current, next),
    retry: false,
    onSuccess: () => {
      setPwdSuccess('Password updated successfully.');
      setPwdError('');
      setCurrent(''); setNext(''); setConfirm('');
    },
    onError: (e: Error) => {
      setPwdError(e.message || 'Failed to update password.');
      setPwdSuccess('');
    },
  });

  function handlePwd(e: React.FormEvent) {
    e.preventDefault();
    setPwdSuccess(''); setPwdError('');
    if (next !== confirm) { setPwdError('New passwords do not match.'); return; }
    if (next.length < 8)  { setPwdError('Password must be at least 8 characters.'); return; }
    changePwd.mutate();
  }

  const fullName = me ? `${me.firstName} ${me.lastName}` : '—';
  const roleLabel = user?.role?.replace('_', ' ') ?? '—';

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">

      {/* ── Header card ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg">
        {isLoading ? (
          <div className="h-20 w-20 animate-pulse rounded-full bg-white/30" />
        ) : (
          <Avatar firstName={me?.firstName ?? 'A'} lastName={me?.lastName ?? 'D'} />
        )}
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold">
            {isLoading ? <span className="inline-block h-7 w-40 animate-pulse rounded bg-white/30" /> : fullName}
          </h1>
          <span className="mt-1 inline-block rounded-full bg-white/20 px-3 py-0.5 text-sm font-semibold tracking-wide">
            {roleLabel}
          </span>
          {me?.employeeNumber && (
            <p className="mt-1 text-xs text-white/70">ID: {me.employeeNumber}</p>
          )}
        </div>
      </div>

      {isError && (
        <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
          Could not load profile. Please refresh.
        </div>
      )}

      {/* ── Two-column cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

        {/* Personal info */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-gray-500 uppercase tracking-wide">Personal Info</h2>
          <div className="divide-y divide-gray-50">
            <InfoRow icon="✉️" label="Email"          value={me?.email} />
            <InfoRow icon="📞" label="Phone"          value={me?.phone} />
            <InfoRow icon="🗂️" label="Employee No."   value={me?.employeeNumber} />
            <InfoRow icon="💼" label="Role"           value={me?.staffType?.replace('_', ' ')} />
            <InfoRow icon="📅" label="Joining Date"   value={me?.joiningDate ?? undefined} />
          </div>
        </div>

        {/* School info */}
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-gray-500 uppercase tracking-wide">School</h2>
          <div className="divide-y divide-gray-50">
            <InfoRow icon="🏫" label="School Name"    value={me?.schoolName} />
            <InfoRow icon="📍" label="Address"        value={me?.schoolAddress} />
            <InfoRow icon="📞" label="School Phone"   value={me?.schoolPhone} />
            <InfoRow icon="✉️" label="School Email"   value={me?.schoolEmail} />
          </div>
        </div>
      </div>

      {/* ── Change password ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800">Change Password</h2>
        <form onSubmit={handlePwd} className="space-y-4 sm:max-w-sm">
          {(['Current Password', 'New Password', 'Confirm New Password'] as const).map((label, i) => {
            const val   = [current, next, confirm][i];
            const setter = [setCurrent, setNext, setConfirm][i];
            return (
              <div key={label}>
                <label className="block text-sm font-medium text-gray-700">{label}</label>
                <input
                  type="password"
                  required
                  value={val}
                  onChange={(e) => setter(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm focus:border-blue-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>
            );
          })}

          {pwdError   && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{pwdError}</p>}
          {pwdSuccess && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">{pwdSuccess}</p>}

          <button
            type="submit"
            disabled={changePwd.isPending}
            className="rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
          >
            {changePwd.isPending ? 'Saving…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
