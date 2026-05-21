import { useQuery } from '@tanstack/react-query';
import { PageHeader, PageSpinner } from '@/shared/ui';
import { getMyTimetable } from '../api/studentPortalApi';
import { WeeklyTimetableView } from '@/features/timetable/components/WeeklyTimetableView';

export default function StudentTimetablePage() {
  const { data: slots = [], isLoading, isError } = useQuery({
    queryKey: ['student-timetable'],
    queryFn:  () => getMyTimetable(),
  });

  if (isLoading) {
    return <PageSpinner />;
  }

  if (isError) {
    return (
      <div className="p-6 text-sm text-red-600">
        Failed to load timetable. Make sure your student profile is linked.
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <PageHeader title="My Timetable" subtitle={`Your class schedule — ${slots.length} period${slots.length !== 1 ? 's' : ''} assigned`} />
      </div>

      <WeeklyTimetableView
        slots={slots}
        emptyMessage="No timetable slots assigned to your class yet."
        slotTone="indigo"
      />
    </div>
  );
}
