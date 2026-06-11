import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { apiBaseUrl, apiRequest } from "../../lib/http";
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshCurrentUser: () => Promise<void>;
  activateSchool: (schoolId: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const SESSION_STORAGE_KEY = "cloudcampus.ai.session";
const ROLE_STORAGE_KEY = "cloudcampus.ai.previewRole";

function readStoredSession(): StoredSession | null {
  const raw = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as StoredSession;
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
  const [session, setSession] = useState<StoredSession | null>(() => readStoredSession());
  const [previewRole, setPreviewRoleState] = useState<UserRole>(() => readStoredRole());

  const persistSession = useCallback((nextSession: StoredSession | null) => {
    setSession(nextSession);
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
        throw new Error("MFA is required. Use the backend MFA flow before continuing in this UI.");
      }
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
    const user = await apiRequest<CurrentUser>("/v1/me", {
      token: session.accessToken
    });
    persistSession({ ...session, user });
    setPreviewRole(user.role);
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
    if (session?.accessToken && !session.user) {
      void refreshCurrentUser();
    }
  }, [refreshCurrentUser, session]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      currentUser: session?.user || null,
      accessToken: session?.accessToken || null,
      authenticated: Boolean(session?.accessToken),
      role: session?.user?.role || previewRole,
      previewRole,
      apiBase: apiBaseUrl || "same-origin / Vite proxy",
      setPreviewRole,
      login,
      logout,
      refreshCurrentUser,
      activateSchool
    }),
    [activateSchool, login, logout, previewRole, refreshCurrentUser, session, setPreviewRole]
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
