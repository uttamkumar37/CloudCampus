package com.cloudcampus.student.dto;

import java.util.UUID;

/** Result returned after a bulk student promotion or dry-run preview. */
public record PromotionResult(
        int studentsFound,
        int studentsPromoted,
        boolean dryRun,
        UUID sourceClassId,
        UUID sourceSectionId,
        UUID targetClassId,
        UUID targetSectionId
) {
    public static PromotionResult dryRun(StudentPromotionRequest request, int studentsFound) {
        return new PromotionResult(
                studentsFound,
                0,
                true,
                request.sourceClassId(),
                request.sourceSectionId(),
                request.targetClassId(),
                request.targetSectionId());
    }

    public static PromotionResult completed(StudentPromotionRequest request, int studentsPromoted) {
        return new PromotionResult(
                studentsPromoted,
                studentsPromoted,
                false,
                request.sourceClassId(),
                request.sourceSectionId(),
                request.targetClassId(),
                request.targetSectionId());
    }
}
