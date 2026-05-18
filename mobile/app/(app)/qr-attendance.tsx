import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { markAttendanceByQrToken } from '@/features/attendance/api/attendanceApi';

function extractToken(raw: string): string {
  const trimmed = raw.trim();
  try {
    const url = new URL(trimmed);
    const param = url.searchParams.get('token');
    if (param) return param;
  } catch {
    // not a URL — use raw value
  }
  return trimmed;
}

type SubmitState = 'idle' | 'success' | 'duplicate' | 'error';

export default function QrAttendanceScreen() {
  const params = useLocalSearchParams<{ token?: string }>();

  const [input, setInput]       = useState('');
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const mutation = useMutation({
    mutationFn: (token: string) => markAttendanceByQrToken(token),
    onSuccess: () => {
      setSubmitState('success');
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setSubmitState('duplicate');
      } else {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
          'Something went wrong. Please try again.';
        setErrorMsg(msg);
        setSubmitState('error');
      }
    },
  });

  // Auto-submit when token arrives via deep link / search params
  useEffect(() => {
    if (params.token && submitState === 'idle') {
      const token = extractToken(params.token);
      if (token) {
        mutation.mutate(token);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.token]);

  function handleSubmit() {
    const token = extractToken(input);
    if (!token) return;
    setSubmitState('idle');
    setErrorMsg('');
    mutation.mutate(token);
  }

  function handleReset() {
    setInput('');
    setSubmitState('idle');
    setErrorMsg('');
    mutation.reset();
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>Scan QR Attendance</Text>
        <Text style={styles.subheading}>
          Use your device camera to scan the QR code, then paste the link below — or paste the token directly.
        </Text>

        {submitState === 'success' ? (
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Attendance Marked!</Text>
            <Text style={styles.successSub}>Your attendance has been recorded successfully.</Text>
            <Pressable style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Mark Another</Text>
            </Pressable>
          </View>
        ) : submitState === 'duplicate' ? (
          <View style={styles.duplicateCard}>
            <Text style={styles.duplicateTitle}>Already Marked</Text>
            <Text style={styles.duplicateSub}>Your attendance for this session has already been recorded.</Text>
            <Pressable style={styles.resetBtn} onPress={handleReset}>
              <Text style={styles.resetBtnText}>Go Back</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.inputLabel}>QR Link or Token</Text>
              <TextInput
                style={styles.input}
                value={input}
                onChangeText={(v) => {
                  setInput(v);
                  setSubmitState('idle');
                  setErrorMsg('');
                }}
                placeholder="Paste QR link or token here…"
                placeholderTextColor="#9ca3af"
                autoCapitalize="none"
                autoCorrect={false}
                multiline={false}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
              />
            </View>

            {submitState === 'error' && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <Pressable
              style={[styles.submitBtn, (mutation.isPending || !input.trim()) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={mutation.isPending || !input.trim()}
            >
              {mutation.isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Attendance</Text>
              )}
            </Pressable>
          </>
        )}

        {params.token && mutation.isPending && submitState === 'idle' && (
          <View style={styles.autoSubmitRow}>
            <ActivityIndicator color="#1e3a5f" size="small" />
            <Text style={styles.autoSubmitText}>Marking attendance…</Text>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex:        { flex: 1 },
  container:   { flex: 1, backgroundColor: '#f9fafb' },
  content:     { padding: 20, paddingBottom: 48 },

  heading:     { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 6 },
  subheading:  { fontSize: 13, color: '#6b7280', marginBottom: 24, lineHeight: 19 },

  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
  },
  inputLabel: { fontSize: 11, fontWeight: '700', color: '#9ca3af', letterSpacing: 0.8, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#111827',
  },

  submitBtn: {
    backgroundColor: '#1e3a5f',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: '#93c5fd' },
  submitBtnText:     { color: '#fff', fontWeight: '700', fontSize: 15 },

  errorBanner: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  errorText: { color: '#dc2626', fontSize: 13 },

  successCard: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
  },
  successIcon:  { fontSize: 48, color: '#16a34a', marginBottom: 12 },
  successTitle: { fontSize: 18, fontWeight: '700', color: '#15803d', marginBottom: 6 },
  successSub:   { fontSize: 13, color: '#166534', textAlign: 'center', marginBottom: 24 },

  duplicateCard: {
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 12,
    backgroundColor: '#eff6ff',
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
  },
  duplicateTitle: { fontSize: 18, fontWeight: '700', color: '#1d4ed8', marginBottom: 6 },
  duplicateSub:   { fontSize: 13, color: '#1e40af', textAlign: 'center', marginBottom: 24 },

  resetBtn: {
    borderWidth: 1,
    borderColor: '#1e3a5f',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  resetBtnText: { color: '#1e3a5f', fontWeight: '700', fontSize: 14 },

  autoSubmitRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24, justifyContent: 'center' },
  autoSubmitText: { color: '#6b7280', fontSize: 13 },
});
