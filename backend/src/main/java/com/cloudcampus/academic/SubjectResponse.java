package com.cloudcampus.academic;

public record SubjectResponse(
        String id,
        String tenantId,
        String schoolId,
        String code,
        String name,
        boolean active
) {
}
