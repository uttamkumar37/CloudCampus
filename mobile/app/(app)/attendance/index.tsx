import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAttendance } from '../../../src/api/attendance';
import type { AttendanceRecord } from '../../../src/types/attendance';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../../src/theme';

const STATUS_META: Record<string, { color: string; bg: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  PRESENT: { color: Colors.success, bg: Colors.successBg, icon: 'checkmark-circle' },
  ABSENT: { color: Colors.danger, bg: Colors.dangerBg, icon: 'close-circle' },
  LATE: { color: Colors.warning, bg: Colors.warningBg, icon: 'time' },
  EXCUSED: { color: Colors.info, bg: Colors.infoBg, icon: 'information-circle' },
};

function addDays(dateStr: string, delta: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + delta);
  return d.toISOString().split('T')[0];
}

function formatDisplayDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function isToday(dateStr: string): boolean {
  return dateStr === new Date().toISOString().split('T')[0];
}

export default function AttendanceScreen() {
  const today = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAttendance = useCallback(async (date: string) => {
    try {
      const data = await getAttendance({ date });
      setRecords(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load attendance';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchAttendance(selectedDate); }, [selectedDate]);

  function changeDate(delta: number) {
    const next = addDays(selectedDate, delta);
    if (next > today) return;
    setLoading(true);
    setSelectedDate(next);
  }

  const summary = {
    present: records.filter((r) => r.status === 'PRESENT').length,
    absent: records.filter((r) => r.status === 'ABSENT').length,
    late: records.filter((r) => r.status === 'LATE').length,
    excused: records.filter((r) => r.status === 'EXCUSED').length,
  };
  const total = records.length;
  const presentPct = total > 0 ? Math.round((summary.present / total) * 100) : 0;
  const attColor = presentPct >= 85 ? Colors.success : presentPct >= 70 ? Colors.warning : Colors.danger;

  function renderItem({ item }: { item: AttendanceRecord }) {
    const meta = STATUS_META[item.status] ?? { color: Colors.textSecondary, bg: Colors.background, icon: 'ellipse-outline' as const };
    return (
      <View style={styles.row}>
        <View style={[styles.rowIconWrap, { backgroundColor: meta.bg }]}>
          <Ionicons name={meta.icon} size={18} color={meta.color} />
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.studentId} numberOfLines={1}>
            {item.studentId.slice(0, 8)}…
          </Text>
          <Text style={styles.rowMeta}>{item.attendanceDate}</Text>
        </View>
        {item.remarks ? (
          <Text style={styles.remarks} numberOfLines={1}>{item.remarks}</Text>
        ) : null}
        <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
          <Text style={[styles.statusText, { color: meta.color }]}>{item.status}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Date Navigator */}
      <View style={styles.dateNav}>
        <TouchableOpacity style={styles.navBtn} onPress={() => changeDate(-1)}>
          <Ionicons name="chevron-back" size={20} color={Colors.primary} />
        </TouchableOpacity>
        <View style={styles.dateLabelWrap}>
          <Text style={styles.dateLabel}>{formatDisplayDate(selectedDate)}</Text>
          {isToday(selectedDate) && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayText}>Today</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[styles.navBtn, selectedDate >= today && styles.navBtnDisabled]}
          onPress={() => changeDate(1)}
          disabled={selectedDate >= today}
        >
          <Ionicons name="chevron-forward" size={20} color={selectedDate >= today ? Colors.textTertiary : Colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.snapshotCard, Shadow.sm]}>
        <Text style={styles.snapshotTitle}>Attendance Snapshot</Text>
        <View style={styles.snapshotMetrics}>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{presentPct}%</Text>
            <Text style={styles.snapshotLabel}>Present Rate</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{summary.absent}</Text>
            <Text style={styles.snapshotLabel}>Absent</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{summary.late}</Text>
            <Text style={styles.snapshotLabel}>Late</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{total}</Text>
            <Text style={styles.snapshotLabel}>Records</Text>
          </View>
        </View>
      </View>

      <View style={[styles.snapshotCard, Shadow.sm]}>
        <Text style={styles.snapshotTitle}>Attendance Pulse</Text>
        <View style={styles.snapshotMetrics}>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{isToday(selectedDate) ? 'Today' : 'Past'}</Text>
            <Text style={styles.snapshotLabel}>Date Scope</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{summary.excused}</Text>
            <Text style={styles.snapshotLabel}>Excused</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{records.length > 0 ? 'Loaded' : 'Empty'}</Text>
            <Text style={styles.snapshotLabel}>Register</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{presentPct >= 85 ? 'Good' : presentPct >= 70 ? 'Watch' : 'Alert'}</Text>
            <Text style={styles.snapshotLabel}>Health</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading attendance…</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchAttendance(selectedDate); }}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          ListHeaderComponent={
            total > 0 ? (
              <View style={[styles.summaryCard, Shadow.md]}>
                {/* Ring-like percentage display */}
                <View style={styles.ringWrap}>
                  <View style={[styles.ringOuter, { borderColor: attColor + '30' }]}>
                    <View style={[styles.ringInner, { borderColor: attColor }]}>
                      <Text style={[styles.ringPct, { color: attColor }]}>{presentPct}%</Text>
                      <Text style={styles.ringLabel}>Present</Text>
                    </View>
                  </View>
                  <View style={styles.summaryChips}>
                    <SummaryChip label="Present" count={summary.present} color={Colors.success} bg={Colors.successBg} />
                    <SummaryChip label="Absent" count={summary.absent} color={Colors.danger} bg={Colors.dangerBg} />
                    <SummaryChip label="Late" count={summary.late} color={Colors.warning} bg={Colors.warningBg} />
                    <SummaryChip label="Excused" count={summary.excused} color={Colors.info} bg={Colors.infoBg} />
                  </View>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${presentPct}%` as any, backgroundColor: attColor }]} />
                </View>
                <Text style={styles.totalText}>{total} records</Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="calendar-outline" size={40} color={Colors.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>No records for this date</Text>
              <Text style={styles.emptySubtitle}>Pull to refresh or change the date</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

function SummaryChip({
  label, count, color, bg,
}: { label: string; count: number; color: string; bg: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.chipCount, { color }]}>{count}</Text>
      <Text style={[styles.chipLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  dateNav: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.surface, paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md, borderBottomWidth: 1, borderBottomColor: Colors.border,
    ...Shadow.sm,
  },
  navBtn: {
    width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accentLight,
    justifyContent: 'center', alignItems: 'center',
  },
  navBtnDisabled: { backgroundColor: Colors.background },
  dateLabelWrap: { flex: 1, alignItems: 'center', gap: 4 },
  dateLabel: { fontSize: 14, fontWeight: '700', color: Colors.text },
  todayBadge: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  todayText: { fontSize: 10, color: '#fff', fontWeight: '700' },

  snapshotCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  snapshotTitle: { fontSize: 12, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.6 },
  snapshotMetrics: { flexDirection: 'row', marginTop: Spacing.sm, gap: Spacing.sm },
  snapshotMetric: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  snapshotValue: { fontSize: 16, fontWeight: '800', color: Colors.text },
  snapshotLabel: { marginTop: 2, fontSize: 10, color: Colors.textTertiary, fontWeight: '600' },

  list: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 40 },

  summaryCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.xl, marginBottom: Spacing.md,
  },
  ringWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl, marginBottom: Spacing.lg },
  ringOuter: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 8, justifyContent: 'center', alignItems: 'center',
  },
  ringInner: {
    width: 70, height: 70, borderRadius: 35,
    borderWidth: 4, justifyContent: 'center', alignItems: 'center',
  },
  ringPct: { fontSize: 18, fontWeight: '800' },
  ringLabel: { fontSize: 10, color: Colors.textTertiary, fontWeight: '600' },
  summaryChips: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: {
    flex: 1, minWidth: '45%', borderRadius: Radius.md,
    paddingVertical: 8, alignItems: 'center',
  },
  chipCount: { fontSize: 18, fontWeight: '800' },
  chipLabel: { fontSize: 10, fontWeight: '600', marginTop: 1 },
  progressTrack: {
    height: 6, backgroundColor: Colors.background, borderRadius: Radius.full,
    overflow: 'hidden', marginBottom: 6,
  },
  progressFill: { height: 6, borderRadius: Radius.full },
  totalText: { fontSize: 12, color: Colors.textTertiary, textAlign: 'right' },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.sm, paddingTop: 80 },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },
  emptyIconWrap: { width: 72, height: 72, borderRadius: 36, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', ...Shadow.sm },
  emptyTitle: { ...Typography.h3, color: Colors.text },
  emptySubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },

  row: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    ...Shadow.sm,
  },
  rowIconWrap: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  rowInfo: { flex: 1 },
  studentId: { fontSize: 13, fontWeight: '600', color: Colors.text },
  rowMeta: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },
  remarks: { flex: 1, fontSize: 11, color: Colors.textSecondary },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },
});
