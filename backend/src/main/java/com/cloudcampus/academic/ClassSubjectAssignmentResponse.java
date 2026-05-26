package com.cloudcampus.academic;

public record ClassSubjectAssignmentResponse(
        String id,
        String tenantId,
        String schoolId,
        String classLevelId,
        String className,
        String subjectId,
        String subjectCode,
        String subjectName,
        boolean active
) {
}
