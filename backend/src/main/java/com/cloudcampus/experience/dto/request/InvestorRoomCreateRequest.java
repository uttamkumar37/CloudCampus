package com.cloudcampus.experience.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record InvestorRoomCreateRequest(
        @NotBlank @Size(max = 180) String title,
        @NotBlank @Size(max = 40) String accessMode,
        @Size(max = 200) String accessPassword,
        @Min(1) @Max(365) int expiresInDays
) {}
