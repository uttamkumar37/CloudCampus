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
  View,
} from 'react-native';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { getLeaveRequests, approveLeave, rejectLeave } from '../api/adminLeaveApi';
import type { LeaveRequest, LeaveStatus } from '../api/leaveApi';

// ── Constants ─────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<LeaveStatus, string> = {
  PENDING:   '#d97706',
  APPROVED:  '#16a34a',
  REJECTED:  '#dc2626',
  CANCELLED: '#9ca3af',
};

const FILTER_TABS: { label: string; value: LeaveStatus | undefined }[] = [
  { label: 'Pending',  value: 'PENDING'  },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'All',      value: undefined  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Review modal ──────────────────────────────────────────────────────────────

function ReviewModal({
  visible,
  action,
  onConfirm,
  onClose,
  submitting,
}: {
  visible:    boolean;
  action:     'approve' | 'reject';
  onConfirm:  (notes: string) => void;
  onClose:    () => void;
  submitting: boolean;
}) {
  const [notes, setNotes] = useState('');

  function handleConfirm() {
    onConfirm(notes.trim());
    setNotes('');
  }

  const isApprove = action === 'approve';

  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.reviewModal}>
          <Text style={styles.reviewTitle}>
            {isApprove ? 'Approve Leave Request' : 'Reject Leave Request'}
          </Text>
          <Text style={styles.reviewSubtitle}>Optional: add a note for the staff member</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Notes (optional)…"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          <View style={styles.reviewBtns}>
            <Pressable style={styles.cancelBtnModal} onPress={onClose} disabled={submitting}>
              <Text style={styles.cancelBtnModalText}>Cancel</Text>
            </Pressable>
            <Pressable
              style={[isApprove ? styles.approveBtn : styles.rejectBtn, submitting && { opacity: 0.6 }]}
              onPress={handleConfirm}
              disabled={submitting}
            >
              {submitting
                ? <ActivityIndicator color="#fff" size="small" />
                : <Text style={styles.actionBtnText}>{isApprove ? 'Approve' : 'Reject'}</Text>
              }
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ── Leave request card ────────────────────────────────────────────────────────

function RequestCard({
  req,
  onApprove,
  onReject,
}: {
  req:       LeaveRequest;
  onApprove: () => void;
  onReject:  () => void;
}) {
  const color = STATUS_COLOR[req.status];

  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardType}>{req.leaveType.replace('_', ' ')}</Text>
          <Text style={styles.cardDates}>
            {fmt(req.startDate)} – {fmt(req.endDate)}
            {'  '}·{'  '}{req.totalDays} day{req.totalDays !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.cardReason} numberOfLines={2}>{req.reason}</Text>
        </View>
        <View style={[styles.statusBadge, { borderColor: color, backgroundColor: color + '18' }]}>
          <Text style={[styles.statusText, { color }]}>{req.status}</Text>
        </View>
      </View>

      {req.reviewNotes ? (
        <Text style={styles.reviewNote}>Note: {req.reviewNotes}</Text>
      ) : null}

      {req.status === 'PENDING' && (
        <View style={styles.actionRow}>
          <Pressable style={styles.approveBtn} onPress={onApprove}>
            <Text style={styles.actionBtnText}>Approve</Text>
          </Pressable>
          <Pressable style={styles.rejectBtn} onPress={onReject}>
            <Text style={styles.actionBtnText}>Reject</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AdminLeaveScreen() {
  const schoolId    = useAuthStore((s) => s.user?.schoolId);
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<LeaveStatus | undefined>('PENDING');
  const [reviewing, setReviewing] = useState<{ req: LeaveRequest; action: 'approve' | 'reject' } | null>(null);

  const { data: requests = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-leave', schoolId, filter],
    queryFn:  () => getLeaveRequests(schoolId!, filter),
    enabled:  !!schoolId,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-leave', schoolId] });
  };

  const approveMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      approveLeave(schoolId!, id, notes || undefined),
    onSuccess: () => { invalidate(); setReviewing(null); },
    onError:   () => Alert.alert('Error', 'Failed to approve leave request.'),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      rejectLeave(schoolId!, id, notes || undefined),
    onSuccess: () => { invalidate(); setReviewing(null); },
    onError:   () => Alert.alert('Error', 'Failed to reject leave request.'),
  });

  if (!schoolId) {
    return (
      <View style={styles.center}>
        <Text style={styles.errText}>School profile not available. Please re-login.</Text>
      </View>
    );
  }

  const isBusy = approveMutation.isPending || rejectMutation.isPending;

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        <Text style={styles.heading}>Leave Requests</Text>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
          {FILTER_TABS.map((t) => (
            <Pressable
              key={t.label}
              style={[styles.filterTab, filter === t.value && styles.filterTabActive]}
              onPress={() => setFilter(t.value)}
            >
              <Text style={[styles.filterTabText, filter === t.value && styles.filterTabTextActive]}>
                {t.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {isLoading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#1e3a5f" /></View>
        ) : isError ? (
          <View style={styles.center}><Text style={styles.errText}>Failed to load requests.</Text></View>
        ) : requests.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No {filter?.toLowerCase() ?? ''} leave requests.</Text>
          </View>
        ) : (
          requests.map((req) => (
            <RequestCard
              key={req.id}
              req={req}
              onApprove={() => setReviewing({ req, action: 'approve' })}
              onReject={()  => setReviewing({ req, action: 'reject'  })}
            />
          ))
        )}
      </ScrollView>

      {reviewing && (
        <ReviewModal
          visible
          action={reviewing.action}
          submitting={isBusy}
          onClose={() => setReviewing(null)}
          onConfirm={(notes) => {
            if (reviewing.action === 'approve') {
              approveMutation.mutate({ id: reviewing.req.id, notes });
            } else {
              rejectMutation.mutate({ id: reviewing.req.id, notes });
            }
          }}
        />
      )}
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errText:     { color: '#dc2626', fontSize: 14, textAlign: 'center' },
  heading:     { fontSize: 18, fontWeight: '700', color: '#1e3a5f', marginBottom: 12 },

  filterRow:   { flexDirection: 'row', marginBottom: 14 },
  filterTab: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  filterTabActive:     { borderColor: '#1e3a5f', backgroundColor: '#1e3a5f' },
  filterTabText:       { fontSize: 12, fontWeight: '600', color: '#6b7280' },
  filterTabTextActive: { color: '#fff' },

  emptyBox:    { alignItems: 'center', paddingVertical: 48 },
  emptyText:   { fontSize: 14, color: '#9ca3af' },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    marginBottom: 10,
  },
  cardTop:    { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, gap: 10 },
  cardType:   { fontSize: 14, fontWeight: '700', color: '#1f2937' },
  cardDates:  { fontSize: 12, color: '#6b7280', marginTop: 2 },
  cardReason: { fontSize: 13, color: '#374151', marginTop: 4 },
  reviewNote: { fontSize: 12, color: '#2563eb', fontStyle: 'italic', marginBottom: 6 },

  statusBadge: { borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3, alignSelf: 'flex-start' },
  statusText:  { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },

  actionRow:   { flexDirection: 'row', gap: 8, marginTop: 8 },
  approveBtn:  { flex: 1, backgroundColor: '#16a34a', borderRadius: 8, padding: 9, alignItems: 'center' },
  rejectBtn:   { flex: 1, backgroundColor: '#dc2626', borderRadius: 8, padding: 9, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Review modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  reviewModal: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  reviewTitle:    { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  reviewSubtitle: { fontSize: 12, color: '#6b7280', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#111827',
    marginBottom: 14,
  },
  textarea:          { height: 80 },
  reviewBtns:        { flexDirection: 'row', gap: 10 },
  cancelBtnModal:    { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 10, alignItems: 'center' },
  cancelBtnModalText: { fontSize: 13, fontWeight: '600', color: '#374151' },
});
