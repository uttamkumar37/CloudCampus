package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PresentationCreateRequest(
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 120) String slug,
        @NotBlank @Size(max = 80) String audienceType
) {}
