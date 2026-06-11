import { RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { AiPageHeader } from "../components/AiPageHeader";
import { AiRecommendationCard } from "../components/AiRecommendationCard";
import { useAiRecommendations } from "../hooks/useAiRecommendations";
import type { AiRecommendation, RecommendationAction } from "../types/ai.types";

function unique(values: Array<string | undefined>) {
  return Array.from(new Set(values.filter(Boolean) as string[])).sort();
}

function groupByPriority(recommendations: AiRecommendation[]) {
  return recommendations.reduce<Record<string, AiRecommendation[]>>((groups, recommendation) => {
    const priority = recommendation.riskLevel || "LOW";
    groups[priority] = groups[priority] || [];
    groups[priority].push(recommendation);
    return groups;
  }, {});
}

export function AiRecommendationsPage() {
  const { recommendations, loading, error, reload, updateRecommendation, demoMode } = useAiRecommendations();
  const [priority, setPriority] = useState("ALL");
  const [category, setCategory] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      recommendations.filter((recommendation) => {
        return (
          (priority === "ALL" || recommendation.riskLevel === priority) &&
          (category === "ALL" || recommendation.recommendationType === category) &&
          (status === "ALL" || recommendation.status === status)
        );
      }),
    [category, priority, recommendations, status]
  );

  const priorities = unique(recommendations.map((item) => item.riskLevel));
  const categories = unique(recommendations.map((item) => item.recommendationType));
  const statuses = unique(recommendations.map((item) => item.status));
  const grouped = groupByPriority(filtered);

  async function onAction(id: string, action: RecommendationAction) {
    setBusyId(id);
    setActionError(null);
    try {
      await updateRecommendation(id, action);
    } catch (updateError) {
      setActionError(updateError instanceof Error ? updateError.message : "Unable to update recommendation.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="page-stack">
      <AiPageHeader
        title="AI recommendations"
        description="Review AI suggestions grouped by priority, with server-authorized actions for approval, dismissal, and completion."
      >
        <button className="icon-button" type="button" onClick={() => void reload()}>
          <RefreshCw size={16} aria-hidden="true" />
          <span>Refresh</span>
        </button>
      </AiPageHeader>

      <section className="filter-bar" aria-label="Recommendation filters">
        <label className="field field--compact">
          <span>Priority</span>
          <select value={priority} onChange={(event) => setPriority(event.target.value)}>
            <option value="ALL">All priorities</option>
            {priorities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--compact">
          <span>Category</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="ALL">All categories</option>
            {categories.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <label className="field field--compact">
          <span>Status</span>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="ALL">All statuses</option>
            {statuses.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
      </section>

      {error ? <div className="inline-error">{error}</div> : null}
      {actionError ? <div className="inline-error">{actionError}</div> : null}

      {loading ? (
        <div className="recommendation-grid">
          <div className="skeleton skeleton--card" />
          <div className="skeleton skeleton--card" />
          <div className="skeleton skeleton--card" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <strong>No recommendations match these filters.</strong>
          <span>Try another priority, category, or status.</span>
        </div>
      ) : (
        Object.entries(grouped).map(([group, rows]) => (
          <section className="recommendation-group" key={group}>
            <div className="section-heading">
              <div>
                <h2>{group} priority</h2>
                <p>{rows.length} recommendation{rows.length === 1 ? "" : "s"}</p>
              </div>
            </div>
            <div className="recommendation-grid">
              {rows.map((recommendation) => (
                <AiRecommendationCard
                  key={recommendation.recommendationId}
                  recommendation={recommendation}
                  busy={busyId === recommendation.recommendationId}
                  demoMode={demoMode}
                  onAction={onAction}
                />
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
