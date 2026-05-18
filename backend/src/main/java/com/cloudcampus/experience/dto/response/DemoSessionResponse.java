package com.cloudcampus.experience.dto.response;

import java.time.Instant;
import java.util.UUID;

public record DemoSessionResponse(
        String visitorToken,
        String loginUrl,
        String demoUsername,
        String demoPassword,
        Instant expiresAt,
        UUID tenantId
) {}
