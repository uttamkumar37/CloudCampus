package com.cloudcampus.onlineclass.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OnlineClassStatusUpdateRequest(
        @NotBlank
        @Pattern(regexp = "start|end|cancel", message = "action must be one of start, end, or cancel")
        String action
) {}
