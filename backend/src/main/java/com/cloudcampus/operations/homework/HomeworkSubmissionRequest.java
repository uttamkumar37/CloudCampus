package com.cloudcampus.operations.homework;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record HomeworkSubmissionRequest(
        @NotBlank @Size(max = 2000) String content
) {
}
