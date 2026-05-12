import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listNotices, type NoticeCategory } from '@/features/notices/api/noticeApi';

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN:  'Super Admin',
  SCHOOL_ADMIN: 'School Admin',
  TEACHER:      'Teacher',
  STUDENT:      'Student',
  PARENT:       'Parent',
};

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
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function DashboardScreen() {
  const user      = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const { data: noticesPage } = useQuery({
    queryKey: ['mobile-notices'],
    queryFn:  () => listNotices(0, 3),
    staleTime: 2 * 60 * 1000,
    enabled: !!user,
  });

  const latestNotices = noticesPage?.items ?? [];

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Welcome */}
      <View style={styles.welcomeCard}>
        <Text style={styles.greeting}>Welcome back</Text>
        <Text style={styles.roleLabel}>{ROLE_LABEL[user?.role ?? ''] ?? user?.role}</Text>
        {user?.tenantId && (
          <Text style={styles.tenant} numberOfLines={1}>Tenant: {user.tenantId}</Text>
        )}
      </View>

      {/* Latest notices preview */}
      {latestNotices.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Latest Notices</Text>
          {latestNotices.map((n) => {
            const color = CATEGORY_COLOR[n.category];
            return (
              <View key={n.id} style={[styles.noticeRow, n.priority >= 50 && styles.noticeRowUrgent]}>
                <View style={[styles.noticeDot, { backgroundColor: color }]} />
                <View style={styles.noticeContent}>
                  <Text style={styles.noticeTitle} numberOfLines={1}>{n.title}</Text>
                  <Text style={styles.noticeDate}>{formatDate(n.createdAt)}</Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Pressable style={styles.signOut} onPress={clearAuth} testID="btn-sign-out">
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:    { flex: 1, backgroundColor: '#f0f4f8' },
  container: { padding: 20, paddingBottom: 40 },

  welcomeCard: {
    backgroundColor: '#1e3a5f',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  greeting:  { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  roleLabel: { fontSize: 15, color: '#93c5fd', marginBottom: 2 },
  tenant:    { fontSize: 11, color: '#64748b', marginTop: 4 },

  section:      { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 20, borderWidth: 1, borderColor: '#e5e7eb' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 },

  noticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 10,
  },
  noticeRowUrgent: { backgroundColor: '#fff5f5', borderRadius: 6, paddingHorizontal: 4 },
  noticeDot:       { width: 8, height: 8, borderRadius: 4 },
  noticeContent:   { flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  noticeTitle:     { flex: 1, fontSize: 13, fontWeight: '500', color: '#111827', marginRight: 8 },
  noticeDate:      { fontSize: 11, color: '#9ca3af' },

  signOut: {
    marginTop: 'auto',
    backgroundColor: '#dc2626',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  signOutText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
