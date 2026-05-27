package com.cloudcampus.intelligence.ai;

import java.util.List;

import com.cloudcampus.identity.auth.UserRole;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AiKnowledgeDocumentRequest(
        @NotBlank @Size(max = 180) String title,
        @NotNull AiFeature category,
        @NotBlank @Size(max = 12000) String content,
        @Size(max = 8) List<UserRole> visibleToRoles
) {
}
