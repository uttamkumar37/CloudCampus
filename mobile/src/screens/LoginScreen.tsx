import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuth } from '../auth/AuthContext';
import { colors } from '../theme/colors';
import { DEFAULT_TENANT_ID } from '../api/client';

export function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('jnv.admin');
  const [password, setPassword] = useState('Demo@1234');
  const [tenantId, setTenantId] = useState<string>(DEFAULT_TENANT_ID);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setSubmitting(true);
    try {
      await login(username.trim(), password, tenantId.trim());
    } catch (e: any) {
      setError(e?.response?.data?.error?.message ?? e?.message ?? 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.heading}>CloudCampus</Text>
        <Text style={styles.sub}>Sign in to your school portal</Text>

        <Text style={styles.label}>Tenant</Text>
        <TextInput
          value={tenantId}
          onChangeText={setTenantId}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
          placeholder="jnv-lucknow-demo"
        />

        <Text style={styles.label}>Username</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          disabled={submitting || !username || !password}
          onPress={onSubmit}
          style={[
            styles.button,
            (submitting || !username || !password) && styles.buttonDisabled,
          ]}
        >
          {submitting ? (
            <ActivityIndicator color={colors.primaryText} />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </Pressable>

        <Text style={styles.hint}>
          Demo: <Text style={styles.hintBold}>jnv.admin</Text> / <Text style={styles.hintBold}>Demo@1234</Text>
          {'\n'}Super admin: <Text style={styles.hintBold}>superadmin</Text> / <Text style={styles.hintBold}>admin123</Text> (leave tenant blank)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: 20 },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heading: { fontSize: 28, fontWeight: '700', color: colors.text, textAlign: 'center' },
  sub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 4, marginBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text, marginTop: 10, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.text,
    backgroundColor: '#ffffff',
  },
  button: {
    marginTop: 18,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: colors.primaryText, fontSize: 16, fontWeight: '600' },
  errorBox: {
    marginTop: 14,
    backgroundColor: colors.dangerBg,
    borderRadius: 8,
    padding: 10,
  },
  errorText: { color: colors.danger, fontSize: 13 },
  hint: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 18, lineHeight: 18 },
  hintBold: { fontWeight: '600', color: colors.text },
});
