import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getStudents } from '../../../src/api/students';
import type { Student } from '../../../src/types/student';
import { Colors, Spacing, Radius, Shadow, Typography, avatarColor } from '../../../src/theme';

const PAGE_SIZE = 30;

export default function StudentsScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchStudents = useCallback(async (query?: string) => {
    try {
      const result = await getStudents(0, PAGE_SIZE, query);
      setStudents(result.content);
      setTotal(result.totalElements ?? result.content.length);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load students';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, []);

  function handleSearch() {
    setLoading(true);
    fetchStudents(search.trim() || undefined);
  }

  function handleClear() {
    setSearch('');
    setLoading(true);
    fetchStudents(undefined);
  }

  function renderStudent({ item, index }: { item: Student; index: number }) {
    const bg = avatarColor(`${item.firstName}${item.lastName}`);
    const initials = `${item.firstName[0]}${item.lastName[0]}`.toUpperCase();
    return (
      <TouchableOpacity
        style={[styles.card, index === 0 && styles.cardFirst]}
        onPress={() => router.push(`/(app)/students/${item.id}`)}
        activeOpacity={0.72}
      >
        <View style={[styles.avatar, { backgroundColor: bg }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
          <Text style={styles.meta}>
            <Ionicons name="card-outline" size={11} color={Colors.textTertiary} /> {item.admissionNo}
          </Text>
          {(item.email || item.phone) && (
            <Text style={styles.meta} numberOfLines={1}>
              {item.email ?? item.phone}
            </Text>
          )}
        </View>
        <View style={styles.right}>
          <View style={[styles.badge, !item.active && styles.badgeInactive]}>
            <Text style={[styles.badgeText, !item.active && styles.badgeTextInactive]}>
              {item.active ? 'Active' : 'Inactive'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} style={{ marginTop: 8 }} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={18} color={Colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search name or admission no."
            placeholderTextColor={Colors.textTertiary}
            value={search}
            onChangeText={setSearch}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>
        {total > 0 && (
          <Text style={styles.countText}>{total} student{total !== 1 ? 's' : ''}</Text>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading students…</Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id}
          renderItem={renderStudent}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchStudents(search.trim() || undefined); }}
              tintColor={Colors.primary}
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.centered}>
              <View style={styles.emptyIcon}>
                <Ionicons name="people-outline" size={40} color={Colors.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>No students found</Text>
              <Text style={styles.emptySubtitle}>Try a different search term</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  searchWrap: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadow.sm,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
  },
  searchIcon: { marginRight: Spacing.xs },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
    color: Colors.text,
  },
  clearBtn: { padding: 4 },
  searchBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    marginLeft: Spacing.sm,
  },
  searchBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  countText: { fontSize: 12, color: Colors.textTertiary, marginTop: 6, marginLeft: 2 },

  list: { padding: Spacing.md, paddingBottom: Spacing.xxxl },
  separator: { height: Spacing.sm },
  cardFirst: {},
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    ...Shadow.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  info: { flex: 1, gap: 2 },
  name: { ...Typography.h3, color: Colors.text },
  meta: { fontSize: 12, color: Colors.textSecondary },
  right: { alignItems: 'flex-end' },
  badge: {
    backgroundColor: Colors.successBg,
    borderRadius: Radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeInactive: { backgroundColor: Colors.dangerBg },
  badgeText: { fontSize: 11, fontWeight: '700', color: Colors.success },
  badgeTextInactive: { color: Colors.danger },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },
  emptyIcon: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  emptyTitle: { ...Typography.h3, color: Colors.text },
  emptySubtitle: { fontSize: 13, color: Colors.textSecondary },
});
