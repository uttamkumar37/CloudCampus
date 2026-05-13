import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getTeacherDashboard } from '../api/teacherDashboardApi';
import type { TimetableSlot } from '@/features/timetable/types/timetable';

function formatTime(t: string | null) {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const display = hour % 12 || 12;
  return `${display}:${m} ${suffix}`;
}

function StatCard({
  label,
  value,
  accent,
  to,
}: {
  label: string;
  value: number;
  accent: string;
  to?: string;
}) {
  const inner = (
    <div className={`rounded-xl border bg-white p-5 shadow-sm ${to ? 'hover:shadow-md transition-shadow' : ''}`}>
      <div className={`text-3xl font-bold ${accent}`}>{value}</div>
      <div className="mt-1 text-sm text-gray-500">{label}</div>
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : <>{inner}</>;
}

function SlotCard({ slot }: { slot: TimetableSlot }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700">
        P{slot.periodNumber}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-gray-900">Period {slot.periodNumber}</div>
        <div className="text-xs text-gray-500">
          {formatTime(slot.startTime)} – {formatTime(slot.endTime)}
        </div>
      </div>
    </div>
  );
}

export default function TeacherDashboardPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: getTeacherDashboard,
  });

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long',
  });

  if (isLoading) {
    return <div className="p-6 text-sm text-gray-400">Loading dashboard…</div>;
  }

  if (isError || !data) {
    return (
      <div className="p-6">
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          Failed to load dashboard. Please refresh.
        </div>
      </div>
    );
  }

  const hasPending = data.pendingHomeworkReview > 0 || data.pendingAssignmentGrading > 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Good morning!</h1>
        <p className="mt-0.5 text-sm text-gray-500">{today}</p>
      </div>

      {/* Pending alert */}
      {hasPending && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You have{' '}
          {data.pendingHomeworkReview > 0 && (
            <><strong>{data.pendingHomeworkReview}</strong> homework submission{data.pendingHomeworkReview !== 1 ? 's' : ''} to review</>
          )}
          {data.pendingHomeworkReview > 0 && data.pendingAssignmentGrading > 0 && ' and '}
          {data.pendingAssignmentGrading > 0 && (
            <><strong>{data.pendingAssignmentGrading}</strong> assignment submission{data.pendingAssignmentGrading !== 1 ? 's' : ''} to grade</>
          )}
          {' '}pending.
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          label="Homework to Review"
          value={data.pendingHomeworkReview}
          accent={data.pendingHomeworkReview > 0 ? 'text-amber-600' : 'text-gray-700'}
          to="/teacher/homework"
        />
        <StatCard
          label="Assignments to Grade"
          value={data.pendingAssignmentGrading}
          accent={data.pendingAssignmentGrading > 0 ? 'text-red-600' : 'text-gray-700'}
          to="/teacher/assignments"
        />
        <StatCard
          label="Homework Posted"
          value={data.totalHomeworkPosted}
          accent="text-blue-700"
          to="/teacher/homework"
        />
        <StatCard
          label="Assignments Posted"
          value={data.totalAssignmentsPosted}
          accent="text-indigo-700"
          to="/teacher/assignments"
        />
      </div>

      {/* Today's schedule */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Today's Schedule
        </h2>

        {data.todaySlots.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 py-12 text-center text-sm text-gray-400">
            No classes scheduled for today.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.todaySlots
              .slice()
              .sort((a, b) => a.periodNumber - b.periodNumber)
              .map((slot) => (
                <SlotCard key={slot.id} slot={slot} />
              ))}
          </div>
        )}
      </div>

      {/* Quick links */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700 uppercase tracking-wide">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/teacher/homework"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            View Homework
          </Link>
          <Link
            to="/teacher/assignments"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            View Assignments
          </Link>
          <Link
            to="/teacher/timetable"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            Full Timetable
          </Link>
        </div>
      </div>
    </div>
  );
}
