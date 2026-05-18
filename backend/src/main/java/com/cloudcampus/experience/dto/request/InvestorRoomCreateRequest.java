package com.cloudcampus.experience.dto.request;

public record InvestorRoomCreateRequest(
        String title,
        String accessMode,
        String accessPassword,
        int expiresInDays
) {}
