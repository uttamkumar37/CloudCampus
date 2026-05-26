package com.cloudcampus.academic;

public record ClassLevelResponse(
        String id,
        String tenantId,
        String schoolId,
        String academicYearId,
        String name,
        int displayOrder,
        boolean active
) {
}
