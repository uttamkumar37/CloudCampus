/**
 * AttendanceScreen — offline-first attendance marking.
 *
 * Flow:
 *  1. Students are loaded from WatermelonDB local cache (instant, offline).
 *  2. If cache is empty / stale, fetch from backend and cache locally.
 *  3. Teacher taps PRESENT / ABSENT / LATE per student.
 *  4. Each mark is written to WatermelonDB immediately (visible in UI).
 *  5. Mark is enqueued in MMKV syncQueue.
 *  6. useSyncTrigger in the app layout flushes the queue when online.
 */
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { database } from '@/offline/database';
import { AttendanceRecord, type AttendanceStatus } from '@/offline/models/AttendanceRecord';
import { Student } from '@/offline/models/Student';
import { syncQueue } from '@/offline/sync/syncQueue';
import { fetchStudentsByClass } from '../api/attendanceApi';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const STALE_THRESHOLD_MS = 12 * 60 * 60 * 1000;      // 12 hours

// Hard-coded for D3 demo; replaced by class-picker in a future session
const DEMO_CLASS_ID = 'class-1';
const DEMO_SECTION_ID = 'section-a';

interface StudentRow {
  id: string;
  name: string;
  rollNumber: string;
  status: AttendanceStatus | null;
}

export default function AttendanceScreen() {
  const user = useAuthStore((s) => s.user);
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);

  // Load students from local DB; fall back to remote if stale
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const studentsCollection = database.get<Student>('students');
      const localStudents = await studentsCollection
        .query()
        .fetch();

      const now = Date.now();
      const needsRefresh =
        localStudents.length === 0 ||
        localStudents.some((s) => now - s.cachedAt > STALE_THRESHOLD_MS);

      let studentList = localStudents;

      if (needsRefresh) {
        const remote = await fetchStudentsByClass(DEMO_CLASS_ID, DEMO_SECTION_ID);
        await database.write(async () => {
          // Replace local cache
          for (const s of localStudents) await s.destroyPermanently();
          for (const r of remote) {
            await studentsCollection.create((s) => {
              s._raw.id = r.id;
              s.name = r.name;
              s.rollNumber = r.rollNumber;
              s.classId = r.classId;
              s.sectionId = r.sectionId;
              s.cachedAt = now;
            });
          }
        });
        studentList = await studentsCollection.query().fetch();
      }

      // Load today's existing attendance records
      const recordsCollection = database.get<AttendanceRecord>('attendance_records');
      const todayRecords = await recordsCollection
        .query()
        .fetch()
        .then((all) => all.filter((r) => r.date === TODAY));

      const statusMap = new Map(todayRecords.map((r) => [r.studentId, r.status]));

      setRows(
        studentList.map((s) => ({
          id: s.id,
          name: s.name,
          rollNumber: s.rollNumber,
          status: statusMap.get(s.id) ?? null,
        })),
      );
    } finally {
      setLoading(false);
      setPendingCount(syncQueue.length);
    }
  }, []);

  useEffect(() => { void loadStudents(); }, [loadStudents]);

  async function markAttendance(studentId: string, status: AttendanceStatus) {
    const userId = user?.userId ?? 'unknown';
    const collection = database.get<AttendanceRecord>('attendance_records');
    const existing = (await collection.query().fetch()).find(
      (r) => r.studentId === studentId && r.date === TODAY,
    );

    let localId: string;
    await database.write(async () => {
      if (existing) {
        await existing.update((r) => { r.status = status; r.syncedAt = null; });
        localId = existing.id;
      } else {
        const created = await collection.create((r) => {
          r.studentId = studentId;
          r.classId = DEMO_CLASS_ID;
          r.sectionId = DEMO_SECTION_ID;
          r.date = TODAY;
          r.status = status;
          r.markedBy = userId;
          r.syncedAt = null;
          r.localCreatedAt = new Date();
        });
        localId = created.id;
      }
    });

    syncQueue.enqueue({
      localId: localId!,
      studentId,
      classId: DEMO_CLASS_ID,
      sectionId: DEMO_SECTION_ID,
      date: TODAY,
      status,
      markedBy: userId,
      localCreatedAt: Date.now(),
    });

    setRows((prev) =>
      prev.map((r) => (r.id === studentId ? { ...r, status } : r)),
    );
    setPendingCount(syncQueue.length);
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>Attendance — {TODAY}</Text>
        {pendingCount > 0 && (
          <Text style={styles.pending}>{pendingCount} pending sync</Text>
        )}
      </View>
      <FlatList
        data={rows}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={styles.studentInfo}>
              <Text style={styles.rollNo}>{item.rollNumber}</Text>
              <Text style={styles.name}>{item.name}</Text>
            </View>
            <View style={styles.buttons}>
              {(['PRESENT', 'ABSENT', 'LATE'] as AttendanceStatus[]).map((s) => (
                <Pressable
                  key={s}
                  style={[
                    styles.statusBtn,
                    item.status === s && styles[`btn_${s}`],
                  ]}
                  onPress={() => void markAttendance(item.id, s)}
                >
                  <Text
                    style={[
                      styles.statusText,
                      item.status === s && styles.statusTextActive,
                    ]}
                  >
                    {s[0]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  date: { fontSize: 15, fontWeight: '600', color: '#1e3a5f' },
  pending: { fontSize: 12, color: '#d97706', fontWeight: '500' },
  row: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentInfo: { flex: 1 },
  rollNo: { fontSize: 11, color: '#6b7280', marginBottom: 2 },
  name: { fontSize: 15, color: '#111827', fontWeight: '500' },
  buttons: { flexDirection: 'row', gap: 8 },
  statusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn_PRESENT: { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  btn_ABSENT: { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  btn_LATE: { backgroundColor: '#d97706', borderColor: '#d97706' },
  statusText: { fontSize: 13, fontWeight: '700', color: '#6b7280' },
  statusTextActive: { color: '#fff' },
  sep: { height: 1, backgroundColor: '#f3f4f6' },
});
