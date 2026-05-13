import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { listNotices, type MobileNotice, type NoticeCategory } from '../api/noticeApi';

// ── Category styling ──────────────────────────────────────────────────────────

const CATEGORY_COLOR: Record<NoticeCategory, string> = {
  GENERAL:  '#6b7280',
  ACADEMIC: '#2563eb',
  EXAM:     '#7c3aed',
  FEE:      '#d97706',
  HOLIDAY:  '#16a34a',
  CIRCULAR: '#0891b2',
  URGENT:   '#dc2626',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ── Notice card ───────────────────────────────────────────────────────────────

function NoticeCard({ item }: { item: MobileNotice }) {
  const color     = CATEGORY_COLOR[item.category];
  const isUrgent  = item.priority >= 50;
  const preview   = item.content.length > 100
    ? item.content.slice(0, 100) + '…'
    : item.content;

  return (
    <View style={[styles.card, isUrgent && styles.cardUrgent]}>
      <View style={styles.cardHeader}>
        <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color + '40' }]}>
          <Text style={[styles.badgeText, { color }]}>{item.category}</Text>
        </View>
        {isUrgent && (
          <View style={styles.urgentDot} />
        )}
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>
      <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
      <Text style={styles.preview}>{preview}</Text>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function NoticesScreen() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['mobile-notices'],
    queryFn:  () => listNotices(0, 50),
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1e3a5f" />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Failed to load notices.</Text>
        <Pressable onPress={() => refetch()} style={styles.retryBtn}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const notices = data?.items ?? [];

  return (
    <FlatList
      data={notices}
      keyExtractor={(n) => n.id}
      renderItem={({ item }) => <NoticeCard item={item} />}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      contentContainerStyle={notices.length === 0 ? styles.emptyContainer : styles.list}
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.emptyText}>No notices at the moment.</Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={styles.sep} />}
    />
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  list:           { padding: 16 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  center:         { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorText:      { fontSize: 14, color: '#dc2626', marginBottom: 12, textAlign: 'center' },
  emptyText:      { fontSize: 14, color: '#9ca3af', textAlign: 'center' },
  retryBtn:       { backgroundColor: '#1e3a5f', borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  retryText:      { color: '#fff', fontWeight: '600', fontSize: 14 },
  sep:            { height: 10 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardUrgent: {
    borderLeftWidth: 3,
    borderLeftColor: '#dc2626',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  badge: {
    borderRadius: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  urgentDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#dc2626',
  },
  date: {
    marginLeft: 'auto',
    fontSize: 11,
    color: '#9ca3af',
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 6,
  },
  preview: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
});
