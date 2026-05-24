package com.cloudcampus.video.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record VideoConfirmRequest(
        @Positive Long fileSizeBytes,
        @PositiveOrZero Integer durationSeconds
) {}
