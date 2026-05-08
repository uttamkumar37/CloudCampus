import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { login } from '../../src/api/auth';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Spacing, Radius, Shadow, Typography } from '../../src/theme';

type Role = 'SCHOOL_ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

const ROLES: { value: Role; label: string; icon: React.ComponentProps<typeof Ionicons>['name']; desc: string }[] = [
  { value: 'SCHOOL_ADMIN', label: 'Admin',   icon: 'shield-checkmark', desc: 'Full access' },
  { value: 'TEACHER',      label: 'Teacher', icon: 'school',           desc: 'Attendance & marks' },
  { value: 'STUDENT',      label: 'Student', icon: 'person',           desc: 'My academics' },
  { value: 'PARENT',       label: 'Parent',  icon: 'heart',            desc: 'My children' },
];

export default function LoginScreen() {
  const [username, setUsername]       = useState('');
  const [password, setPassword]       = useState('');
  const [tenantSlug, setTenantSlug]   = useState('');
  const [role, setRole]               = useState<Role>('SCHOOL_ADMIN');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);
  const { setSession } = useAuthStore();

  async function handleLogin() {
    if (!username.trim() || !password.trim() || !tenantSlug.trim()) {
      Alert.alert('Missing fields', 'Please fill in all fields to continue.');
      return;
    }
    setLoading(true);
    try {
      const response = await login({
        username: username.trim(),
        password,
        tenantSlug: tenantSlug.trim().toLowerCase(),
        role,
      });
      await setSession({
        token: response.accessToken,
        username: response.username,
        role: response.role,
        tenantSlug: response.tenantSlug,
        schoolName: response.schoolName,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
      Alert.alert('Login Failed', message);
    } finally {
      setLoading(false);
    }
  }

  const selectedRoleMeta = ROLES.find((r) => r.value === role)!;

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />
          <View style={styles.circle3} />
          <View style={styles.logoWrap}>
            <View style={styles.logoBox}>
              <Ionicons name="school" size={36} color={Colors.primary} />
            </View>
          </View>
          <Text style={styles.appName}>CloudCampus</Text>
          <Text style={styles.tagline}>School Management · Made Simple</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Text style={styles.cardSubtitle}>Sign in to your portal</Text>

          {/* Role selector */}
          <Text style={styles.fieldLabel}>I AM A</Text>
          <View style={styles.roleGrid}>
            {ROLES.map((r) => {
              const active = role === r.value;
              return (
                <TouchableOpacity
                  key={r.value}
                  style={[styles.roleChip, active && styles.roleChipActive]}
                  onPress={() => setRole(r.value)}
                  activeOpacity={0.75}
                >
                  <View style={[styles.roleIconWrap, active && styles.roleIconWrapActive]}>
                    <Ionicons
                      name={r.icon}
                      size={18}
                      color={active ? Colors.primary : Colors.textTertiary}
                    />
                  </View>
                  <Text style={[styles.roleLabel, active && styles.roleLabelActive]}>
                    {r.label}
                  </Text>
                  <Text style={[styles.roleDesc, active && styles.roleDescActive]}>
                    {r.desc}
                  </Text>
                  {active && <View style={styles.roleCheck}><Ionicons name="checkmark" size={10} color="#fff" /></View>}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* School slug */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>SCHOOL IDENTIFIER</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="business-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="e.g. jnv-palamau"
                placeholderTextColor={Colors.textTertiary}
                value={tenantSlug}
                onChangeText={setTenantSlug}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Username */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>USERNAME</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="person-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={
                  role === 'SCHOOL_ADMIN' ? 'e.g. uttam.kumar' :
                  role === 'TEACHER'      ? 'e.g. anand.mishra' :
                  role === 'STUDENT'      ? 'e.g. s24001' :
                                           'e.g. par.001'
                }
                placeholderTextColor={Colors.textTertiary}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>PASSWORD</Text>
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={18} color={Colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputPassword]}
                placeholder="Your password"
                placeholderTextColor={Colors.textTertiary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeBtn}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={Colors.textTertiary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Hint bar */}
          <View style={styles.hintBar}>
            <Ionicons name={selectedRoleMeta.icon} size={13} color={Colors.primaryLight} />
            <Text style={styles.hintText}>
              Signing in as <Text style={styles.hintBold}>{selectedRoleMeta.label}</Text>
              {role === 'STUDENT'      ? ' — password: Jnv@Demo2026' :
               role === 'TEACHER'      ? ' — password: Jnv@Demo2026' :
               role === 'PARENT'       ? ' — password: Jnv@Demo2026' : ''}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.signInBtn, loading && styles.signInBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Text style={styles.signInText}>Sign In</Text>
                <Ionicons name="arrow-forward" size={18} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>CloudCampus © 2026 · Multi-tenant School ERP</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.primary },
  scroll: { flexGrow: 1 },

  hero: {
    backgroundColor: Colors.primary, paddingTop: 56, paddingBottom: 40,
    alignItems: 'center', overflow: 'hidden', position: 'relative',
  },
  circle1: { position: 'absolute', width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.04)', top: -60, right: -60 },
  circle2: { position: 'absolute', width: 150, height: 150, borderRadius: 75,  backgroundColor: 'rgba(255,255,255,0.05)', bottom: 20, left: -40 },
  circle3: { position: 'absolute', width: 80,  height: 80,  borderRadius: 40,  backgroundColor: 'rgba(255,255,255,0.06)', top: 30, left: 30 },
  logoWrap: { marginBottom: Spacing.lg },
  logoBox: { width: 72, height: 72, borderRadius: Radius.xl, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center', ...Shadow.lg },
  appName: { ...Typography.hero, color: Colors.textOnPrimary, marginBottom: 6 },
  tagline: { fontSize: 13, color: Colors.textOnPrimaryMuted, letterSpacing: 0.3 },

  card: { backgroundColor: Colors.surface, borderTopLeftRadius: 28, borderTopRightRadius: 28, flex: 1, padding: Spacing.xxl, paddingTop: 28 },
  cardTitle: { ...Typography.h1, color: Colors.text, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: Colors.textSecondary, marginBottom: Spacing.xl },

  fieldLabel: { fontSize: 11, fontWeight: '700', color: Colors.textTertiary, letterSpacing: 0.5, marginBottom: Spacing.xs },

  roleGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
  roleChip: {
    flex: 1, alignItems: 'center', borderRadius: Radius.lg, paddingVertical: 10,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background, gap: 4,
  },
  roleChipActive: { borderColor: Colors.primary, backgroundColor: Colors.accentLight },
  roleIconWrap: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.surface, justifyContent: 'center', alignItems: 'center' },
  roleIconWrapActive: { backgroundColor: Colors.surface },
  roleLabel: { fontSize: 12, fontWeight: '700', color: Colors.textTertiary },
  roleLabelActive: { color: Colors.primary },
  roleDesc: { fontSize: 9, color: Colors.textTertiary, textAlign: 'center' },
  roleDescActive: { color: Colors.primaryLight },
  roleCheck: { position: 'absolute', top: 6, right: 6, width: 16, height: 16, borderRadius: 8, backgroundColor: Colors.primary, justifyContent: 'center', alignItems: 'center' },

  fieldGroup: { marginBottom: Spacing.lg },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.background, paddingHorizontal: Spacing.md },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, paddingVertical: 13, fontSize: 15, color: Colors.text },
  inputPassword: { paddingRight: 0 },
  eyeBtn: { padding: Spacing.sm },

  hintBar: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.accentLight, borderRadius: Radius.md,
    paddingHorizontal: Spacing.md, paddingVertical: 10, marginBottom: Spacing.lg,
  },
  hintText: { flex: 1, fontSize: 12, color: Colors.primaryMid },
  hintBold: { fontWeight: '700' },

  signInBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    gap: Spacing.sm, ...Shadow.md,
  },
  signInBtnDisabled: { opacity: 0.6 },
  signInText: { color: Colors.textOnPrimary, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },

  footer: { textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.35)', paddingVertical: Spacing.lg, backgroundColor: Colors.primary },
});
