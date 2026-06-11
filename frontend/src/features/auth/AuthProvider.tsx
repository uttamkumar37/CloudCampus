import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { ApiError, apiBaseUrl, apiRequest } from "../../lib/http";
import type { AuthSessionResponse, CurrentUser, StoredSession, UserRole } from "./auth.types";

type AuthContextValue = {
  session: StoredSession | null;
  currentUser: CurrentUser | null;
  accessToken: string | null;
  authenticated: boolean;
  role: UserRole;
  previewRole: UserRole;
  apiBase: string;
  setPreviewRole: (role: UserRole) => void;
  login: (email: string, password: string) => Promise<AuthSessionResponse>;
  verifyMfa: (challengeId: string, code: string) => Promise<void>;
  logout: () => void;
  refreshCurrentUser: () => Promise<void>;
  activateSchool: (schoolId: string) => Promise<void>;
};

type AuthState = {
  session: StoredSession | null;
  sessionValidated: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_STORAGE_KEY = "cloudcampus.ai.session";
const ROLE_STORAGE_KEY = "cloudcampus.ai.previewRole";
const EXPIRY_SKEW_MS = 30_000;

function isExpired(expiresAt: string | null) {
  if (!expiresAt) {
    return false;
  }
  const expiresAtMs = Date.parse(expiresAt);
  return Number.isNaN(expiresAtMs) || expiresAtMs <= Date.now() + EXPIRY_SKEW_MS;
}

function readStoredSession(): StoredSession | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as StoredSession;
    if (isExpired(parsed.expiresAt)) {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
    return parsed.accessToken ? parsed : null;
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function readStoredRole(): UserRole {
  const role = localStorage.getItem(ROLE_STORAGE_KEY) as UserRole | null;
  return role || "SCHOOL_ADMIN";
}

function readInitialAuthState(): AuthState {
  const session = readStoredSession();
  return {
    session,
    sessionValidated: !session
  };
}

function toStoredSession(response: AuthSessionResponse): StoredSession {
  if (!response.accessToken) {
    throw new Error("Login did not return an access token.");
  }
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    expiresAt: response.expiresAt,
    user: response.user
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(() => readInitialAuthState());
  const [previewRole, setPreviewRoleState] = useState<UserRole>(() => readStoredRole());
  const { session, sessionValidated } = authState;

  const persistSession = useCallback((nextSession: StoredSession | null) => {
    setAuthState({
      session: nextSession,
      sessionValidated: true
    });
    if (nextSession) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(nextSession));
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    }
  }, []);

  const setPreviewRole = useCallback((role: UserRole) => {
    setPreviewRoleState(role);
    localStorage.setItem(ROLE_STORAGE_KEY, role);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await apiRequest<AuthSessionResponse>("/v1/auth/login", {
        method: "POST",
        body: { email, password }
      });
      if (response.mfaRequired) {
        return response;
      }
      const nextSession = toStoredSession(response);
      persistSession(nextSession);
      if (nextSession.user?.role) {
        setPreviewRole(nextSession.user.role);
      }
      return response;
    },
    [persistSession, setPreviewRole]
  );

  const verifyMfa = useCallback(
    async (challengeId: string, code: string) => {
      const response = await apiRequest<AuthSessionResponse>("/v1/auth/mfa/verify", {
        method: "POST",
        body: { challengeId, code }
      });
      const nextSession = toStoredSession(response);
      persistSession(nextSession);
      if (nextSession.user?.role) {
        setPreviewRole(nextSession.user.role);
      }
    },
    [persistSession, setPreviewRole]
  );

  const refreshCurrentUser = useCallback(async () => {
    if (!session?.accessToken) {
      return;
    }
    try {
      const user = await apiRequest<CurrentUser>("/v1/me", {
        token: session.accessToken
      });
      persistSession({ ...session, user });
      setPreviewRole(user.role);
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        persistSession(null);
      }
      throw error;
    }
  }, [persistSession, session, setPreviewRole]);

  const activateSchool = useCallback(
    async (schoolId: string) => {
      if (!session?.accessToken) {
        return;
      }
      const response = await apiRequest<AuthSessionResponse>(`/v1/me/schools/${schoolId}/activate`, {
        method: "POST",
        token: session.accessToken
      });
      const nextSession = toStoredSession(response);
      persistSession(nextSession);
      if (nextSession.user?.role) {
        setPreviewRole(nextSession.user.role);
      }
    },
    [persistSession, session, setPreviewRole]
  );

  const logout = useCallback(() => {
    persistSession(null);
  }, [persistSession]);

  useEffect(() => {
    const accessToken = session?.accessToken;
    if (!accessToken) {
      return;
    }
    let cancelled = false;
    void apiRequest<CurrentUser>("/v1/me", { token: accessToken })
      .then((user) => {
        if (cancelled) {
          return;
        }
        persistSession({ ...session, user });
        setPreviewRole(user.role);
      })
      .catch(() => {
        if (!cancelled) {
          persistSession(null);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [session?.accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      currentUser: sessionValidated ? session?.user || null : null,
      accessToken: sessionValidated ? session?.accessToken || null : null,
      authenticated: Boolean(sessionValidated && session?.accessToken),
      role: sessionValidated ? session?.user?.role || previewRole : previewRole,
      previewRole,
      apiBase: apiBaseUrl || "same-origin / Vite proxy",
      setPreviewRole,
      login,
      verifyMfa,
      logout,
      refreshCurrentUser,
      activateSchool
    }),
    [activateSchool, login, logout, previewRole, refreshCurrentUser, session, sessionValidated, setPreviewRole, verifyMfa]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
