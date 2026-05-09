import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getStudentDetails } from '../../../src/api/students';
import type { StudentFullDetail } from '../../../src/types/student';
import { Colors, Spacing, Radius, Shadow, Typography, avatarColor } from '../../../src/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const FEE_STATUS: Record<string, { color: string; bg: string }> = {
  PAID: { color: Colors.success, bg: Colors.successBg },
  PENDING: { color: Colors.warning, bg: Colors.warningBg },
  OVERDUE: { color: Colors.danger, bg: Colors.dangerBg },
  PARTIALLY_PAID: { color: Colors.info, bg: Colors.infoBg },
};

const ATT_COLOR: Record<string, string> = {
  PRESENT: Colors.success,
  ABSENT: Colors.danger,
  LATE: Colors.warning,
  EXCUSED: Colors.info,
};

function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  return (
    <View style={pb.track}>
      <View style={[pb.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
    </View>
  );
}
const pb = StyleSheet.create({
  track: { height: 6, backgroundColor: Colors.background, borderRadius: Radius.full, overflow: 'hidden', marginTop: 6 },
  fill: { height: 6, borderRadius: Radius.full },
});

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<StudentFullDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getStudentDetails(id)
      .then(setDetail)
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : 'Failed to load student';
        Alert.alert('Error', message);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading profile…</Text>
      </View>
    );
  }

  if (!detail) return null;

  const { student, parents, fees, exams, attendance } = detail;
  const bg = avatarColor(`${student.firstName}${student.lastName}`);
  const initials = `${student.firstName[0]}${student.lastName[0]}`.toUpperCase();

  const attPresent = attendance.filter((a) => a.status === 'PRESENT').length;
  const attTotal = attendance.length;
  const attPct = attTotal > 0 ? Math.round((attPresent / attTotal) * 100) : 0;
  const attColor = attPct >= 85 ? Colors.success : attPct >= 70 ? Colors.warning : Colors.danger;

  const totalFees = fees.reduce((s, f) => s + f.amount, 0);
  const paidFees = fees.filter((f) => f.status === 'PAID').length;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Back button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
        <View style={styles.backIconWrap}>
          <Ionicons name="arrow-back" size={18} color={Colors.primary} />
        </View>
        <Text style={styles.backText}>Students</Text>
      </TouchableOpacity>

      {/* Hero card */}
      <View style={styles.hero}>
        <View style={styles.heroBg} />
        <View style={[styles.bigAvatar, { backgroundColor: bg }]}>
          <Text style={styles.bigAvatarText}>{initials}</Text>
        </View>
        <Text style={styles.fullName}>{student.firstName} {student.lastName}</Text>
        <Text style={styles.admNo}>{student.admissionNo}</Text>
        <View style={styles.tagRow}>
          <Tag label={student.gender} icon="person-outline" />
          <Tag
            label={student.active ? 'Active' : 'Inactive'}
            icon={student.active ? 'checkmark-circle-outline' : 'close-circle-outline'}
            color={student.active ? Colors.success : Colors.danger}
          />
        </View>
        {(student.email || student.phone) && (
          <View style={styles.contactRow}>
            {student.email && (
              <View style={styles.contactChip}>
                <Ionicons name="mail-outline" size={12} color={Colors.textSecondary} />
                <Text style={styles.contactText}>{student.email}</Text>
              </View>
            )}
            {student.phone && (
              <View style={styles.contactChip}>
                <Ionicons name="call-outline" size={12} color={Colors.textSecondary} />
                <Text style={styles.contactText}>{student.phone}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      <View style={[styles.snapshotCard, Shadow.sm]}>
        <Text style={styles.snapshotTitle}>Student Snapshot</Text>
        <View style={styles.snapshotMetrics}>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{fees.length}</Text>
            <Text style={styles.snapshotLabel}>Fee Items</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{paidFees}</Text>
            <Text style={styles.snapshotLabel}>Paid</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{attendance.length}</Text>
            <Text style={styles.snapshotLabel}>Attendance</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{exams.length}</Text>
            <Text style={styles.snapshotLabel}>Exams</Text>
          </View>
        </View>
      </View>

      <View style={[styles.snapshotCard, Shadow.sm]}>
        <Text style={styles.snapshotTitle}>Student Pulse</Text>
        <View style={styles.snapshotMetrics}>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{student.active ? 'Active' : 'Inactive'}</Text>
            <Text style={styles.snapshotLabel}>Status</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{attPct >= 85 ? 'Good' : attPct >= 70 ? 'Watch' : 'Alert'}</Text>
            <Text style={styles.snapshotLabel}>Attendance</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{fees.some((fee) => fee.status !== 'PAID') ? 'Due' : 'Clear'}</Text>
            <Text style={styles.snapshotLabel}>Fees</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{parents.length > 0 ? 'Linked' : 'Open'}</Text>
            <Text style={styles.snapshotLabel}>Parents</Text>
          </View>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <StatCard icon="card-outline" label="Fee Items" value={fees.length} color="#7C3AED" bg="#EDE9FE" />
        <StatCard icon="document-text-outline" label="Exams" value={exams.length} color={Colors.primaryLight} bg={Colors.accentLight} />
        <StatCard icon="calendar-outline" label="Att. %" value={`${attPct}%`} color={attColor} bg={attPct >= 85 ? Colors.successBg : attPct >= 70 ? Colors.warningBg : Colors.dangerBg} />
      </View>

      {/* Fee Status */}
      <Section title="Fee Status" icon="card">
        {fees.length === 0 ? (
          <EmptyState label="No fee assignments." />
        ) : (
          fees.map((f) => {
            const s = FEE_STATUS[f.status] ?? { color: Colors.textSecondary, bg: Colors.background };
            return (
              <View key={f.id} style={styles.feeRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.feeTitle}>{f.title}</Text>
                  <Text style={styles.feeMeta}>Due: {f.dueDate ?? '—'} · ₹{f.amount.toLocaleString()}</Text>
                  <ProgressBar value={f.status === 'PAID' ? f.amount : 0} max={f.amount} color={s.color} />
                </View>
                <View style={[styles.statusBadge, { backgroundColor: s.bg }]}>
                  <Text style={[styles.statusText, { color: s.color }]}>{f.status.replace('_', ' ')}</Text>
                </View>
              </View>
            );
          })
        )}
        {fees.length > 0 && (
          <View style={styles.feeSummary}>
            <Text style={styles.feeSummaryText}>
              {paidFees}/{fees.length} paid · ₹{totalFees.toLocaleString()} total
            </Text>
          </View>
        )}
      </Section>

      {/* Recent Exams */}
      <Section title="Recent Exams" icon="document-text">
        {exams.length === 0 ? (
          <EmptyState label="No exam results recorded." />
        ) : (
          exams.slice(0, 5).map((e) => (
            <View key={e.resultId} style={styles.examRow}>
              <View style={styles.examLeft}>
                <Text style={styles.examTitle}>{e.examTitle ?? 'Exam'}</Text>
                <Text style={styles.examMeta}>
                  {[e.subject, e.examDate].filter(Boolean).join(' · ')}
                </Text>
              </View>
              <View style={styles.examRight}>
                <Text style={styles.examMarks}>{e.marksObtained}</Text>
                {e.grade && (
                  <View style={styles.gradeBadge}>
                    <Text style={styles.gradeText}>{e.grade}</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </Section>

      {/* Attendance */}
      <Section title={`Attendance (last ${Math.min(attendance.length, 10)})`} icon="calendar">
        {attendance.length === 0 ? (
          <EmptyState label="No attendance records." />
        ) : (
          <>
            <View style={styles.attSummaryRow}>
              <Text style={styles.attSummaryLabel}>Present rate</Text>
              <Text style={[styles.attSummaryPct, { color: attColor }]}>{attPct}%</Text>
            </View>
            <ProgressBar value={attPresent} max={attTotal} color={attColor} />
            <View style={{ height: Spacing.md }} />
            {attendance.slice(0, 10).map((a, i) => (
              <View key={i} style={[styles.attRow, i > 0 && styles.attRowBorder]}>
                <Text style={styles.attDate}>{a.date}</Text>
                {a.className && (
                  <Text style={styles.attClass}>{a.className} {a.sectionName ?? ''}</Text>
                )}
                <View style={[styles.attDot, { backgroundColor: ATT_COLOR[a.status] ?? Colors.textTertiary }]} />
                <Text style={[styles.attStatus, { color: ATT_COLOR[a.status] ?? Colors.text }]}>
                  {a.status}
                </Text>
              </View>
            ))}
          </>
        )}
      </Section>

      {/* Parents */}
      {parents.length > 0 && (
        <Section title="Parent Contacts" icon="people">
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
              <Ionicons name="call-outline" size={18} color={Colors.textTertiary} />
            </View>
          ))}
        </Section>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Section({
  title, icon, children,
}: {
  title: string; icon: IoniconsName; children: React.ReactNode;
}) {
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

function Tag({ label, icon, color }: { label: string; icon: IoniconsName; color?: string }) {
  return (
    <View style={[styles.tag, color ? { backgroundColor: `${color}18` } : {}]}>
      <Ionicons name={icon} size={11} color={color ?? Colors.textSecondary} />
      <Text style={[styles.tagText, color ? { color } : {}]}>{label}</Text>
    </View>
  );
}

function StatCard({
  icon, label, value, color, bg,
}: {
  icon: IoniconsName; label: string; value: string | number; color: string; bg: string;
}) {
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

function EmptyState({ label }: { label: string }) {
  return <Text style={styles.emptyText}>{label}</Text>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },

  backBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, gap: Spacing.sm },
  backIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.accentLight, justifyContent: 'center', alignItems: 'center' },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: '600' },

  hero: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.md,
  },
  heroBg: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 80, backgroundColor: Colors.primary, opacity: 0.05,
  },
  bigAvatar: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 3, borderColor: Colors.surface,
    ...Shadow.md,
  },
  bigAvatarText: { color: '#fff', fontWeight: '800', fontSize: 28 },
  fullName: { ...Typography.h1, color: Colors.text, textAlign: 'center' },
  admNo: { fontSize: 13, color: Colors.textSecondary, marginTop: 4 },
  tagRow: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.md },
  tag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: Colors.background, borderRadius: Radius.full,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  tagText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  contactRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm, marginTop: Spacing.md, justifyContent: 'center' },
  contactChip: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  contactText: { fontSize: 12, color: Colors.textSecondary },

  snapshotCard: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  snapshotTitle: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  snapshotMetrics: { flexDirection: 'row', marginTop: Spacing.sm, gap: Spacing.xs },
  snapshotMetric: { flex: 1, backgroundColor: Colors.background, borderRadius: Radius.md, paddingVertical: 8, alignItems: 'center' },
  snapshotValue: { fontSize: 12, fontWeight: '800', color: Colors.text },
  snapshotLabel: { marginTop: 2, fontSize: 9, color: Colors.textTertiary, fontWeight: '600' },

  statsRow: {
    flexDirection: 'row', marginHorizontal: Spacing.md,
    marginBottom: Spacing.md, gap: Spacing.md,
  },
  statCard: {
    flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg,
    padding: Spacing.md, alignItems: 'center', gap: 4,
  },
  statIcon: { width: 36, height: 36, borderRadius: Radius.md, justifyContent: 'center', alignItems: 'center' },
  statValue: { ...Typography.numericMd, fontSize: 18 },
  statLabel: { fontSize: 10, color: Colors.textSecondary, fontWeight: '600', textAlign: 'center' },

  section: {
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    ...Shadow.sm,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.md },
  sectionIconWrap: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.accentLight, justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { ...Typography.h3, color: Colors.text },

  feeRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  feeTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  feeMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  statusBadge: { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 4 },
  statusText: { fontSize: 10, fontWeight: '700' },
  feeSummary: { paddingTop: Spacing.md },
  feeSummaryText: { fontSize: 12, color: Colors.textSecondary, textAlign: 'right' },

  examRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  examLeft: { flex: 1 },
  examTitle: { fontSize: 14, fontWeight: '600', color: Colors.text },
  examMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },
  examRight: { alignItems: 'flex-end', gap: 4 },
  examMarks: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  gradeBadge: { backgroundColor: Colors.accentLight, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  gradeText: { fontSize: 11, fontWeight: '700', color: Colors.primaryLight },

  attSummaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  attSummaryLabel: { fontSize: 13, color: Colors.textSecondary },
  attSummaryPct: { fontSize: 18, fontWeight: '800' },
  attRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: 8,
  },
  attRowBorder: { borderTopWidth: 1, borderTopColor: Colors.borderLight },
  attDate: { flex: 1, fontSize: 13, color: Colors.text },
  attClass: { fontSize: 12, color: Colors.textTertiary },
  attDot: { width: 8, height: 8, borderRadius: 4 },
  attStatus: { fontSize: 12, fontWeight: '700', minWidth: 60, textAlign: 'right' },

  parentRow: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.md,
    paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  parentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.accentLight, justifyContent: 'center', alignItems: 'center' },
  parentName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  parentMeta: { fontSize: 12, color: Colors.textSecondary, marginTop: 1 },

  emptyText: { fontSize: 13, color: Colors.textTertiary, paddingVertical: Spacing.md },
});
