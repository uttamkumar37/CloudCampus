package com.cloudcampus.attendance.dto;

import jakarta.validation.constraints.NotBlank;

public record QrMarkRequest(@NotBlank String token) {}
