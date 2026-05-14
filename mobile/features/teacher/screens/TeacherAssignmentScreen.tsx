import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getTeacherAssignments, type TeacherAssignment, type AssignmentStatus } from '../api/teacherApi';

const STATUS_COLOR: Record<AssignmentStatus, string> = {
  DRAFT:  '#9ca3af',
  OPEN:   '#2563eb',
  CLOSED: '#6b7280',
};

function dueBadgeColor(dueDate: string): string {
  const diff = new Date(dueDate).getTime() - Date.now();
  if (diff < 0)          return '#dc2626';
  if (diff < 172_800_000) return '#d97706';
  return '#16a34a';
}

function GradeProgress({ submitted, graded }: { submitted: number; graded: number }) {
  const pct  = submitted > 0 ? Math.round((graded / submitted) * 100) : 0;
  const fill = submitted > 0 ? graded / submitted : 0;
  return (
    <View style={styles.progressWrap}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { flex: fill }]} />
        <View style={{ flex: 1 - fill }} />
      </View>
      <Text style={styles.progressLabel}>
        {graded}/{submitted} graded ({pct}%)
      </Text>
    </View>
  );
}

function AssignmentCard({ item }: { item: TeacherAssignment }) {
  const statusColor = STATUS_COLOR[item.status] ?? '#9ca3af';
  const dueColor    = dueBadgeColor(item.dueDate);
  const dueFmt      = new Date(item.dueDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short',
  });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={[styles.badge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{item.status}</Text>
        </View>
      </View>

      {item.description ? (
        <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>
      ) : null}

      <View style={styles.meta}>
        <View style={[styles.dueBadge, { borderColor: dueColor }]}>
          <Text style={[styles.dueText, { color: dueColor }]}>Due {dueFmt}</Text>
        </View>
        {item.maxMarks != null && (
          <Text style={styles.marks}>Max {item.maxMarks} marks</Text>
        )}
      </View>

      {item.submissionCount > 0 && (
        <GradeProgress submitted={item.submissionCount} graded={item.gradedCount} />
      )}

      {item.submissionCount === 0 && (
        <Text style={styles.noSubs}>No submissions yet</Text>
      )}
    </View>
  );
}

export default function TeacherAssignmentScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['teacher-assignments'],
    queryFn:  () => getTeacherAssignments(0),
  });

  const items = data?.items ?? [];

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1e3a5f" size="large" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errText}>Failed to load assignments.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.assignmentId}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      ListHeaderComponent={
        data && data.total > 0 ? (
          <Text style={styles.totalLabel}>{data.total} assignment{data.total !== 1 ? 's' : ''}</Text>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.empty}>No assignments created yet.</Text>
        </View>
      }
      renderItem={({ item }) => <AssignmentCard item={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list:       { padding: 16, gap: 12 },
  center:     { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errText:    { color: '#dc2626', fontSize: 14 },
  empty:      { color: '#9ca3af', fontSize: 14 },
  totalLabel: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title:      { flex: 1, fontSize: 14, fontWeight: '600', color: '#1f2937' },
  badge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  badgeText:  { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  desc:       { marginTop: 6, fontSize: 12, color: '#6b7280', lineHeight: 18 },
  meta:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  dueBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  dueText:   { fontSize: 11, fontWeight: '600' },
  marks:     { fontSize: 11, color: '#6b7280', fontWeight: '500' },

  progressWrap: { marginTop: 10 },
  progressBar: {
    height: 6,
    backgroundColor: '#f3f4f6',
    borderRadius: 3,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill:  { backgroundColor: '#1e3a5f', borderRadius: 3 },
  progressLabel: { fontSize: 11, color: '#6b7280' },
  noSubs:        { marginTop: 8, fontSize: 11, color: '#9ca3af', fontStyle: 'italic' },
});
