import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { API_BASE_URL } from '../api/client';
import { fetchProjectSnapshot, ProjectSnapshot, SchoolAccess, SyncCard } from '../api/projectApi';
import { colors } from '../theme/colors';

export function HomeScreen() {
  const { user, activateSchool, logout } = useAuth();
  const [snapshot, setSnapshot] = useState<ProjectSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [switchingSchool, setSwitchingSchool] = useState<string | null>(null);

  const load = useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (!user) return;
    if (mode === 'initial') setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      setSnapshot(await fetchProjectSnapshot(user));
    } catch (e) {
      setError((e as Error)?.message ?? 'Failed to sync mobile dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    void load('initial');
  }, [load]);

  const counts = useMemo(() => {
    const cards = snapshot?.cards ?? [];
    return {
      ok: cards.filter((c) => c.status === 'ok').length,
      error: cards.filter((c) => c.status === 'error').length,
      skipped: cards.filter((c) => c.status === 'skipped').length,
    };
  }, [snapshot]);

  const switchSchool = async (schoolId: string) => {
    setSwitchingSchool(schoolId);
    setError(null);
    try {
      await activateSchool(schoolId);
      await load('refresh');
    } catch (e) {
      setError((e as Error)?.message ?? 'Unable to switch school');
    } finally {
      setSwitchingSchool(null);
    }
  };

  if (!user) return null;

  return (
    <ScrollView contentContainerStyle={styles.scroll} style={styles.root}>
      <View style={styles.headerRow}>
        <View style={styles.headerText}>
          <Text style={styles.kicker}>CloudCampus Mobile</Text>
          <Text style={styles.welcome}>{roleTitle(user.role)}</Text>
          <Text style={styles.metaText} numberOfLines={1}>{API_BASE_URL}</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={logout} style={styles.signOut}>
          <Text style={styles.signOutText}>Sign out</Text>
        </Pressable>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardHeading}>Session</Text>
        <Row label="Role" value={user.role} />
        <Row label="Tenant" value={user.tenantId ? 'Tenant scoped' : 'Platform'} />
        <Row label="School" value={user.schoolId ? 'School scoped' : 'No active school'} />
        <Row label="Features" value={`${user.features?.length ?? 0} enabled`} />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.toolbar}>
        <View>
          <Text style={styles.cardHeading}>API sync</Text>
          <Text style={styles.cardSub}>
            {snapshot ? `${counts.ok} live, ${counts.error} failed, ${counts.skipped} skipped` : 'Loading current project APIs'}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          disabled={refreshing || loading}
          onPress={() => void load('refresh')}
          style={[styles.refreshButton, (refreshing || loading) && styles.disabled]}
        >
          <Text style={styles.refreshText}>{refreshing ? 'Syncing' : 'Sync'}</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.loadingCard}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.empty}>Loading role workspace...</Text>
        </View>
      ) : (
        <>
          {snapshot?.schools?.length ? (
            <View style={styles.card}>
              <Text style={styles.cardHeading}>School access</Text>
              <Text style={styles.cardSub}>Switching calls /v1/me/schools/:id/activate and refreshes the JWT.</Text>
              {snapshot.schools.map((school) => (
                <SchoolRow
                  key={school.schoolId}
                  active={school.schoolId === user.schoolId}
                  school={school}
                  busy={switchingSchool === school.schoolId}
                  onSwitch={() => void switchSchool(school.schoolId)}
                />
              ))}
            </View>
          ) : null}

          {snapshot?.cards.map((card) => (
            <SyncCardView key={card.key} card={card} />
          ))}
        </>
      )}
    </ScrollView>
  );
}

function roleTitle(role: string): string {
  return role
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

function SchoolRow({
  school,
  active,
  busy,
  onSwitch,
}: {
  school: SchoolAccess;
  active: boolean;
  busy: boolean;
  onSwitch: () => void;
}) {
  const name = school.schoolName ?? school.name ?? school.code ?? 'School access';
  return (
    <View style={styles.schoolRow}>
      <View style={styles.schoolInfo}>
        <Text style={styles.noticeTitle}>{name}</Text>
        <Text style={styles.noticeMeta}>{active ? 'Active school' : 'Available'}</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        disabled={active || busy}
        onPress={onSwitch}
        style={[styles.smallButton, (active || busy) && styles.disabled]}
      >
        <Text style={styles.smallButtonText}>{busy ? 'Switching' : active ? 'Active' : 'Use'}</Text>
      </Pressable>
    </View>
  );
}

function SyncCardView({ card }: { card: SyncCard }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.cardTitleBlock}>
          <Text style={styles.cardHeading}>{card.title}</Text>
          <Text style={styles.endpoint} numberOfLines={1}>{card.endpoint}</Text>
        </View>
        <View style={[styles.badge, styles[`${card.status}Badge`]]}>
          <Text style={[styles.badgeText, styles[`${card.status}BadgeText`]]}>{card.status}</Text>
        </View>
      </View>
      <Text style={card.status === 'error' ? styles.errorText : styles.summaryText}>
        {card.summary}
      </Text>
      {card.details.map((detail) => (
        <View key={detail} style={styles.detailRow}>
          <Text style={styles.detailBullet}>-</Text>
          <Text style={styles.detailText} numberOfLines={2}>{detail}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: 16, paddingBottom: 32 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingTop: 8,
  },
  headerText: { flex: 1 },
  kicker: { color: colors.primary, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  welcome: { fontSize: 26, fontWeight: '800', color: colors.text, marginTop: 2 },
  metaText: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  signOut: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: colors.border,
  },
  signOutText: { color: colors.text, fontSize: 13, fontWeight: '700' },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start' },
  cardTitleBlock: { flex: 1 },
  cardHeading: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: 2 },
  cardSub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  endpoint: { fontSize: 11, color: colors.textMuted, marginBottom: 10 },
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  refreshButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  refreshText: { color: colors.primaryText, fontWeight: '800', fontSize: 13 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  rowLabel: { color: colors.textMuted, fontSize: 13 },
  rowValue: { color: colors.text, fontSize: 13, fontWeight: '700', maxWidth: '60%' },
  schoolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  schoolInfo: { flex: 1 },
  smallButton: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#eef2ff',
  },
  smallButtonText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  disabled: { opacity: 0.5 },
  badge: { borderRadius: 999, paddingHorizontal: 9, paddingVertical: 4 },
  badgeText: { fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  okBadge: { backgroundColor: colors.successBg },
  okBadgeText: { color: colors.successText },
  emptyBadge: { backgroundColor: '#f1f5f9' },
  emptyBadgeText: { color: colors.textMuted },
  errorBadge: { backgroundColor: colors.dangerBg },
  errorBadgeText: { color: colors.danger },
  skippedBadge: { backgroundColor: '#fef3c7' },
  skippedBadgeText: { color: '#92400e' },
  summaryText: { color: colors.text, fontSize: 14, marginTop: 2, marginBottom: 6 },
  detailRow: { flexDirection: 'row', gap: 8, marginTop: 4 },
  detailBullet: { color: colors.textMuted, fontSize: 13 },
  detailText: { color: colors.textMuted, fontSize: 13, flex: 1 },
  noticeTitle: { color: colors.text, fontSize: 14, fontWeight: '700' },
  noticeMeta: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  empty: { color: colors.textMuted, fontSize: 13, marginTop: 12 },
  errorBox: {
    marginBottom: 12,
    backgroundColor: colors.dangerBg,
    borderRadius: 10,
    padding: 12,
  },
  errorText: { color: colors.danger, fontSize: 13, fontWeight: '600' },
});
