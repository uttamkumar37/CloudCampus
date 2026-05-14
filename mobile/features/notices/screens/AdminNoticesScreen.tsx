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
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import {
  listNoticesAdmin,
  createNotice,
  publishNotice,
  deleteNotice,
  type AdminNotice,
  type NoticeCategory,
  type NoticeTarget,
  type CreateNoticePayload,
} from '../api/adminNoticeApi';

// ── Constants ─────────────────────────────────────────────────────────────────

const CATEGORIES: NoticeCategory[] = ['GENERAL', 'ACADEMIC', 'EXAM', 'FEE', 'HOLIDAY', 'CIRCULAR', 'URGENT'];
const TARGETS:    NoticeTarget[]   = ['ALL', 'STUDENT', 'PARENT', 'TEACHER', 'STAFF'];

const CATEGORY_COLOR: Record<NoticeCategory, string> = {
  GENERAL:   '#6b7280',
  ACADEMIC:  '#2563eb',
  EXAM:      '#7c3aed',
  FEE:       '#d97706',
  HOLIDAY:   '#16a34a',
  CIRCULAR:  '#0891b2',
  URGENT:    '#dc2626',
};

const TARGET_LABEL: Record<NoticeTarget, string> = {
  ALL:     'Everyone',
  STUDENT: 'Students',
  PARENT:  'Parents',
  TEACHER: 'Teachers',
  STAFF:   'Staff',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ── Notice card ───────────────────────────────────────────────────────────────

function NoticeCard({
  notice,
  onPublish,
  onDelete,
}: {
  notice:    AdminNotice;
  onPublish: () => void;
  onDelete:  () => void;
}) {
  const catColor = CATEGORY_COLOR[notice.category];

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.header}>
        <View style={[cardStyles.catBadge, { backgroundColor: catColor + '1a', borderColor: catColor }]}>
          <Text style={[cardStyles.catText, { color: catColor }]}>{notice.category}</Text>
        </View>
        <View style={[cardStyles.pubBadge, { backgroundColor: notice.published ? '#dcfce7' : '#fef9c3' }]}>
          <Text style={[cardStyles.pubText, { color: notice.published ? '#16a34a' : '#a16207' }]}>
            {notice.published ? 'Published' : 'Draft'}
          </Text>
        </View>
      </View>

      <Text style={cardStyles.title} numberOfLines={2}>{notice.title}</Text>
      <Text style={cardStyles.content} numberOfLines={3}>{notice.content}</Text>

      <View style={cardStyles.meta}>
        <Text style={cardStyles.metaText}>For: {TARGET_LABEL[notice.target]}</Text>
        <Text style={cardStyles.metaText}>{fmtDate(notice.createdAt)}</Text>
      </View>

      <View style={cardStyles.actions}>
        {!notice.published && (
          <Pressable style={[cardStyles.actionBtn, cardStyles.publishBtn]} onPress={onPublish}>
            <Text style={cardStyles.publishBtnText}>Publish</Text>
          </Pressable>
        )}
        <Pressable style={[cardStyles.actionBtn, cardStyles.deleteBtn]} onPress={onDelete}>
          <Text style={cardStyles.deleteBtnText}>Delete</Text>
        </Pressable>
      </View>
    </View>
  );
}

// ── Create form modal ─────────────────────────────────────────────────────────

const EMPTY_FORM: CreateNoticePayload = {
  title:              '',
  content:            '',
  category:           'GENERAL',
  target:             'ALL',
  priority:           0,
  expiresAt:          null,
  publishImmediately: false,
};

function CreateModal({
  visible,
  onClose,
  onSubmit,
  pending,
}: {
  visible:  boolean;
  onClose:  () => void;
  onSubmit: (p: CreateNoticePayload) => void;
  pending:  boolean;
}) {
  const [form, setForm] = useState<CreateNoticePayload>(EMPTY_FORM);

  function set<K extends keyof CreateNoticePayload>(k: K, v: CreateNoticePayload[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function reset() {
    setForm(EMPTY_FORM);
    onClose();
  }

  function submit() {
    if (!form.title.trim() || !form.content.trim()) {
      Alert.alert('Required', 'Title and content cannot be empty.');
      return;
    }
    onSubmit(form);
  }

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={reset}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={modalStyles.heading}>New Notice</Text>

            {/* Title */}
            <Text style={modalStyles.label}>Title *</Text>
            <TextInput
              style={modalStyles.input}
              placeholder="Notice title"
              value={form.title}
              onChangeText={(t) => set('title', t)}
              maxLength={300}
            />

            {/* Content */}
            <Text style={modalStyles.label}>Content *</Text>
            <TextInput
              style={[modalStyles.input, modalStyles.multiline]}
              placeholder="Notice body…"
              value={form.content}
              onChangeText={(t) => set('content', t)}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Category */}
            <Text style={modalStyles.label}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', gap: 6 }}>
                {CATEGORIES.map((c) => {
                  const active = form.category === c;
                  const color  = CATEGORY_COLOR[c];
                  return (
                    <Pressable
                      key={c}
                      style={[modalStyles.chip, { borderColor: color, backgroundColor: active ? color : color + '1a' }]}
                      onPress={() => set('category', c)}
                    >
                      <Text style={[modalStyles.chipText, { color: active ? '#fff' : color }]}>{c}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>

            {/* Target */}
            <Text style={modalStyles.label}>Audience</Text>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
              {TARGETS.map((t) => {
                const active = form.target === t;
                return (
                  <Pressable
                    key={t}
                    style={[modalStyles.chip, { borderColor: '#1e3a5f', backgroundColor: active ? '#1e3a5f' : '#e8eef5' }]}
                    onPress={() => set('target', t)}
                  >
                    <Text style={[modalStyles.chipText, { color: active ? '#fff' : '#1e3a5f' }]}>
                      {TARGET_LABEL[t]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Priority */}
            <Text style={modalStyles.label}>Priority (0–100)</Text>
            <TextInput
              style={[modalStyles.input, { width: 80 }]}
              keyboardType="numeric"
              value={String(form.priority)}
              onChangeText={(t) => set('priority', Math.min(100, Math.max(0, parseInt(t) || 0)))}
              maxLength={3}
            />

            {/* Publish immediately */}
            <Pressable
              style={modalStyles.toggleRow}
              onPress={() => set('publishImmediately', !form.publishImmediately)}
            >
              <View style={[modalStyles.toggle, form.publishImmediately && modalStyles.toggleOn]}>
                <View style={[modalStyles.toggleThumb, form.publishImmediately && modalStyles.toggleThumbOn]} />
              </View>
              <Text style={modalStyles.toggleLabel}>Publish immediately</Text>
            </Pressable>

            <View style={modalStyles.btnRow}>
              <Pressable style={modalStyles.cancelBtn} onPress={reset} disabled={pending}>
                <Text style={modalStyles.cancelBtnText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[modalStyles.submitBtn, pending && { opacity: 0.5 }]}
                onPress={submit}
                disabled={pending}
              >
                {pending
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={modalStyles.submitBtnText}>
                      {form.publishImmediately ? 'Publish' : 'Save Draft'}
                    </Text>
                }
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function AdminNoticesScreen() {
  const schoolId    = useAuthStore((s) => s.user?.schoolId);
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-notices', schoolId],
    queryFn:  () => listNoticesAdmin(schoolId!),
    enabled:  !!schoolId,
  });

  const notices = data?.items ?? [];

  const createMutation = useMutation({
    mutationFn: (payload: CreateNoticePayload) => createNotice(schoolId!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notices', schoolId] });
      setShowCreate(false);
      Alert.alert('Done', 'Notice saved.');
    },
    onError: () => Alert.alert('Error', 'Failed to create notice.'),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => publishNotice(schoolId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notices', schoolId] });
      Alert.alert('Published', 'Notice is now live.');
    },
    onError: () => Alert.alert('Error', 'Failed to publish notice.'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteNotice(schoolId!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-notices', schoolId] }),
    onError: () => Alert.alert('Error', 'Failed to delete notice.'),
  });

  function confirmDelete(notice: AdminNotice) {
    Alert.alert(
      'Delete Notice',
      `Delete "${notice.title}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteMutation.mutate(notice.id) },
      ],
    );
  }

  if (!schoolId) {
    return (
      <View style={styles.center}>
        <Text style={styles.errText}>School profile unavailable. Please re-login.</Text>
      </View>
    );
  }

  const draftCount     = notices.filter((n: AdminNotice) => !n.published).length;
  const publishedCount = notices.filter((n: AdminNotice) => n.published).length;

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      >
        {/* Summary strip */}
        {notices.length > 0 && (
          <View style={styles.summaryRow}>
            {[
              { label: 'Total',     value: notices.length,  color: '#1e3a5f' },
              { label: 'Published', value: publishedCount,  color: '#16a34a' },
              { label: 'Drafts',    value: draftCount,      color: '#d97706' },
            ].map((s) => (
              <View key={s.label} style={styles.summaryCard}>
                <Text style={[styles.summaryValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.summaryLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        )}

        {isLoading ? (
          <View style={styles.center}><ActivityIndicator size="large" color="#1e3a5f" /></View>
        ) : isError ? (
          <View style={styles.center}><Text style={styles.errText}>Failed to load notices.</Text></View>
        ) : notices.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>No notices yet. Tap + to create one.</Text>
          </View>
        ) : (
          <View style={{ gap: 10, paddingBottom: 100 }}>
            {notices.map((n: AdminNotice) => (
              <NoticeCard
                key={n.id}
                notice={n}
                onPublish={() => publishMutation.mutate(n.id)}
                onDelete={() => confirmDelete(n)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={() => setShowCreate(true)} activeOpacity={0.85}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <CreateModal
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        onSubmit={(p) => createMutation.mutate(p)}
        pending={createMutation.isPending}
      />
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  center:       { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errText:      { color: '#dc2626', fontSize: 14, textAlign: 'center' },

  summaryRow:  { flexDirection: 'row', gap: 8, marginBottom: 12 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
    paddingVertical: 10,
  },
  summaryValue: { fontSize: 20, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: '#9ca3af', marginTop: 2 },

  emptyBox:  { alignItems: 'center', paddingVertical: 64 },
  emptyText: { fontSize: 14, color: '#9ca3af' },

  fab: {
    position: 'absolute',
    bottom: 28,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1e3a5f',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabText: { color: '#fff', fontSize: 28, lineHeight: 32, fontWeight: '400' },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
  },
  header:    { flexDirection: 'row', gap: 8, marginBottom: 8 },
  catBadge:  { borderWidth: 1, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  catText:   { fontSize: 10, fontWeight: '700' },
  pubBadge:  { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  pubText:   { fontSize: 10, fontWeight: '700' },
  title:     { fontSize: 14, fontWeight: '700', color: '#1f2937', marginBottom: 4 },
  content:   { fontSize: 12, color: '#6b7280', lineHeight: 18, marginBottom: 8 },
  meta:      { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  metaText:  { fontSize: 11, color: '#9ca3af' },
  actions:   { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  publishBtn:     { backgroundColor: '#1e3a5f' },
  publishBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  deleteBtn:      { borderWidth: 1, borderColor: '#dc2626', backgroundColor: '#fef2f2' },
  deleteBtnText:  { color: '#dc2626', fontWeight: '700', fontSize: 12 },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '92%',
  },
  heading:   { fontSize: 18, fontWeight: '800', color: '#1e3a5f', marginBottom: 16 },
  label:     { fontSize: 12, fontWeight: '600', color: '#374151', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#1f2937',
    marginBottom: 12,
    backgroundColor: '#f9fafb',
  },
  multiline: { height: 90, textAlignVertical: 'top' },

  chip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  chipText: { fontSize: 11, fontWeight: '700' },

  toggleRow:  { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 12 },
  toggle:     { width: 44, height: 24, borderRadius: 12, backgroundColor: '#d1d5db', padding: 2 },
  toggleOn:   { backgroundColor: '#1e3a5f' },
  toggleThumb:    { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleThumbOn:  { transform: [{ translateX: 20 }] },
  toggleLabel:    { fontSize: 14, color: '#374151' },

  btnRow:      { flexDirection: 'row', gap: 10, marginTop: 8, paddingBottom: 16 },
  cancelBtn:   { flex: 1, borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 14, alignItems: 'center' },
  cancelBtnText: { fontWeight: '700', color: '#374151' },
  submitBtn:   { flex: 2, backgroundColor: '#1e3a5f', borderRadius: 10, padding: 14, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
