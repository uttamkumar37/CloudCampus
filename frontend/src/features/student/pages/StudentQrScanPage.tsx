import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { qrMarkAttendance } from '../api/studentPortalApi';

type State = 'marking' | 'success' | 'error' | 'no-token';

export default function StudentQrScanPage() {
  const [searchParams] = useSearchParams();
  const navigate       = useNavigate();
  const token          = searchParams.get('token');
  const [state, setState] = useState<State>(token ? 'marking' : 'no-token');
  const [errMsg, setErrMsg] = useState('');

  // Capture the token at mount time — searchParams can change but we only
  // want to mark attendance for the token that was present on first render.
  const initialToken = useRef(token);

  const { mutate } = useMutation({
    mutationFn: () => qrMarkAttendance(initialToken.current!),
    onSuccess: () => setState('success'),
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { error?: { message?: string } } } })
        ?.response?.data?.error?.message ?? 'Something went wrong. Please try again.';
      setErrMsg(msg);
      setState('error');
    },
  });

  useEffect(() => {
    if (initialToken.current) mutate();
  }, [mutate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
        {state === 'marking' && (
          <>
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
            <p className="text-sm font-medium text-gray-700">Marking your attendance…</p>
          </>
        )}

        {state === 'success' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Attendance Marked!</h2>
            <p className="mt-1 text-sm text-gray-500">You have been marked as present for this session.</p>
            <button
              onClick={() => navigate('/student/attendance')}
              className="mt-6 w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              View My Attendance
            </button>
          </>
        )}

        {state === 'error' && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">Could Not Mark Attendance</h2>
            <p className="mt-1 text-sm text-gray-500">{errMsg}</p>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="mt-6 w-full rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Go to Dashboard
            </button>
          </>
        )}

        {state === 'no-token' && (
          <>
            <h2 className="text-lg font-semibold text-gray-900">Invalid QR Code</h2>
            <p className="mt-1 text-sm text-gray-500">
              No attendance token found. Please scan a valid QR code from your teacher.
            </p>
            <button
              onClick={() => navigate('/student/dashboard')}
              className="mt-6 w-full rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Go to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
