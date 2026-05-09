import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
  ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getMyStudentDetails } from '../../../src/api/selfProfile';
import type { StudentFeeItem } from '../../../src/types/student';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../../src/theme';

const STATUS_META: Record<string, { color: string; bg: string }> = {
  PAID:           { color: Colors.success, bg: Colors.successBg },
  PENDING:        { color: Colors.warning, bg: Colors.warningBg },
  OVERDUE:        { color: Colors.danger,  bg: Colors.dangerBg  },
  PARTIALLY_PAID: { color: Colors.info,    bg: Colors.infoBg    },
};

export default function StudentFeesScreen() {
  const [fees, setFees]         = useState<StudentFeeItem[]>([]);
  const [loading, setLoading]   = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    try {
      const data = await getMyStudentDetails();
      setFees(data.fees);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to load fees');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const totalAmount  = fees.reduce((s, f) => s + f.amount, 0);
  const paidCount    = fees.filter((f) => f.status === 'PAID').length;
  const pendingCount = fees.filter((f) => f.status !== 'PAID').length;
  const paidRate = fees.length > 0 ? Math.round((paidCount / fees.length) * 100) : 0;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading your fees…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.primary} />}
    >
      {/* Summary */}
      <View style={[styles.snapshotCard, Shadow.sm]}>
        <Text style={styles.snapshotTitle}>Payment Snapshot</Text>
        <View style={styles.snapshotMetrics}>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{fees.length}</Text>
            <Text style={styles.snapshotLabel}>Assignments</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{paidCount}</Text>
            <Text style={styles.snapshotLabel}>Paid</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{pendingCount}</Text>
            <Text style={styles.snapshotLabel}>Pending</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{paidRate}%</Text>
            <Text style={styles.snapshotLabel}>Clearance</Text>
          </View>
        </View>
      </View>

      <View style={[styles.snapshotCard, Shadow.sm]}>
        <Text style={styles.snapshotTitle}>Payment Pulse</Text>
        <View style={styles.snapshotMetrics}>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{fees.length > 0 ? 'Live' : 'Empty'}</Text>
            <Text style={styles.snapshotLabel}>Ledger</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{pendingCount > 0 ? 'Due' : 'Clear'}</Text>
            <Text style={styles.snapshotLabel}>State</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{refreshing ? 'Sync' : 'Idle'}</Text>
            <Text style={styles.snapshotLabel}>Refresh</Text>
          </View>
          <View style={styles.snapshotMetric}>
            <Text style={styles.snapshotValue}>{paidRate >= 80 ? 'Good' : paidRate >= 50 ? 'Watch' : 'Alert'}</Text>
            <Text style={styles.snapshotLabel}>Recovery</Text>
          </View>
        </View>
      </View>

      <View style={[styles.summaryCard, Shadow.md]}>
        <Text style={styles.summaryHeading}>Fee Summary</Text>
        <View style={styles.summaryRow}>
          <SummaryChip label="Total Fees" value={`₹${totalAmount.toLocaleString()}`} color="#fff" />
          <View style={styles.summaryDivider} />
          <SummaryChip label="Paid" value={String(paidCount)} color="#4ADE80" />
          <View style={styles.summaryDivider} />
          <SummaryChip label="Pending" value={String(pendingCount)} color={pendingCount > 0 ? '#FCD34D' : '#4ADE80'} />
        </View>
      </View>

      {fees.length === 0 ? (
        <View style={styles.emptyWrap}>
          <Ionicons name="card-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No fee assignments</Text>
        </View>
      ) : (
        fees.map((fee) => {
          const meta = STATUS_META[fee.status] ?? { color: Colors.textSecondary, bg: Colors.background };
          return (
            <View key={fee.id} style={[styles.card, Shadow.sm]}>
              <View style={styles.cardTop}>
                <Text style={styles.feeTitle}>{fee.title}</Text>
                <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                  <Text style={[styles.statusText, { color: meta.color }]}>
                    {fee.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
              <View style={styles.amountRow}>
                <View style={styles.amountItem}>
                  <Text style={styles.amountValue}>₹{fee.amount.toLocaleString()}</Text>
                  <Text style={styles.amountLabel}>Amount</Text>
                </View>
                <View style={styles.amountItem}>
                  <Text style={[styles.amountValue, { color: Colors.textSecondary, fontSize: 13 }]}>
                    {fee.dueDate ?? '—'}
                  </Text>
                  <Text style={styles.amountLabel}>Due Date</Text>
                </View>
              </View>
              {fee.status !== 'PAID' && (
                <View style={styles.pendingNote}>
                  <Ionicons name="alert-circle-outline" size={13} color={Colors.warning} />
                  <Text style={styles.pendingNoteText}>
                    Please contact the school office to make payment.
                  </Text>
                </View>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

function SummaryChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.summaryChip}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.md, paddingBottom: 40, gap: Spacing.md },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },

  snapshotCard: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.md },
  snapshotTitle: { fontSize: 11, fontWeight: '700', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  snapshotMetrics: { flexDirection: 'row', marginTop: Spacing.sm, gap: Spacing.xs },
  snapshotMetric: { flex: 1, backgroundColor: Colors.background, borderRadius: Radius.md, paddingVertical: 8, alignItems: 'center' },
  snapshotValue: { fontSize: 12, fontWeight: '800', color: Colors.text },
  snapshotLabel: { marginTop: 2, fontSize: 9, color: Colors.textTertiary, fontWeight: '600' },

  summaryCard: { backgroundColor: Colors.primary, borderRadius: Radius.xl, padding: Spacing.xl },
  summaryHeading: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginBottom: Spacing.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center' },
  summaryChip: { flex: 1, alignItems: 'center' },
  summaryValue: { fontSize: 18, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  summaryDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.15)' },

  emptyWrap: { alignItems: 'center', paddingTop: 60, gap: Spacing.sm },
  emptyTitle: { ...Typography.h3, color: Colors.textSecondary },

  card: { backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.md },
  feeTitle: { ...Typography.h3, color: Colors.text, flex: 1, marginRight: Spacing.sm },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  amountRow: { flexDirection: 'row', gap: Spacing.lg },
  amountItem: {},
  amountValue: { fontSize: 18, fontWeight: '800', color: Colors.text },
  amountLabel: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },
  pendingNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    backgroundColor: Colors.warningBg, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 8, marginTop: Spacing.md,
  },
  pendingNoteText: { flex: 1, fontSize: 12, color: Colors.warning, lineHeight: 17 },
});
