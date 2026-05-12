package com.cloudcampus.homework.dto;

import com.cloudcampus.homework.entity.HomeworkAssignment;
import com.cloudcampus.homework.entity.HomeworkStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record HomeworkResponse(
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
        HomeworkStatus status,
        String attachmentUrls,
        Instant createdAt,
        Instant updatedAt
) {
    public static HomeworkResponse from(HomeworkAssignment h) {
        return new HomeworkResponse(
                h.getId(),
                h.getSchoolId(),
                h.getAcademicYearId(),
                h.getClassId(),
                h.getSectionId(),
                h.getSubjectId(),
                h.getAssignedBy(),
                h.getTitle(),
                h.getDescription(),
                h.getDueDate(),
                h.getStatus(),
                h.getAttachmentUrls(),
                h.getCreatedAt(),
                h.getUpdatedAt()
        );
    }
}
