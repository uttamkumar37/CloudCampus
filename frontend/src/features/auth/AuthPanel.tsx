import { FormEvent, useState } from "react";
import { KeyRound, LogIn, LogOut, RefreshCw, Server, ShieldCheck, UserRoundCheck } from "lucide-react";
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

const localDemoCredentials = {
  email: "principal@jnv.knp.demo",
  password: "DemoPass123!"
};

export function AuthPanel() {
  const {
    apiBase,
    authenticated,
    currentUser,
    previewRole,
    setPreviewRole,
    login,
    verifyMfa,
    logout,
    refreshCurrentUser,
    activateSchool
  } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaChallenge, setMfaChallenge] = useState<{
    challengeId: string;
    email: string;
    expiresAt: string | null;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageKind, setMessageKind] = useState<"info" | "error">("info");
  const environmentLabel =
    apiBase.includes("127.0.0.1") || apiBase.includes("localhost") || apiBase.includes("same-origin")
      ? "Local demo environment"
      : "Connected workspace";
  const localDemo = environmentLabel === "Local demo environment";

  function fillLocalDemoCredentials() {
    setEmail(localDemoCredentials.email);
    setPassword(localDemoCredentials.password);
    setMessageKind("info");
    setMessage("Demo credentials filled. Sign in to continue.");
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    setMessageKind("info");
    try {
      const response = await login(email, password);
      if (response.mfaRequired && response.mfaChallengeId) {
        setMfaChallenge({
          challengeId: response.mfaChallengeId,
          email,
          expiresAt: response.mfaExpiresAt
        });
        setMfaCode(response.mfaCode || "");
        setMessageKind("info");
        setMessage(response.mfaCode ? "MFA code received from local demo backend." : "Enter your MFA code.");
        return;
      }
      setMfaChallenge(null);
      setMfaCode("");
      setPassword("");
    } catch (error) {
      setMessageKind("error");
      setMessage(error instanceof Error ? error.message : "Unable to sign in.");
    } finally {
      setBusy(false);
    }
  }

  async function onMfaSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!mfaChallenge) {
      return;
    }
    setBusy(true);
    setMessage(null);
    setMessageKind("info");
    try {
      await verifyMfa(mfaChallenge.challengeId, mfaCode);
      setPassword("");
      setMfaCode("");
      setMfaChallenge(null);
    } catch (error) {
      setMessageKind("error");
      setMessage(error instanceof Error ? error.message : "Unable to verify MFA code.");
    } finally {
      setBusy(false);
    }
  }

  async function onSchoolChange(schoolId: string) {
    setBusy(true);
    setMessage(null);
    setMessageKind("info");
    try {
      await activateSchool(schoolId);
    } catch (error) {
      setMessageKind("error");
      setMessage(error instanceof Error ? error.message : "Unable to activate school.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-panel" aria-label="Session">
      <div className="auth-panel__meta">
        <Server size={16} aria-hidden="true" />
        <span>{environmentLabel}</span>
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
      ) : mfaChallenge ? (
        <form className="auth-panel__form" onSubmit={onMfaSubmit}>
          <div className="auth-panel__subtle">MFA required for {mfaChallenge.email}</div>
          <label className="field">
            <span>MFA code</span>
            <input
              value={mfaCode}
              onChange={(event) => setMfaCode(event.target.value)}
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              placeholder="6 digit code"
              autoComplete="one-time-code"
            />
          </label>
          {mfaChallenge.expiresAt ? (
            <div className="auth-panel__subtle">Expires at {new Date(mfaChallenge.expiresAt).toLocaleTimeString()}</div>
          ) : null}
          <button className="primary-button" type="submit" disabled={busy || mfaCode.length !== 6}>
            <KeyRound size={16} aria-hidden="true" />
            <span>{busy ? "Verifying" : "Verify MFA"}</span>
          </button>
          <button
            className="secondary-button"
            type="button"
            onClick={() => {
              setMfaChallenge(null);
              setMfaCode("");
              setMessage(null);
              setMessageKind("info");
            }}
            disabled={busy}
          >
            Use another account
          </button>
        </form>
      ) : (
        <form className="auth-panel__form" onSubmit={onSubmit}>
          {localDemo ? (
            <button className="demo-fill-button" type="button" onClick={fillLocalDemoCredentials}>
              <UserRoundCheck size={16} aria-hidden="true" />
              <span>Use demo login</span>
            </button>
          ) : null}
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
        Role preview changes sample content only. Sign in to use your assigned CloudCampus access.
      </p>

      {message ? (
        <div aria-live="polite" className={messageKind === "error" ? "inline-error" : "inline-info"}>
          {message}
        </div>
      ) : null}
    </section>
  );
}
