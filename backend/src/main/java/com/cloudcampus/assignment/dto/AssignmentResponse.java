package com.cloudcampus.assignment.dto;

import com.cloudcampus.assignment.entity.Assignment;
import com.cloudcampus.assignment.entity.AssignmentStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record AssignmentResponse(
        UUID id,
        UUID schoolId,
        UUID academicYearId,
        UUID classId,
        UUID sectionId,
        UUID subjectId,
        UUID assignedBy,
        String title,
        String description,
        LocalDate dueDate,
        BigDecimal maxMarks,
        AssignmentStatus status,
        Instant createdAt,
        Instant updatedAt
) {
    public static AssignmentResponse from(Assignment a) {
        return new AssignmentResponse(
                a.getId(), a.getSchoolId(), a.getAcademicYearId(),
                a.getClassId(), a.getSectionId(), a.getSubjectId(), a.getAssignedBy(),
                a.getTitle(), a.getDescription(), a.getDueDate(), a.getMaxMarks(),
                a.getStatus(), a.getCreatedAt(), a.getUpdatedAt()
        );
    }
}
