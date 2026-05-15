import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getTeacherTimetable, getStudentTimetable, type DayOfWeek, type TimetableSlot } from '../api/timetableApi';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

// ── Constants ─────────────────────────────────────────────────────────────────

const DAYS: DayOfWeek[] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
const DAY_LABEL: Record<DayOfWeek, string> = {
  MONDAY: 'Mon', TUESDAY: 'Tue', WEDNESDAY: 'Wed',
  THURSDAY: 'Thu', FRIDAY: 'Fri', SATURDAY: 'Sat',
};
const MAX_PERIODS = 8;
const PERIODS = Array.from({ length: MAX_PERIODS }, (_, i) => i + 1);

// ── Helpers ───────────────────────────────────────────────────────────────────

function slotAt(slots: TimetableSlot[], day: DayOfWeek, period: number) {
  return slots.find((s) => s.dayOfWeek === day && s.periodNumber === period);
}

function shortId(id: string) { return id.slice(0, 6).toUpperCase(); }

function timeRange(slot: TimetableSlot) {
  if (!slot.startTime) return '';
  const start = slot.startTime.slice(0, 5);
  const end   = slot.endTime ? slot.endTime.slice(0, 5) : '';
  return end ? `${start}–${end}` : start;
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function TimetableScreen() {
  const role = useAuthStore((s) => s.user?.role);
  const isStudent = role === 'STUDENT';

  const {
    data: slots = [],
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: [isStudent ? 'student-timetable' : 'teacher-timetable'],
    queryFn:  () => isStudent ? getStudentTimetable() : getTeacherTimetable(),
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          Could not load timetable.{'\n'}
          {isStudent
            ? 'Make sure your student profile is set up correctly.'
            : 'Make sure your staff profile is linked.'}
        </Text>
      </View>
    );
  }

  if (slots.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.empty}>No timetable slots assigned yet.</Text>
      </View>
    );
  }

  // Build a map of days → list of (period, slot) for vertical scrolling
  const dayColumns = DAYS.map((day) => ({
    day,
    periods: PERIODS.map((p) => ({ period: p, slot: slotAt(slots, day, p) })),
  })).filter((col) => col.periods.some((r) => r.slot));

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
    >
      <Text style={styles.subtitle}>
        {slots.length} period{slots.length !== 1 ? 's' : ''} assigned — current academic year
      </Text>

      {dayColumns.map(({ day, periods }) => (
        <View key={day} style={styles.dayCard}>
          <Text style={styles.dayLabel}>{DAY_LABEL[day]}</Text>
          {periods.map(({ period, slot }) =>
            slot ? (
              <View key={period} style={styles.slotRow}>
                <View style={styles.periodBadge}>
                  <Text style={styles.periodText}>P{period}</Text>
                </View>
                <View style={styles.slotInfo}>
                  <Text style={styles.subjectText}>
                    {slot.subjectName ?? slot.subjectCode ?? shortId(slot.subjectId)}
                  </Text>
                  <Text style={styles.classText}>
                    Class {shortId(slot.classId)} · Sec {shortId(slot.sectionId)}
                  </Text>
                  {timeRange(slot) ? (
                    <Text style={styles.timeText}>{timeRange(slot)}</Text>
                  ) : null}
                </View>
              </View>
            ) : null,
          )}
        </View>
      ))}
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  subtitle:     { fontSize: 13, color: '#6b7280', marginBottom: 12 },
  error:        { fontSize: 14, color: '#dc2626', textAlign: 'center', lineHeight: 22 },
  empty:        { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
  dayCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    padding: 12,
  },
  dayLabel:     { fontSize: 13, fontWeight: '700', color: '#1e3a5f', marginBottom: 8 },
  slotRow:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  periodBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  periodText:   { fontSize: 11, fontWeight: '700', color: '#1d4ed8' },
  slotInfo:     { flex: 1 },
  subjectText:  { fontSize: 13, fontWeight: '600', color: '#1f2937' },
  classText:    { fontSize: 11, color: '#6b7280', marginTop: 1 },
  timeText:     { fontSize: 11, color: '#9ca3af', marginTop: 1 },
});
