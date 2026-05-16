package com.cloudcampus.school.dto;

import java.util.UUID;

public record SchoolAccessResponse(
        UUID    schoolId,
        String  schoolName,
        String  schoolCode,
        boolean isPrimary
) {}
