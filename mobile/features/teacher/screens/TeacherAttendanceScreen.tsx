/**
 * TeacherAttendanceScreen — mobile attendance marking for teachers.
 *
 * Flow:
 *   1. Loads today's timetable slots via GET /v1/teacher/timetable.
 *   2. Teacher picks a period (shows class / time info).
 *   3. Fetches ACTIVE students for that class/section via
 *      GET /v1/teacher/attendance/students.
 *   4. All students default to PRESENT; teacher taps to change status.
 *   5. Submit → POST /v1/teacher/attendance/sessions (atomic create + mark).
 */
import { useEffect, useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  getStudentsForAttendance,
  submitTeacherAttendance,
  type AttendanceStatus,
  type StudentMark,
  type TeacherStudentRow,
} from '../api/teacherApi';
import { getTeacherTimetable, type TimetableSlot } from '@/features/timetable/api/timetableApi';

// ── Helpers ───────────────────────────────────────────────────────────────────

const DOW: Record<number, string> = {
  0: 'SUNDAY', 1: 'MONDAY', 2: 'TUESDAY', 3: 'WEDNESDAY',
  4: 'THURSDAY', 5: 'FRIDAY', 6: 'SATURDAY',
};

function todayStr() {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
}

function todayDow() {
  return DOW[new Date().getDay()];
}

const STATUS_LABELS: AttendanceStatus[] = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'];

const STATUS_COLORS: Record<AttendanceStatus, { bg: string; text: string; border: string }> = {
  PRESENT: { bg: '#dcfce7', text: '#16a34a', border: '#86efac' },
  ABSENT:  { bg: '#fee2e2', text: '#dc2626', border: '#fca5a5' },
  LATE:    { bg: '#fef3c7', text: '#d97706', border: '#fcd34d' },
  EXCUSED: { bg: '#dbeafe', text: '#2563eb', border: '#93c5fd' },
};

// ── Period picker ─────────────────────────────────────────────────────────────

function PeriodCard({
  slot,
  selected,
  onPress,
}: {
  slot: TimetableSlot;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.periodCard, selected && styles.periodCardSelected]}
    >
      <Text style={[styles.periodNum, selected && styles.periodNumSelected]}>
        Period {slot.periodNumber}
      </Text>
      {slot.startTime ? (
        <Text style={styles.periodTime}>{slot.startTime.slice(0, 5)}</Text>
      ) : null}
    </TouchableOpacity>
  );
}

// ── Student row ───────────────────────────────────────────────────────────────

function StudentRow({
  student,
  status,
  onChangeStatus,
}: {
  student: TeacherStudentRow;
  status: AttendanceStatus;
  onChangeStatus: (s: AttendanceStatus) => void;
}) {
  return (
    <View style={styles.studentRow}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>
          {student.lastName}, {student.firstName}
        </Text>
        <Text style={styles.studentNum}>{student.studentNumber}</Text>
      </View>
      <View style={styles.statusButtons}>
        {STATUS_LABELS.map((s) => {
          const active = status === s;
          const colors = STATUS_COLORS[s];
          return (
            <Pressable
              key={s}
              onPress={() => onChangeStatus(s)}
              style={[
                styles.statusBtn,
                active
                  ? { backgroundColor: colors.bg, borderColor: colors.border }
                  : styles.statusBtnInactive,
              ]}
            >
              <Text
                style={[
                  styles.statusBtnText,
                  active ? { color: colors.text } : styles.statusBtnTextInactive,
                ]}
              >
                {s[0]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────

export default function TeacherAttendanceScreen() {
  const [selectedSlot, setSelectedSlot] = useState<TimetableSlot | null>(null);
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});
  const [saved, setSaved] = useState(false);

  // Load timetable and filter to today
  const {
    data: allSlots = [],
    isLoading: loadingSlots,
    refetch: refetchSlots,
    isRefetching,
  } = useQuery({
    queryKey: ['teacher-timetable-attendance'],
    queryFn:  () => getTeacherTimetable(),
  });

  const todaySlots = allSlots
    .filter((s) => s.dayOfWeek === todayDow())
    .sort((a, b) => a.periodNumber - b.periodNumber);

  // Load students when a slot is selected
  const {
    data: students = [],
    isLoading: loadingStudents,
  } = useQuery({
    queryKey: ['teacher-attendance-students', selectedSlot?.classId, selectedSlot?.sectionId],
    queryFn:  () =>
      getStudentsForAttendance(
        selectedSlot!.classId,
        selectedSlot!.sectionId ?? undefined,
      ),
    enabled: !!selectedSlot,
  });

  // Default all students to PRESENT when student list loads
  useEffect(() => {
    if (students.length > 0) {
      const initial: Record<string, AttendanceStatus> = {};
      students.forEach((s) => { initial[s.id] = 'PRESENT'; });
      setMarks(initial);
      setSaved(false);
    }
  }, [students]);

  function setStatus(studentId: string, status: AttendanceStatus) {
    setMarks((prev) => ({ ...prev, [studentId]: status }));
    setSaved(false);
  }

  function markAll(status: AttendanceStatus) {
    const bulk: Record<string, AttendanceStatus> = {};
    students.forEach((s) => { bulk[s.id] = status; });
    setMarks(bulk);
    setSaved(false);
  }

  const mutation = useMutation({
    mutationFn: () => {
      if (!selectedSlot) throw new Error('No period selected');
      const markList: StudentMark[] = students.map((s) => ({
        studentId: s.id,
        status:    marks[s.id] ?? 'PRESENT',
      }));
      return submitTeacherAttendance({
        classId:        selectedSlot.classId,
        sectionId:      selectedSlot.sectionId ?? undefined,
        academicYearId: selectedSlot.academicYearId,
        subjectId:      selectedSlot.subjectId ?? undefined,
        sessionDate:    todayStr(),
        periodNumber:   selectedSlot.periodNumber,
        marks:          markList,
      });
    },
    onSuccess: () => setSaved(true),
  });

  // Summary counts
  const summary = STATUS_LABELS.map((s) => ({
    status: s,
    count: Object.values(marks).filter((v) => v === s).length,
  })).filter((s) => s.count > 0);

  // ── Render ─────────────────────────────────────────────────────────────────

  if (loadingSlots) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e3a5f" />
        <Text style={styles.loadingText}>Loading timetable…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isRefetching} onRefresh={refetchSlots} />
      }
    >
      {/* Date header */}
      <View style={styles.dateHeader}>
        <Text style={styles.dateLabel}>
          {new Date().toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'long',
          })}
        </Text>
      </View>

      {/* Period picker */}
      {todaySlots.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No classes scheduled for today.</Text>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SELECT PERIOD</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodsRow}>
            {todaySlots.map((slot) => (
              <PeriodCard
                key={slot.id}
                slot={slot}
                selected={selectedSlot?.id === slot.id}
                onPress={() => {
                  setSelectedSlot(slot);
                  setSaved(false);
                  setMarks({});
                }}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Student roster */}
      {selectedSlot && (
        <>
          {loadingStudents ? (
            <View style={styles.center}>
              <ActivityIndicator color="#1e3a5f" />
            </View>
          ) : students.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No active students found for this class.</Text>
            </View>
          ) : (
            <>
              {/* Mark-all shortcuts */}
              <View style={styles.markAllRow}>
                <Text style={styles.markAllLabel}>Mark all:</Text>
                {(['PRESENT', 'ABSENT', 'EXCUSED'] as AttendanceStatus[]).map((s) => {
                  const colors = STATUS_COLORS[s];
                  return (
                    <Pressable
                      key={s}
                      onPress={() => markAll(s)}
                      style={[styles.markAllBtn, { backgroundColor: colors.bg, borderColor: colors.border }]}
                    >
                      <Text style={[styles.markAllBtnText, { color: colors.text }]}>{s}</Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Summary chips */}
              {summary.length > 0 && (
                <View style={styles.summaryRow}>
                  {summary.map((s) => {
                    const colors = STATUS_COLORS[s.status];
                    return (
                      <View
                        key={s.status}
                        style={[styles.summaryChip, { backgroundColor: colors.bg, borderColor: colors.border }]}
                      >
                        <Text style={[styles.summaryChipText, { color: colors.text }]}>
                          {s.status}: {s.count}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {/* Student list */}
              <FlatList
                data={students}
                keyExtractor={(s) => s.id}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <StudentRow
                    student={item}
                    status={marks[item.id] ?? 'PRESENT'}
                    onChangeStatus={(s) => setStatus(item.id, s)}
                  />
                )}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                style={styles.studentList}
              />

              {/* Success / error banners */}
              {saved && !mutation.isPending && (
                <View style={styles.successBanner}>
                  <Text style={styles.successText}>
                    Attendance saved for Period {selectedSlot.periodNumber}.
                  </Text>
                </View>
              )}
              {mutation.isError && (
                <View style={styles.errorBanner}>
                  <Text style={styles.errorText}>
                    Failed to save — this period may already have attendance recorded.
                  </Text>
                </View>
              )}

              {/* Save button */}
              <TouchableOpacity
                style={[styles.saveBtn, (mutation.isPending || saved) && styles.saveBtnDisabled]}
                onPress={() => mutation.mutate()}
                disabled={mutation.isPending || saved}
              >
                <Text style={styles.saveBtnText}>
                  {mutation.isPending
                    ? 'Saving…'
                    : saved
                      ? 'Saved ✓'
                      : `Save Attendance (${students.length} students)`}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f9fafb' },
  content:        { padding: 16, paddingBottom: 40 },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  loadingText:    { marginTop: 10, color: '#6b7280', fontSize: 14 },

  dateHeader:   { marginBottom: 16 },
  dateLabel:    { fontSize: 16, fontWeight: '600', color: '#111827' },

  section:      { marginBottom: 20 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.8, marginBottom: 8 },

  periodsRow: { flexDirection: 'row' },
  periodCard: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12,
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12,
    marginRight: 8, alignItems: 'center', minWidth: 80,
  },
  periodCardSelected: { borderColor: '#3b82f6', backgroundColor: '#eff6ff' },
  periodNum:          { fontSize: 14, fontWeight: '600', color: '#374151' },
  periodNumSelected:  { color: '#1d4ed8' },
  periodTime:         { fontSize: 11, color: '#9ca3af', marginTop: 2 },

  emptyBox:  { borderWidth: 1, borderColor: '#e5e7eb', borderStyle: 'dashed', borderRadius: 12, padding: 32, alignItems: 'center' },
  emptyText: { color: '#9ca3af', fontSize: 14 },

  markAllRow:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 10, flexWrap: 'wrap' },
  markAllLabel:    { fontSize: 12, color: '#6b7280', marginRight: 4 },
  markAllBtn:      { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  markAllBtnText:  { fontSize: 11, fontWeight: '600' },

  summaryRow:       { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 12 },
  summaryChip:      { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3 },
  summaryChipText:  { fontSize: 11, fontWeight: '600' },

  studentList:  { borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, backgroundColor: '#fff', overflow: 'hidden', marginBottom: 16 },
  studentRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, justifyContent: 'space-between' },
  studentInfo:  { flex: 1, marginRight: 8 },
  studentName:  { fontSize: 13, fontWeight: '500', color: '#111827' },
  studentNum:   { fontSize: 11, color: '#9ca3af', fontFamily: 'monospace', marginTop: 1 },
  statusButtons:{ flexDirection: 'row', gap: 4 },
  statusBtn:    { width: 32, height: 32, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  statusBtnInactive:     { backgroundColor: '#fff', borderColor: '#e5e7eb' },
  statusBtnText:         { fontSize: 11, fontWeight: '700' },
  statusBtnTextInactive: { color: '#d1d5db' },
  separator: { height: 1, backgroundColor: '#f3f4f6' },

  successBanner: { backgroundColor: '#f0fdf4', borderWidth: 1, borderColor: '#bbf7d0', borderRadius: 10, padding: 12, marginBottom: 12 },
  successText:   { color: '#16a34a', fontSize: 13, fontWeight: '500' },
  errorBanner:   { backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', borderRadius: 10, padding: 12, marginBottom: 12 },
  errorText:     { color: '#dc2626', fontSize: 13 },

  saveBtn:         { backgroundColor: '#1e3a5f', borderRadius: 12, padding: 15, alignItems: 'center' },
  saveBtnDisabled: { backgroundColor: '#93c5fd' },
  saveBtnText:     { color: '#fff', fontWeight: '700', fontSize: 15 },
});
