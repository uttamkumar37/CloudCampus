import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { forgotPasswordApi } from '../api/authApi';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail]     = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  async function handleSend() {
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Email is required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError('Enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await forgotPasswordApi(trimmed);
      setSent(true);
    } catch {
      // Server always returns 200 for unknown emails — only real errors surface here.
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function goToReset() {
    router.push({ pathname: '/(auth)/reset-password', params: { email: email.trim() } });
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Forgot password?</Text>

        {!sent ? (
          <>
            <Text style={styles.subtitle}>
              Enter your account email and we'll send a 6-digit reset code.
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Email address"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              value={email}
              onChangeText={(t) => { setEmail(t); setError(''); }}
            />

            {error ? <Text style={styles.error}>{error}</Text> : null}

            <Pressable
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSend}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.buttonText}>Send reset code</Text>
              }
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.sentMsg}>
              If that email is registered, a 6-digit code has been sent. Check your inbox.
            </Text>
            <Pressable style={styles.button} onPress={goToReset}>
              <Text style={styles.buttonText}>Enter the code</Text>
            </Pressable>
          </>
        )}

        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backText}>Back to sign in</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8', justifyContent: 'center', padding: 24 },
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
  title:    { fontSize: 22, fontWeight: '700', color: '#1e3a5f', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#6b7280', marginBottom: 20, lineHeight: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    color: '#111827',
  },
  error:         { color: '#dc2626', fontSize: 13, marginBottom: 10 },
  button: {
    backgroundColor: '#1e3a5f',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText:    { color: '#fff', fontWeight: '600', fontSize: 15 },
  sentMsg: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 21,
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#bbf7d0',
  },
  backLink: { marginTop: 16, alignItems: 'center' },
  backText: { fontSize: 14, color: '#2563eb' },
});
