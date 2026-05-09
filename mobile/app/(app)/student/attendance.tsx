import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMyStudentDetails } from '../../../src/api/selfProfile';
import type { StudentAttendanceItem } from '../../../src/types/student';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../../src/theme';

const STATUS_META: Record<string, { color: string; bg: string; icon: React.ComponentProps<typeof Ionicons>['name'] }> = {
  PRESENT: { color: Colors.success, bg: Colors.successBg, icon: 'checkmark-circle' },
  ABSENT:  { color: Colors.danger,  bg: Colors.dangerBg,  icon: 'close-circle'     },
  LATE:    { color: Colors.warning, bg: Colors.warningBg, icon: 'time'             },
  EXCUSED: { color: Colors.info,    bg: Colors.infoBg,    icon: 'information-circle'},
};

export default function StudentAttendanceScreen() {
  const [records, setRecords]   = useState<StudentAttendanceItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const data = await getMyStudentDetails();
      setRecords(data.attendance);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load attendance');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const present  = records.filter((r) => r.status === 'PRESENT').length;
  const absent   = records.filter((r) => r.status === 'ABSENT').length;
  const late     = records.filter((r) => r.status === 'LATE').length;
  const excused  = records.filter((r) => r.status === 'EXCUSED').length;
  const total    = records.length;
  const pct      = total > 0 ? Math.round((present / total) * 100) : 0;
  const attColor = pct >= 85 ? Colors.success : pct >= 70 ? Colors.warning : Colors.danger;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading attendance…</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={records}
      keyExtractor={(_, i) => String(i)}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
      ListHeaderComponent={
        <>
          <View style={[styles.snapshotCard, Shadow.sm]}>
            <Text style={styles.snapshotTitle}>Attendance Snapshot</Text>
            <View style={styles.snapshotMetrics}>
              <View style={styles.snapshotMetric}>
                <Text style={styles.snapshotValue}>{pct}%</Text>
                <Text style={styles.snapshotLabel}>Present</Text>
              </View>
              <View style={styles.snapshotMetric}>
                <Text style={styles.snapshotValue}>{absent}</Text>
                <Text style={styles.snapshotLabel}>Absent</Text>
              </View>
              <View style={styles.snapshotMetric}>
                <Text style={styles.snapshotValue}>{late}</Text>
                <Text style={styles.snapshotLabel}>Late</Text>
              </View>
              <View style={styles.snapshotMetric}>
                <Text style={styles.snapshotValue}>{total}</Text>
                <Text style={styles.snapshotLabel}>Total</Text>
              </View>
            </View>
          </View>

          <View style={[styles.snapshotCard, Shadow.sm]}>
            <Text style={styles.snapshotTitle}>Attendance Pulse</Text>
            <View style={styles.snapshotMetrics}>
              <View style={styles.snapshotMetric}>
                <Text style={styles.snapshotValue}>{records.length > 0 ? 'Loaded' : 'Empty'}</Text>
                <Text style={styles.snapshotLabel}>Register</Text>
              </View>
              <View style={styles.snapshotMetric}>
                <Text style={styles.snapshotValue}>{excused}</Text>
                <Text style={styles.snapshotLabel}>Excused</Text>
              </View>
              <View style={styles.snapshotMetric}>
                <Text style={styles.snapshotValue}>{refreshing ? 'Sync' : 'Idle'}</Text>
                <Text style={styles.snapshotLabel}>Refresh</Text>
              </View>
              <View style={styles.snapshotMetric}>
                <Text style={styles.snapshotValue}>{pct >= 85 ? 'Good' : pct >= 70 ? 'Watch' : 'Alert'}</Text>
                <Text style={styles.snapshotLabel}>Health</Text>
              </View>
            </View>
          </View>

          {total > 0 ? (
            <View style={[styles.summaryCard, Shadow.md]}>
              {/* Ring display */}
              <View style={styles.ringWrap}>
                <View style={[styles.ringOuter, { borderColor: attColor + '30' }] }>
                  <View style={[styles.ringInner, { borderColor: attColor }] }>
                    <Text style={[styles.ringPct, { color: attColor }]}>{pct}%</Text>
                    <Text style={styles.ringLabel}>Present</Text>
                  </View>
                </View>
                <View style={styles.chipGrid}>
                  <SummaryChip label="Present" count={present} color={Colors.success} bg={Colors.successBg} />
                  <SummaryChip label="Absent"  count={absent}  color={Colors.danger}  bg={Colors.dangerBg}  />
                  <SummaryChip label="Late"    count={late}    color={Colors.warning} bg={Colors.warningBg} />
                  <SummaryChip label="Excused" count={excused} color={Colors.info}    bg={Colors.infoBg}    />
                </View>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${pct}%` as any, backgroundColor: attColor }]} />
              </View>
            </View>
          ) : null}
        </>
      }
      renderItem={({ item }) => {
        const meta = STATUS_META[item.status] ?? { color: Colors.textSecondary, bg: Colors.background, icon: 'ellipse-outline' as const };
        return (
          <View style={[styles.row, Shadow.sm]}>
            <View style={[styles.rowIcon, { backgroundColor: meta.bg }]}>
              <Ionicons name={meta.icon} size={18} color={meta.color} />
            </View>
            <View style={styles.rowInfo}>
              <Text style={styles.rowDate}>{item.date}</Text>
              {item.className && (
                <Text style={styles.rowClass}>{item.className} {item.sectionName ?? ''}</Text>
              )}
              {item.remarks && <Text style={styles.rowRemarks}>{item.remarks}</Text>}
            </View>
            <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
              <Text style={[styles.statusText, { color: meta.color }]}>{item.status}</Text>
            </View>
          </View>
        );
      }}
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <Ionicons name="calendar-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No attendance records yet</Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
    />
  );
}

function SummaryChip({ label, count, color, bg }: { label: string; count: number; color: string; bg: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: bg }]}>
      <Text style={[styles.chipCount, { color }]}>{count}</Text>
      <Text style={[styles.chipLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { padding: Spacing.md, gap: Spacing.sm, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },

  snapshotCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.sm },
  snapshotTitle: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  snapshotMetrics: { flexDirection: 'row', marginTop: Spacing.sm, gap: Spacing.xs },
  snapshotMetric: { flex: 1, backgroundColor: Colors.background, borderRadius: Radius.md, paddingVertical: 8, alignItems: 'center' },
  snapshotValue: { fontSize: 12, fontWeight: '800', color: Colors.text },
  snapshotLabel: { marginTop: 2, fontSize: 9, color: Colors.textTertiary, fontWeight: '600' },

  summaryCard: { backgroundColor: Colors.surface, borderRadius: Radius.xl, padding: Spacing.xl, marginBottom: Spacing.md },
  ringWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl, marginBottom: Spacing.lg },
  ringOuter: { width: 90, height: 90, borderRadius: 45, borderWidth: 8, justifyContent: 'center', alignItems: 'center' },
  ringInner: { width: 70, height: 70, borderRadius: 35, borderWidth: 4, justifyContent: 'center', alignItems: 'center' },
  ringPct: { fontSize: 18, fontWeight: '800' },
  ringLabel: { fontSize: 10, color: Colors.textTertiary, fontWeight: '600' },
  chipGrid: { flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: { flex: 1, minWidth: '45%', borderRadius: Radius.md, paddingVertical: 8, alignItems: 'center' },
  chipCount: { fontSize: 18, fontWeight: '800' },
  chipLabel: { fontSize: 10, fontWeight: '600', marginTop: 1 },
  progressTrack: { height: 6, backgroundColor: Colors.background, borderRadius: Radius.full, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: Radius.full },

  row: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rowIcon: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  rowInfo: { flex: 1 },
  rowDate: { fontSize: 14, fontWeight: '600', color: Colors.text },
  rowClass: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  rowRemarks: { fontSize: 11, color: Colors.textTertiary, marginTop: 1 },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  statusText: { fontSize: 10, fontWeight: '700' },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: Spacing.sm },
  emptyTitle: { ...Typography.h3, color: Colors.textSecondary },
});
