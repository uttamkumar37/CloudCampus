import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './useAuthStore';
import type { AuthUser } from '../types/auth';

const mockUser: AuthUser = {
  userId: 'u-123',
  role: 'SCHOOL_ADMIN',
  tenantId: 't-456',
  schoolId: 's-789',
  requiresPasswordChange: false,
  expiresIn: 900,
  features: ['ATTENDANCE_QR'],
};

describe('useAuthStore', () => {
  beforeEach(() => useAuthStore.getState().clearAuth());

  // ── initial state ───────────────────────────────────────────────────────────

  it('starts with all state null', () => {
    const { accessToken, refreshToken, user } = useAuthStore.getState();
    expect(accessToken).toBeNull();
    expect(refreshToken).toBeNull();
    expect(user).toBeNull();
  });

  // ── setTokens ───────────────────────────────────────────────────────────────

  it('setTokens stores all auth state', () => {
    useAuthStore.getState().setTokens('access-tok', 'refresh-tok', mockUser);
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access-tok');
    expect(state.refreshToken).toBe('refresh-tok');
    expect(state.user).toEqual(mockUser);
  });

  it('setTokens is idempotent — second call overwrites first', () => {
    useAuthStore.getState().setTokens('tok-1', 'ref-1', mockUser);
    const user2: AuthUser = { ...mockUser, userId: 'u-999', role: 'TEACHER' };
    useAuthStore.getState().setTokens('tok-2', 'ref-2', user2);
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('tok-2');
    expect(state.user?.userId).toBe('u-999');
  });

  // ── setAccessToken ──────────────────────────────────────────────────────────

  it('setAccessToken updates only the access token', () => {
    useAuthStore.getState().setTokens('old-access', 'ref-tok', mockUser);
    useAuthStore.getState().setAccessToken('new-access');
    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('new-access');
    expect(state.refreshToken).toBe('ref-tok');
    expect(state.user).toEqual(mockUser);
  });

  // ── clearAuth ───────────────────────────────────────────────────────────────

  it('clearAuth wipes all state to null', () => {
    useAuthStore.getState().setTokens('access-tok', 'refresh-tok', mockUser);
    useAuthStore.getState().clearAuth();
    const state = useAuthStore.getState();
    expect(state.accessToken).toBeNull();
    expect(state.refreshToken).toBeNull();
    expect(state.user).toBeNull();
  });

  // ── security: no localStorage persistence ───────────────────────────────────

  it('access token is never written to localStorage', () => {
    useAuthStore.getState().setTokens('secret-access', 'secret-refresh', mockUser);
    const stored = JSON.stringify(localStorage);
    expect(stored).not.toContain('secret-access');
    expect(stored).not.toContain('secret-refresh');
  });

  it('clearAuth does not leave residue in localStorage', () => {
    useAuthStore.getState().setTokens('tok', 'ref', mockUser);
    useAuthStore.getState().clearAuth();
    const stored = JSON.stringify(localStorage);
    expect(stored).not.toContain('tok');
    expect(stored).not.toContain('ref');
  });
});
