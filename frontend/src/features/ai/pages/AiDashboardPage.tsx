import { ArrowRight, BarChart3, BookOpenCheck, FileQuestion, Lightbulb, Megaphone, NotebookPen } from "lucide-react";
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

export function AiDashboardPage() {
  const { role, authenticated, currentUser } = useAuth();
  const { recommendations, loading } = useAiRecommendations();
  const quickActions = navigationForRole(role).filter((item) =>
    ["notice", "homework", "lessonPlan", "quiz", "reportSummary", "recommendations"].includes(item.key)
  );

  return (
    <div className="page-stack">
      <AiPageHeader
        title="AI workspace"
        description="A role-aware assistant surface for school operations, teaching, finance, parent support, and safe student learning."
      >
        <span className={authenticated ? "status-pill status-pill--success" : "status-pill status-pill--demo"}>
          {authenticated ? "Backend connected" : "Demo mode"}
        </span>
      </AiPageHeader>

      <section className="welcome-band">
        <div>
          <p className="eyebrow">{role.replaceAll("_", " ")}</p>
          <h2>{currentUser ? `Welcome, ${currentUser.displayName}` : "Preview the CloudCampus AI experience"}</h2>
          <p>
            {authenticated
              ? "Your AI pages use the signed-in backend session. Tenant and school scope stay server-side."
              : "Use the role preview and sample prompts, then sign in to fetch real tenant-scoped AI data."}
          </p>
        </div>
        <AiDisclaimer />
      </section>

      <section className="dashboard-section">
        <div className="section-heading">
          <div>
            <h2>Role-specific prompts</h2>
            <p>Start with common questions for this role.</p>
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
            <p>Focused workflows for generating and reviewing school-ready drafts.</p>
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
            <p>Priority-ranked suggestions from the backend recommendation workflow.</p>
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
