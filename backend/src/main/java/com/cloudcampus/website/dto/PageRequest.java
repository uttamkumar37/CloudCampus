package com.cloudcampus.website.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record PageRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug must be lowercase letters, digits, and hyphens only")
        @Size(max = 200) String slug,
        @Size(max = 200) String seoTitle,
        @Size(max = 500) String seoDescription,
        boolean published,
        int displayOrder
) {}
