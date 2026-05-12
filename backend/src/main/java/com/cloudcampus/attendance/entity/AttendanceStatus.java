package com.cloudcampus.attendance.entity;

/**
 * Attendance status for a student in a given session.
 *
 * Values must match the DB CHECK constraint in V21__create_attendance_records.sql.
 */
public enum AttendanceStatus {

    /** Student was present for the full session. */
    PRESENT,

    /** Student was absent (no notification / reason provided). */
    ABSENT,

    /** Student arrived after the session started. */
    LATE,

    /** Absence is excused (sick note, parental leave, etc.). */
    EXCUSED
}
