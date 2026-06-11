package com.cloudcampus.intelligence.ai;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;

import com.cloudcampus.common.context.RequestContext;

import org.springframework.stereotype.Component;

@Component
public class AiFeatureCatalog {

    private static final Set<String> SCHOOL_SCOPED_ROLES = Set.of(
            "SCHOOL_ADMIN",
            "PRINCIPAL",
            "TEACHER",
            "STUDENT",
            "PARENT",
            "FINANCE_STAFF",
            "OFFICE_STAFF",
            "STAFF"
    );

    public boolean isAllowed(RequestContext context, AiFeature feature) {
        if (hasAnyRole(context, "GUEST", "SYSTEM", "AI_AGENT")) {
            return false;
        }
        return switch (feature) {
            case ASSISTANT_QUERY -> hasAnyPortalRole(context);
            case NOTICE_DRAFTING, NOTICE_TRANSLATION, ADMISSION_ENQUIRY_ASSISTANT ->
                    hasAnyRole(context, "TENANT_ADMIN", "SCHOOL_ADMIN", "PRINCIPAL", "TEACHER", "FINANCE_STAFF", "OFFICE_STAFF", "STAFF");
            case HOMEWORK_DRAFTING, LESSON_PLAN_DRAFTING, QUIZ_DRAFTING ->
                    hasAnyRole(context, "SCHOOL_ADMIN", "PRINCIPAL", "TEACHER");
            case REPORT_SUMMARY, REPORT_EXPLANATION ->
                    hasAnyRole(context, "TENANT_ADMIN", "SCHOOL_ADMIN", "PRINCIPAL", "TEACHER", "STUDENT", "PARENT", "FINANCE_STAFF");
            case STUDY_PLAN_DRAFTING ->
                    hasAnyRole(context, "TEACHER", "STUDENT", "PARENT");
            case PARENT_PROGRESS_SUMMARY ->
                    hasAnyRole(context, "SCHOOL_ADMIN", "PRINCIPAL", "TEACHER", "PARENT");
            case FINANCE_SUMMARY ->
                    hasAnyRole(context, "SCHOOL_ADMIN", "PRINCIPAL", "FINANCE_STAFF");
            case SCHOOL_POLICY_QA ->
                    hasAnyRole(context, "TENANT_ADMIN", "SCHOOL_ADMIN", "PRINCIPAL", "TEACHER", "OFFICE_STAFF", "STAFF");
        };
    }

    public boolean requiresActiveSchool(RequestContext context) {
        return context.roles().stream().anyMatch(SCHOOL_SCOPED_ROLES::contains);
    }

    public AiFeature assistantFeature(RequestContext context, String module, String prompt) {
        String selector = ((module == null ? "" : module) + " " + (prompt == null ? "" : prompt)).toLowerCase(Locale.ROOT);
        if (selector.contains("fee") || selector.contains("payment") || selector.contains("finance") || context.hasRole("FINANCE_STAFF")) {
            return AiFeature.FINANCE_SUMMARY;
        }
        if (selector.contains("parent") || selector.contains("child progress") || context.hasRole("PARENT")) {
            return AiFeature.PARENT_PROGRESS_SUMMARY;
        }
        if (selector.contains("study") || selector.contains("revision") || selector.contains("weak topic") || context.hasRole("STUDENT")) {
            return AiFeature.STUDY_PLAN_DRAFTING;
        }
        if (selector.contains("report") || selector.contains("summary") || selector.contains("risk")) {
            return AiFeature.REPORT_SUMMARY;
        }
        return AiFeature.ASSISTANT_QUERY;
    }

    public String primaryRole(RequestContext context) {
        List<String> priority = List.of(
                "TENANT_ADMIN",
                "SCHOOL_ADMIN",
                "PRINCIPAL",
                "TEACHER",
                "STUDENT",
                "PARENT",
                "FINANCE_STAFF",
                "OFFICE_STAFF",
                "STAFF"
        );
        return priority.stream().filter(context::hasRole).findFirst().orElse("USER");
    }

    public List<AiQuickActionResponse> quickActions(RequestContext context, AiFeature feature) {
        if (context.hasRole("TEACHER")) {
            return List.of(
                    new AiQuickActionResponse("Lesson plan", "Generate a lesson plan for Class VI Mathematics on fractions.", "/v1/ai/generate/lesson-plan"),
                    new AiQuickActionResponse("Homework", "Create homework for today's topic.", "/v1/ai/generate/homework"),
                    new AiQuickActionResponse("Quiz", "Create a short quiz with mixed difficulty.", "/v1/ai/generate/quiz")
            );
        }
        if (context.hasRole("STUDENT")) {
            return List.of(
                    new AiQuickActionResponse("Study plan", "Create a study plan for my weak topics.", "/v1/ai/assistant/query"),
                    new AiQuickActionResponse("Explain", "Explain this concept step by step.", "/v1/ai/assistant/query")
            );
        }
        if (context.hasRole("PARENT")) {
            return List.of(
                    new AiQuickActionResponse("Child progress", "Summarize my child's progress and questions for the teacher.", "/v1/ai/assistant/query"),
                    new AiQuickActionResponse("Meeting prep", "Help me prepare for a parent-teacher meeting.", "/v1/ai/assistant/query")
            );
        }
        if (context.hasRole("FINANCE_STAFF")) {
            return List.of(
                    new AiQuickActionResponse("Fee summary", "Summarize fee dues for my active school.", "/v1/ai/assistant/query"),
                    new AiQuickActionResponse("Reminder", "Draft a polite fee reminder.", "/v1/ai/generate/notice")
            );
        }
        if (context.hasRole("TENANT_ADMIN")) {
            return List.of(
                    new AiQuickActionResponse("Tenant health", "Summarize tenant health and low-activity schools.", "/v1/ai/assistant/query"),
                    new AiQuickActionResponse("Onboarding", "Create an onboarding checklist for a new school.", "/v1/ai/assistant/query")
            );
        }
        return List.of(
                new AiQuickActionResponse("Daily summary", "Show today's school summary and risks.", "/v1/ai/assistant/query"),
                new AiQuickActionResponse("Notice", "Draft a parent meeting notice.", "/v1/ai/generate/notice"),
                new AiQuickActionResponse("Report", "Summarize this report in simple language.", "/v1/ai/reports/summary")
        );
    }

    public List<AiRoleCapabilityResponse> capabilities(RequestContext context) {
        String role = primaryRole(context);
        List<String> features = new ArrayList<>();
        for (AiFeature feature : AiFeature.values()) {
            if (isAllowed(context, feature)) {
                features.add(feature.name());
            }
        }
        return List.of(new AiRoleCapabilityResponse(role, features, quickActions(context, AiFeature.ASSISTANT_QUERY)));
    }

    private boolean hasAnyPortalRole(RequestContext context) {
        return hasAnyRole(
                context,
                "TENANT_ADMIN",
                "SCHOOL_ADMIN",
                "PRINCIPAL",
                "TEACHER",
                "STUDENT",
                "PARENT",
                "FINANCE_STAFF",
                "OFFICE_STAFF",
                "STAFF"
        );
    }

    private boolean hasAnyRole(RequestContext context, String... roles) {
        for (String role : roles) {
            if (context.hasRole(role)) {
                return true;
            }
        }
        return false;
    }
}
