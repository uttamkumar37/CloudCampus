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
  const canMarkAttendance =        // school admin offline class-picker flow (WatermelonDB)
    user?.role === 'SCHOOL_ADMIN' ||
    user?.role === 'SUPER_ADMIN';
  const canMarkTeacherAttendance = user?.role === 'TEACHER'; // timetable-based teacher flow
  const canScanQr               = user?.role === 'STUDENT';
  const canPromoteStudents      = user?.role === 'SCHOOL_ADMIN';

  const canViewTimetable         = user?.role === 'TEACHER' || user?.role === 'STUDENT';
  const canViewLeave             = user?.role === 'TEACHER';
  const canManageLeave           = user?.role === 'SCHOOL_ADMIN';
  const canManageStaffAttendance = user?.role === 'SCHOOL_ADMIN';
  const canViewHomework          = user?.role === 'STUDENT';
  const canViewAssignments       = user?.role === 'STUDENT';
  const canViewTeacherHomework   = user?.role === 'TEACHER';
  const canViewTeacherAssignments = user?.role === 'TEACHER';
  const canViewResults      = user?.role === 'STUDENT';
  const canViewFees         = user?.role === 'STUDENT';
  const canViewMyAttendance = user?.role === 'STUDENT';
  const canViewChildren     = user?.role === 'PARENT';
  const canManageNotices    = user?.role === 'SCHOOL_ADMIN';

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
      {canMarkTeacherAttendance && (
        <Tabs.Screen
          name="teacher-attendance"
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
      {canViewMyAttendance && (
        <Tabs.Screen
          name="my-attendance"
          options={{ title: 'Attendance', tabBarLabel: 'Attendance' }}
        />
      )}
      {canViewTeacherHomework && (
        <Tabs.Screen
          name="teacher-homework"
          options={{ title: 'Homework', tabBarLabel: 'Homework' }}
        />
      )}
      {canViewTeacherAssignments && (
        <Tabs.Screen
          name="teacher-assignments"
          options={{ title: 'Assignments', tabBarLabel: 'Assignments' }}
        />
      )}
      {canViewLeave && (
        <Tabs.Screen
          name="leave"
          options={{ title: 'Leave', tabBarLabel: 'Leave' }}
        />
      )}
      {canManageLeave && (
        <Tabs.Screen
          name="admin-leave"
          options={{ title: 'Leave Approvals', tabBarLabel: 'Leave' }}
        />
      )}
      {canManageStaffAttendance && (
        <Tabs.Screen
          name="staff-attendance"
          options={{ title: 'Staff Attendance', tabBarLabel: 'Staff Att.' }}
        />
      )}
      {canViewChildren && (
        <Tabs.Screen
          name="children"
          options={{ title: 'My Children', tabBarLabel: 'Children' }}
        />
      )}
      {canManageNotices && (
        <Tabs.Screen
          name="admin-notices"
          options={{ title: 'Notices', tabBarLabel: 'Notices' }}
        />
      )}
      {canScanQr && (
        <Tabs.Screen
          name="qr-attendance"
          options={{ title: 'Scan QR', tabBarLabel: 'Scan QR' }}
        />
      )}
      {canPromoteStudents && (
        <Tabs.Screen
          name="student-promotion"
          options={{ title: 'Promote Students', tabBarLabel: 'Promote' }}
        />
      )}
    </Tabs>
  );
}
