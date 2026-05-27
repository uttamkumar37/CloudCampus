package com.cloudcampus.operations.document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SchoolDocumentRequest(
        String classLevelId,
        String studentId,
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 220) String fileName,
        @NotBlank @Size(max = 500) String storageKey
) {
}
