package com.cloudcampus.notice.dto;

import com.cloudcampus.notice.entity.NoticeCategory;
import com.cloudcampus.notice.entity.NoticeTarget;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public record NoticeCreateRequest(

        @NotBlank @Size(max = 300)
        String title,

        @NotBlank
        String content,

        @NotNull
        NoticeCategory category,

        NoticeTarget target,       // defaults to ALL if null

        @Min(0) @Max(100)
        int priority,

        Instant expiresAt,

        boolean publishImmediately
) {}
