import { CheckCircle2, Eye, Play, ThumbsUp, XCircle } from "lucide-react";
import type { AiRecommendation, RecommendationAction } from "../types/ai.types";

type AiRecommendationCardProps = {
  recommendation: AiRecommendation;
  onAction: (id: string, action: RecommendationAction) => Promise<void>;
  busy?: boolean;
  demoMode?: boolean;
};

function formatDate(value?: string) {
  if (!value) {
    return "No date";
  }
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function priorityClass(priority?: string) {
  const normalized = (priority || "LOW").toLowerCase();
  return `priority-badge priority-badge--${normalized}`;
}

export function AiRecommendationCard({ recommendation, onAction, busy, demoMode }: AiRecommendationCardProps) {
  const status = recommendation.status || "NEW";
  const isApproved = status === "APPROVED";
  const isClosed = ["EXECUTED", "REJECTED", "CANCELLED", "FAILED", "EXPIRED"].includes(status);

  return (
    <article className="recommendation-card">
      <div className="recommendation-card__top">
        <span className={priorityClass(recommendation.riskLevel)}>{recommendation.riskLevel || "LOW"}</span>
        <span className="status-pill">{status.replaceAll("_", " ")}</span>
      </div>

      <h3>{recommendation.title}</h3>
      <p>{recommendation.summary || "No description was provided."}</p>

      <dl className="recommendation-card__details">
        <div>
          <dt>Category</dt>
          <dd>{(recommendation.recommendationType || "GENERAL").replaceAll("_", " ")}</dd>
        </div>
        <div>
          <dt>Suggested action</dt>
          <dd>{recommendation.rationale || "Review the recommendation and choose a safe next step."}</dd>
        </div>
        <div>
          <dt>Created</dt>
          <dd>{formatDate(recommendation.createdAt)}</dd>
        </div>
      </dl>

      <div className="recommendation-card__actions">
        <button className="icon-button" type="button" onClick={() => onAction(recommendation.recommendationId, "viewed")} disabled={busy}>
          <Eye size={16} aria-hidden="true" />
          <span>Viewed</span>
        </button>
        <button
          className="icon-button"
          type="button"
          onClick={() => onAction(recommendation.recommendationId, recommendation.approvalRequired ? "approve" : "accept")}
          disabled={busy || isClosed}
        >
          <ThumbsUp size={16} aria-hidden="true" />
          <span>{recommendation.approvalRequired ? "Approve" : "Accept"}</span>
        </button>
        <button
          className="icon-button"
          type="button"
          onClick={() => onAction(recommendation.recommendationId, "execute")}
          disabled={busy || !isApproved}
          title={isApproved ? "Mark completed by executing the approved recommendation" : "Backend requires approval before completion"}
        >
          <Play size={16} aria-hidden="true" />
          <span>Completed</span>
        </button>
        <button className="icon-button" type="button" onClick={() => onAction(recommendation.recommendationId, "dismiss")} disabled={busy || isClosed}>
          <XCircle size={16} aria-hidden="true" />
          <span>Dismiss</span>
        </button>
      </div>

      {demoMode ? (
        <div className="pending-label">
          <CheckCircle2 size={14} aria-hidden="true" />
          Demo mode uses local sample recommendations.
        </div>
      ) : null}
    </article>
  );
}
