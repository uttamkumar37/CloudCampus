package com.cloudcampus.academic;

import jakarta.validation.constraints.NotBlank;

public record TeacherAssignmentRequest(
        @NotBlank
        String teacherUserId,

        @NotBlank
        String classSubjectAssignmentId
) {
}
