import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { resetPasswordApi } from '../api/authApi';

function isStrongPassword(pw: string): boolean {
  return pw.length >= 8
    && /[A-Z]/.test(pw)
    && /[a-z]/.test(pw)
    && /\d/.test(pw)
    && /[^a-zA-Z\d]/.test(pw);
}

export default function ResetPasswordScreen() {
  const router  = useRouter();
  const params  = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail]           = useState(params.email ?? '');
  const [otp, setOtp]               = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  async function handleReset() {
    setError('');
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!/^\d{6}$/.test(otp)) { setError('Enter the 6-digit code from your email.'); return; }
    if (!isStrongPassword(newPassword)) {
      setError('Password must be ≥8 chars with uppercase, lowercase, digit, and special character.');
      return;
    }
    if (newPassword !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      await resetPasswordApi(email.trim(), otp, newPassword);
      Alert.alert(
        'Password reset',
        'Your password has been updated. Sign in with your new password.',
        [{ text: 'Sign in', onPress: () => router.replace('/(auth)/login') }],
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } } })
          ?.response?.data?.error?.message ?? 'Invalid or expired code. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Reset password</Text>
          <Text style={styles.subtitle}>Enter the 6-digit code we sent to your email.</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Email address"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={(t) => { setEmail(t); setError(''); }}
          />

          <Text style={styles.label}>Reset code</Text>
          <TextInput
            style={styles.input}
            placeholder="6-digit code"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(t) => { setOtp(t.replace(/\D/g, '')); setError(''); }}
          />

          <View style={styles.labelRow}>
            <Text style={styles.label}>New password</Text>
            <Pressable onPress={() => setShowPw((v) => !v)}>
              <Text style={styles.showToggle}>{showPw ? 'Hide' : 'Show'}</Text>
            </Pressable>
          </View>
          <TextInput
            style={styles.input}
            placeholder="Min 8 chars"
            secureTextEntry={!showPw}
            value={newPassword}
            onChangeText={(t) => { setNewPassword(t); setError(''); }}
          />
          <Text style={styles.hint}>
            Uppercase · lowercase · digit · special character
          </Text>

          <Text style={styles.label}>Confirm password</Text>
          <TextInput
            style={[styles.input, { marginBottom: 16 }]}
            placeholder="Repeat password"
            secureTextEntry={!showPw}
            value={confirm}
            onChangeText={(t) => { setConfirm(t); setError(''); }}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleReset}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.buttonText}>Reset password</Text>
            }
          </Pressable>

          <Pressable style={styles.backLink} onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  scroll:    { flexGrow: 1, justifyContent: 'center', padding: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  title:    { fontSize: 22, fontWeight: '700', color: '#1e3a5f', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 20 },
  label:    { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 4 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  showToggle: { fontSize: 13, color: '#2563eb' },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    color: '#111827',
  },
  hint:          { fontSize: 11, color: '#9ca3af', marginTop: -8, marginBottom: 12 },
  error:         { color: '#dc2626', fontSize: 13, marginBottom: 12 },
  button: {
    backgroundColor: '#1e3a5f',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText:    { color: '#fff', fontWeight: '600', fontSize: 15 },
  backLink: { marginTop: 16, alignItems: 'center' },
  backText: { fontSize: 14, color: '#2563eb' },
});
