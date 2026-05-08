import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { getTenantDashboardSummary } from '../../src/api/dashboard';
import type { TenantDashboardSummary } from '../../src/types/dashboard';
import { Colors, Spacing, Radius, Shadow, Typography, avatarColor } from '../../src/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

const ACTIVITY_ICON: Record<string, { icon: IoniconsName; color: string; bg: string }> = {
  ATTENDANCE: { icon: 'calendar-outline', color: Colors.info, bg: Colors.infoBg },
  STUDENT: { icon: 'person-add-outline', color: Colors.success, bg: Colors.successBg },
  FEES: { icon: 'card-outline', color: Colors.warning, bg: Colors.warningBg },
  EXAM: { icon: 'document-text-outline', color: Colors.primaryLight, bg: Colors.accentLight },
  HOMEWORK: { icon: 'book-outline', color: '#7C3AED', bg: '#EDE9FE' },
};

export default function DashboardScreen() {
  const router = useRouter();
  const { session, clearSession } = useAuthStore();
  const [summary, setSummary] = useState<TenantDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function fetchSummary() {
    try {
      const data = await getTenantDashboardSummary();
      setSummary(data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load dashboard';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { fetchSummary(); }, []);

  const schoolName = summary?.branding.schoolName ?? session?.schoolName ?? 'Your School';
  const initials = (session?.username ?? 'U').slice(0, 2).toUpperCase();
  const avatarBg = avatarColor(session?.username ?? 'U');
  const attendancePct = summary?.attendancePercentage ?? 0;
  const attColor = attendancePct >= 85 ? Colors.success : attendancePct >= 70 ? Colors.warning : Colors.danger;
  const isAdmin = session?.role === 'SCHOOL_ADMIN';
  const roleLabel = session?.role === 'SCHOOL_ADMIN' ? 'Admin' : session?.role === 'TEACHER' ? 'Teacher' : session?.role ?? '';

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => { setRefreshing(true); fetchSummary(); }}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.headerUsername}>{session?.username}</Text>
            <View style={styles.schoolBadge}>
              <Ionicons name="business-outline" size={11} color={Colors.textOnPrimaryMuted} />
              <Text style={styles.schoolBadgeText} numberOfLines={1}>{schoolName}</Text>
            </View>
            {roleLabel ? (
              <View style={[styles.schoolBadge, { marginTop: 4 }]}>
                <Ionicons name="shield-checkmark-outline" size={11} color={Colors.textOnPrimaryMuted} />
                <Text style={styles.schoolBadgeText}>{roleLabel}</Text>
              </View>
            ) : null}
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
            <TouchableOpacity onPress={() => clearSession()} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={18} color={Colors.textOnPrimaryMuted} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Attendance bar inside header */}
        {summary && (
          <View style={styles.attBar}>
            <View style={styles.attBarLeft}>
              <Text style={styles.attBarLabel}>Today's Attendance</Text>
              <Text style={[styles.attBarPct, { color: '#fff' }]}>
                {attendancePct.toFixed(1)}%
              </Text>
            </View>
            <View style={styles.attTrack}>
              <View style={[styles.attFill, { width: `${Math.min(attendancePct, 100)}%` as any, backgroundColor: attColor }]} />
            </View>
          </View>
        )}
      </View>

      {/* KPI Grid */}
      {summary && (
        <View style={styles.kpiGrid}>
          <KpiCard
            label="Students"
            value={summary.totalStudents}
            icon="people"
            color="#2563EB"
            bg="#EFF6FF"
          />
          <KpiCard
            label="Teachers"
            value={summary.totalTeachers}
            icon="school"
            color={Colors.success}
            bg={Colors.successBg}
          />
          <KpiCard
            label="Attendance"
            value={`${attendancePct.toFixed(1)}%`}
            icon="calendar-outline"
            color={Colors.warning}
            bg={Colors.warningBg}
          />
          <KpiCard
            label="Fees (₹)"
            value={summary.feesCollected >= 1000
              ? `${(summary.feesCollected / 1000).toFixed(1)}k`
              : String(summary.feesCollected)}
            icon="card"
            color="#7C3AED"
            bg="#EDE9FE"
          />
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <QuickAction
            icon="people-outline"
            label="Students"
            color="#2563EB"
            bg="#EFF6FF"
            onPress={() => router.push('/(app)/students')}
          />
          {isAdmin && (
            <QuickAction
              icon="card-outline"
              label="Fees"
              color="#7C3AED"
              bg="#EDE9FE"
              onPress={() => router.push('/(app)/fees')}
            />
          )}
          <QuickAction
            icon="calendar-outline"
            label="Attendance"
            color={Colors.success}
            bg={Colors.successBg}
            onPress={() => router.push('/(app)/attendance')}
          />
        </View>
      </View>

      {/* Insights */}
      {summary && summary.quickInsights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Insights</Text>
          {summary.quickInsights.map((insight, i) => (
            <View key={i} style={styles.insightRow}>
              <View style={styles.insightIcon}>
                <Ionicons name="bulb-outline" size={14} color={Colors.warning} />
              </View>
              <Text style={styles.insightText}>{insight}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Recent Activity */}
      {summary && summary.recentActivity.length > 0 && (
        <View style={[styles.section, { marginBottom: Spacing.xxxl }]}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          {summary.recentActivity.slice(0, 6).map((activity, i) => {
            const meta = ACTIVITY_ICON[activity.type] ?? ACTIVITY_ICON['ATTENDANCE'];
            return (
              <View key={i} style={[styles.activityRow, i > 0 && styles.activityBorder]}>
                <View style={[styles.activityIconWrap, { backgroundColor: meta.bg }]}>
                  <Ionicons name={meta.icon} size={16} color={meta.color} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDesc} numberOfLines={1}>
                    {activity.description}
                  </Text>
                </View>
                <Text style={styles.activityTime}>{formatTime(activity.occurredAt)}</Text>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function KpiCard({
  label, value, icon, color, bg,
}: {
  label: string; value: string | number; icon: IoniconsName; color: string; bg: string;
}) {
  return (
    <View style={[styles.kpiCard, Shadow.sm]}>
      <View style={[styles.kpiIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function QuickAction({
  icon, label, color, bg, onPress,
}: {
  icon: IoniconsName; label: string; color: string; bg: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.qaBtn} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.qaIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.qaLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { paddingBottom: Spacing.xxxl },

  loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md, backgroundColor: Colors.background },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },

  header: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    overflow: 'hidden',
    position: 'relative',
  },
  circle1: {
    position: 'absolute', width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.05)', top: -50, right: -40,
  },
  circle2: {
    position: 'absolute', width: 120, height: 120, borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.04)', bottom: -30, left: 20,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { flex: 1 },
  greeting: { fontSize: 13, color: Colors.textOnPrimaryMuted, marginBottom: 2 },
  headerUsername: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  schoolBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4, alignSelf: 'flex-start', marginTop: 6,
  },
  schoolBadgeText: { fontSize: 11, color: Colors.textOnPrimaryMuted, fontWeight: '500', maxWidth: 180 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  avatarText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  logoutBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },

  attBar: { marginTop: Spacing.xl },
  attBarLeft: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  attBarLabel: { fontSize: 12, color: Colors.textOnPrimaryMuted, fontWeight: '500' },
  attBarPct: { fontSize: 12, fontWeight: '700' },
  attTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: Radius.full, overflow: 'hidden' },
  attFill: { height: 6, borderRadius: Radius.full },

  kpiGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    paddingHorizontal: Spacing.md, paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  kpiCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    width: '47.5%',
    alignItems: 'flex-start',
  },
  kpiIcon: { width: 40, height: 40, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md },
  kpiValue: { ...Typography.numericMd, marginBottom: 2 },
  kpiLabel: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },

  section: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  sectionTitle: { ...Typography.h3, color: Colors.text, marginBottom: Spacing.md },

  actionsRow: { flexDirection: 'row', gap: Spacing.sm },
  qaBtn: { flex: 1, alignItems: 'center', gap: Spacing.sm },
  qaIcon: { width: 56, height: 56, borderRadius: Radius.lg, justifyContent: 'center', alignItems: 'center' },
  qaLabel: { fontSize: 12, fontWeight: '600', color: Colors.text },

  insightRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.sm },
  insightIcon: { width: 26, height: 26, borderRadius: 13, backgroundColor: Colors.warningBg, justifyContent: 'center', alignItems: 'center', marginTop: 1 },
  insightText: { flex: 1, fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },

  activityRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, gap: Spacing.md },
  activityBorder: { borderTopWidth: 1, borderTopColor: Colors.borderLight },
  activityIconWrap: { width: 36, height: 36, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 13, fontWeight: '600', color: Colors.text },
  activityDesc: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  activityTime: { fontSize: 11, color: Colors.textTertiary, fontWeight: '500' },
});
