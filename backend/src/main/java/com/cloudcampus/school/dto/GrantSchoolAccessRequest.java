package com.cloudcampus.school.dto;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record GrantSchoolAccessRequest(
        @NotNull UUID schoolId,
        boolean isPrimary
) {}
