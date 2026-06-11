package com.cloudcampus.intelligence.ai;

import java.util.List;

public record AiProviderResponse(
        String provider,
        String model,
        String answer,
        List<String> highlights,
        List<String> recommendedActions,
        long estimatedOutputUnits
) {
}
