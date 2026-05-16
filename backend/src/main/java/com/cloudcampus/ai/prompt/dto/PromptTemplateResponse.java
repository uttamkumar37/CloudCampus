package com.cloudcampus.ai.prompt.dto;

import com.cloudcampus.ai.prompt.entity.AiPromptTemplate;

import java.time.Instant;
import java.util.UUID;

public record PromptTemplateResponse(
        UUID    id,
        String  promptKey,
        String  name,
        String  description,
        String  template,
        String  variables,
        int     version,
        boolean active,
        UUID    createdBy,
        Instant createdAt,
        Instant updatedAt
) {
    public static PromptTemplateResponse from(AiPromptTemplate t) {
        return new PromptTemplateResponse(
                t.getId(), t.getPromptKey(), t.getName(), t.getDescription(),
                t.getTemplate(), t.getVariables(), t.getVersion(), t.isActive(),
                t.getCreatedBy(), t.getCreatedAt(), t.getUpdatedAt()
        );
    }
}
