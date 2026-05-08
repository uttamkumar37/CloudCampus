import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getMyChildren } from '../../../src/api/parent';
import { useAuthStore } from '../../../src/store/authStore';
import type { ParentChild } from '../../../src/types/parent';
import { Colors, Spacing, Radius, Shadow, Typography, avatarColor } from '../../../src/theme';

export default function ParentHomeScreen() {
  const router = useRouter();
  const { session, clearSession } = useAuthStore();
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const data = await getMyChildren();
      setChildren(data);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load children');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your children…</Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.container}
      data={children}
      keyExtractor={(item) => item.studentId}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.headerContent}>
            <View>
              <Text style={styles.greeting}>Welcome,</Text>
              <Text style={styles.username}>{session?.username}</Text>
              <View style={styles.schoolBadge}>
                <Ionicons name="business-outline" size={11} color={Colors.textOnPrimaryMuted} />
                <Text style={styles.schoolText}>{session?.schoolName}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => clearSession()} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={18} color={Colors.textOnPrimaryMuted} />
            </TouchableOpacity>
          </View>
          <View style={styles.countBadge}>
            <Ionicons name="people" size={14} color={Colors.textOnPrimaryMuted} />
            <Text style={styles.countText}>
              {children.length} child{children.length !== 1 ? 'ren' : ''} linked
            </Text>
          </View>
        </View>
      }
      renderItem={({ item }) => {
        const bg = avatarColor(`${item.firstName}${item.lastName}`);
        const initials = `${item.firstName[0]}${item.lastName[0]}`.toUpperCase();
        return (
          <TouchableOpacity
            style={[styles.card, Shadow.sm]}
            onPress={() => router.push(`/(app)/parent/${item.studentId}`)}
            activeOpacity={0.75}
          >
            <View style={[styles.avatar, { backgroundColor: bg }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <View style={styles.info}>
              <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
              <Text style={styles.meta}>Adm: {item.admissionNo}</Text>
              {item.className && (
                <Text style={styles.meta}>
                  Class {item.className}{item.sectionName ? ` · ${item.sectionName}` : ''}
                </Text>
              )}
            </View>
            <View style={styles.right}>
              <View style={[styles.activeBadge, !item.active && styles.activeBadgeOff]}>
                <Text style={[styles.activeBadgeText, !item.active && styles.activeBadgeTextOff]}>
                  {item.active ? 'Active' : 'Inactive'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textTertiary} style={{ marginTop: 8 }} />
            </View>
          </TouchableOpacity>
        );
      }}
      ListEmptyComponent={
        <View style={styles.emptyWrap}>
          <View style={styles.emptyIcon}>
            <Ionicons name="people-outline" size={40} color={Colors.textTertiary} />
          </View>
          <Text style={styles.emptyTitle}>No children linked</Text>
          <Text style={styles.emptySubtitle}>Contact the school to link your children</Text>
        </View>
      }
      ItemSeparatorComponent={() => <View style={{ height: Spacing.sm }} />}
    />
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  list: { paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },

  header: {
    backgroundColor: Colors.primary, paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl, paddingBottom: Spacing.xxl,
    marginBottom: Spacing.md, overflow: 'hidden', position: 'relative',
  },
  circle1: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.05)', top: -50, right: -40 },
  circle2: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255,255,255,0.04)', bottom: -30, left: 20 },
  headerContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  greeting: { fontSize: 13, color: Colors.textOnPrimaryMuted },
  username: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  schoolBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 6 },
  schoolText: { fontSize: 11, color: Colors.textOnPrimaryMuted, fontWeight: '500' },
  logoutBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  countBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xl },
  countText: { fontSize: 13, color: Colors.textOnPrimaryMuted, fontWeight: '500' },

  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, marginHorizontal: Spacing.md, padding: Spacing.lg, flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: { width: 52, height: 52, borderRadius: 26, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  info: { flex: 1, gap: 2 },
  name: { ...Typography.h3, color: Colors.text },
  meta: { fontSize: 12, color: Colors.textSecondary },
  right: { alignItems: 'flex-end' },
  activeBadge: { backgroundColor: Colors.successBg, borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  activeBadgeOff: { backgroundColor: Colors.dangerBg },
  activeBadgeText: { fontSize: 11, fontWeight: '700', color: Colors.success },
  activeBadgeTextOff: { color: Colors.danger },

  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm, paddingHorizontal: Spacing.xxl },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', ...Shadow.sm },
  emptyTitle: { ...Typography.h3, color: Colors.text },
  emptySubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center' },
});
