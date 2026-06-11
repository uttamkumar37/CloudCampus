package com.cloudcampus.intelligence.ai;

import java.util.List;

public record AiProviderRequest(
        AiFeature feature,
        String requestType,
        String role,
        String tone,
        String language,
        String prompt,
        List<String> contextFacts,
        List<String> guardrails
) {
}
