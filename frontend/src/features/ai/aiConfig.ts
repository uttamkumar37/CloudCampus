import type { UserRole } from "../auth/auth.types";
import type { AiAssistantResponse, AiRecommendation, RouteKey } from "./types/ai.types";

export type NavigationItem = {
  key: RouteKey;
  label: string;
  description: string;
  icon: string;
  roles: UserRole[];
};

export const allAiRoles: UserRole[] = [
  "SUPER_ADMIN",
  "TENANT_ADMIN",
  "SCHOOL_ADMIN",
  "PRINCIPAL",
  "TEACHER",
  "STUDENT",
  "PARENT",
  "FINANCE_STAFF",
  "OFFICE_STAFF",
  "STAFF",
  "GUEST"
];

export const aiNavigation: NavigationItem[] = [
  {
    key: "dashboard",
    label: "AI Dashboard",
    description: "Role-aware AI workspace",
    icon: "LayoutDashboard",
    roles: allAiRoles
  },
  {
    key: "recommendations",
    label: "Recommendations",
    description: "Priority AI follow-ups",
    icon: "Lightbulb",
    roles: ["SUPER_ADMIN", "TENANT_ADMIN", "SCHOOL_ADMIN", "PRINCIPAL", "TEACHER", "FINANCE_STAFF", "OFFICE_STAFF", "STAFF"]
  },
  {
    key: "notice",
    label: "Notice Generator",
    description: "Parent and school messages",
    icon: "Megaphone",
    roles: ["SCHOOL_ADMIN", "PRINCIPAL", "TEACHER", "FINANCE_STAFF", "OFFICE_STAFF", "STAFF"]
  },
  {
    key: "homework",
    label: "Homework",
    description: "Teacher-reviewed drafts",
    icon: "NotebookPen",
    roles: ["SCHOOL_ADMIN", "PRINCIPAL", "TEACHER"]
  },
  {
    key: "lessonPlan",
    label: "Lesson Plan",
    description: "Classroom planning",
    icon: "BookOpenCheck",
    roles: ["SCHOOL_ADMIN", "PRINCIPAL", "TEACHER"]
  },
  {
    key: "quiz",
    label: "Quiz",
    description: "Practice questions",
    icon: "FileQuestion",
    roles: ["SCHOOL_ADMIN", "PRINCIPAL", "TEACHER"]
  },
  {
    key: "reportSummary",
    label: "Report Summary",
    description: "Plain-language insight",
    icon: "ChartNoAxesCombined",
    roles: ["SUPER_ADMIN", "TENANT_ADMIN", "SCHOOL_ADMIN", "PRINCIPAL", "TEACHER", "PARENT", "FINANCE_STAFF", "STAFF"]
  },
  {
    key: "settings",
    label: "Settings",
    description: "Entitlement and controls",
    icon: "Settings",
    roles: ["SUPER_ADMIN", "TENANT_ADMIN", "SCHOOL_ADMIN", "PRINCIPAL"]
  },
  {
    key: "audit",
    label: "Audit Logs",
    description: "Safe usage metadata",
    icon: "ShieldCheck",
    roles: ["SUPER_ADMIN", "TENANT_ADMIN", "SCHOOL_ADMIN", "PRINCIPAL"]
  }
];

export const quickPromptsByRole: Record<UserRole, string[]> = {
  SUPER_ADMIN: [
    "Show tenant health summary",
    "Identify low activity schools",
    "Summarize AI usage",
    "Suggest renewal follow-ups"
  ],
  TENANT_ADMIN: [
    "Show tenant school health",
    "Find schools needing follow-up",
    "Summarize subscription usage",
    "Draft onboarding reminders"
  ],
  SCHOOL_ADMIN: [
    "Show today's school summary",
    "Find attendance risks",
    "Summarize fee dues",
    "Draft parent meeting notice"
  ],
  PRINCIPAL: [
    "Show today's school summary",
    "Find attendance risks",
    "Summarize weak classes",
    "Draft parent meeting notice"
  ],
  TEACHER: [
    "Generate homework",
    "Create lesson plan",
    "Generate quiz",
    "Summarize weak students",
    "Draft parent message"
  ],
  STUDENT: ["Explain homework", "Create study plan", "Practice weak topics", "Revise chapter"],
  PARENT: [
    "Summarize child progress",
    "Explain attendance",
    "Prepare for parent-teacher meeting",
    "Suggest improvement plan"
  ],
  FINANCE_STAFF: ["Summarize fee dues", "Draft fee reminder", "Show collection insight"],
  OFFICE_STAFF: ["Draft parent response", "Summarize admission follow-ups", "Prepare daily office notes"],
  STAFF: ["Draft parent response", "Summarize school follow-ups", "Prepare daily office notes"],
  GUEST: ["Show sample AI demo prompts", "Explain how CloudCampus AI works", "Show a safe school demo flow"]
};

export function navigationForRole(role: UserRole) {
  return aiNavigation.filter((item) => item.roles.includes(role));
}

export function reviewDisclaimer(role: UserRole) {
  if (role === "STUDENT") {
    return "Use this as learning help. Ask your teacher if you are unsure.";
  }
  return "AI-generated content may be inaccurate. Please review before using.";
}

export function demoAssistantResponse(role: UserRole, prompt: string): AiAssistantResponse {
  return {
    feature: "DEMO_ASSISTANT",
    role,
    answer:
      role === "STUDENT"
        ? `Here is a learning-friendly plan for: ${prompt}. Start with the concept, try two practice questions, and ask your teacher if a step feels unclear.`
        : `Here is a safe demo response for: ${prompt}. Connect a real CloudCampus token to fetch tenant-aware data from the backend AI service.`,
    highlights: [
      "Role-aware examples are available without sending tenant or school context from the browser.",
      "Real responses require a bearer token and are authorized by the backend.",
      "Prompt and response content is not shown in audit logs."
    ],
    recommendedActions: [
      "Sign in with a local demo user.",
      "Choose an active school when your role is school-scoped.",
      "Review generated content before sending or publishing."
    ],
    quickActions: quickPromptsByRole[role].slice(0, 3).map((label) => ({ label, prompt: label })),
    disclaimer: reviewDisclaimer(role),
    provider: "demo",
    model: "frontend-sample"
  };
}

export const sampleRecommendations: AiRecommendation[] = [
  {
    recommendationId: "sample-attendance-risk",
    title: "Attendance risk rising in Class VI",
    summary: "Three students have repeated absences this week and may need parent follow-up.",
    rationale: "Attendance and class-level trends suggest early intervention.",
    recommendationType: "STUDENT_RISK_ATTENDANCE",
    riskLevel: "HIGH",
    status: "PENDING_REVIEW",
    confidenceScore: 0.86,
    approvalRequired: true,
    createdAt: new Date().toISOString()
  },
  {
    recommendationId: "sample-fee-reminder",
    title: "Fee reminder batch ready",
    summary: "A polite reminder can be sent to families with overdue May dues.",
    rationale: "Finance staff should review before sending.",
    recommendationType: "FEE_REMINDER_SUGGESTION",
    riskLevel: "MEDIUM",
    status: "APPROVED",
    confidenceScore: 0.79,
    approvalRequired: false,
    createdAt: new Date().toISOString()
  },
  {
    recommendationId: "sample-lesson-plan",
    title: "Fractions lesson plan suggested",
    summary: "Teacher can use a 40 minute plan with recap, activity, and exit ticket.",
    rationale: "Matches the upcoming chapter and weak-topic signal.",
    recommendationType: "LESSON_PLAN_SUGGESTION",
    riskLevel: "LOW",
    status: "DRAFT",
    confidenceScore: 0.72,
    approvalRequired: false,
    createdAt: new Date().toISOString()
  }
];
