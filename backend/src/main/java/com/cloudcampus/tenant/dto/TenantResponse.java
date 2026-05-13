package com.cloudcampus.tenant.dto;

import com.cloudcampus.tenant.entity.TenantStatus;

import java.time.Instant;
import java.util.UUID;

// C-06: updatedAt added — backward-compatible field addition (new JSON field; existing clients ignore it).
public record TenantResponse(
        UUID id,
        String code,
        String name,
        TenantStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}

