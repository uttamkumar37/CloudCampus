import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { listMyHomework, submitHomework, type MobileHomework } from '../api/homeworkApi';

function dueBadgeColor(dueDate: string) {
  const diff = new Date(dueDate).getTime() - Date.now();
  const days = diff / 86_400_000;
  if (days < 0)  return '#dc2626'; // overdue
  if (days < 2)  return '#d97706'; // due soon
  return '#16a34a';
}

function HomeworkCard({
  item,
  onSubmit,
}: {
  item: MobileHomework;
  onSubmit: (id: string) => void;
}) {
  const color = dueBadgeColor(item.dueDate);
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <View style={[styles.dueBadge, { backgroundColor: color + '20', borderColor: color }]}>
          <Text style={[styles.dueText, { color }]}>
            Due {new Date(item.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
          </Text>
        </View>
      </View>
      {item.description ? (
        <Text style={styles.desc} numberOfLines={3}>{item.description}</Text>
      ) : null}
      <Pressable style={styles.submitBtn} onPress={() => onSubmit(item.id)}>
        <Text style={styles.submitBtnText}>Submit</Text>
      </Pressable>
    </View>
  );
}

export default function HomeworkScreen() {
  const queryClient = useQueryClient();
  const [selected, setSelected]   = useState<string | null>(null);
  const [notes, setNotes]         = useState('');
  const [submitError, setError]   = useState('');

  const { data = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['student-homework'],
    queryFn:  listMyHomework,
  });

  const mutation = useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) => submitHomework(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student-homework'] });
      setSelected(null);
      setNotes('');
      setError('');
    },
    onError: (e: { response?: { data?: { error?: { message?: string } } } }) => {
      setError(e?.response?.data?.error?.message ?? 'Submission failed');
    },
  });

  if (isLoading) return <View style={styles.center}><ActivityIndicator color="#1e3a5f" size="large" /></View>;
  if (isError)   return <View style={styles.center}><Text style={styles.errText}>Failed to load homework.</Text></View>;

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        ListEmptyComponent={
          <View style={styles.center}><Text style={styles.empty}>No homework assigned yet.</Text></View>
        }
        renderItem={({ item }) => (
          <HomeworkCard item={item} onSubmit={(id) => { setSelected(id); setNotes(''); setError(''); }} />
        )}
      />

      {/* Submit modal */}
      <Modal visible={!!selected} transparent animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Submit Homework</Text>
            {submitError ? <Text style={styles.modalError}>{submitError}</Text> : null}
            <TextInput
              style={styles.textarea}
              multiline
              numberOfLines={5}
              placeholder="Add your notes or answer…"
              value={notes}
              onChangeText={setNotes}
            />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancelBtn} onPress={() => setSelected(null)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.confirmBtn, mutation.isPending && styles.disabled]}
                disabled={mutation.isPending}
                onPress={() => selected && mutation.mutate({ id: selected, notes })}
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
  list:        { padding: 16, gap: 12 },
  center:      { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errText:     { color: '#dc2626', fontSize: 14 },
  empty:       { color: '#9ca3af', fontSize: 14 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
  },
  cardHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title:       { flex: 1, fontSize: 14, fontWeight: '600', color: '#1f2937' },
  dueBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  dueText:     { fontSize: 11, fontWeight: '600' },
  desc:        { marginTop: 6, fontSize: 12, color: '#6b7280', lineHeight: 18 },
  submitBtn: {
    marginTop: 10,
    alignSelf: 'flex-end',
    backgroundColor: '#1e3a5f',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  submitBtnText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  overlay:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle:  { fontSize: 16, fontWeight: '700', color: '#1f2937', marginBottom: 12 },
  modalError:  { color: '#dc2626', fontSize: 12, marginBottom: 8 },
  textarea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 16,
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
