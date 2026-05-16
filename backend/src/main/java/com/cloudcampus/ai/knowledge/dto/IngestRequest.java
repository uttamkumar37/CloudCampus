package com.cloudcampus.ai.knowledge.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record IngestRequest(
        @NotBlank @Size(max = 300) String title,
        @NotBlank @Size(max = 200_000) String content
) {}
