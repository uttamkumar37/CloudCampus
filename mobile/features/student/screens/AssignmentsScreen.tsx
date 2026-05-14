import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  listMyAssignments,
  submitAssignment,
  type MobileAssignment,
  type SubmissionStatus,
} from '../api/studentApi';

const STATUS_COLOR: Record<SubmissionStatus, string> = {
  PENDING:   '#d97706',
  SUBMITTED: '#2563eb',
  LATE:      '#dc2626',
  GRADED:    '#16a34a',
};

function dueBadgeColor(dueDate: string, submitted: boolean) {
  if (submitted) return '#16a34a';
  const diff = new Date(dueDate).getTime() - Date.now();
  const days  = diff / 86_400_000;
  if (days < 0)  return '#dc2626';
  if (days < 2)  return '#d97706';
  return '#6b7280';
}

function AssignmentCard({
  item,
  onSubmit,
}: {
  item: MobileAssignment;
  onSubmit: (id: string) => void;
}) {
  const color = dueBadgeColor(item.dueDate, item.submitted);
  const dueStr = new Date(item.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={[styles.badge, { backgroundColor: color + '20', borderColor: color }]}>
          <Text style={[styles.badgeText, { color }]}>Due {dueStr}</Text>
        </View>
      </View>

      {item.description ? (
        <Text style={styles.desc} numberOfLines={3}>{item.description}</Text>
      ) : null}

      <View style={styles.cardFooter}>
        {item.maxMarks != null && (
          <Text style={styles.meta}>Max: {item.maxMarks} marks</Text>
        )}
        {item.submissionStatus && (
          <View style={[styles.statusPill, { backgroundColor: STATUS_COLOR[item.submissionStatus] + '20' }]}>
            <Text style={[styles.statusText, { color: STATUS_COLOR[item.submissionStatus] }]}>
              {item.submissionStatus}
            </Text>
          </View>
        )}
      </View>

      {item.marksObtained != null && (
        <Text style={styles.marks}>
          Marks: {item.marksObtained}{item.maxMarks != null ? ` / ${item.maxMarks}` : ''}
          {item.feedback ? `  ·  "${item.feedback}"` : ''}
        </Text>
      )}

      {!item.submitted && item.assignmentStatus === 'PUBLISHED' && (
        <Pressable style={styles.submitBtn} onPress={() => onSubmit(item.assignmentId)}>
          <Text style={styles.submitBtnText}>Submit Assignment</Text>
        </Pressable>
      )}
    </View>
  );
}

export default function AssignmentsScreen() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<string | null>(null);
  const [response, setResponse] = useState('');
  const [error, setError]       = useState('');

  const { data = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['student-assignments'],
    queryFn:  listMyAssignments,
  });

  const mutation = useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => submitAssignment(id, text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-assignments'] });
      setSelected(null);
      setResponse('');
      setError('');
    },
    onError: () => setError('Submission failed. Please try again.'),
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1e3a5f" /></View>;
  }
  if (isError) {
    return <View style={styles.center}><Text style={styles.errText}>Failed to load assignments.</Text></View>;
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        keyExtractor={(i) => i.assignmentId}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <View style={styles.center}>
            <Text style={styles.empty}>No assignments yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <AssignmentCard
            item={item}
            onSubmit={(id) => { setSelected(id); setResponse(''); setError(''); }}
          />
        )}
      />

      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Submit Assignment</Text>
            {error ? <Text style={styles.modalError}>{error}</Text> : null}
            <ScrollView style={{ maxHeight: 200 }}>
              <TextInput
                style={styles.textarea}
                multiline
                numberOfLines={6}
                placeholder="Type your answer or response here…"
                value={response}
                onChangeText={setResponse}
                textAlignVertical="top"
              />
            </ScrollView>
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setSelected(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmBtn, mutation.isPending && styles.disabled]}
                disabled={mutation.isPending}
                onPress={() => selected && mutation.mutate({ id: selected, text: response })}
              >
                <Text style={styles.confirmText}>
                  {mutation.isPending ? 'Submitting…' : 'Submit'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  list:    { padding: 16, gap: 12 },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errText: { color: '#dc2626', fontSize: 14 },
  empty:   { color: '#9ca3af', fontSize: 14 },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    gap: 8,
  },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title:       { flex: 1, fontSize: 14, fontWeight: '600', color: '#1f2937' },
  badge:       { borderWidth: 1, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  badgeText:   { fontSize: 11, fontWeight: '600' },
  desc:        { fontSize: 12, color: '#6b7280', lineHeight: 18 },
  cardFooter:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  meta:        { fontSize: 11, color: '#9ca3af' },
  statusPill:  { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  statusText:  { fontSize: 11, fontWeight: '600' },
  marks:       { fontSize: 12, color: '#374151', fontStyle: 'italic' },

  submitBtn: {
    alignSelf: 'flex-end',
    backgroundColor: '#1e3a5f',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  submitBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    gap: 12,
  },
  modalTitle:   { fontSize: 16, fontWeight: '700', color: '#1f2937' },
  modalError:   { color: '#dc2626', fontSize: 12 },
  textarea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 120,
  },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelText:  { color: '#6b7280', fontWeight: '600' },
  confirmBtn: {
    flex: 1,
    backgroundColor: '#1e3a5f',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  confirmText: { color: '#fff', fontWeight: '600' },
  disabled:    { opacity: 0.5 },
});
