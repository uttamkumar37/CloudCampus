package com.cloudcampus.attendance.repository;

import com.cloudcampus.attendance.entity.AttendanceSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Data access for {@link AttendanceSession}.
 */
public interface AttendanceSessionRepository extends JpaRepository<AttendanceSession, UUID> {

    // ── List sessions ────────────────────────────────────────────────────────

    /** All sessions for a school on a given date (teacher dashboard). */
    List<AttendanceSession> findAllBySchoolIdAndSessionDateOrderByPeriodNumberAsc(
            UUID schoolId, LocalDate sessionDate);

    /** Sessions for a class over a date range (report drill-down). */
    List<AttendanceSession> findAllByClassIdAndSessionDateBetweenOrderBySessionDateAscPeriodNumberAsc(
            UUID classId, LocalDate from, LocalDate to);

    /** Sessions for a class + section over a date range. */
    List<AttendanceSession> findAllByClassIdAndSectionIdAndSessionDateBetweenOrderBySessionDateAscPeriodNumberAsc(
            UUID classId, UUID sectionId, LocalDate from, LocalDate to);

    /** Sessions for a school over a date range (admin report). */
    List<AttendanceSession> findAllBySchoolIdAndSessionDateBetweenOrderBySessionDateAscPeriodNumberAsc(
            UUID schoolId, LocalDate from, LocalDate to);

    // ── Duplicate-guard ──────────────────────────────────────────────────────

    /** Check for an existing section-level session. */
    Optional<AttendanceSession> findBySchoolIdAndClassIdAndSectionIdAndSessionDateAndPeriodNumber(
            UUID schoolId, UUID classId, UUID sectionId, LocalDate sessionDate, int periodNumber);

    /** Check for an existing whole-class (no section) session. */
    Optional<AttendanceSession> findBySchoolIdAndClassIdAndSectionIdIsNullAndSessionDateAndPeriodNumber(
            UUID schoolId, UUID classId, LocalDate sessionDate, int periodNumber);

    /** All session IDs for a school + academic year (used for attendance reports). */
    @Query("SELECT s.id FROM AttendanceSession s WHERE s.schoolId = :schoolId AND s.academicYearId = :academicYearId")
    List<UUID> findSessionIdsBySchoolAndYear(@Param("schoolId") UUID schoolId,
                                             @Param("academicYearId") UUID academicYearId);
}
