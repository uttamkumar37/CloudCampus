import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  FileQuestion,
  Lightbulb,
  Megaphone,
  NotebookPen,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import { useAuth } from "../../auth/AuthProvider";
import { navigationForRole, quickPromptsByRole } from "../aiConfig";
import { AiDisclaimer } from "../components/AiDisclaimer";
import { AiPageHeader } from "../components/AiPageHeader";
import { AiPromptChips } from "../components/AiPromptChips";
import { useAiRecommendations } from "../hooks/useAiRecommendations";

const actionIconMap = {
  notice: Megaphone,
  homework: NotebookPen,
  lessonPlan: BookOpenCheck,
  quiz: FileQuestion,
  reportSummary: BarChart3,
  recommendations: Lightbulb
};

const trustSignals = [
  {
    label: "Role-aware access",
    icon: ShieldCheck
  },
  {
    label: "Review before use",
    icon: CheckCircle2
  },
  {
    label: "Audit metadata",
    icon: Sparkles
  }
];

export function AiDashboardPage() {
  const { role, authenticated, currentUser } = useAuth();
  const { recommendations, loading } = useAiRecommendations();
  const quickActions = navigationForRole(role).filter((item) =>
    ["notice", "homework", "lessonPlan", "quiz", "reportSummary", "recommendations"].includes(item.key)
  );
  const roleLabel = role.replaceAll("_", " ");
  const recommendationCount = loading ? "..." : recommendations.length.toString();
  const metrics = [
    {
      label: "Session",
      value: authenticated ? "Live" : "Demo",
      detail: authenticated ? "Uses your signed-in CloudCampus role." : "Safe sample data for walkthroughs.",
      icon: CheckCircle2
    },
    {
      label: "AI tools",
      value: quickActions.length.toString(),
      detail: "Available workflows for this role.",
      icon: Sparkles
    },
    {
      label: "Review queue",
      value: recommendationCount,
      detail: "Suggestions waiting for attention.",
      icon: ShieldCheck
    }
  ];

  return (
    <div className="page-stack">
      <AiPageHeader
        title="CloudCampus AI workspace"
        description="Turn daily school work into clear actions, safer drafts, and quick role-aware summaries."
      >
        <span className={authenticated ? "status-pill status-pill--success" : "status-pill status-pill--demo"}>
          {authenticated ? "Live school data" : "Demo mode"}
        </span>
      </AiPageHeader>

      <section className="welcome-band">
        <div>
          <p className="eyebrow">{roleLabel}</p>
          <h2>{currentUser ? `Welcome, ${currentUser.displayName}` : "Preview a smarter school workspace"}</h2>
          <p>
            {authenticated
              ? "Your tools, recommendations, and prompts follow your CloudCampus role and school access."
              : "Switch roles, try safe sample prompts, and sign in when you want to use live school data."}
          </p>
        </div>
        <AiDisclaimer />
      </section>

      <section className="trust-strip" aria-label="AI trust signals">
        {trustSignals.map((signal) => {
          const Icon = signal.icon;
          return (
            <div className="trust-strip__item" key={signal.label}>
              <Icon size={17} aria-hidden="true" />
              <span>{signal.label}</span>
            </div>
          );
        })}
      </section>

      <section className="metric-grid" aria-label="AI workspace summary">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <article className="metric-card" key={metric.label}>
              <div className="metric-card__icon">
                <Icon size={18} aria-hidden="true" />
              </div>
              <div>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
                <p>{metric.detail}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Role-specific prompts</h2>
            <p>Start with the questions this role asks most often.</p>
          </div>
        </div>
        <AiPromptChips
          prompts={quickPromptsByRole[role]}
          onPrompt={(prompt) => {
            window.location.hash = "dashboard";
            window.dispatchEvent(new CustomEvent("cloudcampus:assistant-prompt", { detail: prompt }));
          }}
        />
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>AI actions</h2>
            <p>Focused workflows for reviewing, drafting, and explaining school work.</p>
          </div>
        </div>
        <div className="action-grid">
          {quickActions.map((action) => {
            const Icon = actionIconMap[action.key as keyof typeof actionIconMap] || Lightbulb;
            return (
              <a className="action-card" href={`#${action.key}`} key={action.key}>
                <Icon size={22} aria-hidden="true" />
                <strong>{action.label}</strong>
                <span>{action.description}</span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Recent recommendations</h2>
            <p>Priority-ranked suggestions for the next useful follow-up.</p>
          </div>
          <a className="text-link" href="#recommendations">
            View all
          </a>
        </div>
        {loading ? (
          <div className="recommendation-row">
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
          </div>
        ) : recommendations.length ? (
          <div className="recommendation-row">
            {recommendations.slice(0, 3).map((recommendation) => (
              <article className="mini-card" key={recommendation.recommendationId}>
                <span className="priority-badge">{recommendation.riskLevel || "LOW"}</span>
                <h3>{recommendation.title}</h3>
                <p>{recommendation.summary}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <strong>No AI recommendations yet.</strong>
            <span>Once the backend creates recommendations, they will appear here.</span>
          </div>
        )}
      </section>
    </div>
  );
}
