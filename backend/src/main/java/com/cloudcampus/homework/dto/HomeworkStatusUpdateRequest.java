package com.cloudcampus.homework.dto;

import com.cloudcampus.homework.entity.HomeworkStatus;
import jakarta.validation.constraints.NotNull;

public record HomeworkStatusUpdateRequest(
        @NotNull(message = "Status is required")
        HomeworkStatus status
) {}
