import { describe, expect, it } from 'vitest';

import { getDefaultMobilePortal, mobileShellPortals } from './mobileShellModel';

describe('mobileShellModel', () => {
  it('keeps parent-first mobile coverage visible for the baseline shell', () => {
    expect(getDefaultMobilePortal().role).toBe('Parent');
    expect(mobileShellPortals.map((portal) => portal.role)).toEqual([
      'Parent',
      'Teacher',
      'Student',
      'School Admin',
    ]);
  });
});
