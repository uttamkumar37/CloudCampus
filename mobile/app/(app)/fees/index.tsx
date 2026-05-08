import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getStudentFeeAssignments, recordPayment } from '../../../src/api/fees';
import type { FeeAssignment } from '../../../src/types/fees';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../../src/theme';

const STATUS_META: Record<string, { color: string; bg: string; label: string }> = {
  PAID: { color: Colors.success, bg: Colors.successBg, label: 'Paid' },
  PENDING: { color: Colors.warning, bg: Colors.warningBg, label: 'Pending' },
  OVERDUE: { color: Colors.danger, bg: Colors.dangerBg, label: 'Overdue' },
  PARTIALLY_PAID: { color: Colors.info, bg: Colors.infoBg, label: 'Partial' },
};

const METHODS = ['CASH', 'ONLINE', 'CHEQUE', 'DD'] as const;

export default function FeesScreen() {
  const [studentId, setStudentId] = useState('');
  const [assignments, setAssignments] = useState<FeeAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedFee, setSelectedFee] = useState<FeeAssignment | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState<typeof METHODS[number]>('CASH');
  const [payRef, setPayRef] = useState('');
  const [paying, setPaying] = useState(false);

  async function loadFees() {
    if (!studentId.trim()) {
      Alert.alert('Required', 'Enter a student ID to search.');
      return;
    }
    setLoading(true);
    try {
      const data = await getStudentFeeAssignments(studentId.trim());
      setAssignments(data);
      setSearched(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load fees';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  }

  async function submitPayment() {
    if (!selectedFee) return;
    const amount = parseFloat(payAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid payment amount.');
      return;
    }
    setPaying(true);
    try {
      await recordPayment({
        feeAssignmentId: selectedFee.id,
        amountPaid: amount,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: payMethod,
        referenceNo: payRef.trim() || null,
      });
      Alert.alert('Payment Recorded', `₹${amount.toLocaleString()} recorded for "${selectedFee.feeTitle}".`);
      setSelectedFee(null);
      setPayAmount('');
      setPayRef('');
      loadFees();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Payment failed';
      Alert.alert('Error', message);
    } finally {
      setPaying(false);
    }
  }

  const totalDue = assignments.reduce((s, a) => s + (a.dueAmount ?? 0), 0);
  const totalPaid = assignments.reduce((s, a) => s + (a.paidAmount ?? 0), 0);
  const totalAmount = assignments.reduce((s, a) => s + a.amount, 0);
  const pctCollected = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

  return (
    <View style={styles.container}>
      {/* Search bar */}
      <View style={styles.searchWrap}>
        <View style={styles.searchRow}>
          <Ionicons name="search-outline" size={17} color={Colors.textTertiary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Enter Student UUID…"
            placeholderTextColor={Colors.textTertiary}
            value={studentId}
            onChangeText={setStudentId}
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={loadFees}
            returnKeyType="search"
          />
          {studentId.length > 0 && (
            <TouchableOpacity onPress={() => { setStudentId(''); setAssignments([]); setSearched(false); }}>
              <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.searchBtn} onPress={loadFees}>
          <Text style={styles.searchBtnText}>Search Fees</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading fees…</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
          {!searched ? (
            <View style={styles.emptyWrap}>
              <View style={styles.emptyIconWrap}>
                <Ionicons name="card-outline" size={40} color={Colors.textTertiary} />
              </View>
              <Text style={styles.emptyTitle}>Search by Student ID</Text>
              <Text style={styles.emptySubtitle}>Enter a student UUID to view and manage their fees</Text>
            </View>
          ) : assignments.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>No fee assignments found</Text>
            </View>
          ) : (
            <>
              {/* Summary card */}
              <View style={[styles.summaryCard, Shadow.md]}>
                <Text style={styles.summaryTitle}>Fee Summary</Text>
                <View style={styles.summaryRow}>
                  <SummaryChip label="Total" amount={totalAmount} color={Colors.text} />
                  <View style={styles.summaryDivider} />
                  <SummaryChip label="Collected" amount={totalPaid} color={Colors.success} />
                  <View style={styles.summaryDivider} />
                  <SummaryChip label="Due" amount={totalDue} color={Colors.danger} />
                </View>
                <View style={styles.progressWrap}>
                  <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${Math.min(pctCollected, 100)}%` as any }]} />
                  </View>
                  <Text style={styles.progressLabel}>{pctCollected.toFixed(0)}% collected</Text>
                </View>
              </View>

              {/* Fee cards */}
              {assignments.map((fee) => {
                const meta = STATUS_META[fee.status] ?? { color: Colors.textSecondary, bg: Colors.background, label: fee.status };
                const feePct = fee.amount > 0 ? ((fee.paidAmount ?? 0) / fee.amount) * 100 : 0;
                return (
                  <View key={fee.id} style={[styles.feeCard, Shadow.sm]}>
                    <View style={styles.feeCardTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.feeName}>{fee.feeTitle}</Text>
                        <Text style={styles.feeDue}>Due: {fee.dueDate ?? '—'}</Text>
                      </View>
                      <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
                        <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
                      </View>
                    </View>

                    <View style={styles.amountRow}>
                      <AmountItem label="Total" value={fee.amount} />
                      <AmountItem label="Paid" value={fee.paidAmount ?? 0} color={Colors.success} />
                      <AmountItem label="Balance" value={fee.dueAmount ?? 0} color={fee.dueAmount > 0 ? Colors.danger : Colors.textSecondary} />
                    </View>

                    <View style={styles.feeProgressTrack}>
                      <View style={[styles.feeProgressFill, {
                        width: `${Math.min(feePct, 100)}%` as any,
                        backgroundColor: fee.status === 'PAID' ? Colors.success : Colors.warning,
                      }]} />
                    </View>

                    {fee.status !== 'PAID' && (
                      <TouchableOpacity
                        style={styles.payBtn}
                        onPress={() => { setSelectedFee(fee); setPayAmount(String(fee.dueAmount ?? fee.amount)); }}
                        activeOpacity={0.8}
                      >
                        <Ionicons name="card-outline" size={16} color="#fff" />
                        <Text style={styles.payBtnText}>Record Payment</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
      )}

      {/* Payment Modal */}
      <Modal visible={!!selectedFee} animationType="slide" transparent statusBarTranslucent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={styles.modalCard}>
            {/* Handle */}
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Record Payment</Text>
                <Text style={styles.modalSubtitle}>{selectedFee?.feeTitle}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedFee(null)} style={styles.modalClose}>
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDivider} />

            <Text style={styles.fieldLabel}>AMOUNT (₹)</Text>
            <View style={styles.amountInputWrap}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountInput}
                value={payAmount}
                onChangeText={setPayAmount}
                keyboardType="numeric"
                placeholder="0.00"
                placeholderTextColor={Colors.textTertiary}
              />
            </View>

            <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>PAYMENT METHOD</Text>
            <View style={styles.methodGrid}>
              {METHODS.map((m) => (
                <TouchableOpacity
                  key={m}
                  style={[styles.methodChip, payMethod === m && styles.methodChipActive]}
                  onPress={() => setPayMethod(m)}
                >
                  <Ionicons
                    name={m === 'CASH' ? 'cash-outline' : m === 'ONLINE' ? 'wifi-outline' : m === 'CHEQUE' ? 'document-outline' : 'receipt-outline'}
                    size={14}
                    color={payMethod === m ? Colors.primary : Colors.textSecondary}
                  />
                  <Text style={[styles.methodText, payMethod === m && styles.methodTextActive]}>{m}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.fieldLabel, { marginTop: Spacing.lg }]}>REFERENCE NO. (OPTIONAL)</Text>
            <TextInput
              style={styles.refInput}
              value={payRef}
              onChangeText={setPayRef}
              placeholder="UTR / cheque number"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedFee(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, paying && { opacity: 0.6 }]}
                onPress={submitPayment}
                disabled={paying}
              >
                {paying ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={styles.confirmText}>Confirm</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

function SummaryChip({ label, amount, color }: { label: string; amount: number; color: string }) {
  return (
    <View style={styles.summaryChip}>
      <Text style={[styles.summaryAmount, { color }]}>₹{amount.toLocaleString()}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function AmountItem({ label, value, color }: { label: string; value: number; color?: string }) {
  return (
    <View style={styles.amountItem}>
      <Text style={[styles.amountValue, color ? { color } : {}]}>₹{value.toLocaleString()}</Text>
      <Text style={styles.amountLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  searchWrap: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.background, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, paddingHorizontal: Spacing.md,
  },
  searchIcon: { marginRight: Spacing.xs },
  searchInput: { flex: 1, paddingVertical: 11, fontSize: 14, color: Colors.text },
  searchBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 12, alignItems: 'center',
  },
  searchBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: Spacing.md, paddingTop: 80 },
  loadingText: { color: Colors.textSecondary, fontSize: 14 },

  list: { padding: Spacing.md, gap: Spacing.md, paddingBottom: 40 },

  emptyWrap: { alignItems: 'center', paddingTop: 80, gap: Spacing.sm },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', ...Shadow.sm },
  emptyTitle: { ...Typography.h3, color: Colors.text },
  emptySubtitle: { fontSize: 13, color: Colors.textSecondary, textAlign: 'center', maxWidth: 240 },

  summaryCard: {
    backgroundColor: Colors.primary, borderRadius: Radius.xl, padding: Spacing.xl,
  },
  summaryTitle: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600', marginBottom: Spacing.md, letterSpacing: 0.5 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
  summaryChip: { flex: 1, alignItems: 'center' },
  summaryAmount: { fontSize: 17, fontWeight: '800' },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  summaryDivider: { width: 1, height: 36, backgroundColor: 'rgba(255,255,255,0.15)' },
  progressWrap: { gap: 6 },
  progressTrack: { height: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: Radius.full, overflow: 'hidden' },
  progressFill: { height: 6, backgroundColor: '#4ADE80', borderRadius: Radius.full },
  progressLabel: { fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'right' },

  feeCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing.lg,
  },
  feeCardTop: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.md, gap: Spacing.md },
  feeName: { ...Typography.h3, color: Colors.text },
  feeDue: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  amountRow: { flexDirection: 'row', marginBottom: Spacing.md },
  amountItem: { flex: 1, alignItems: 'center' },
  amountValue: { fontSize: 16, fontWeight: '800', color: Colors.text },
  amountLabel: { fontSize: 11, color: Colors.textTertiary, marginTop: 2 },
  feeProgressTrack: { height: 4, backgroundColor: Colors.background, borderRadius: Radius.full, overflow: 'hidden', marginBottom: Spacing.md },
  feeProgressFill: { height: 4, borderRadius: Radius.full },
  payBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 12,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.sm,
  },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: {
    backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: Spacing.xxl, paddingBottom: 40,
  },
  modalHandle: { width: 40, height: 4, backgroundColor: Colors.border, borderRadius: 2, alignSelf: 'center', marginBottom: Spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: Spacing.lg },
  modalTitle: { ...Typography.h2, color: Colors.text },
  modalSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  modalClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center' },
  modalDivider: { height: 1, backgroundColor: Colors.border, marginBottom: Spacing.lg },

  fieldLabel: { ...Typography.label, color: Colors.textTertiary, marginBottom: Spacing.xs },
  amountInputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    backgroundColor: Colors.background, paddingHorizontal: Spacing.md,
  },
  currencySymbol: { fontSize: 18, fontWeight: '700', color: Colors.textSecondary, marginRight: 4 },
  amountInput: { flex: 1, paddingVertical: 13, fontSize: 22, fontWeight: '700', color: Colors.text },
  methodGrid: { flexDirection: 'row', gap: Spacing.sm },
  methodChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4,
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    paddingVertical: 10, backgroundColor: Colors.background,
  },
  methodChipActive: { borderColor: Colors.primary, backgroundColor: Colors.accentLight },
  methodText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '600' },
  methodTextActive: { color: Colors.primary },
  refInput: {
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 12, fontSize: 14,
    color: Colors.text, backgroundColor: Colors.background,
  },
  modalActions: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.xl },
  cancelBtn: {
    flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md,
    paddingVertical: 14, alignItems: 'center',
  },
  cancelText: { fontSize: 15, color: Colors.textSecondary, fontWeight: '600' },
  confirmBtn: {
    flex: 2, backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 14, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: Spacing.sm,
  },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
