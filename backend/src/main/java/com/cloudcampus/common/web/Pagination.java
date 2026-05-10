package com.cloudcampus.common.web;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record Pagination(
        @Min(0) int offset,
        @Min(1) @Max(200) int limit
) {
    public static Pagination defaultPage() {
        return new Pagination(0, 20);
    }
}

