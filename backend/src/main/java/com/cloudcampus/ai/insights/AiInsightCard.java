package com.cloudcampus.ai.insights;

import java.util.List;
import java.util.Map;

public record AiInsightCard(
        String key,
        AiInsightAudience audience,
        String title,
        String summary,
        String recommendation,
        AiInsightSeverity severity,
        int confidence,
        List<String> signals,
        Map<String, Object> metadata
) {
    public AiInsightCard {
        if (key == null || key.isBlank()) {
            throw new IllegalArgumentException("AI insight key is required");
        }
        if (title == null || title.isBlank()) {
            throw new IllegalArgumentException("AI insight title is required");
        }
        if (summary == null || summary.isBlank()) {
            throw new IllegalArgumentException("AI insight summary is required");
        }
        if (recommendation == null || recommendation.isBlank()) {
            throw new IllegalArgumentException("AI insight recommendation is required");
        }
        confidence = Math.max(0, Math.min(100, confidence));
        severity = severity == null ? AiInsightSeverity.INFO : severity;
        signals = signals == null ? List.of() : List.copyOf(signals);
        metadata = metadata == null ? Map.of() : Map.copyOf(metadata);
    }
}
