// Minimal auth context: session state + login/logout actions.
// Persists via expo-secure-store (native) or localStorage (web) — see storage.ts.

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  api,
  loginApi,
  loadStoredSession,
  setAuthHeaders,
  DEFAULT_TENANT_ID,
  LoginResponse,
} from '../api/client';
import { clearSession, saveSession, StoredSession } from './storage';

interface AuthState {
  status: 'unknown' | 'unauthenticated' | 'authenticated';
  user: StoredSession['user'] | null;
  login: (username: string, password: string, tenantId?: string) => Promise<void>;
  activateSchool: (schoolId: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthState['status']>('unknown');
  const [user, setUser] = useState<StoredSession['user'] | null>(null);

  useEffect(() => {
    (async () => {
      const s = await loadStoredSession();
      if (s && s.expiresAt > Date.now() + 30_000) {
        setUser(s.user);
        setStatus('authenticated');
      } else {
        // expired or absent — wipe and stay logged out
        await clearSession();
        setStatus('unauthenticated');
      }
    })();
  }, []);

  const login = async (username: string, password: string, tenantId = DEFAULT_TENANT_ID) => {
    const lr: LoginResponse = await loginApi(username, password, tenantId);
    const session: StoredSession = {
      accessToken: lr.accessToken,
      refreshToken: lr.refreshToken,
      expiresAt: Date.now() + lr.expiresIn * 1000,
      tenantHeader: tenantId || null,
      user: {
        userId: lr.userId,
        role: lr.role,
        tenantId: lr.tenantId,
        schoolId: lr.schoolId,
        requiresPasswordChange: lr.requiresPasswordChange,
        features: lr.features ?? [],
      },
    };
    await saveSession(session);
    setAuthHeaders(session.accessToken, session.refreshToken, tenantId);
    setUser(session.user);
    setStatus('authenticated');
  };

  const activateSchool = async (schoolId: string) => {
    const current = await loadStoredSession();
    if (!current) throw new Error('No active session');
    const resp = await api.post(`/v1/me/schools/${schoolId}/activate`);
    const data = resp.data?.data;
    if (!data?.accessToken) throw new Error('School switch failed');
    const next: StoredSession = {
      ...current,
      accessToken: data.accessToken,
      expiresAt: Date.now() + (data.expiresIn ?? 900) * 1000,
      user: {
        ...current.user,
        schoolId: data.schoolId ?? schoolId,
      },
    };
    await saveSession(next);
    setAuthHeaders(next.accessToken, next.refreshToken, next.tenantHeader);
    setUser(next.user);
  };

  const logout = async () => {
    await clearSession();
    setAuthHeaders(null, null, DEFAULT_TENANT_ID);
    setUser(null);
    setStatus('unauthenticated');
  };

  const value = useMemo(() => ({ status, user, login, activateSchool, logout }), [status, user]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth must be inside <AuthProvider>');
  return ctx;
}
