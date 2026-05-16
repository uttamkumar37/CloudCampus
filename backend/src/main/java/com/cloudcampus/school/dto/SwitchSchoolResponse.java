package com.cloudcampus.school.dto;

import java.util.UUID;

public record SwitchSchoolResponse(
        String accessToken,
        long   expiresIn,
        UUID   schoolId
) {}
