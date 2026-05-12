package com.cloudcampus.attendance.dto;

import com.cloudcampus.attendance.entity.AttendanceSession;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Full session detail — includes all attendance records.
 * Used for GET /sessions/{id}, POST /sessions (create response),
 * and POST /sessions/{id}/mark response.
 */
public record AttendanceSessionResponse(

        UUID                          id,
        UUID                          schoolId,
        UUID                          classId,
        UUID                          sectionId,
        UUID                          academicYearId,
        UUID                          subjectId,
        UUID                          takenByStaffId,
        LocalDate                     sessionDate,
        int                           periodNumber,
        boolean                       finalized,
        Instant                       createdAt,
        Instant                       updatedAt,
        List<AttendanceRecordResponse> records
) {
    public static AttendanceSessionResponse from(AttendanceSession s,
                                                  List<AttendanceRecordResponse> records) {
        return new AttendanceSessionResponse(
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
                s.getCreatedAt(),
                s.getUpdatedAt(),
                records
        );
    }
}
