import { Tabs } from 'expo-router';
import { useAuthStore } from '@/features/auth/store/useAuthStore';
import { useProactiveTokenRefresh } from '@/shared/hooks/useProactiveTokenRefresh';
import { useSyncTrigger } from '@/offline/sync/useSyncTrigger';
import { usePushRegistration } from '@/features/notifications/hooks/usePushRegistration';
import { useNotificationListeners } from '@/features/notifications/hooks/useNotificationListeners';

export default function AppLayout() {
  const user = useAuthStore((s) => s.user);

  // D2 — pre-empt token expiry on foreground
  useProactiveTokenRefresh();
  // D3 — flush pending offline attendance on foreground / reconnect
  useSyncTrigger();
  // D4 — request push permission, register token with backend
  usePushRegistration();
  // D4 — handle foreground notifications and tap deep-links
  useNotificationListeners();

  // Role-based tab visibility
  const canMarkAttendance =
    user?.role === 'SCHOOL_ADMIN' ||
    user?.role === 'TEACHER' ||
    user?.role === 'SUPER_ADMIN';

  const canViewTimetable  = user?.role === 'TEACHER';
  const canViewHomework    = user?.role === 'STUDENT';
  const canViewAssignments = user?.role === 'STUDENT';
  const canViewResults     = user?.role === 'STUDENT';
  const canViewFees        = user?.role === 'STUDENT';
  const canViewChildren    = user?.role === 'PARENT';

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#1e3a5f',
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Dashboard', tabBarLabel: 'Home' }}
      />
      <Tabs.Screen
        name="notices"
        options={{ title: 'Notices', tabBarLabel: 'Notices' }}
      />
      {canMarkAttendance && (
        <Tabs.Screen
          name="attendance"
          options={{ title: 'Attendance', tabBarLabel: 'Attendance' }}
        />
      )}
      {canViewTimetable && (
        <Tabs.Screen
          name="timetable"
          options={{ title: 'Timetable', tabBarLabel: 'Timetable' }}
        />
      )}
      {canViewHomework && (
        <Tabs.Screen
          name="homework"
          options={{ title: 'Homework', tabBarLabel: 'Homework' }}
        />
      )}
      {canViewAssignments && (
        <Tabs.Screen
          name="assignments"
          options={{ title: 'Assignments', tabBarLabel: 'Assignments' }}
        />
      )}
      {canViewResults && (
        <Tabs.Screen
          name="results"
          options={{ title: 'Results', tabBarLabel: 'Results' }}
        />
      )}
      {canViewFees && (
        <Tabs.Screen
          name="fees"
          options={{ title: 'Fees', tabBarLabel: 'Fees' }}
        />
      )}
      {canViewChildren && (
        <Tabs.Screen
          name="children"
          options={{ title: 'My Children', tabBarLabel: 'Children' }}
        />
      )}
    </Tabs>
  );
}
