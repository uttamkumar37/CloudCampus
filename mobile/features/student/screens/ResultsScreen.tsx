import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { listMyResults, type MobileResult } from '../api/studentApi';

function PercentBar({ pct, passed }: { pct: number; passed: boolean }) {
  const fill = Math.min(100, pct);
  return (
    <View style={styles.barBg}>
      <View style={[
        styles.barFill,
        { width: `${fill}%` as `${number}%`, backgroundColor: passed ? '#16a34a' : '#dc2626' },
      ]} />
    </View>
  );
}

function ResultCard({ item }: { item: MobileResult }) {
  const date = new Date(item.generatedAt).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.examName}>{item.examName}</Text>
          {item.examType ? (
            <Text style={styles.examType}>{item.examType.replace(/_/g, ' ')}</Text>
          ) : null}
        </View>
        <View style={[styles.passBadge, { backgroundColor: item.passed ? '#dcfce7' : '#fee2e2' }]}>
          <Text style={[styles.passBadgeText, { color: item.passed ? '#16a34a' : '#dc2626' }]}>
            {item.passed ? 'PASS' : 'FAIL'}
          </Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{Number(item.totalMarksObtained).toFixed(0)}</Text>
          <Text style={styles.statLabel}>Obtained</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{Number(item.totalMarksPossible).toFixed(0)}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        {item.grade ? (
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: '#1e3a5f' }]}>{item.grade}</Text>
            <Text style={styles.statLabel}>Grade</Text>
          </View>
        ) : null}
        {item.rank != null ? (
          <View style={styles.stat}>
            <Text style={[styles.statValue, { color: '#7c3aed' }]}>#{item.rank}</Text>
            <Text style={styles.statLabel}>Rank</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.barWrapper}>
        <PercentBar pct={item.percentage} passed={item.passed} />
        <Text style={styles.pctLabel}>{Number(item.percentage).toFixed(1)}%</Text>
      </View>

      <Text style={styles.dateText}>{date}</Text>
    </View>
  );
}

export default function ResultsScreen() {
  const { data = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['student-results'],
    queryFn:  listMyResults,
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1e3a5f" /></View>;
  }
  if (isError) {
    return <View style={styles.center}><Text style={styles.errText}>Failed to load results.</Text></View>;
  }

  const passed  = data.filter((r) => r.passed).length;
  const avgPct  = data.length ? data.reduce((s, r) => s + r.percentage, 0) / data.length : 0;

  return (
    <FlatList
      data={data}
      keyExtractor={(i) => i.resultId}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      ListHeaderComponent={
        data.length > 0 ? (
          <View style={styles.summary}>
            {[
              { label: 'Exams',  value: data.length,               color: '#1e3a5f' },
              { label: 'Passed', value: passed,                     color: '#16a34a' },
              { label: 'Avg %',  value: `${avgPct.toFixed(1)}%`,   color: '#7c3aed' },
            ].map(({ label, value, color }) => (
              <View key={label} style={styles.summaryCard}>
                <Text style={[styles.summaryValue, { color }]}>{value}</Text>
                <Text style={styles.summaryLabel}>{label}</Text>
              </View>
            ))}
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.empty}>No exam results published yet.</Text>
        </View>
      }
      renderItem={({ item }) => <ResultCard item={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list:    { padding: 16, gap: 12 },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errText: { color: '#dc2626', fontSize: 14 },
  empty:   { color: '#9ca3af', fontSize: 14 },

  summary: { flexDirection: 'row', gap: 10, marginBottom: 4 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    alignItems: 'center',
  },
  summaryValue: { fontSize: 20, fontWeight: '800' },
  summaryLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    gap: 10,
  },
  cardHeader:    { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  examName:      { fontSize: 14, fontWeight: '700', color: '#1f2937' },
  examType:      { fontSize: 11, color: '#9ca3af', marginTop: 2, textTransform: 'uppercase' },
  passBadge:     { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  passBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  statsRow:  { flexDirection: 'row', gap: 12 },
  stat:      { alignItems: 'center', minWidth: 52 },
  statValue: { fontSize: 18, fontWeight: '800', color: '#1f2937' },
  statLabel: { fontSize: 10, color: '#9ca3af', marginTop: 2 },

  barWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barBg:      { flex: 1, height: 6, backgroundColor: '#f3f4f6', borderRadius: 3, overflow: 'hidden' },
  barFill:    { height: 6, borderRadius: 3 },
  pctLabel:   { fontSize: 12, fontWeight: '700', color: '#374151', minWidth: 44, textAlign: 'right' },

  dateText: { fontSize: 11, color: '#9ca3af' },
});
