package com.cloudcampus.academic;

public record SectionResponse(
        String id,
        String tenantId,
        String schoolId,
        String classLevelId,
        String name,
        Integer capacity,
        boolean active
) {
}
