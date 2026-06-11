import { AlertCircle, RefreshCw, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthProvider";
import { AiPageHeader } from "../components/AiPageHeader";
import { getAiSettings } from "../services/aiApi";
import type { AiPortalSettings } from "../types/ai.types";

const sampleSettings: AiPortalSettings = {
  enabled: true,
  monthlyUnitBudget: 50000,
  unitsUsedThisMonth: 1200,
  remainingUnitsThisMonth: 48800,
  enabledFeatures: ["ASSISTANT_QUERY", "NOTICE_DRAFTING", "LESSON_PLAN_DRAFTING", "REPORT_SUMMARY"],
  humanApprovalRequired: true,
  retentionDays: 90,
  capabilities: []
};

export function AiSettingsPage() {
  const { accessToken, role } = useAuth();
  const [settings, setSettings] = useState<AiPortalSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      if (!accessToken || role === "GUEST") {
        setSettings(sampleSettings);
        return;
      }
      setSettings(await getAiSettings(accessToken));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load AI settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [accessToken, role]);

  return (
    <div className="page-stack">
      <AiPageHeader
        title="AI settings"
        description="Review AI availability, usage budget, approval rules, and enabled capabilities."
      >
        <button className="icon-button" type="button" onClick={() => void load()}>
          <RefreshCw size={16} aria-hidden="true" />
          <span>Refresh</span>
        </button>
      </AiPageHeader>

      {error ? <div className="inline-error">{error}</div> : null}

      {loading || !settings ? (
        <section className="settings-grid">
          <div className="skeleton skeleton--card" />
          <div className="skeleton skeleton--card" />
        </section>
      ) : (
        <>
          <section className="settings-grid">
            <article className="settings-card">
              <Settings2 size={22} aria-hidden="true" />
              <h3>Tenant AI</h3>
              <label className="toggle-row">
                <span>AI enabled</span>
                <input checked={settings.enabled} type="checkbox" disabled readOnly />
              </label>
              <label className="toggle-row">
                <span>Human approval required</span>
                <input checked={settings.humanApprovalRequired} type="checkbox" disabled readOnly />
              </label>
              <span className="pending-label">Read-only for this demo.</span>
            </article>
            <article className="settings-card">
              <AlertCircle size={22} aria-hidden="true" />
              <h3>Usage budget</h3>
              <div className="metric-row">
                <span>Used</span>
                <strong>{settings.unitsUsedThisMonth.toLocaleString()}</strong>
              </div>
              <div className="metric-row">
                <span>Remaining</span>
                <strong>{settings.remainingUnitsThisMonth.toLocaleString()}</strong>
              </div>
              <div className="metric-row">
                <span>Monthly budget</span>
                <strong>{settings.monthlyUnitBudget.toLocaleString()}</strong>
              </div>
            </article>
          </section>

          <section className="dashboard-section">
            <div className="section-heading">
              <div>
                <h2>Feature flags</h2>
                <p>Capabilities currently enabled for this workspace.</p>
              </div>
            </div>
            <div className="flag-grid">
              {settings.enabledFeatures.map((feature) => (
                <label className="toggle-row" key={feature}>
                  <span>{feature.replaceAll("_", " ")}</span>
                  <input checked type="checkbox" disabled readOnly />
                </label>
              ))}
            </div>
          </section>

          <section className="dashboard-section">
            <div className="section-heading">
              <div>
                <h2>Role controls</h2>
                <p>Role-level access is visible here and remains controlled by administrators.</p>
              </div>
            </div>
            <div className="flag-grid">
              {["Teachers", "Students", "Parents", "Finance"].map((label) => (
                <label className="toggle-row" key={label}>
                  <span>{label}</span>
                  <input checked={settings.enabled} type="checkbox" disabled readOnly />
                  <em>Read-only</em>
                </label>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
