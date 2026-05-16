package com.cloudcampus.ai.knowledge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RagQueryRequest(
        @NotBlank @Size(max = 1000) String question
) {}
