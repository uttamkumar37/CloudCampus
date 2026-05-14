package com.cloudcampus.attendance.repository;

import com.cloudcampus.attendance.entity.AttendanceRecord;
import com.cloudcampus.attendance.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

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

    /** Lookup for upsert — does a record already exist for this student + session? */
    Optional<AttendanceRecord> findBySessionIdAndStudentId(UUID sessionId, UUID studentId);

    /** Existence check (lighter than findBy). */
    boolean existsBySessionIdAndStudentId(UUID sessionId, UUID studentId);

    /** Count present records for a student (quick percentage calculation). */
    long countByStudentIdAndStatus(UUID studentId, AttendanceStatus status);

    /** Per-student status counts for a set of sessions (attendance report). */
    @Query("SELECT r.studentId, r.status, COUNT(r) FROM AttendanceRecord r WHERE r.sessionId IN :sessionIds GROUP BY r.studentId, r.status")
    List<Object[]> aggregateByStudentAndStatus(@Param("sessionIds") List<UUID> sessionIds);

    /** Total attendance records for a student (denominator for percentage). */
    long countByStudentId(UUID studentId);

    /** Per-record history for a student joined with session date and period, newest first. */
    @Query("""
           SELECT r.status, s.sessionDate, s.periodNumber
           FROM AttendanceRecord r, AttendanceSession s
           WHERE r.sessionId = s.id
             AND r.studentId = :studentId
           ORDER BY s.sessionDate DESC, s.id DESC
           """)
    List<Object[]> findStudentHistory(@Param("studentId") UUID studentId,
                                      org.springframework.data.domain.Pageable pageable);
}
