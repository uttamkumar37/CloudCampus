import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { getTeacherHomework, type TeacherHomework, type HomeworkStatus } from '../api/teacherApi';

const STATUS_COLOR: Record<HomeworkStatus, string> = {
  DRAFT:     '#9ca3af',
  PUBLISHED: '#16a34a',
  CLOSED:    '#6b7280',
};

function dueBadgeColor(dueDate: string): string {
  const diff = new Date(dueDate).getTime() - Date.now();
  if (diff < 0)          return '#dc2626'; // overdue
  if (diff < 172_800_000) return '#d97706'; // < 2 days
  return '#16a34a';
}

function HomeworkCard({ item }: { item: TeacherHomework }) {
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

      <View style={styles.footer}>
        <View style={[styles.dueBadge, { borderColor: dueColor }]}>
          <Text style={[styles.dueText, { color: dueColor }]}>Due {dueFmt}</Text>
        </View>
        <View style={styles.countChip}>
          <Text style={styles.countText}>{item.submissionCount} submission{item.submissionCount !== 1 ? 's' : ''}</Text>
        </View>
      </View>
    </View>
  );
}

export default function TeacherHomeworkScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['teacher-homework'],
    queryFn:  () => getTeacherHomework(0),
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
        <Text style={styles.errText}>Failed to load homework.</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={items}
      keyExtractor={(i) => i.homeworkId}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      ListHeaderComponent={
        data && data.total > 0 ? (
          <Text style={styles.totalLabel}>{data.total} homework assignment{data.total !== 1 ? 's' : ''}</Text>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.empty}>No homework assignments yet.</Text>
        </View>
      }
      renderItem={({ item }) => <HomeworkCard item={item} />}
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
  footer:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  dueBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  dueText:   { fontSize: 11, fontWeight: '600' },
  countChip: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  countText: { fontSize: 11, color: '#374151', fontWeight: '500' },
});
