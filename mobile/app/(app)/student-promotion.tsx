import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import axiosInstance from '@/shared/api/axiosInstance';
import type { ApiResponse } from '@/shared/types/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface AcademicYear {
  id:        string;
  name:      string;
  isCurrent: boolean;
}

interface ClassItem {
  id:   string;
  name: string;
}

interface SectionItem {
  id:   string;
  name: string;
}

interface PromoteResult {
  promoted: number;
  skipped:  number;
  errors:   string[];
}

// ── API helpers ───────────────────────────────────────────────────────────────

async function fetchAcademicYears(schoolId: string): Promise<AcademicYear[]> {
  const { data } = await axiosInstance.get<ApiResponse<AcademicYear[]>>(
    `/v1/school-admin/schools/${schoolId}/academic-years`,
  );
  return data.data ?? [];
}

async function fetchClassesForYear(academicYearId: string): Promise<ClassItem[]> {
  const { data } = await axiosInstance.get<ApiResponse<ClassItem[]>>(
    `/v1/school-admin/academic-years/${academicYearId}/classes`,
  );
  return data.data ?? [];
}

async function fetchSections(classId: string): Promise<SectionItem[]> {
  const { data } = await axiosInstance.get<ApiResponse<SectionItem[]>>(
    `/v1/school-admin/classes/${classId}/sections`,
  );
  return data.data ?? [];
}

async function promoteStudents(
  schoolId: string,
  payload: {
    fromClassId:     string;
    fromSectionId?:  string;
    toClassId:       string;
    toSectionId?:    string;
    academicYearId:  string;
  },
): Promise<PromoteResult> {
  const { data } = await axiosInstance.post<ApiResponse<PromoteResult>>(
    `/v1/school-admin/schools/${schoolId}/students/promote`,
    payload,
  );
  return data.data ?? { promoted: 0, skipped: 0, errors: [] };
}

// ── Picker component ──────────────────────────────────────────────────────────

function PickerRow<T extends { id: string; name: string }>({
  label,
  items,
  selected,
  onSelect,
  placeholder,
  loading,
}: {
  label:       string;
  items:       T[];
  selected:    string | null;
  onSelect:    (id: string) => void;
  placeholder: string;
  loading:     boolean;
}) {
  const [open, setOpen] = useState(false);
  const selectedItem = items.find((i) => i.id === selected);

  return (
    <View style={styles.pickerGroup}>
      <Text style={styles.pickerLabel}>{label}</Text>
      <Pressable style={styles.pickerBtn} onPress={() => setOpen((o) => !o)}>
        {loading ? (
          <ActivityIndicator size="small" color="#1e3a5f" />
        ) : (
          <Text style={selectedItem ? styles.pickerBtnText : styles.pickerBtnPlaceholder}>
            {selectedItem?.name ?? placeholder}
          </Text>
        )}
        <Text style={styles.pickerChevron}>{open ? '▲' : '▼'}</Text>
      </Pressable>
      {open && (
        <View style={styles.pickerDropdown}>
          {items.length === 0 ? (
            <Text style={styles.pickerEmpty}>No options available</Text>
          ) : (
            items.map((item) => (
              <Pressable
                key={item.id}
                style={[styles.pickerOption, selected === item.id && styles.pickerOptionActive]}
                onPress={() => { onSelect(item.id); setOpen(false); }}
              >
                <Text style={[styles.pickerOptionText, selected === item.id && styles.pickerOptionTextActive]}>
                  {item.name}
                </Text>
              </Pressable>
            ))
          )}
        </View>
      )}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function StudentPromotionScreen() {
  const schoolId = useAuthStore((s) => s.user?.schoolId);

  const [academicYearId, setAcademicYearId] = useState<string | null>(null);
  const [fromClassId,    setFromClassId]    = useState<string | null>(null);
  const [fromSectionId,  setFromSectionId]  = useState<string | null>(null);
  const [toClassId,      setToClassId]      = useState<string | null>(null);
  const [toSectionId,    setToSectionId]    = useState<string | null>(null);
  const [result,         setResult]         = useState<PromoteResult | null>(null);

  const { data: academicYears = [], isLoading: loadingYears } = useQuery({
    queryKey: ['academic-years', schoolId],
    queryFn:  () => fetchAcademicYears(schoolId!),
    enabled:  !!schoolId,
  });

  const { data: classes = [], isLoading: loadingClasses } = useQuery({
    queryKey: ['classes-for-year', academicYearId],
    queryFn:  () => fetchClassesForYear(academicYearId!),
    enabled:  !!academicYearId,
  });

  const { data: fromSections = [], isLoading: loadingFromSections } = useQuery({
    queryKey: ['sections-from', fromClassId],
    queryFn:  () => fetchSections(fromClassId!),
    enabled:  !!fromClassId,
  });

  const { data: toSections = [], isLoading: loadingToSections } = useQuery({
    queryKey: ['sections-to', toClassId],
    queryFn:  () => fetchSections(toClassId!),
    enabled:  !!toClassId,
  });

  const mutation = useMutation({
    mutationFn: () =>
      promoteStudents(schoolId!, {
        fromClassId:    fromClassId!,
        fromSectionId:  fromSectionId ?? undefined,
        toClassId:      toClassId!,
        toSectionId:    toSectionId ?? undefined,
        academicYearId: academicYearId!,
      }),
    onSuccess: (res) => setResult(res),
    onError: () => Alert.alert('Error', 'Failed to promote students. Please try again.'),
  });

  if (!schoolId) {
    return (
      <View style={styles.center}>
        <Text style={styles.errText}>School profile not available. Please re-login.</Text>
      </View>
    );
  }

  const canSubmit =
    !!academicYearId && !!fromClassId && !!toClassId && !mutation.isPending;

  function handlePromote() {
    if (!canSubmit) return;
    setResult(null);
    mutation.mutate();
  }

  function handleReset() {
    setFromClassId(null);
    setFromSectionId(null);
    setToClassId(null);
    setToSectionId(null);
    setResult(null);
    mutation.reset();
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Student Promotion</Text>
      <Text style={styles.subheading}>
        Move students from one class/section to another for the selected academic year.
      </Text>

      {/* Academic year */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>ACADEMIC YEAR</Text>
        <PickerRow
          label="Academic Year"
          items={academicYears}
          selected={academicYearId}
          onSelect={(id) => {
            setAcademicYearId(id);
            setFromClassId(null);
            setFromSectionId(null);
            setToClassId(null);
            setToSectionId(null);
            setResult(null);
          }}
          placeholder="Select academic year…"
          loading={loadingYears}
        />
      </View>

      {/* Source class */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>FROM</Text>
        <PickerRow
          label="Source Class"
          items={classes}
          selected={fromClassId}
          onSelect={(id) => { setFromClassId(id); setFromSectionId(null); }}
          placeholder="Select source class…"
          loading={loadingClasses && !!academicYearId}
        />
        {fromClassId && (
          <PickerRow
            label="Source Section (optional)"
            items={fromSections}
            selected={fromSectionId}
            onSelect={setFromSectionId}
            placeholder="All sections"
            loading={loadingFromSections}
          />
        )}
      </View>

      {/* Target class */}
      <View style={styles.card}>
        <Text style={styles.sectionLabel}>TO</Text>
        <PickerRow
          label="Target Class"
          items={classes}
          selected={toClassId}
          onSelect={(id) => { setToClassId(id); setToSectionId(null); }}
          placeholder="Select target class…"
          loading={loadingClasses && !!academicYearId}
        />
        {toClassId && (
          <PickerRow
            label="Target Section (optional)"
            items={toSections}
            selected={toSectionId}
            onSelect={setToSectionId}
            placeholder="No specific section"
            loading={loadingToSections}
          />
        )}
      </View>

      {/* Result card */}
      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>Promotion Complete</Text>
          <View style={styles.resultRow}>
            <View style={styles.resultStat}>
              <Text style={[styles.resultValue, { color: '#16a34a' }]}>{result.promoted}</Text>
              <Text style={styles.resultStatLabel}>Promoted</Text>
            </View>
            <View style={styles.resultStat}>
              <Text style={[styles.resultValue, { color: '#d97706' }]}>{result.skipped}</Text>
              <Text style={styles.resultStatLabel}>Skipped</Text>
            </View>
          </View>
          {result.errors.length > 0 && (
            <View style={styles.resultErrors}>
              <Text style={styles.resultErrorsLabel}>Errors:</Text>
              {result.errors.map((e, i) => (
                <Text key={i} style={styles.resultErrorItem}>• {e}</Text>
              ))}
            </View>
          )}
          <Pressable style={styles.resetBtn} onPress={handleReset}>
            <Text style={styles.resetBtnText}>Promote Another Batch</Text>
          </Pressable>
        </View>
      )}

      {/* Submit */}
      {!result && (
        <TouchableOpacity
          style={[styles.submitBtn, !canSubmit && styles.submitBtnDisabled]}
          onPress={handlePromote}
          disabled={!canSubmit}
        >
          {mutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>Promote Students</Text>
          )}
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#f9fafb' },
  content:     { padding: 16, paddingBottom: 48 },
  center:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  errText:     { color: '#dc2626', fontSize: 14, textAlign: 'center' },

  heading:     { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 6 },
  subheading:  { fontSize: 13, color: '#6b7280', marginBottom: 20, lineHeight: 19 },

  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 14,
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.8, marginBottom: 12 },

  pickerGroup:       { marginBottom: 10 },
  pickerLabel:       { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 6 },
  pickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    backgroundColor: '#fff',
  },
  pickerBtnText:        { fontSize: 14, color: '#111827', flex: 1 },
  pickerBtnPlaceholder: { fontSize: 14, color: '#9ca3af', flex: 1 },
  pickerChevron:        { fontSize: 10, color: '#6b7280', marginLeft: 8 },

  pickerDropdown: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    backgroundColor: '#fff',
    marginTop: 4,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  pickerOptionActive:     { backgroundColor: '#eff6ff' },
  pickerOptionText:       { fontSize: 14, color: '#111827' },
  pickerOptionTextActive: { color: '#1d4ed8', fontWeight: '600' },
  pickerEmpty:            { padding: 12, fontSize: 13, color: '#9ca3af', textAlign: 'center' },

  submitBtn: {
    backgroundColor: '#1e3a5f',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  submitBtnDisabled: { backgroundColor: '#93c5fd' },
  submitBtnText:     { color: '#fff', fontWeight: '700', fontSize: 15 },

  resultCard: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    padding: 20,
    marginBottom: 16,
  },
  resultTitle:      { fontSize: 16, fontWeight: '700', color: '#15803d', marginBottom: 16 },
  resultRow:        { flexDirection: 'row', gap: 16, marginBottom: 12 },
  resultStat:       { flex: 1, alignItems: 'center' },
  resultValue:      { fontSize: 32, fontWeight: '800' },
  resultStatLabel:  { fontSize: 11, color: '#6b7280', marginTop: 2 },

  resultErrors:      { backgroundColor: '#fef2f2', borderRadius: 8, padding: 12, marginBottom: 14 },
  resultErrorsLabel: { fontSize: 12, fontWeight: '700', color: '#dc2626', marginBottom: 6 },
  resultErrorItem:   { fontSize: 12, color: '#dc2626', marginBottom: 3 },

  resetBtn: {
    borderWidth: 1,
    borderColor: '#1e3a5f',
    borderRadius: 10,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  resetBtnText: { color: '#1e3a5f', fontWeight: '700', fontSize: 14 },
});
