package com.cloudcampus.intelligence.ai;

import java.util.Locale;
import java.util.regex.Pattern;

import com.cloudcampus.common.context.RequestContext;
import com.cloudcampus.common.exception.BadRequestException;

import org.springframework.stereotype.Component;

@Component
public class AiSafetyService {

    private static final int MAX_PROMPT_LENGTH = 8000;
    private static final Pattern SECRET_PATTERN = Pattern.compile(
            "(?i)(jwt|refresh token|access token|password|mfa code|reset token|api key|private key|smtp password|secret)"
    );
    private static final Pattern CROSS_SCOPE_PATTERN = Pattern.compile(
            "(?i)(another tenant|other tenant|different tenant|another school|other school|bypass scope|ignore tenant)"
    );
    private static final Pattern CHEATING_PATTERN = Pattern.compile(
            "(?i)(cheat|give me the exam answers|answer key for my test|bypass teacher|solve my graded assignment)"
    );

    public String requireSafePrompt(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(fieldName + " is required.");
        }
        String trimmed = value.trim();
        if (trimmed.length() > MAX_PROMPT_LENGTH) {
            throw new BadRequestException(fieldName + " is too long.");
        }
        validateNoSensitiveOrCrossScope(trimmed, fieldName);
        return trimmed;
    }

    public String optionalSafeText(String value, String fieldName, int maxLength) {
        if (value == null || value.isBlank()) {
            return "";
        }
        String trimmed = value.trim();
        if (trimmed.length() > maxLength) {
            throw new BadRequestException(fieldName + " is too long.");
        }
        validateNoSensitiveOrCrossScope(trimmed, fieldName);
        return trimmed;
    }

    public void validateRoleSafety(RequestContext context, String prompt) {
        if (context.hasRole("STUDENT") && CHEATING_PATTERN.matcher(prompt).find()) {
            throw new BadRequestException("Student AI can explain concepts and give practice, but it cannot provide cheating help.");
        }
    }

    public String safeTone(String tone) {
        String value = tone == null || tone.isBlank() ? "clear" : tone.trim().toLowerCase(Locale.ROOT);
        return switch (value) {
            case "formal", "friendly", "short", "detailed", "hindi", "english", "hinglish", "clear" -> value;
            default -> "clear";
        };
    }

    public String safeLanguage(String language) {
        if (language == null || language.isBlank()) {
            return "English";
        }
        return switch (language.trim().toLowerCase(Locale.ROOT)) {
            case "hindi" -> "Hindi";
            case "hinglish" -> "Hinglish";
            default -> "English";
        };
    }

    private void validateNoSensitiveOrCrossScope(String value, String fieldName) {
        if (SECRET_PATTERN.matcher(value).find()) {
            throw new BadRequestException(fieldName + " must not include secrets, passwords, tokens, or credentials.");
        }
        if (CROSS_SCOPE_PATTERN.matcher(value).find()) {
            throw new BadRequestException(fieldName + " cannot request cross-tenant or cross-school access.");
        }
    }
}
