import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import axiosInstance from '@/shared/api/axiosInstance';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [current, setCurrent]   = useState('');
  const [next, setNext]         = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleSubmit() {
    if (!current || !next || !confirm) {
      Alert.alert('Validation', 'All fields are required.');
      return;
    }
    if (next.length < 8) {
      Alert.alert('Validation', 'New password must be at least 8 characters.');
      return;
    }
    if (next !== confirm) {
      Alert.alert('Validation', 'Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/v1/auth/change-password', {
        currentPassword: current,
        newPassword:     next,
      });

      // Clear the forced-change flag so the guard routes to the app.
      useAuthStore.setState((s) => ({
        user: s.user ? { ...s.user, requiresPasswordChange: false } : s.user,
      }));

      Alert.alert('Success', 'Password updated. Welcome!', [
        { text: 'OK', onPress: () => router.replace('/(app)/') },
      ]);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? 'Failed to update password. Try again.';
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.subtitle}>
          Your account requires a password change before you can continue.
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Current password"
          secureTextEntry
          value={current}
          onChangeText={setCurrent}
        />
        <TextInput
          style={styles.input}
          placeholder="New password (min 8 characters)"
          secureTextEntry
          value={next}
          onChangeText={setNext}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm new password"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Saving…' : 'Update Password'}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
    justifyContent: 'center',
    padding: 24,
  },
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
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e3a5f',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 13,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    marginBottom: 12,
    color: '#111827',
  },
  button: {
    backgroundColor: '#1e3a5f',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
