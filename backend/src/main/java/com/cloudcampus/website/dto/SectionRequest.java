package com.cloudcampus.website.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.Map;

public record SectionRequest(
        @NotBlank String sectionType,
        int position,
        Map<String, Object> content,
        boolean visible
) {}
