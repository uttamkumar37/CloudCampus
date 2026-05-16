package com.cloudcampus.ai.prompt.dto;

import java.util.Map;
import java.util.UUID;

public record PromptRenderRequest(
        Map<String, Object> variables,   // variable name → value for template substitution
        UUID                tenantId     // tenant context for usage logging (nullable in test)
) {}
