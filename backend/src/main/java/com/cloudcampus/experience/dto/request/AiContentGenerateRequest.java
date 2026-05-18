package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AiContentGenerateRequest(
        @NotBlank String prompt,
        @NotBlank String contentType
) {}
