package com.cloudcampus.assignment.dto;

import com.cloudcampus.assignment.entity.AssignmentStatus;
import jakarta.validation.constraints.NotNull;

public record AssignmentStatusUpdateRequest(
        @NotNull(message = "Status is required")
        AssignmentStatus status
) {}
