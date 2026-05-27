package com.cloudcampus.common.web;

import java.util.List;

public final class PageResponses {

    private PageResponses() {
    }

    public static <T> PageResponse<T> of(List<T> rows, int page, int size) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.max(1, Math.min(size, 100));
        int from = Math.min(safePage * safeSize, rows.size());
        int to = Math.min(from + safeSize, rows.size());
        int totalPages = rows.isEmpty() ? 0 : (int) Math.ceil((double) rows.size() / safeSize);
        return new PageResponse<>(rows.subList(from, to), safePage, safeSize, rows.size(), totalPages);
    }
}
