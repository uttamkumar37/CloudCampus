import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import {
  getStaffAttendance,
  markStaffAttendance,
  type StaffAttendanceRow,
  type StaffAttendanceStatus,
  type AttendanceEntry,
} from '../api/staffAttendanceApi';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUSES: StaffAttendanceStatus[] = ['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY'];

const STATUS_LABEL: Record<StaffAttendanceStatus, string> = {
  PRESENT:  'Present',
  ABSENT:   'Absent',
  HALF_DAY: 'Half Day',
  ON_LEAVE: 'On Leave',
  HOLIDAY:  'Holiday',
};

const STATUS_COLOR: Record<StaffAttendanceStatus, string> = {
  PRESENT:  '#16a34a',
  ABSENT:   '#dc2626',
  HALF_DAY: '#d97706',
  ON_LEAVE: '#2563eb',
  HOLIDAY:  '#9ca3af',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function isoDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function shiftDay(iso: string, delta: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + delta);
  return isoDate(d);
}

function displayDate(iso: string) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });
}

function nextStatus(current: StaffAttendanceStatus | null): StaffAttendanceStatus {
  if (!current) return 'PRESENT';
  const idx = STATUSES.indexOf(current);
  return STATUSES[(idx + 1) % STATUSES.length];
}

// ── Staff row ─────────────────────────────────────────────────────────────────

function StaffRow({
  row,
  draft,
  onToggle,
}: {
  row:      StaffAttendanceRow;
  draft:    StaffAttendanceStatus | null;
  onToggle: () => void;
}) {
  const status = draft;
  const color  = status ? STATUS_COLOR[status] : '#d1d5db';

  return (
    <TouchableOpacity style={styles.row} onPress={onToggle} activeOpacity={0.7}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {row.firstName[0]}{row.lastName[0]}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{row.firstName} {row.lastName}</Text>
        <Text style={styles.rowEmp}>{row.employeeNumber}</Text>
      </View>
      <View style={[styles.statusPill, { borderColor: color, backgroundColor: color + '1a' }]}>
        <Text style={[styles.statusPillText, { color: color === '#d1d5db' ? '#9ca3af' : color }]}>
          {status ? STATUS_LABEL[status] : 'Tap to mark'}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function StaffAttendanceScreen() {
  const schoolId    = useAuthStore((s) => s.user?.schoolId);
  const queryClient = useQueryClient();

  const [date, setDate]   = useState(isoDate(new Date()));
  const [drafts, setDrafts] = useState<Record<string, StaffAttendanceStatus | null>>({});
  const [dirty, setDirty]  = useState(false);

  const { data: rows = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['staff-attendance', schoolId, date],
    queryFn:  () => getStaffAttendance(schoolId!, date),
    enabled:  !!schoolId,
  });

  // Sync fetched statuses into drafts whenever data or date changes
  useEffect(() => {
    const initial: Record<string, StaffAttendanceStatus | null> = {};
    rows.forEach((r) => { initial[r.staffId] = r.status; });
    setDrafts(initial);
    setDirty(false);
  }, [rows]);

  const saveMutation = useMutation({
    mutationFn: (entries: AttendanceEntry[]) => markStaffAttendance(schoolId!, date, entries),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-attendance', schoolId, date] });
      setDirty(false);
      Alert.alert('Saved', 'Staff attendance has been recorded.');
    },
    onError: () => Alert.alert('Error', 'Failed to save attendance. Please try again.'),
  });

  function toggleStaff(staffId: string) {
    setDrafts((prev) => {
      const next = nextStatus(prev[staffId] ?? null);
      return { ...prev, [staffId]: next };
    });
    setDirty(true);
  }

  function markAll(status: StaffAttendanceStatus) {
    const next: Record<string, StaffAttendanceStatus> = {};
    rows.forEach((r) => { next[r.staffId] = status; });
    setDrafts(next);
    setDirty(true);
  }

  function handleSave() {
    const entries: AttendanceEntry[] = Object.entries(drafts)
      .filter(([, s]) => s !== null)
      .map(([staffId, status]) => ({ staffId, status: status! }));

    if (entries.length === 0) {
      Alert.alert('Nothing to save', 'Please mark at least one staff member.');
      return;
    }
    saveMutation.mutate(entries);
  }

  if (!schoolId) {
    return (
      <View style={styles.center}>
        <Text style={styles.errText}>School profile unavailable. Please re-login.</Text>
      </View>
    );
  }

  const markedCount   = Object.values(drafts).filter(Boolean).length;
  const presentCount  = Object.values(drafts).filter((s) => s === 'PRESENT').length;
  const absentCount   = Object.values(drafts).filter((s) => s === 'ABSENT').length;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
    >
      {/* Date navigator */}
      <View style={styles.dateNav}>
        <Pressable style={styles.arrowBtn} onPress={() => setDate(shiftDay(date, -1))}>
          <Text style={styles.arrowText}>‹</Text>
        </Pressable>
        <View style={{ flex: 1, alignItems: 'center' }}>
          <Text style={styles.dateLabel}>{displayDate(date)}</Text>
        </View>
        <Pressable
          style={[styles.arrowBtn, date >= isoDate(new Date()) && { opacity: 0.3 }]}
          onPress={() => date < isoDate(new Date()) && setDate(shiftDay(date, 1))}
        >
          <Text style={styles.arrowText}>›</Text>
        </Pressable>
      </View>

      {/* Summary strip */}
      {rows.length > 0 && (
        <View style={styles.summaryRow}>
          {[
            { label: 'Total',    value: rows.length,    color: '#1e3a5f' },
            { label: 'Marked',   value: markedCount,    color: '#374151' },
            { label: 'Present',  value: presentCount,   color: '#16a34a' },
            { label: 'Absent',   value: absentCount,    color: '#dc2626' },
          ].map((s) => (
            <View key={s.label} style={styles.summaryCard}>
              <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.summaryLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Quick mark-all row */}
      {rows.length > 0 && (
        <View style={styles.quickRow}>
          <Text style={styles.quickLabel}>Mark all:</Text>
          {(['PRESENT', 'ABSENT', 'HOLIDAY'] as StaffAttendanceStatus[]).map((s) => (
            <Pressable
              key={s}
              style={[styles.quickChip, { borderColor: STATUS_COLOR[s] }]}
              onPress={() => markAll(s)}
            >
              <Text style={[styles.quickChipText, { color: STATUS_COLOR[s] }]}>
                {STATUS_LABEL[s]}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Staff list */}
      {isLoading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#1e3a5f" /></View>
      ) : isError ? (
        <View style={styles.center}><Text style={styles.errText}>Failed to load staff list.</Text></View>
      ) : rows.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No staff found for this school.</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {rows.map((row) => (
            <StaffRow
              key={row.staffId}
              row={row}
              draft={drafts[row.staffId] ?? null}
              onToggle={() => toggleStaff(row.staffId)}
            />
          ))}
        </View>
      )}

      {/* Save button */}
      {rows.length > 0 && (
        <Pressable
          style={[styles.saveBtn, (!dirty || saveMutation.isPending) && { opacity: 0.5 }]}
          onPress={handleSave}
          disabled={!dirty || saveMutation.isPending}
        >
          {saveMutation.isPending
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.saveBtnText}>
                Save Attendance ({markedCount}/{rows.length} marked)
              </Text>
          }
        </Pressable>
      )}
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errText:      { color: '#dc2626', fontSize: 14, textAlign: 'center' },

  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 10,
    marginBottom: 12,
  },
  arrowBtn:   { padding: 6 },
  arrowText:  { fontSize: 22, color: '#1e3a5f', fontWeight: '600' },
  dateLabel:  { fontSize: 14, fontWeight: '700', color: '#1e3a5f' },

  summaryRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryValue: { fontSize: 20, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: '#9ca3af', marginTop: 2 },

  quickRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  quickLabel:   { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  quickChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  quickChipText: { fontSize: 11, fontWeight: '700' },

  list:        { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', overflow: 'hidden', marginBottom: 16 },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText:  { color: '#fff', fontWeight: '700', fontSize: 13 },
  rowName:     { fontSize: 13, fontWeight: '700', color: '#1f2937' },
  rowEmp:      { fontSize: 11, color: '#9ca3af', marginTop: 1 },

  statusPill: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  statusPillText: { fontSize: 11, fontWeight: '700' },

  emptyBox:   { alignItems: 'center', paddingVertical: 48 },
  emptyText:  { fontSize: 14, color: '#9ca3af' },

  saveBtn: {
    backgroundColor: '#1e3a5f',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
