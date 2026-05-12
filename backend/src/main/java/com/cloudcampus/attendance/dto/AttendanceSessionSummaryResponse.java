package com.cloudcampus.attendance.dto;

import com.cloudcampus.attendance.entity.AttendanceSession;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * Lightweight session summary — used in list endpoints.
 * Does NOT include individual attendance records.
 */
public record AttendanceSessionSummaryResponse(

        UUID      id,
        UUID      schoolId,
        UUID      classId,
        UUID      sectionId,
        UUID      academicYearId,
        UUID      subjectId,
        UUID      takenByStaffId,
        LocalDate sessionDate,
        int       periodNumber,
        boolean   finalized,
        Instant   createdAt
) {
    public static AttendanceSessionSummaryResponse from(AttendanceSession s) {
        return new AttendanceSessionSummaryResponse(
                s.getId(),
                s.getSchoolId(),
                s.getClassId(),
                s.getSectionId(),
                s.getAcademicYearId(),
                s.getSubjectId(),
                s.getTakenByStaffId(),
                s.getSessionDate(),
                s.getPeriodNumber(),
                s.isFinalized(),
                s.getCreatedAt()
        );
    }
}
