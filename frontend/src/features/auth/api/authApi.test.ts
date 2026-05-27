import { describe, expect, it } from 'vitest';

import { BACKEND_USER_ROLES } from './authApi';

describe('auth role model', () => {
  it('matches the backend user roles used by the current scaffold', () => {
    expect(BACKEND_USER_ROLES).toEqual([
      'SUPER_ADMIN',
      'TENANT_ADMIN',
      'SCHOOL_ADMIN',
      'TEACHER',
      'FINANCE_STAFF',
      'STAFF',
      'PARENT',
      'STUDENT',
    ]);
  });
});
