package com.cloudcampus.common.web;

import java.util.List;

public record PageResponse<T>(
        List<T> items,
        int offset,
        int limit,
        long total
) {
}

