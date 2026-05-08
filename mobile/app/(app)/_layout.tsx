import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../src/store/authStore';
import { Colors, Shadow } from '../../src/theme';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({ name, focused, label }: { name: IoniconsName; focused: boolean; label: string }) {
  return (
    <View style={[tabStyles.wrap, focused && tabStyles.wrapActive]}>
      <Ionicons
        name={focused ? name : (`${name}-outline` as IoniconsName)}
        size={22}
        color={focused ? Colors.primary : Colors.textTertiary}
      />
      <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{label}</Text>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingTop: 6, paddingHorizontal: 10, borderRadius: 12, minWidth: 56 },
  wrapActive: { backgroundColor: Colors.accentLight },
  label: { fontSize: 10, fontWeight: '500', color: Colors.textTertiary, marginTop: 2 },
  labelActive: { color: Colors.primary, fontWeight: '700' },
});

const SCREEN_OPTIONS = {
  headerStyle: { backgroundColor: Colors.primary, ...Shadow.md },
  headerTintColor: Colors.textOnPrimary,
  headerTitleStyle: { fontWeight: '700' as const, fontSize: 17 },
  headerShadowVisible: false,
  tabBarShowLabel: false,
  tabBarStyle: {
    backgroundColor: Colors.surface,
    borderTopColor: Colors.border,
    borderTopWidth: 1,
    height: 64,
    paddingTop: 4,
    paddingBottom: 8,
    ...Shadow.md,
  },
};

function AdminTeacherTabs({ isAdmin }: { isAdmin: boolean }) {
  return (
    <Tabs screenOptions={SCREEN_OPTIONS}>
      <Tabs.Screen name="index"            options={{ title: 'Dashboard',  tabBarIcon: ({ focused }) => <TabIcon name="home"     focused={focused} label="Home" /> }} />
      <Tabs.Screen name="students/index"   options={{ title: 'Students',   tabBarIcon: ({ focused }) => <TabIcon name="people"   focused={focused} label="Students" /> }} />
      <Tabs.Screen name="fees/index"       options={{ title: 'Fees',       tabBarIcon: ({ focused }) => <TabIcon name="card"     focused={focused} label="Fees" />, tabBarItemStyle: isAdmin ? {} : { display: 'none' } }} />
      <Tabs.Screen name="attendance/index" options={{ title: 'Attendance', tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} label="Attend." /> }} />
      {/* Hidden */}
      <Tabs.Screen name="students/[id]"      options={{ href: null, title: 'Student Detail' }} />
      <Tabs.Screen name="student/index"      options={{ href: null }} />
      <Tabs.Screen name="student/fees"       options={{ href: null }} />
      <Tabs.Screen name="student/attendance" options={{ href: null }} />
      <Tabs.Screen name="parent/index"       options={{ href: null }} />
      <Tabs.Screen name="parent/[childId]"   options={{ href: null }} />
    </Tabs>
  );
}

function StudentTabs() {
  return (
    <Tabs screenOptions={SCREEN_OPTIONS}>
      <Tabs.Screen name="student/index"      options={{ title: 'My Profile',    tabBarIcon: ({ focused }) => <TabIcon name="person"   focused={focused} label="Profile" /> }} />
      <Tabs.Screen name="student/fees"       options={{ title: 'My Fees',       tabBarIcon: ({ focused }) => <TabIcon name="card"     focused={focused} label="My Fees" /> }} />
      <Tabs.Screen name="student/attendance" options={{ title: 'My Attendance', tabBarIcon: ({ focused }) => <TabIcon name="calendar" focused={focused} label="Attend." /> }} />
      {/* Hidden */}
      <Tabs.Screen name="index"            options={{ href: null }} />
      <Tabs.Screen name="students/index"   options={{ href: null }} />
      <Tabs.Screen name="students/[id]"    options={{ href: null }} />
      <Tabs.Screen name="fees/index"       options={{ href: null }} />
      <Tabs.Screen name="attendance/index" options={{ href: null }} />
      <Tabs.Screen name="parent/index"     options={{ href: null }} />
      <Tabs.Screen name="parent/[childId]" options={{ href: null }} />
    </Tabs>
  );
}

function ParentTabs() {
  return (
    <Tabs screenOptions={SCREEN_OPTIONS}>
      <Tabs.Screen name="parent/index"     options={{ title: 'My Children', tabBarIcon: ({ focused }) => <TabIcon name="heart"    focused={focused} label="Children" /> }} />
      <Tabs.Screen name="parent/[childId]" options={{ href: null, title: 'Child Detail' }} />
      {/* Hidden */}
      <Tabs.Screen name="index"            options={{ href: null }} />
      <Tabs.Screen name="students/index"   options={{ href: null }} />
      <Tabs.Screen name="students/[id]"    options={{ href: null }} />
      <Tabs.Screen name="fees/index"       options={{ href: null }} />
      <Tabs.Screen name="attendance/index" options={{ href: null }} />
      <Tabs.Screen name="student/index"    options={{ href: null }} />
      <Tabs.Screen name="student/fees"     options={{ href: null }} />
      <Tabs.Screen name="student/attendance" options={{ href: null }} />
    </Tabs>
  );
}

export default function AppLayout() {
  const { session } = useAuthStore();
  const role = session?.role ?? 'SCHOOL_ADMIN';

  if (role === 'STUDENT') return <StudentTabs />;
  if (role === 'PARENT')  return <ParentTabs />;
  return <AdminTeacherTabs isAdmin={role === 'SCHOOL_ADMIN'} />;
}
