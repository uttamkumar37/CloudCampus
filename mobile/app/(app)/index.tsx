import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { listNotices } from '@/features/notices/api/noticeApi';
import { listMyHomework } from '@/features/homework/api/homeworkApi';
import { listMyAssignments, listMyFees } from '@/features/student/api/studentApi';
import { getChildren } from '@/features/parent/api/parentApi';
import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface TeacherDash {
  todaySlots:               { id: string }[];
  pendingHomeworkReview:    number;
  pendingAssignmentGrading: number;
}

interface StudentAtt { attendancePct: number; }

// ── Role label ────────────────────────────────────────────────────────────────

const ROLE_LABEL: Record<string, string> = {
  SUPER_ADMIN:  'Super Admin',
  SCHOOL_ADMIN: 'School Admin',
  TEACHER:      'Teacher',
  STUDENT:      'Student',
  PARENT:       'Parent',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatChip({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={[styles.chip, { backgroundColor: color + '20' }]}>
      <Text style={[styles.chipValue, { color }]}>{value}</Text>
      <Text style={styles.chipLabel}>{label}</Text>
    </View>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {children}
    </View>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role ?? '';

  const isStudent     = role === 'STUDENT';
  const isTeacher     = role === 'TEACHER';
  const isParent      = role === 'PARENT';

  // Notices (all roles)
  const { data: noticesPage } = useQuery({
    queryKey: ['mobile-notices'],
    queryFn:  () => listNotices(0, 3),
    staleTime: 2 * 60_000,
    enabled: !!user,
  });

  // Student stats
  const { data: homework = [] } = useQuery({
    queryKey: ['student-homework'],
    queryFn:  listMyHomework,
    enabled:  isStudent,
  });
  const { data: assignments = [] } = useQuery({
    queryKey: ['student-assignments'],
    queryFn:  listMyAssignments,
    enabled:  isStudent,
  });
  const { data: fees = [] } = useQuery({
    queryKey: ['student-fees'],
    queryFn:  listMyFees,
    enabled:  isStudent,
  });
  const { data: studentAtt } = useQuery<StudentAtt>({
    queryKey: ['student-attendance-dash'],
    queryFn:  () => axiosInstance.get<ApiResponse<StudentAtt>>('/v1/student/attendance')
                      .then((r) => r.data.data!),
    enabled:  isStudent,
  });

  // Teacher stats
  const { data: teacherDash } = useQuery<TeacherDash>({
    queryKey: ['teacher-dashboard'],
    queryFn:  () => axiosInstance.get<ApiResponse<TeacherDash>>('/v1/teacher/dashboard')
                      .then((r) => r.data.data!),
    enabled:  isTeacher,
  });

  // Parent stats
  const { data: children = [] } = useQuery({
    queryKey: ['parent-children'],
    queryFn:  getChildren,
    enabled:  isParent,
  });

  const latestNotices    = noticesPage?.items ?? [];
  const pendingHw        = homework.filter((h) => h.status === 'PUBLISHED').length;
  const pendingAss       = assignments.filter((a) => !a.submitted).length;
  const feeBalance       = fees.reduce((s, f) => s + f.balance, 0);
  const attPct           = studentAtt?.attendancePct ?? null;
  const todayPeriods     = teacherDash?.todaySlots?.length ?? 0;
  const pendingReview    = (teacherDash?.pendingHomeworkReview ?? 0) + (teacherDash?.pendingAssignmentGrading ?? 0);

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      {/* Welcome */}
      <View style={styles.welcomeCard}>
        <Text style={styles.greeting}>Welcome back</Text>
        <Text style={styles.roleLabel}>{ROLE_LABEL[role] ?? role}</Text>
      </View>

      {/* Student stats */}
      {isStudent && (
        <SectionCard title="My Overview">
          <View style={styles.chipRow}>
            {attPct !== null && (
              <StatChip
                label="Attendance"
                value={`${attPct}%`}
                color={attPct >= 75 ? '#16a34a' : '#dc2626'}
              />
            )}
            <StatChip label="Homework"    value={pendingHw}  color="#2563eb" />
            <StatChip label="Assignments" value={pendingAss} color="#d97706" />
          </View>
          {feeBalance > 0 && (
            <View style={styles.alert}>
              <Text style={styles.alertText}>
                Fee balance due: ₹{feeBalance.toLocaleString('en-IN')}
              </Text>
            </View>
          )}
          {attPct !== null && attPct < 75 && (
            <View style={[styles.alert, { backgroundColor: '#fee2e2' }]}>
              <Text style={[styles.alertText, { color: '#dc2626' }]}>
                Attendance below 75% ({attPct}%)
              </Text>
            </View>
          )}
        </SectionCard>
      )}

      {/* Teacher stats */}
      {isTeacher && (
        <SectionCard title="Today's Summary">
          <View style={styles.chipRow}>
            <StatChip label="Today's Classes" value={todayPeriods} color="#1e3a5f" />
            <StatChip label="Pending Review"  value={pendingReview} color={pendingReview > 0 ? '#d97706' : '#16a34a'} />
          </View>
        </SectionCard>
      )}

      {/* Parent stats */}
      {isParent && children.length > 0 && (
        <SectionCard title="My Children">
          {children.map((child) => (
            <View key={child.studentId} style={styles.childRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.childName}>{child.firstName} {child.lastName}</Text>
                <Text style={styles.childNumber}>{child.studentNumber}</Text>
              </View>
              <View style={[styles.attBadge, {
                backgroundColor: child.attendancePct >= 75 ? '#dcfce7' : '#fee2e2',
              }]}>
                <Text style={[styles.attBadgeText, {
                  color: child.attendancePct >= 75 ? '#16a34a' : '#dc2626',
                }]}>
                  {child.attendancePct}%
                </Text>
              </View>
            </View>
          ))}
        </SectionCard>
      )}

      {/* Latest notices */}
      {latestNotices.length > 0 && (
        <SectionCard title="Latest Notices">
          {latestNotices.map((n) => (
            <View key={n.id} style={styles.noticeRow}>
              <View style={[styles.noticeDot, {
                backgroundColor: n.priority >= 50 ? '#dc2626' : '#2563eb',
              }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noticeTitle} numberOfLines={1}>{n.title}</Text>
                <Text style={styles.noticeCategory}>{n.category}</Text>
              </View>
            </View>
          ))}
        </SectionCard>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll:    { flex: 1, backgroundColor: '#f0f4f8' },
  container: { padding: 16, paddingBottom: 40, gap: 14 },

  welcomeCard: {
    backgroundColor: '#1e3a5f',
    borderRadius: 16,
    padding: 20,
  },
  greeting:  { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 4 },
  roleLabel: { fontSize: 14, color: '#93c5fd' },

  card:      { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#e5e7eb', gap: 10 },
  cardTitle: { fontSize: 12, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 },

  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip:    { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, alignItems: 'center', minWidth: 80 },
  chipValue: { fontSize: 18, fontWeight: '800' },
  chipLabel: { fontSize: 10, color: '#6b7280', marginTop: 2 },

  alert:     { backgroundColor: '#fef3c7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  alertText: { fontSize: 12, fontWeight: '600', color: '#92400e' },

  childRow:      { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  childName:     { fontSize: 13, fontWeight: '600', color: '#1f2937' },
  childNumber:   { fontSize: 11, color: '#9ca3af' },
  attBadge:      { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  attBadgeText:  { fontSize: 13, fontWeight: '700' },

  noticeRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  noticeDot:     { width: 8, height: 8, borderRadius: 4, marginTop: 4 },
  noticeTitle:   { fontSize: 13, fontWeight: '500', color: '#111827' },
  noticeCategory: { fontSize: 11, color: '#9ca3af', marginTop: 1 },
});
