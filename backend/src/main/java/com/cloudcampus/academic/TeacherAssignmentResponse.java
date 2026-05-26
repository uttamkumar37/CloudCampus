package com.cloudcampus.academic;

public record TeacherAssignmentResponse(
        String id,
        String tenantId,
        String schoolId,
        String teacherUserId,
        String teacherName,
        String classSubjectAssignmentId,
        String classLevelId,
        String className,
        String subjectId,
        String subjectCode,
        String subjectName,
        boolean active
) {
}
