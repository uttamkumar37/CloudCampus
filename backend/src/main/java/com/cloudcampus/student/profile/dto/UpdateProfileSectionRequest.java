package com.cloudcampus.student.profile.dto;

import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record UpdateProfileSectionRequest(
        @NotNull Map<String, Object> data
) {}
