import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { ReactNode } from 'react';

import { AUTH_SESSION_EXPIRED_EVENT } from '../../../shared/api/authHeaders';
import {
  activateSchool,
  getCurrentUser,
  getMySchools,
  logout,
} from '../api/authApi';
import type { AuthSession, CurrentUser, SchoolAccess } from '../api/authApi';

export const ACCESS_TOKEN_STORAGE_KEY = 'cloudcampus.auth.accessToken';
export const REFRESH_TOKEN_STORAGE_KEY = 'cloudcampus.auth.refreshToken';

type AuthStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type AuthClient = {
  activateSchool: typeof activateSchool;
  getCurrentUser: typeof getCurrentUser;
  getMySchools: typeof getMySchools;
  logout: typeof logout;
};

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

type AuthStateContextValue = {
  accessToken: string | null;
  allowedSchools: SchoolAccess[];
  activateSchool: (schoolId: string) => Promise<void>;
  clearError: () => void;
  currentUser: CurrentUser | null;
  error: string | null;
  logout: () => Promise<void>;
  refreshCurrentUser: () => Promise<void>;
  registerSession: (session: AuthSession) => Promise<void>;
  schoolActivationError: string | null;
  status: AuthStatus;
};

const defaultClient: AuthClient = {
  activateSchool,
  getCurrentUser,
  getMySchools,
  logout,
};

const AuthStateContext = createContext<AuthStateContextValue | null>(null);

type AuthStateProviderProps = {
  children: ReactNode;
  client?: Partial<AuthClient>;
  storage?: AuthStorage;
};

export function AuthStateProvider({
  children,
  client,
  storage = globalThis.sessionStorage,
}: AuthStateProviderProps) {
  const authClient = useMemo(() => ({ ...defaultClient, ...client }), [client]);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [allowedSchools, setAllowedSchools] = useState<SchoolAccess[]>([]);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [schoolActivationError, setSchoolActivationError] = useState<string | null>(null);

  const clearStoredSession = useCallback(() => {
    storage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
    storage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
    setAccessToken(null);
    setRefreshToken(null);
    setCurrentUser(null);
    setAllowedSchools([]);
    setStatus('unauthenticated');
  }, [storage]);

  useEffect(() => {
    const handleExpiredSession = () => {
      clearStoredSession();
      setError('Session expired. Sign in again.');
      setSchoolActivationError(null);
    };

    globalThis.addEventListener?.(AUTH_SESSION_EXPIRED_EVENT, handleExpiredSession);
    return () => {
      globalThis.removeEventListener?.(AUTH_SESSION_EXPIRED_EVENT, handleExpiredSession);
    };
  }, [clearStoredSession]);

  const hydrate = useCallback(async (token: string) => {
    try {
      const [user, schools] = await Promise.all([
        authClient.getCurrentUser(token),
        authClient.getMySchools(token),
      ]);
      setAccessToken(token);
      setCurrentUser({ ...user, allowedSchools: schools });
      setAllowedSchools(schools);
      setStatus('authenticated');
      setError(null);
    } catch {
      clearStoredSession();
      setError('Session expired. Sign in again.');
    }
  }, [authClient, clearStoredSession]);

  useEffect(() => {
    const storedAccessToken = storage.getItem(ACCESS_TOKEN_STORAGE_KEY);
    const storedRefreshToken = storage.getItem(REFRESH_TOKEN_STORAGE_KEY);
    if (!storedAccessToken) {
      setStatus('unauthenticated');
      return;
    }
    setRefreshToken(storedRefreshToken);
    void hydrate(storedAccessToken);
  }, [hydrate, storage]);

  const registerSession = useCallback(async (session: AuthSession) => {
    if (!session.accessToken) {
      clearStoredSession();
      throw new Error('Authenticated session was not returned.');
    }
    storage.setItem(ACCESS_TOKEN_STORAGE_KEY, session.accessToken);
    if (session.refreshToken) {
      storage.setItem(REFRESH_TOKEN_STORAGE_KEY, session.refreshToken);
      setRefreshToken(session.refreshToken);
    }
    await hydrate(session.accessToken);
  }, [clearStoredSession, hydrate, storage]);

  const refreshCurrentUser = useCallback(async () => {
    if (!accessToken) {
      clearStoredSession();
      return;
    }
    await hydrate(accessToken);
  }, [accessToken, clearStoredSession, hydrate]);

  const activateCurrentSchool = useCallback(async (schoolId: string) => {
    if (!accessToken) {
      clearStoredSession();
      return;
    }
    try {
      setSchoolActivationError(null);
      const session = await authClient.activateSchool(accessToken, schoolId);
      if (!session.accessToken) {
        throw new Error('School activation did not return an access token.');
      }
      storage.setItem(ACCESS_TOKEN_STORAGE_KEY, session.accessToken);
      if (session.refreshToken) {
        storage.setItem(REFRESH_TOKEN_STORAGE_KEY, session.refreshToken);
        setRefreshToken(session.refreshToken);
      }
      await hydrate(session.accessToken);
    } catch {
      setSchoolActivationError('School activation was denied.');
    }
  }, [accessToken, authClient, clearStoredSession, hydrate, storage]);

  const logoutCurrentUser = useCallback(async () => {
    if (accessToken) {
      try {
        await authClient.logout(accessToken, refreshToken ?? undefined);
      } catch {
        // Local logout still clears an invalid or already-revoked session.
      }
    }
    clearStoredSession();
    setError(null);
    setSchoolActivationError(null);
  }, [accessToken, authClient, clearStoredSession, refreshToken]);

  const value = useMemo<AuthStateContextValue>(() => ({
    accessToken,
    activateSchool: activateCurrentSchool,
    allowedSchools,
    clearError: () => {
      setError(null);
      setSchoolActivationError(null);
    },
    currentUser,
    error,
    logout: logoutCurrentUser,
    refreshCurrentUser,
    registerSession,
    schoolActivationError,
    status,
  }), [
    accessToken,
    activateCurrentSchool,
    allowedSchools,
    currentUser,
    error,
    logoutCurrentUser,
    refreshCurrentUser,
    registerSession,
    schoolActivationError,
    status,
  ]);

  return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>;
}

export function useAuthState() {
  const context = useContext(AuthStateContext);
  if (!context) {
    throw new Error('useAuthState must be used inside AuthStateProvider.');
  }
  return context;
}
