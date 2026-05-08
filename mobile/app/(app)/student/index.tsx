import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, Alert, RefreshControl, TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMyStudentDetails } from '../../../src/api/selfProfile';
import { useAuthStore } from '../../../src/store/authStore';
import type { StudentFullDetail } from '../../../src/types/student';
import { Colors, Spacing, Radius, Shadow, Typography, avatarColor } from '../../../src/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const ATT_COLOR: Record<string, string> = {
  PRESENT: Colors.success, ABSENT: Colors.danger, LATE: Colors.warning, EXCUSED: Colors.info,
};

export default function StudentProfileScreen() {
  const { session, clearSession } = useAuthStore();
  const [detail, setDetail] = useState<StudentFullDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const data = await getMyStudentDetails();
      setDetail(data);
    } catch (err: unknown) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load profile');
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
        <Text style={styles.loadingText}>Loading your profile…</Text>
      </View>
    );
  }

  if (!detail) return null;

  const { student, parents, exams, attendance } = detail;
  const bg = avatarColor(`${student.firstName}${student.lastName}`);
  const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();
  const attPresent = attendance.filter((a) => a.status === 'PRESENT').length;
  const attTotal = attendance.length;
  const attPct = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0;
  const attColor = attPct >= 85 ? Colors.success : attPct >= 70 ? Colors.warning : Colors.danger;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
    >
      {/* Profile hero */}
      <View style={styles.hero}>
        <View style={styles.heroBg} />
        <View style={[styles.bigAvatar, { backgroundColor: bg }]}>
          <Text style={styles.bigAvatarText}>{initials}</Text>
        </View>
        <Text style={styles.fullName}>{student.firstName} {student.lastName}</Text>
        <Text style={styles.admNo}>Adm: {student.admissionNo}</Text>
        <View style={styles.tagRow}>
          <InfoTag icon="person-outline" label={student.gender} />
          <InfoTag
            icon={student.active ? 'checkmark-circle-outline' : 'close-circle-outline'}
            label={student.active ? 'Active' : 'Inactive'}
            color={student.active ? Colors.success : Colors.danger}
          />
        </View>
        {student.email && (
          <View style={styles.contactChip}>
            <Ionicons name="mail-outline" size={12} color={Colors.textSecondary} />
            <Text style={styles.contactText}>{student.email}</Text>
          </View>
        )}
        <TouchableOpacity onPress={() => clearSession()} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={14} color={Colors.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Stat row */}
      <View style={styles.statsRow}>
        <StatCard icon="calendar-outline" label="Attendance" value={`${attPct}%`} color={attColor} bg={attPct >= 85 ? Colors.successBg : attPct >= 70 ? Colors.warningBg : Colors.dangerBg} />
        <StatCard icon="document-text-outline" label="Exams" value={exams.length} color={Colors.primaryLight} bg={Colors.accentLight} />
        <StatCard icon="people-outline" label="Parents" value={parents.length} color="#7C3AED" bg="#EDE9FE" />
      </View>

      {/* Recent exams */}
      <SectionCard title="Recent Exams" icon="document-text">
        {exams.length === 0 ? (
          <Text style={styles.emptyText}>No results yet.</Text>
        ) : (
          exams.slice(0, 5).map((e) => (
            <View key={e.resultId} style={styles.examRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.examTitle}>{e.examTitle ?? 'Exam'}</Text>
                <Text style={styles.examMeta}>{[e.subject, e.examDate].filter(Boolean).join(' · ')}</Text>
              </View>
              <View style={styles.examRight}>
                <Text style={styles.examMarks}>{e.marksObtained}</Text>
                {e.grade && <View style={styles.gradeBadge}><Text style={styles.gradeText}>{e.grade}</Text></View>}
              </View>
            </View>
          ))
        )}
      </SectionCard>

      {/* Recent attendance */}
      <SectionCard title={`Attendance (last ${Math.min(attTotal, 7)})`} icon="calendar">
        {attendance.length === 0 ? (
          <Text style={styles.emptyText}>No records.</Text>
        ) : (
          <>
            <View style={styles.attSummary}>
              <Text style={styles.attSummaryLabel}>Present rate</Text>
              <Text style={[styles.attSummaryPct, { color: attColor }]}>{attPct}%</Text>
            </View>
            <View style={styles.attTrack}>
              <View style={[styles.attFill, { width: `${attPct}%` as any, backgroundColor: attColor }]} />
            </View>
            <View style={{ height: Spacing.md }} />
            {attendance.slice(0, 7).map((a, i) => (
              <View key={i} style={[styles.attRow, i > 0 && styles.attRowBorder]}>
                <Text style={styles.attDate}>{a.date}</Text>
                <View style={[styles.attDot, { backgroundColor: ATT_COLOR[a.status] ?? Colors.textTertiary }]} />
                <Text style={[styles.attStatus, { color: ATT_COLOR[a.status] ?? Colors.text }]}>{a.status}</Text>
              </View>
            ))}
          </>
        )}
      </SectionCard>

      {/* Parents */}
      {parents.length > 0 && (
        <SectionCard title="My Parents" icon="people">
          {parents.map((p) => (
            <View key={p.parentUserId} style={styles.parentRow}>
              <View style={styles.parentAvatar}>
                <Ionicons name="person" size={16} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.parentName}>{p.parentName ?? 'Parent'}</Text>
                {p.parentEmail && <Text style={styles.parentMeta}>{p.parentEmail}</Text>}
                {p.parentPhone && <Text style={styles.parentMeta}>{p.parentPhone}</Text>}
              </View>
            </View>
          ))}
        </SectionCard>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function SectionCard({ title, icon, children }: { title: string; icon: IoniconsName; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIconWrap}>
          <Ionicons name={icon} size={15} color={Colors.primary} />
        </View>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function InfoTag({ icon, label, color }: { icon: IoniconsName; label: string; color?: string }) {
  return (
    <View style={[styles.tag, color ? { backgroundColor: `${color}18` } : {}]}>
      <Ionicons name={icon} size={11} color={color ?? Colors.textSecondary} />
      <Text style={[styles.tagText, color ? { color } : {}]}>{label}</Text>
    </View>
  );
}

function StatCard({ icon, label, value, color, bg }: { icon: IoniconsName; label: string; value: string | number; color: string; bg: string }) {
  return (
    <View style={[styles.statCard, Shadow.sm]}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={16} color={color} />
      </View>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },

  hero: {
    backgroundColor: Colors.surface, marginHorizontal: Spacing.md, marginTop: Spacing.md,
    borderRadius: Radius.xl, padding: Spacing.xxl, alignItems: 'center',
    marginBottom: Spacing.md, overflow: 'hidden', ...Shadow.md,
  },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 80, backgroundColor: Colors.primary, opacity: 0.05 },
  bigAvatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md, borderWidth: 3, borderColor: Colors.surface, ...Shadow.md },
  bigAvatarText: { color: '#fff', fontWeight: '800', fontSize: 28 },
  fullName: { ...Typography.h1, color: Colors.text, textAlign: 'center' },
  admNo: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  tagRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: Colors.background, borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  tagText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  contactChip: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.sm },
  contactText: { fontSize: 12, color: Colors.textSecondary },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.lg, borderWidth: 1, borderColor: Colors.dangerBg, borderRadius: Radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  logoutText: { fontSize: 12, color: Colors.danger, fontWeight: '600' },

  statsRow: { flexDirection: 'row', marginHorizontal: Spacing.md, marginBottom: Spacing.md, gap: Spacing.md },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', gap: 4 },
  statIcon: { width: 36, height: 36, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '800' },
  statLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  section: { backgroundColor: Colors.surface, marginHorizontal: Spacing.md, marginBottom: Spacing.md, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.accentLight, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { ...Typography.h3, color: Colors.text },

  examRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  examTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  examMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  examRight: { alignItems: 'flex-end', gap: 4 },
  examMarks: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  gradeBadge: { backgroundColor: Colors.accentLight, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  gradeText: { fontSize: 11, fontWeight: '700', color: Colors.primaryLight },

  attSummary: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attSummaryLabel: { fontSize: 13, color: Colors.textSecondary },
  attSummaryPct: { fontSize: 18, fontWeight: '800' },
  attTrack: { height: 6, backgroundColor: Colors.background, borderRadius: Radius.full, overflow: 'hidden', marginTop: 6 },
  attFill: { height: 6, borderRadius: Radius.full },
  attRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 8 },
  attRowBorder: { borderTopWidth: 1, borderTopColor: Colors.borderLight },
  attDate: { flex: 1, fontSize: 13, color: Colors.text },
  attDot: { width: 8, height: 8, borderRadius: 4 },
  attStatus: { fontSize: 12, fontWeight: '700', minWidth: 60, textAlign: 'right' },

  parentRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  parentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accentLight, justifyContent: 'center', alignItems: 'center' },
  parentName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  parentMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },

  emptyText: { fontSize: 13, color: Colors.textTertiary, paddingVertical: Spacing.md },
});
