package com.cloudcampus.attendance.repository;

import com.cloudcampus.attendance.entity.AttendanceRecord;
import com.cloudcampus.attendance.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Data access for {@link AttendanceRecord}.
 */
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, UUID> {

    /** All records for a session (bulk load when displaying a session). */
    List<AttendanceRecord> findAllBySessionId(UUID sessionId);

    /** All records for a set of sessions (used for class / date-range reports). */
    List<AttendanceRecord> findAllBySessionIdIn(List<UUID> sessionIds);

    /** All records for a student (student attendance history). */
    List<AttendanceRecord> findAllByStudentIdOrderByCreatedAtAsc(UUID studentId);

    /**
     * H-05 / M-19: Explicit INNER JOIN avoids the Hibernate cross-join that the comma
     * syntax generates, ensuring the tenant filter on attendance_records is applied
     * and preventing a Cartesian product in the query plan.
     */
    @Query(value = """
           SELECT ar.* FROM attendance_records ar
           INNER JOIN attendance_sessions s ON ar.session_id = s.id
           WHERE ar.student_id = :studentId
             AND s.session_date BETWEEN :from AND :to
           ORDER BY s.session_date ASC
           """, nativeQuery = true)
    List<AttendanceRecord> findAllByStudentIdAndSessionDateBetween(
            @Param("studentId") UUID studentId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);

    /** Lookup for upsert — does a record already exist for this student + session? */
    Optional<AttendanceRecord> findBySessionIdAndStudentId(UUID sessionId, UUID studentId);

    /** Existence check (lighter than findBy). */
    boolean existsBySessionIdAndStudentId(UUID sessionId, UUID studentId);

    /** Count present records for a student (quick percentage calculation). */
    long countByStudentIdAndStatus(UUID studentId, AttendanceStatus status);

    /** Per-student status counts for a set of sessions (attendance report). */
    @Query("SELECT r.studentId, r.status, COUNT(r) FROM AttendanceRecord r WHERE r.sessionId IN :sessionIds GROUP BY r.studentId, r.status")
    List<Object[]> aggregateByStudentAndStatus(@Param("sessionIds") List<UUID> sessionIds);

    /** School-level status totals for a set of sessions (cross-school comparison). */
    @Query("SELECT r.status, COUNT(r) FROM AttendanceRecord r WHERE r.sessionId IN :sessionIds GROUP BY r.status")
    List<Object[]> countByStatusForSessions(@Param("sessionIds") List<UUID> sessionIds);

    /** Total attendance records for a student (denominator for percentage). */
    long countByStudentId(UUID studentId);

    // ── Super Admin analytics (native — bypasses tenant filter) ───────────────

    /**
     * Returns [total_records, present_records] for all sessions belonging to a school.
     * Used by the school comparison report to compute the attendance rate.
     */
    @Query(value = """
           SELECT COUNT(*),
                  SUM(CASE WHEN ar.status = 'PRESENT' THEN 1 ELSE 0 END)
           FROM attendance_records ar
           WHERE ar.session_id IN (
               SELECT id FROM attendance_sessions WHERE school_id = :schoolId
           )
           """, nativeQuery = true)
    Object[] countTotalAndPresentBySchool(@Param("schoolId") UUID schoolId);

    /** Per-record history for a student joined with session date and period, newest first.
     *  M-19: explicit INNER JOIN replaces the implicit cross-join that bypassed Hibernate filters. */
    @Query(value = """
           SELECT ar.status, s.session_date, s.period_number
           FROM attendance_records ar
           INNER JOIN attendance_sessions s ON ar.session_id = s.id
           WHERE ar.student_id = :studentId
           ORDER BY s.session_date DESC, ar.session_id DESC
           """, nativeQuery = true)
    List<Object[]> findStudentHistory(@Param("studentId") UUID studentId,
                                      org.springframework.data.domain.Pageable pageable);
}
