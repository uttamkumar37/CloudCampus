import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuthStore } from '@/features/auth/store/useAuthStore';

export default function DashboardScreen() {
  const user = useAuthStore((s) => s.user);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>
        Welcome{user?.userId ? `, ${user.userId}` : ''}
      </Text>
      <Text style={styles.role}>Role: {user?.role ?? '—'}</Text>
      {user?.tenantId && (
        <Text style={styles.tenant}>Tenant: {user.tenantId}</Text>
      )}

      <Pressable style={styles.signOut} onPress={clearAuth} testID="btn-sign-out">
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f0f4f8',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1e3a5f',
    marginBottom: 8,
  },
  role: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  tenant: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 24,
  },
  signOut: {
    marginTop: 'auto',
    backgroundColor: '#dc2626',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  signOutText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
