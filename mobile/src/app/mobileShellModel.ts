export type MobileShellPortal = {
  backendRole: 'TENANT_ADMIN' | 'SCHOOL_ADMIN' | 'TEACHER' | 'STAFF' | 'PARENT' | 'STUDENT';
  role: 'Tenant Admin' | 'School Admin' | 'Teacher' | 'Staff' | 'Parent' | 'Student';
  initialScope: string;
  requiresSchoolContext: boolean;
  supportsSchoolSwitching: boolean;
};

export const mobileShellPortals: MobileShellPortal[] = [
  {
    backendRole: 'TENANT_ADMIN',
    role: 'Tenant Admin',
    initialScope: 'Multi-school overview, school switching, usage, and combined summaries.',
    requiresSchoolContext: false,
    supportsSchoolSwitching: true,
  },
  {
    backendRole: 'SCHOOL_ADMIN',
    role: 'School Admin',
    initialScope: 'Assigned school setup and operational summaries.',
    requiresSchoolContext: true,
    supportsSchoolSwitching: true,
  },
  {
    backendRole: 'TEACHER',
    role: 'Teacher',
    initialScope: 'Assigned classes, attendance, homework, timetable, and marks.',
    requiresSchoolContext: true,
    supportsSchoolSwitching: true,
  },
  {
    backendRole: 'STAFF',
    role: 'Staff',
    initialScope: 'Assigned school operations and staff-facing workflows.',
    requiresSchoolContext: true,
    supportsSchoolSwitching: true,
  },
  {
    backendRole: 'PARENT',
    role: 'Parent',
    initialScope: 'Child-specific notices, attendance, homework, results, fees, and leave.',
    requiresSchoolContext: true,
    supportsSchoolSwitching: true,
  },
  {
    backendRole: 'STUDENT',
    role: 'Student',
    initialScope: 'Own homework, notices, results, and resources.',
    requiresSchoolContext: true,
    supportsSchoolSwitching: true,
  },
];

export function getDefaultMobilePortal(): MobileShellPortal {
  return mobileShellPortals.find((portal) => portal.backendRole === 'PARENT') ?? mobileShellPortals[0];
}

export function getMobileSchoolSwitchingRoles(): MobileShellPortal['backendRole'][] {
  return mobileShellPortals
    .filter((portal) => portal.supportsSchoolSwitching)
    .map((portal) => portal.backendRole);
}
