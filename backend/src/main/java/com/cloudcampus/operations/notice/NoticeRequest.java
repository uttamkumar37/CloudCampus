package com.cloudcampus.operations.notice;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record NoticeRequest(
        String classLevelId,
        String sectionId,
        @NotBlank @Size(max = 160) String title,
        @NotBlank @Size(max = 4000) String body,
        @NotNull NoticeAudience audience
) {
}
