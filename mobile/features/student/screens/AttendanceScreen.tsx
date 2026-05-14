import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';

interface AttendanceRow { date: string; period: number; status: AttendanceStatus; }

interface MyAttendance {
  totalSessions: number;
  presentCount:  number;
  absentCount:   number;
  lateCount:     number;
  excusedCount:  number;
  attendancePct: number;
  recent:        AttendanceRow[];
}

async function getMyAttendance(): Promise<MyAttendance> {
  const { data } = await axiosInstance.get<ApiResponse<MyAttendance>>('/v1/student/attendance');
  return data.data!;
}

const STATUS_COLOR: Record<AttendanceStatus, { bg: string; text: string }> = {
  PRESENT: { bg: '#dcfce7', text: '#16a34a' },
  ABSENT:  { bg: '#fee2e2', text: '#dc2626' },
  LATE:    { bg: '#fef3c7', text: '#d97706' },
  EXCUSED: { bg: '#dbeafe', text: '#2563eb' },
};

function SummaryCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function RecordRow({ item }: { item: AttendanceRow }) {
  const date = new Date(item.date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const c = STATUS_COLOR[item.status];
  return (
    <View style={styles.row}>
      <Text style={styles.rowDate}>{date}</Text>
      <Text style={styles.rowPeriod}>P{item.period}</Text>
      <View style={[styles.badge, { backgroundColor: c.bg }]}>
        <Text style={[styles.badgeText, { color: c.text }]}>{item.status}</Text>
      </View>
    </View>
  );
}

export default function AttendanceScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['student-attendance'],
    queryFn:  getMyAttendance,
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1e3a5f" /></View>;
  }
  if (isError || !data) {
    return (
      <View style={styles.center}>
        <Text style={styles.errText}>Failed to load attendance.</Text>
      </View>
    );
  }

  const { totalSessions, presentCount, absentCount, lateCount, attendancePct, recent } = data;
  const pctColor = attendancePct >= 75 ? '#16a34a' : '#dc2626';
  const barWidth = `${Math.min(100, attendancePct)}%` as `${number}%`;

  return (
    <FlatList
      data={recent}
      keyExtractor={(_, i) => String(i)}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      ListHeaderComponent={
        <>
          {/* Summary cards */}
          <View style={styles.summaryRow}>
            <SummaryCard label="Total"   value={totalSessions} color="#1e3a5f" />
            <SummaryCard label="Present" value={presentCount}  color="#16a34a" />
            <SummaryCard label="Absent"  value={absentCount}   color="#dc2626" />
            <SummaryCard label="Late"    value={lateCount}     color="#d97706" />
          </View>

          {/* Percentage bar */}
          <View style={styles.pctCard}>
            <View style={styles.pctHeader}>
              <Text style={styles.pctTitle}>Attendance Rate</Text>
              <Text style={[styles.pctValue, { color: pctColor }]}>{attendancePct}%</Text>
            </View>
            <View style={styles.barBg}>
              <View style={[styles.barFill, { width: barWidth, backgroundColor: pctColor }]} />
            </View>
            {attendancePct < 75 && (
              <Text style={styles.pctWarn}>Below 75% attendance requirement</Text>
            )}
          </View>

          {recent.length > 0 && (
            <Text style={styles.sectionTitle}>Recent Sessions ({recent.length})</Text>
          )}
        </>
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.empty}>No attendance records yet.</Text>
        </View>
      }
      renderItem={({ item }) => <RecordRow item={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list:    { padding: 16, gap: 12 },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errText: { color: '#dc2626', fontSize: 14 },
  empty:   { color: '#9ca3af', fontSize: 14 },

  summaryRow:  { flexDirection: 'row', gap: 8, marginBottom: 4 },
  summaryCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 10,
    borderWidth: 1, borderColor: '#e5e7eb', padding: 10, alignItems: 'center',
  },
  summaryValue: { fontSize: 18, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: '#9ca3af', marginTop: 2 },

  pctCard:   { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 14, gap: 8 },
  pctHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  pctTitle:  { fontSize: 13, fontWeight: '600', color: '#374151' },
  pctValue:  { fontSize: 16, fontWeight: '800' },
  pctWarn:   { fontSize: 11, color: '#dc2626' },
  barBg:     { height: 8, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden' },
  barFill:   { height: 8, borderRadius: 4 },

  sectionTitle: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 4 },

  row:        { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowDate:    { flex: 1, fontSize: 13, color: '#374151' },
  rowPeriod:  { fontSize: 12, color: '#9ca3af', minWidth: 24 },
  badge:      { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:  { fontSize: 11, fontWeight: '700' },
});
