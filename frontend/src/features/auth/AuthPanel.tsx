import { FormEvent, useState } from "react";
import { LogIn, LogOut, RefreshCw, Server, ShieldCheck } from "lucide-react";
import { useAuth } from "./AuthProvider";
import type { UserRole } from "./auth.types";

const roles: UserRole[] = [
  "SUPER_ADMIN",
  "TENANT_ADMIN",
  "SCHOOL_ADMIN",
  "PRINCIPAL",
  "TEACHER",
  "STUDENT",
  "PARENT",
  "FINANCE_STAFF",
  "OFFICE_STAFF",
  "GUEST"
];

export function AuthPanel() {
  const {
    apiBase,
    authenticated,
    currentUser,
    previewRole,
    setPreviewRole,
    login,
    logout,
    refreshCurrentUser,
    activateSchool
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await login(email, password);
      setPassword("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function onSchoolChange(schoolId: string) {
    setBusy(true);
    setMessage(null);
    try {
      await activateSchool(schoolId);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to activate school.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-panel" aria-label="Session">
      <div className="auth-panel__meta">
        <Server size={16} aria-hidden="true" />
        <span>{apiBase}</span>
      </div>

      {authenticated && currentUser ? (
        <div className="auth-panel__signed-in">
          <div>
            <div className="auth-panel__name">{currentUser.displayName}</div>
            <div className="auth-panel__subtle">{currentUser.role.replaceAll("_", " ")}</div>
          </div>
          {currentUser.allowedSchools?.length > 0 ? (
            <label className="field field--compact">
              <span>Active school</span>
              <select
                value={currentUser.activeSchool?.schoolId || ""}
                onChange={(event) => void onSchoolChange(event.target.value)}
                disabled={busy}
              >
                <option value="">No active school</option>
                {currentUser.allowedSchools.map((school) => (
                  <option key={school.schoolId} value={school.schoolId}>
                    {school.name}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          <div className="auth-panel__actions">
            <button className="icon-button" type="button" onClick={() => void refreshCurrentUser()} disabled={busy}>
              <RefreshCw size={16} aria-hidden="true" />
              <span>Refresh</span>
            </button>
            <button className="icon-button" type="button" onClick={logout}>
              <LogOut size={16} aria-hidden="true" />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      ) : (
        <form className="auth-panel__form" onSubmit={onSubmit}>
          <label className="field">
            <span>Email</span>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="user@school.edu"
              autoComplete="username"
            />
          </label>
          <label className="field">
            <span>Password</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Password"
              autoComplete="current-password"
            />
          </label>
          <button className="primary-button" type="submit" disabled={busy || !email || !password}>
            <LogIn size={16} aria-hidden="true" />
            <span>{busy ? "Signing in" : "Sign in"}</span>
          </button>
        </form>
      )}

      <label className="field field--compact">
        <span>Demo role preview</span>
        <select value={previewRole} onChange={(event) => setPreviewRole(event.target.value as UserRole)}>
          {roles.map((role) => (
            <option key={role} value={role}>
              {role.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </label>

      <p className="auth-panel__note">
        <ShieldCheck size={15} aria-hidden="true" />
        Role preview changes only the UI examples. Backend authorization comes from the bearer token.
      </p>

      {message ? <div className="inline-error">{message}</div> : null}
    </section>
  );
}
