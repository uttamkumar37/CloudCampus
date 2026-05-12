package com.cloudcampus.attendance.service;

import com.cloudcampus.attendance.dto.AttendanceSessionResponse;
import com.cloudcampus.attendance.dto.AttendanceSessionSummaryResponse;
import com.cloudcampus.attendance.dto.CreateSessionRequest;
import com.cloudcampus.attendance.dto.MarkAttendanceRequest;
import com.cloudcampus.attendance.dto.StudentAttendanceReport;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Manual attendance lifecycle — session management and reporting (CC-0801 / CC-0805).
 */
public interface AttendanceService {

    // ── Session management ──────────────────────────────────────────────────

    /**
     * Open a new attendance session for a class / section on a specific date
     * and period. Prevents duplicate sessions (same class/section/date/period).
     */
    AttendanceSessionResponse openSession(UUID schoolId, CreateSessionRequest request);

    /**
     * Bulk-mark (or update) attendance records for a session.
     * Each entry is an upsert. Throws if the session is already finalized.
     * If {@code request.finalize()} is true, the session is locked after marking.
     */
    AttendanceSessionResponse markAttendance(UUID sessionId, MarkAttendanceRequest request);

    /** Retrieve a session with all its attendance records. */
    AttendanceSessionResponse getSession(UUID sessionId);

    // ── Listing ─────────────────────────────────────────────────────────────

    /** All sessions for a school on a given date. */
    List<AttendanceSessionSummaryResponse> listBySchoolAndDate(UUID schoolId, LocalDate date);

    /**
     * Sessions for a class (optionally scoped to a section) over a date range.
     * Used to populate a timetable / weekly report view.
     */
    List<AttendanceSessionSummaryResponse> listByClassAndDateRange(
            UUID classId, UUID sectionId, LocalDate from, LocalDate to);

    // ── Reports (CC-0805) ───────────────────────────────────────────────────

    /**
     * Attendance report for a single student over a date range.
     * Returns counts by status and a computed attendance percentage.
     */
    StudentAttendanceReport getStudentReport(UUID studentId, LocalDate from, LocalDate to);

    /**
     * Class-level report: attendance per student over a date range.
     * Optionally filtered to a specific section.
     */
    List<StudentAttendanceReport> getClassReport(
            UUID classId, UUID sectionId, LocalDate from, LocalDate to);
}
