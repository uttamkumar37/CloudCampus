package com.cloudcampus.video.dto;

import com.cloudcampus.video.entity.VideoVisibility;
import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record VideoUploadRequest(
        UUID            subjectId,
        UUID            classId,
        @NotBlank String title,
        String          description,
        String          contentType,
        VideoVisibility visibility
) {}
