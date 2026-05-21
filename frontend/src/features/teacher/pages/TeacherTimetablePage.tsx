import { useQuery } from '@tanstack/react-query';
import { getMyTimetable } from '../api/teacherTimetableApi';
import { PageSpinner, PageHeader } from '@/shared/ui';
import { WeeklyTimetableView } from '@/features/timetable/components/WeeklyTimetableView';

export default function TeacherTimetablePage() {
  const { data: slots = [], isLoading, isError } = useQuery({
    queryKey: ['teacher-timetable'],
    queryFn:  () => getMyTimetable(),
  });

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError) {
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load timetable. Make sure your staff profile is linked to your account.
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <PageHeader title="My Timetable" />
        <p className="mt-0.5 text-sm text-gray-500">
          Your current academic year schedule — {slots.length} period{slots.length !== 1 ? 's' : ''} assigned
        </p>
      </div>

      <WeeklyTimetableView
        slots={slots}
        emptyMessage="No timetable slots assigned to you yet."
        slotTone="blue"
      />
    </div>
  );
}
