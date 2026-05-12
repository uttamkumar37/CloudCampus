package com.cloudcampus.exam.service;

import com.cloudcampus.exam.dto.ExamResultResponse;

import java.util.List;
import java.util.UUID;

/**
 * CC-1103: Result generation contract.
 *
 * {@link #generate} is idempotent — calling it multiple times re-computes
 * and upserts (overwrites) results. Rank is re-assigned on each generation.
 */
public interface ResultService {

    /**
     * Aggregate all student marks for the exam, compute percentage / grade /
     * pass-fail / rank, then upsert into {@code exam_results}.
     *
     * @param tenantId UUID of the requesting tenant
     * @param schoolId must match exam.schoolId
     * @param examId   the exam to generate results for
     * @return ranked list of results (rank 1 = highest percentage)
     */
    List<ExamResultResponse> generate(UUID tenantId, UUID schoolId, UUID examId);

    /**
     * Return previously-generated results for all students in the exam,
     * ordered by rank ascending.
     */
    List<ExamResultResponse> listResults(UUID schoolId, UUID examId);

    /**
     * Return the result + per-subject breakdown for one student (report card).
     *
     * @throws com.cloudcampus.common.exception.NotFoundException if no result exists
     */
    ExamResultResponse getStudentResult(UUID schoolId, UUID examId, UUID studentId);
}
