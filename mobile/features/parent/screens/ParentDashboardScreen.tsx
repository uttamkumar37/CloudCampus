import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  getChildren,
  getChildAttendance,
  getChildResults,
  type ChildSummary,
} from '../api/parentApi';

// ── Child detail panel ────────────────────────────────────────────────────────

function ChildDetail({ studentId }: { studentId: string }) {
  const { data: att, isLoading: attLoading } = useQuery({
    queryKey: ['child-attendance', studentId],
    queryFn:  () => getChildAttendance(studentId),
  });
  const { data: results = [], isLoading: resLoading } = useQuery({
    queryKey: ['child-results', studentId],
    queryFn:  () => getChildResults(studentId),
  });

  return (
    <View style={styles.detail}>
      {/* Attendance */}
      <Text style={styles.sectionLabel}>Attendance</Text>
      {attLoading ? (
        <ActivityIndicator size="small" color="#1e3a5f" />
      ) : att ? (
        <View style={styles.attRow}>
          <AttStat label="Present" value={att.present} color="#16a34a" />
          <AttStat label="Absent"  value={att.absent}  color="#dc2626" />
          <AttStat label="Late"    value={att.late}     color="#d97706" />
          <AttStat label="Overall" value={`${att.attendancePct}%`} color="#1e3a5f" />
        </View>
      ) : null}

      {/* Exam results */}
      <Text style={[styles.sectionLabel, { marginTop: 14 }]}>Recent Exam Results</Text>
      {resLoading ? (
        <ActivityIndicator size="small" color="#1e3a5f" />
      ) : results.length === 0 ? (
        <Text style={styles.noData}>No results yet.</Text>
      ) : (
        results.slice(0, 5).map((r) => (
          <View key={r.id} style={styles.resultRow}>
            <View style={styles.resultLeft}>
              <Text style={styles.resultGrade}>{r.grade}</Text>
              <Text style={styles.resultPct}>{Number(r.percentage).toFixed(1)}%</Text>
            </View>
            <View>
              {r.rank ? <Text style={styles.resultRank}>Rank #{r.rank}</Text> : null}
              <Text style={[styles.resultPassed, { color: r.passed ? '#16a34a' : '#dc2626' }]}>
                {r.passed ? 'Passed' : 'Failed'}
              </Text>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

function AttStat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <View style={styles.attStat}>
      <Text style={[styles.attValue, { color }]}>{value}</Text>
      <Text style={styles.attLabel}>{label}</Text>
    </View>
  );
}

// ── Child card ────────────────────────────────────────────────────────────────

function ChildCard({ child }: { child: ChildSummary }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.cardHeader} onPress={() => setExpanded(!expanded)} activeOpacity={0.7}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {child.firstName[0]}{child.lastName[0]}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.childName}>{child.firstName} {child.lastName}</Text>
          <Text style={styles.childSub}>
            {child.studentNumber} · {child.relationship} · {child.attendancePct}% attendance
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expanded && <ChildDetail studentId={child.studentId} />}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function ParentDashboardScreen() {
  const { data: children = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['parent-children'],
    queryFn:  getChildren,
  });

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#1e3a5f" /></View>;
  if (isError)   return <View style={styles.center}><Text style={styles.errText}>Failed to load children.</Text></View>;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
    >
      <Text style={styles.heading}>My Children</Text>
      {children.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.empty}>No children linked to this account yet.</Text>
        </View>
      ) : (
        children.map((child) => <ChildCard key={child.studentId} child={child} />)
      )}
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  heading:     { fontSize: 18, fontWeight: '700', color: '#1e3a5f', marginBottom: 14 },
  errText:     { color: '#dc2626', fontSize: 14 },
  empty:       { color: '#9ca3af', fontSize: 14, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    overflow: 'hidden',
  },
  cardHeader:  { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText:  { color: '#fff', fontWeight: '700', fontSize: 16 },
  childName:   { fontSize: 15, fontWeight: '700', color: '#1f2937' },
  childSub:    { fontSize: 12, color: '#6b7280', marginTop: 2 },
  chevron:     { fontSize: 12, color: '#9ca3af' },

  detail:      { paddingHorizontal: 14, paddingBottom: 14, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 12, marginBottom: 8 },

  attRow:      { flexDirection: 'row', gap: 12 },
  attStat:     { flex: 1, alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 10, padding: 10 },
  attValue:    { fontSize: 18, fontWeight: '800' },
  attLabel:    { fontSize: 10, color: '#9ca3af', marginTop: 2 },

  noData:      { fontSize: 12, color: '#9ca3af' },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resultLeft:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultGrade: { fontSize: 20, fontWeight: '800', color: '#1e3a5f', width: 36, textAlign: 'center' },
  resultPct:   { fontSize: 14, color: '#6b7280' },
  resultRank:  { fontSize: 12, color: '#6b7280' },
  resultPassed: { fontSize: 13, fontWeight: '700' },
});
