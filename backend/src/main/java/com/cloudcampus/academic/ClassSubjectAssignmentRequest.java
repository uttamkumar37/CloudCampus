package com.cloudcampus.academic;

import jakarta.validation.constraints.NotBlank;

public record ClassSubjectAssignmentRequest(
        @NotBlank
        String classLevelId,

        @NotBlank
        String subjectId
) {
}
