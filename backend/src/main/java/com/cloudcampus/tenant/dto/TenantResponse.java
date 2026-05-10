package com.cloudcampus.tenant.dto;

import com.cloudcampus.tenant.entity.TenantStatus;

import java.time.Instant;
import java.util.UUID;

public record TenantResponse(
        UUID id,
        String code,
        String name,
        TenantStatus status,
        Instant createdAt
) {
}

