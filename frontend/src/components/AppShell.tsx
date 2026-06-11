import {
  BarChart3,
  BookOpenCheck,
  Bot,
  ChartNoAxesCombined,
  FileQuestion,
  LayoutDashboard,
  Lightbulb,
  Megaphone,
  Menu,
  NotebookPen,
  Settings,
  ShieldCheck,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ComponentType, useEffect, useMemo, useState } from "react";
import { useAuth } from "../features/auth/AuthProvider";
import { AuthPanel } from "../features/auth/AuthPanel";
import { aiNavigation, navigationForRole } from "../features/ai/aiConfig";
import { AiAssistantButton } from "../features/ai/components/AiAssistantButton";
import { AiAssistantDrawer } from "../features/ai/components/AiAssistantDrawer";
import { AiAuditPage } from "../features/ai/pages/AiAuditPage";
import { AiDashboardPage } from "../features/ai/pages/AiDashboardPage";
import { AiHomeworkGeneratorPage } from "../features/ai/pages/AiHomeworkGeneratorPage";
import { AiLessonPlanGeneratorPage } from "../features/ai/pages/AiLessonPlanGeneratorPage";
import { AiNoticeGeneratorPage } from "../features/ai/pages/AiNoticeGeneratorPage";
import { AiQuizGeneratorPage } from "../features/ai/pages/AiQuizGeneratorPage";
import { AiRecommendationsPage } from "../features/ai/pages/AiRecommendationsPage";
import { AiReportSummaryPage } from "../features/ai/pages/AiReportSummaryPage";
import { AiSettingsPage } from "../features/ai/pages/AiSettingsPage";
import type { RouteKey } from "../features/ai/types/ai.types";

const pages: Record<RouteKey, ComponentType> = {
  dashboard: AiDashboardPage,
  recommendations: AiRecommendationsPage,
  notice: AiNoticeGeneratorPage,
  homework: AiHomeworkGeneratorPage,
  lessonPlan: AiLessonPlanGeneratorPage,
  quiz: AiQuizGeneratorPage,
  reportSummary: AiReportSummaryPage,
  settings: AiSettingsPage,
  audit: AiAuditPage
};

const iconMap: Record<string, LucideIcon> = {
  LayoutDashboard,
  Lightbulb,
  Megaphone,
  NotebookPen,
  BookOpenCheck,
  FileQuestion,
  ChartNoAxesCombined,
  Settings,
  ShieldCheck,
  BarChart3
};

function routeFromHash(): RouteKey {
  const key = window.location.hash.replace("#", "") as RouteKey;
  return pages[key] ? key : "dashboard";
}

export function AppShell() {
  const { role, authenticated, currentUser } = useAuth();
  const [route, setRoute] = useState<RouteKey>(() => routeFromHash());
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navItems = useMemo(() => navigationForRole(role), [role]);

  useEffect(() => {
    function onHashChange() {
      setRoute(routeFromHash());
      setMobileNavOpen(false);
    }
    function onAssistantPrompt() {
      setAssistantOpen(true);
    }
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("cloudcampus:assistant-prompt", onAssistantPrompt);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("cloudcampus:assistant-prompt", onAssistantPrompt);
    };
  }, []);

  const visibleRoute = navItems.some((item) => item.key === route) ? route : "dashboard";
  const CurrentPage = pages[visibleRoute];

  return (
    <div className="app-shell">
      <aside className={mobileNavOpen ? "sidebar sidebar--open" : "sidebar"}>
        <div className="sidebar__brand">
          <div className="brand-mark">CC</div>
          <div>
            <strong>CloudCampus</strong>
            <span>AI workspace</span>
          </div>
          <button className="icon-only sidebar__close" type="button" onClick={() => setMobileNavOpen(false)} aria-label="Close navigation">
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="AI navigation">
          <p>AI</p>
          {navItems.map((item) => {
            const Icon = iconMap[item.icon] || Bot;
            const active = item.key === visibleRoute;
            return (
              <a className={active ? "nav-item nav-item--active" : "nav-item"} href={`#${item.key}`} key={item.key}>
                <Icon size={18} aria-hidden="true" />
                <span>{item.label}</span>
              </a>
            );
          })}
        </nav>

        <AuthPanel />
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="icon-only topbar__menu" type="button" onClick={() => setMobileNavOpen(true)} aria-label="Open navigation">
            <Menu size={20} aria-hidden="true" />
          </button>
          <div>
            <p className="eyebrow">AI-powered school ERP</p>
            <h1>{aiNavigation.find((item) => item.key === visibleRoute)?.label || "AI Dashboard"}</h1>
          </div>
          <div className="topbar__session">
            <span className={authenticated ? "status-pill status-pill--success" : "status-pill status-pill--demo"}>
              {authenticated ? "Signed in" : "Demo"}
            </span>
            <span>{currentUser?.activeSchool?.name || role.replaceAll("_", " ")}</span>
          </div>
        </header>

        <main className="content-area">
          <CurrentPage />
        </main>
      </div>

      <AiAssistantButton onClick={() => setAssistantOpen(true)} />
      <AiAssistantDrawer open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}
