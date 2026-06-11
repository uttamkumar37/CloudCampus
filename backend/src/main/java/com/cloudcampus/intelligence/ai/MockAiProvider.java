package com.cloudcampus.intelligence.ai;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MockAiProvider implements AiProvider {

    private final String model;

    public MockAiProvider(@Value("${cloudcampus.ai.model:mock-school-helper}") String model) {
        this.model = model == null || model.isBlank() ? "mock-school-helper" : model;
    }

    @Override
    public AiProviderResponse generate(AiProviderRequest request) {
        List<String> highlights = highlights(request);
        List<String> actions = actions(request);
        String answer = answer(request);
        long outputUnits = Math.max(60, answer.length() / 4L + highlights.size() * 8L + actions.size() * 8L);
        return new AiProviderResponse("mock", model, answer, highlights, actions, outputUnits);
    }

    private String answer(AiProviderRequest request) {
        return switch (request.feature()) {
            case NOTICE_DRAFTING -> "Draft notice prepared in a " + tone(request)
                    + " tone for " + language(request) + ". Review audience, date, and final wording before publishing.";
            case HOMEWORK_DRAFTING -> "Homework draft prepared with a learning objective, practice tasks, and a clear submission expectation.";
            case LESSON_PLAN_DRAFTING -> "Lesson plan prepared with outcomes, warm-up, explanation, guided practice, and an exit check.";
            case QUIZ_DRAFTING -> "Quiz draft prepared with mixed difficulty questions and a teacher-review note for the answer key.";
            case REPORT_SUMMARY, REPORT_EXPLANATION -> "Report summary prepared with highlights, risks, and recommended actions in plain language.";
            case STUDY_PLAN_DRAFTING -> "Study plan prepared with short daily sessions, weak-topic practice, revision, and encouragement.";
            case PARENT_PROGRESS_SUMMARY -> "Parent progress summary prepared with attendance, homework, performance, and meeting discussion points.";
            case FINANCE_SUMMARY -> "Finance summary prepared with fee due patterns, follow-up priority, and polite reminder guidance.";
            case ASSISTANT_QUERY -> "I reviewed your role and active scope, then prepared a safe next-step answer using only allowed actions.";
            default -> "AI draft prepared for review. Verify details before using it with students, parents, or staff.";
        };
    }

    private List<String> highlights(AiProviderRequest request) {
        List<String> rows = new ArrayList<>();
        rows.add("Role: " + request.role());
        rows.add("Feature: " + request.feature().name());
        if (request.contextFacts() != null) {
            request.contextFacts().stream().limit(2).forEach(rows::add);
        }
        if (request.prompt() != null && !request.prompt().isBlank()) {
            rows.add("Prompt understood: " + abbreviate(request.prompt(), 120));
        }
        return rows.stream().limit(5).toList();
    }

    private List<String> actions(AiProviderRequest request) {
        return switch (request.feature()) {
            case NOTICE_DRAFTING -> List.of("Review names, dates, and audience.", "Publish or copy only after approval.");
            case HOMEWORK_DRAFTING -> List.of("Check class level and due date.", "Adjust difficulty before assigning.");
            case LESSON_PLAN_DRAFTING -> List.of("Match activities to available class time.", "Add textbook references if needed.");
            case QUIZ_DRAFTING -> List.of("Review the answer key before sharing.", "Keep assessed questions teacher-approved.");
            case REPORT_SUMMARY -> List.of("Verify source report numbers.", "Follow up on high-risk items first.");
            case STUDY_PLAN_DRAFTING -> List.of("Study in short focused blocks.", "Ask a teacher when a concept remains unclear.");
            case PARENT_PROGRESS_SUMMARY -> List.of("Discuss strengths first.", "Ask the teacher for one concrete next step.");
            case FINANCE_SUMMARY -> List.of("Prioritize overdue high-value dues.", "Avoid sensitive payment details in reminders.");
            default -> List.of("Review before use.", "Use only actions allowed for this role.");
        };
    }

    private String tone(AiProviderRequest request) {
        return request.tone() == null || request.tone().isBlank() ? "clear" : request.tone().trim();
    }

    private String language(AiProviderRequest request) {
        return request.language() == null || request.language().isBlank() ? "English" : request.language().trim();
    }

    private String abbreviate(String value, int maxLength) {
        String trimmed = value.trim().replaceAll("\\s+", " ");
        if (trimmed.length() <= maxLength) {
            return trimmed;
        }
        return trimmed.substring(0, maxLength - 3) + "...";
    }
}
