package com.cloudcampus.student.dto;

/** Result returned after a bulk student promotion. */
public record PromotionResult(
        int studentsFound,
        int studentsPromoted
) {}
