package com.cloudcampus.finance.dto;

import com.cloudcampus.finance.entity.FeeCategory;

import java.time.Instant;
import java.util.UUID;

public record FeeCategoryResponse(
        UUID    id,
        UUID    schoolId,
        String  name,
        String  description,
        boolean active,
        Instant createdAt,
        Instant updatedAt
) {
    public static FeeCategoryResponse from(FeeCategory c) {
        return new FeeCategoryResponse(
                c.getId(),
                c.getSchoolId(),
                c.getName(),
                c.getDescription(),
                c.isActive(),
                c.getCreatedAt(),
                c.getUpdatedAt()
        );
    }
}
