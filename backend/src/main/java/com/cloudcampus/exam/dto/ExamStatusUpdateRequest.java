package com.cloudcampus.exam.dto;

import com.cloudcampus.exam.entity.ExamStatus;
import jakarta.validation.constraints.NotNull;

/**
 * Request body for transitioning an exam's status.
 */
public record ExamStatusUpdateRequest(
        @NotNull(message = "Status is required")
        ExamStatus status
) {}
