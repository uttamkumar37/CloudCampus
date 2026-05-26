export type MobileShellPortal = {
  role: 'Parent' | 'Teacher' | 'Student' | 'School Admin';
  initialScope: string;
};

export const mobileShellPortals: MobileShellPortal[] = [
  {
    role: 'Parent',
    initialScope: 'Child-specific notices, attendance, homework, results, fees, and leave.',
  },
  {
    role: 'Teacher',
    initialScope: 'Assigned classes, attendance, homework, timetable, and marks.',
  },
  {
    role: 'Student',
    initialScope: 'Own homework, notices, results, and resources.',
  },
  {
    role: 'School Admin',
    initialScope: 'Assigned school setup and operational summaries.',
  },
];

export function getDefaultMobilePortal(): MobileShellPortal {
  return mobileShellPortals[0];
}
