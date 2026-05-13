package com.cloudcampus.exam.dto;

import com.cloudcampus.exam.entity.StudentMark;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

/**
 * API response shape for a single student mark record (CC-1102).
 */
public record StudentMarkResponse(
        UUID      id,
        UUID      examId,
        UUID      examSubjectId,
        UUID      studentId,
        BigDecimal marksObtained,
        boolean   isAbsent,
        String    remarks,
        UUID      enteredBy,
        Instant   createdAt,
        Instant   updatedAt
) {
    public static StudentMarkResponse from(StudentMark sm) {
        return new StudentMarkResponse(
                sm.getId(),
                sm.getExamId(),
                sm.getExamSubjectId(),
                sm.getStudentId(),
                sm.getMarksObtained(),
                sm.isAbsent(),
                sm.getRemarks(),
                sm.getEnteredBy(),
                sm.getCreatedAt(),
                sm.getUpdatedAt()
        );
    }
}
