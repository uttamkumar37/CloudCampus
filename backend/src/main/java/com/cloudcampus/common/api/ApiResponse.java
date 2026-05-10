package com.cloudcampus.common.api;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiResponse<T>(
        boolean success,
        String correlationId,
        Instant timestamp,
        T data,
        ApiError error
) {
    public static <T> ApiResponse<T> ok(String correlationId, T data) {
        return new ApiResponse<>(true, correlationId, Instant.now(), data, null);
    }

    public static <T> ApiResponse<T> error(String correlationId, ApiError error) {
        return new ApiResponse<>(false, correlationId, Instant.now(), null, error);
    }
}

