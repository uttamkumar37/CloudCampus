/**
 * AttendanceScreen — offline-first attendance marking.
 *
 * Flow:
 *  1. Teacher picks class → section from live API.
 *  2. Students are loaded from WatermelonDB local cache (instant, offline).
 *  3. If cache is empty / stale, fetch from backend and cache locally.
 *  4. Teacher taps PRESENT / ABSENT / LATE per student.
 *  5. Each mark is written to WatermelonDB immediately (visible in UI).
 *  6. Mark is enqueued in MMKV syncQueue.
 *  7. useSyncTrigger in the app layout flushes the queue when online.
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
import {
  fetchStudentsByClass,
  fetchClassesForSchool,
  fetchSectionsForClass,
  type ClassPickerItem,
  type SectionPickerItem,
} from '../api/attendanceApi';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

const TODAY = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const STALE_THRESHOLD_MS = 12 * 60 * 60 * 1000;      // 12 hours

type Step = 'class' | 'section' | 'attendance';

interface StudentRow {
  id: string;
  name: string;
  rollNumber: string;
  status: AttendanceStatus | null;
}

export default function AttendanceScreen() {
  const user     = useAuthStore((s) => s.user);
  const schoolId = user?.schoolId ?? '';

  // ── Picker state ────────────────────────────────────────────────────────────
  const [step, setStep]                       = useState<Step>('class');
  const [classes, setClasses]                 = useState<ClassPickerItem[]>([]);
  const [sections, setSections]               = useState<SectionPickerItem[]>([]);
  const [pickedClassId, setPickedClassId]     = useState('');
  const [pickedSectionId, setPickedSectionId] = useState('');
  const [pickedClassName, setPickedClassName] = useState('');
  const [pickedSectionName, setPickedSectionName] = useState('');
  const [pickerLoading, setPickerLoading]     = useState(false);

  // ── Attendance state ─────────────────────────────────────────────────────────
  const [rows, setRows]               = useState<StudentRow[]>([]);
  const [loading, setLoading]         = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  // Load class list when on class-picker step
  useEffect(() => {
    if (step !== 'class' || !schoolId) return;
    setPickerLoading(true);
    fetchClassesForSchool(schoolId)
      .then(setClasses)
      .catch(() => setClasses([]))
      .finally(() => setPickerLoading(false));
  }, [step, schoolId]);

  // Load section list when on section-picker step
  useEffect(() => {
    if (step !== 'section' || !pickedClassId) return;
    setPickerLoading(true);
    fetchSectionsForClass(pickedClassId)
      .then(setSections)
      .catch(() => setSections([]))
      .finally(() => setPickerLoading(false));
  }, [step, pickedClassId]);

  // Load students from local DB; fall back to remote if stale
  const loadStudents = useCallback(async () => {
    if (!pickedClassId || !pickedSectionId) return;
    setLoading(true);
    try {
      const studentsCollection = database.get<Student>('students');
      const allLocal     = await studentsCollection.query().fetch();
      const localStudents = allLocal.filter(
        (s) => s.classId === pickedClassId && s.sectionId === pickedSectionId,
      );

      const now = Date.now();
      const needsRefresh =
        localStudents.length === 0 ||
        localStudents.some((s) => now - s.cachedAt > STALE_THRESHOLD_MS);

      let studentList = localStudents;

      if (needsRefresh) {
        const remote = await fetchStudentsByClass(pickedClassId, pickedSectionId);
        await database.write(async () => {
          for (const s of localStudents) await s.destroyPermanently();
          for (const r of remote) {
            await studentsCollection.create((s) => {
              s._raw.id  = r.id;
              s.name       = r.name;
              s.rollNumber = r.rollNumber;
              s.classId    = r.classId;
              s.sectionId  = r.sectionId;
              s.cachedAt   = now;
            });
          }
        });
        const refreshed = await studentsCollection.query().fetch();
        studentList = refreshed.filter(
          (s) => s.classId === pickedClassId && s.sectionId === pickedSectionId,
        );
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
  }, [pickedClassId, pickedSectionId]);

  useEffect(() => {
    if (step === 'attendance') void loadStudents();
  }, [step, loadStudents]);

  async function markAttendance(studentId: string, status: AttendanceStatus) {
    const userId   = user?.userId ?? 'unknown';
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
          r.studentId  = studentId;
          r.classId    = pickedClassId;
          r.sectionId  = pickedSectionId;
          r.date       = TODAY;
          r.status     = status;
          r.markedBy   = userId;
          r.syncedAt   = null;
          r.localCreatedAt = new Date();
        });
        localId = created.id;
      }
    });

    syncQueue.enqueue({
      localId:        localId!,
      studentId,
      classId:        pickedClassId,
      sectionId:      pickedSectionId,
      date:           TODAY,
      status,
      markedBy:       userId,
      localCreatedAt: Date.now(),
    });

    setRows((prev) =>
      prev.map((r) => (r.id === studentId ? { ...r, status } : r)),
    );
    setPendingCount(syncQueue.length);
  }

  function resetToPicker() {
    setStep('class');
    setPickedClassId('');
    setPickedSectionId('');
    setPickedClassName('');
    setPickedSectionName('');
    setRows([]);
  }

  // ── Class picker ─────────────────────────────────────────────────────────────
  if (step === 'class') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.date}>Select Class</Text>
        </View>
        {pickerLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#1e3a5f" />
          </View>
        ) : classes.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No classes found.</Text>
          </View>
        ) : (
          <FlatList
            data={classes}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.pickerList}
            ItemSeparatorComponent={() => <View style={styles.pickerSep} />}
            renderItem={({ item }) => (
              <Pressable
                style={styles.pickerCard}
                onPress={() => {
                  setPickedClassId(item.id);
                  setPickedClassName(item.name);
                  setStep('section');
                }}
              >
                <Text style={styles.pickerCardText}>{item.name}</Text>
              </Pressable>
            )}
          />
        )}
      </View>
    );
  }

  // ── Section picker ───────────────────────────────────────────────────────────
  if (step === 'section') {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.date}>{pickedClassName}</Text>
          <Pressable onPress={() => setStep('class')}>
            <Text style={styles.changeBtn}>Back</Text>
          </Pressable>
        </View>
        {pickerLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color="#1e3a5f" />
          </View>
        ) : sections.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No sections found.</Text>
          </View>
        ) : (
          <FlatList
            data={sections}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.pickerList}
            ItemSeparatorComponent={() => <View style={styles.pickerSep} />}
            renderItem={({ item }) => (
              <Pressable
                style={styles.pickerCard}
                onPress={() => {
                  setPickedSectionId(item.id);
                  setPickedSectionName(item.name);
                  setStep('attendance');
                }}
              >
                <Text style={styles.pickerCardText}>{item.name}</Text>
              </Pressable>
            )}
          />
        )}
      </View>
    );
  }

  // ── Attendance list ──────────────────────────────────────────────────────────
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
        <View>
          <Text style={styles.date}>Attendance — {TODAY}</Text>
          <Text style={styles.classLabel}>
            {pickedClassName} / {pickedSectionName}
          </Text>
        </View>
        <View style={styles.headerRight}>
          {pendingCount > 0 && (
            <Text style={styles.pending}>{pendingCount} pending sync</Text>
          )}
          <Pressable onPress={resetToPicker}>
            <Text style={styles.changeBtn}>Change</Text>
          </Pressable>
        </View>
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
  center:    { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  date:       { fontSize: 15, fontWeight: '600', color: '#1e3a5f' },
  classLabel: { fontSize: 12, color: '#6b7280', marginTop: 2 },
  pending:    { fontSize: 12, color: '#d97706', fontWeight: '500' },
  changeBtn:  { fontSize: 13, color: '#2563eb', fontWeight: '600' },
  headerRight: { alignItems: 'flex-end', gap: 4 },

  pickerList: { padding: 12 },
  pickerSep:  { height: 8 },
  pickerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pickerCardText: { fontSize: 16, fontWeight: '600', color: '#1e3a5f' },
  emptyText: { fontSize: 14, color: '#6b7280' },

  row: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  studentInfo: { flex: 1 },
  rollNo:      { fontSize: 11, color: '#6b7280', marginBottom: 2 },
  name:        { fontSize: 15, color: '#111827', fontWeight: '500' },
  buttons:     { flexDirection: 'row', gap: 8 },
  statusBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn_PRESENT:      { backgroundColor: '#16a34a', borderColor: '#16a34a' },
  btn_ABSENT:       { backgroundColor: '#dc2626', borderColor: '#dc2626' },
  btn_LATE:         { backgroundColor: '#d97706', borderColor: '#d97706' },
  statusText:       { fontSize: 13, fontWeight: '700', color: '#6b7280' },
  statusTextActive: { color: '#fff' },
  sep: { height: 1, backgroundColor: '#f3f4f6' },
});
