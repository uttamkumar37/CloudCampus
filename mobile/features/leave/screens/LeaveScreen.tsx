import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  getMyLeave,
  submitLeave,
  cancelLeave,
  type LeaveType,
  type LeaveRequest,
} from '../api/leaveApi';

// ── Constants ─────────────────────────────────────────────────────────────────

const LEAVE_TYPES: LeaveType[] = ['SICK', 'CASUAL', 'EARNED', 'MATERNITY', 'PATERNITY', 'STUDY', 'UNPAID'];

const STATUS_COLOR: Record<string, string> = {
  PENDING:   '#d97706',
  APPROVED:  '#16a34a',
  REJECTED:  '#dc2626',
  CANCELLED: '#9ca3af',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function addDays(iso: string, n: number) {
  const d = new Date(iso);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// ── Request form modal ────────────────────────────────────────────────────────

interface FormState {
  leaveType: LeaveType;
  startDate: string;
  endDate:   string;
  reason:    string;
}

function RequestModal({
  visible,
  onClose,
  onSubmit,
  submitting,
}: {
  visible:    boolean;
  onClose:    () => void;
  onSubmit:   (f: FormState) => void;
  submitting: boolean;
}) {
  const today = todayIso();
  const [form, setForm] = useState<FormState>({
    leaveType: 'CASUAL',
    startDate: today,
    endDate:   today,
    reason:    '',
  });

  function set<K extends keyof FormState>(k: K, v: FormState[K]) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function handleSubmit() {
    if (!form.reason.trim()) {
      Alert.alert('Validation', 'Please provide a reason for your leave.');
      return;
    }
    if (form.endDate < form.startDate) {
      Alert.alert('Validation', 'End date must be on or after start date.');
      return;
    }
    onSubmit(form);
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.modal}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Request Leave</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={styles.modalClose}>✕</Text>
          </Pressable>
        </View>

        <ScrollView style={styles.modalBody} keyboardShouldPersistTaps="handled">
          {/* Leave Type */}
          <Text style={styles.label}>Leave Type</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
            {LEAVE_TYPES.map((t) => (
              <Pressable
                key={t}
                onPress={() => set('leaveType', t)}
                style={[styles.typeChip, form.leaveType === t && styles.typeChipActive]}
              >
                <Text style={[styles.typeChipText, form.leaveType === t && styles.typeChipTextActive]}>
                  {t}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Dates — text inputs (YYYY-MM-DD) */}
          <View style={styles.dateRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Start Date</Text>
              <TextInput
                style={styles.input}
                value={form.startDate}
                onChangeText={(v) => {
                  set('startDate', v);
                  if (v > form.endDate) set('endDate', v);
                }}
                placeholder="YYYY-MM-DD"
                maxLength={10}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>End Date</Text>
              <TextInput
                style={styles.input}
                value={form.endDate}
                onChangeText={(v) => set('endDate', v)}
                placeholder="YYYY-MM-DD"
                maxLength={10}
              />
            </View>
          </View>

          {/* Quick date helpers */}
          <View style={styles.quickRow}>
            {[
              { label: 'Today', fn: () => { set('startDate', today); set('endDate', today); } },
              { label: '+1 day', fn: () => set('endDate', addDays(form.startDate, 1)) },
              { label: '+3 days', fn: () => set('endDate', addDays(form.startDate, 3)) },
              { label: '+1 week', fn: () => set('endDate', addDays(form.startDate, 7)) },
            ].map((q) => (
              <Pressable key={q.label} style={styles.quickBtn} onPress={q.fn}>
                <Text style={styles.quickBtnText}>{q.label}</Text>
              </Pressable>
            ))}
          </View>

          {/* Reason */}
          <Text style={styles.label}>Reason</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={form.reason}
            onChangeText={(v) => set('reason', v)}
            placeholder="Describe the reason for your leave…"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Pressable
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitBtnText}>Submit Request</Text>
            }
          </Pressable>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ── Leave card ────────────────────────────────────────────────────────────────

function LeaveCard({ req, onCancel }: { req: LeaveRequest; onCancel: () => void }) {
  const color = STATUS_COLOR[req.status] ?? '#6b7280';

  function confirmCancel() {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this leave request?',
      [
        { text: 'No',  style: 'cancel' },
        { text: 'Yes', style: 'destructive', onPress: onCancel },
      ],
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardType}>{req.leaveType.replace('_', ' ')}</Text>
          <Text style={styles.cardDates}>
            {formatDate(req.startDate)} – {formatDate(req.endDate)}
            {'  '}·{'  '}{req.totalDays} day{req.totalDays !== 1 ? 's' : ''}
          </Text>
        </View>
        <View style={[styles.statusBadge, { borderColor: color, backgroundColor: color + '18' }]}>
          <Text style={[styles.statusText, { color }]}>{req.status}</Text>
        </View>
      </View>

      <Text style={styles.cardReason} numberOfLines={2}>{req.reason}</Text>

      {req.reviewNotes ? (
        <Text style={styles.reviewNotes}>Note: {req.reviewNotes}</Text>
      ) : null}

      {req.status === 'PENDING' && (
        <Pressable style={styles.cancelBtn} onPress={confirmCancel}>
          <Text style={styles.cancelBtnText}>Cancel Request</Text>
        </Pressable>
      )}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function LeaveScreen() {
  const [showModal, setShowModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['my-leave'],
    queryFn:  () => getMyLeave(),
  });

  const submitMutation = useMutation({
    mutationFn: submitLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-leave'] });
      setShowModal(false);
      Alert.alert('Submitted', 'Your leave request has been submitted for review.');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to submit leave request. Please try again.');
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelLeave,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-leave'] });
    },
    onError: () => {
      Alert.alert('Error', 'Failed to cancel leave request.');
    },
  });

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#1e3a5f" /></View>;
  if (isError)   return <View style={styles.center}><Text style={styles.errText}>Failed to load leave requests.</Text></View>;

  const pending   = requests.filter((r) => r.status === 'PENDING');
  const others    = requests.filter((r) => r.status !== 'PENDING');

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        <View style={styles.headerRow}>
          <Text style={styles.heading}>My Leave</Text>
          <TouchableOpacity style={styles.requestBtn} onPress={() => setShowModal(true)} activeOpacity={0.7}>
            <Text style={styles.requestBtnText}>+ Request</Text>
          </TouchableOpacity>
        </View>

        {requests.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No leave requests yet.</Text>
            <Text style={styles.emptyHint}>Tap "Request" to submit your first leave.</Text>
          </View>
        ) : (
          <>
            {pending.length > 0 && (
              <>
                <Text style={styles.sectionLabel}>Pending Review</Text>
                {pending.map((r) => (
                  <LeaveCard key={r.id} req={r} onCancel={() => cancelMutation.mutate(r.id)} />
                ))}
              </>
            )}
            {others.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, pending.length > 0 && { marginTop: 16 }]}>History</Text>
                {others.map((r) => (
                  <LeaveCard key={r.id} req={r} onCancel={() => cancelMutation.mutate(r.id)} />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>

      <RequestModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={(f) => submitMutation.mutate(f)}
        submitting={submitMutation.isPending}
      />
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errText:     { color: '#dc2626', fontSize: 14 },

  headerRow:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  heading:     { fontSize: 18, fontWeight: '700', color: '#1e3a5f' },
  requestBtn:  { backgroundColor: '#1e3a5f', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 },
  requestBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },

  emptyBox:    { alignItems: 'center', paddingVertical: 48 },
  emptyText:   { fontSize: 15, fontWeight: '600', color: '#374151', marginBottom: 6 },
  emptyHint:   { fontSize: 13, color: '#9ca3af' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 10,
  },
  cardTop:     { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
  cardType:    { fontSize: 14, fontWeight: '700', color: '#1f2937' },
  cardDates:   { fontSize: 12, color: '#6b7280', marginTop: 2 },
  cardReason:  { fontSize: 13, color: '#374151', marginBottom: 6 },
  reviewNotes: { fontSize: 12, color: '#2563eb', fontStyle: 'italic', marginBottom: 6 },

  statusBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  statusText:  { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  cancelBtn:   { alignSelf: 'flex-start', marginTop: 4, paddingVertical: 5, paddingHorizontal: 10, borderRadius: 6, borderWidth: 1, borderColor: '#fca5a5' },
  cancelBtnText: { fontSize: 11, color: '#dc2626', fontWeight: '600' },

  // Modal
  modal:       { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalTitle:  { fontSize: 17, fontWeight: '700', color: '#1e3a5f' },
  modalClose:  { fontSize: 16, color: '#9ca3af', fontWeight: '600' },
  modalBody:   { padding: 16 },

  label:       { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 11,
    fontSize: 14,
    color: '#111827',
    marginBottom: 14,
  },
  textarea:    { height: 100 },
  dateRow:     { flexDirection: 'row', marginBottom: 0 },

  quickRow:    { flexDirection: 'row', gap: 8, marginBottom: 14 },
  quickBtn:    { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  quickBtnText: { fontSize: 11, color: '#374151' },

  typeChip:     { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8 },
  typeChipActive: { borderColor: '#1e3a5f', backgroundColor: '#1e3a5f' },
  typeChipText:   { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  typeChipTextActive: { color: '#fff' },

  submitBtn:   { backgroundColor: '#1e3a5f', borderRadius: 10, padding: 14, alignItems: 'center', marginTop: 8, marginBottom: 32 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
