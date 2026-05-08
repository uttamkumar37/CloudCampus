import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, Alert, TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getStudentDetails } from '../../../src/api/students';
import type { StudentFullDetail } from '../../../src/types/student';
import { Colors, Spacing, Radius, Shadow, Typography, avatarColor } from '../../../src/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const FEE_STATUS: Record<string, { color: string; bg: string }> = {
  PAID:           { color: Colors.success, bg: Colors.successBg },
  PENDING:        { color: Colors.warning, bg: Colors.warningBg },
  OVERDUE:        { color: Colors.danger,  bg: Colors.dangerBg  },
  PARTIALLY_PAID: { color: Colors.info,    bg: Colors.infoBg    },
};
const ATT_COLOR: Record<string, string> = {
  PRESENT: Colors.success, ABSENT: Colors.danger, LATE: Colors.warning, EXCUSED: Colors.info,
};

export default function ParentChildDetailScreen() {
  const { childId } = useLocalSearchParams<{ childId: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<StudentFullDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childId) return;
    getStudentDetails(childId)
      .then(setDetail)
      .catch((err) => Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [childId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading…</Text>
      </View>
    );
  }
  if (!detail) return null;

  const { student, fees, exams, attendance } = detail;
  const bg = avatarColor(`${student.firstName}${student.lastName}`);
  const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

  const attPresent = attendance.filter((a) => a.status === 'PRESENT').length;
  const attTotal   = attendance.length;
  const attPct     = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0;
  const attColor   = attPct >= 85 ? Colors.success : attPct >= 70 ? Colors.warning : Colors.danger;

  const totalFees  = fees.reduce((s, f) => s + f.amount, 0);
  const pendingFees = fees.filter((f) => f.status !== 'PAID').reduce((s, f) => s + f.amount, 0);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <View style={styles.backIconWrap}>
          <Ionicons name="arrow-back" size={18} color={Colors.primary} />
        </View>
        <Text style={styles.backText}>My Children</Text>
      </TouchableOpacity>

      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroBg} />
        <View style={[styles.bigAvatar, { backgroundColor: bg }]}>
          <Text style={styles.bigAvatarText}>{initials}</Text>
        </View>
        <Text style={styles.fullName}>{student.firstName} {student.lastName}</Text>
        <Text style={styles.admNo}>Adm: {student.admissionNo}</Text>
        {(student.email || student.phone) && (
          <Text style={styles.contact}>{student.email ?? student.phone}</Text>
        )}
      </View>

      {/* Quick stats */}
      <View style={styles.statsRow}>
        <StatCard icon="card-outline"     label="Total Fees"  value={`₹${totalFees.toLocaleString()}`} color="#7C3AED" bg="#EDE9FE" />
        <StatCard icon="alert-circle-outline" label="Pending" value={`₹${pendingFees.toLocaleString()}`} color={pendingFees > 0 ? Colors.danger : Colors.success} bg={pendingFees > 0 ? Colors.dangerBg : Colors.successBg} />
        <StatCard icon="calendar-outline" label="Attendance"  value={`${attPct}%`} color={attColor} bg={attPct >= 85 ? Colors.successBg : attPct >= 70 ? Colors.warningBg : Colors.dangerBg} />
      </View>

      {/* Fees */}
      <SectionCard title="Fee Status" icon="card">
        {fees.length === 0 ? (
          <Text style={styles.emptyText}>No fee assignments.</Text>
        ) : (
          fees.map((f) => {
            const s = FEE_STATUS[f.status] ?? { color: Colors.textSecondary, bg: Colors.background };
            return (
              <View key={f.id} style={styles.feeRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.feeTitle}>{f.title}</Text>
                  <Text style={styles.feeMeta}>₹{f.amount.toLocaleString()} · Due: {f.dueDate ?? '—'}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.statusText, { color: s.color }]}>{f.status.replace('_', ' ')}</Text>
                </View>
              </View>
            );
          })
        )}
        {pendingFees > 0 && (
          <View style={styles.pendingAlert}>
            <Ionicons name="alert-circle-outline" size={14} color={Colors.warning} />
            <Text style={styles.pendingAlertText}>
              ₹{pendingFees.toLocaleString()} pending — please contact the school office.
            </Text>
          </View>
        )}
      </SectionCard>

      {/* Recent exams */}
      <SectionCard title="Recent Exams" icon="document-text">
        {exams.length === 0 ? (
          <Text style={styles.emptyText}>No results recorded.</Text>
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

      {/* Attendance */}
      <SectionCard title={`Attendance (${attPct}%)`} icon="calendar">
        {attendance.length === 0 ? (
          <Text style={styles.emptyText}>No attendance records.</Text>
        ) : (
          <>
            <View style={styles.attSummary}>
              <Text style={[styles.attPct, { color: attColor }]}>{attPct}% present</Text>
            </View>
            <View style={styles.attTrack}>
              <View style={[styles.attFill, { width: `${attPct}%` as any, backgroundColor: attColor }]} />
            </View>
            <View style={{ height: Spacing.md }} />
            {attendance.slice(0, 10).map((a, i) => (
              <View key={i} style={[styles.attRow, i > 0 && { borderTopWidth: 1, borderTopColor: Colors.borderLight }]}>
                <Text style={styles.attDate}>{a.date}</Text>
                <View style={[styles.attDot, { backgroundColor: ATT_COLOR[a.status] ?? Colors.textTertiary }]} />
                <Text style={[styles.attStatus, { color: ATT_COLOR[a.status] ?? Colors.text }]}>{a.status}</Text>
              </View>
            ))}
          </>
        )}
      </SectionCard>

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

function StatCard({ icon, label, value, color, bg }: { icon: IoniconsName; label: string; value: string | number; color: string; bg: string }) {
  return (
    <View style={[styles.statCard, Shadow.sm]}>
      <View style={[styles.statIcon, { backgroundColor: bg }]}>
        <Ionicons name={icon} size={15} color={color} />
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

  backBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm },
  backIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accentLight, justifyContent: 'center', alignItems: 'center' },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },

  hero: { backgroundColor: Colors.surface, marginHorizontal: Spacing.md, borderRadius: Radius.xl, padding: Spacing.xxl, alignItems: 'center', marginBottom: Spacing.md, overflow: 'hidden', ...Shadow.md },
  heroBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 80, backgroundColor: Colors.primary, opacity: 0.05 },
  bigAvatar: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: Spacing.md, borderWidth: 3, borderColor: Colors.surface, ...Shadow.md },
  bigAvatarText: { color: '#fff', fontWeight: '800', fontSize: 28 },
  fullName: { ...Typography.h1, color: Colors.text, textAlign: 'center' },
  admNo: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  contact: { fontSize: 12, color: Colors.textSecondary, marginTop: 4 },

  statsRow: { flexDirection: 'row', marginHorizontal: Spacing.md, marginBottom: Spacing.md, gap: Spacing.sm },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'center', gap: 3 },
  statIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  statValue: { fontSize: 14, fontWeight: '800' },
  statLabel: { fontSize: 9, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  section: { backgroundColor: Colors.surface, marginHorizontal: Spacing.md, marginBottom: Spacing.md, borderRadius: Radius.lg, padding: Spacing.lg, ...Shadow.sm },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.accentLight, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { ...Typography.h3, color: Colors.text },

  feeRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  feeTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  feeMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  statusBadge: { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  pendingAlert: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: Colors.warningBg, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 8, marginTop: Spacing.md },
  pendingAlertText: { flex: 1, fontSize: 12, color: Colors.warning, lineHeight: 17 },

  examRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  examTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  examMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  examRight: { alignItems: 'flex-end', gap: 4 },
  examMarks: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  gradeBadge: { backgroundColor: Colors.accentLight, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  gradeText: { fontSize: 11, fontWeight: '700', color: Colors.primaryLight },

  attSummary: { flexDirection: 'row', justifyContent: 'flex-end' },
  attPct: { fontSize: 14, fontWeight: '700' },
  attTrack: { height: 6, backgroundColor: Colors.background, borderRadius: Radius.full, overflow: 'hidden', marginTop: 6 },
  attFill: { height: 6, borderRadius: Radius.full },
  attRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: 8 },
  attDate: { flex: 1, fontSize: 13, color: Colors.text },
  attDot: { width: 8, height: 8, borderRadius: 4 },
  attStatus: { fontSize: 12, fontWeight: '700', minWidth: 60, textAlign: 'right' },

  emptyText: { fontSize: 13, color: Colors.textTertiary, paddingVertical: Spacing.sm },
});
