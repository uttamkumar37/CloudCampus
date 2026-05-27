import { describe, expect, it } from 'vitest';

import {
  getDefaultMobilePortal,
  getMobileSchoolSwitchingRoles,
  mobileShellPortals,
} from './mobileShellModel';

describe('mobileShellModel', () => {
  it('keeps backend role coverage visible for the baseline shell', () => {
    expect(getDefaultMobilePortal().role).toBe('Parent');
    expect(mobileShellPortals.map((portal) => portal.backendRole)).toEqual([
      'TENANT_ADMIN',
      'SCHOOL_ADMIN',
      'TEACHER',
      'FINANCE_STAFF',
      'STAFF',
      'PARENT',
      'STUDENT',
    ]);
  });

  it('marks school-context mobile roles as switch-ready in the shell model', () => {
    expect(getMobileSchoolSwitchingRoles()).toEqual([
      'TENANT_ADMIN',
      'SCHOOL_ADMIN',
      'TEACHER',
      'FINANCE_STAFF',
      'STAFF',
      'PARENT',
      'STUDENT',
    ]);
    expect(mobileShellPortals.filter((portal) => portal.requiresSchoolContext).map((portal) => portal.backendRole))
      .toEqual(['SCHOOL_ADMIN', 'TEACHER', 'FINANCE_STAFF', 'STAFF', 'PARENT', 'STUDENT']);
  });
});
