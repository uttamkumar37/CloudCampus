package com.cloudcampus.exam.repository;

import com.cloudcampus.exam.entity.ExamResult;
import com.cloudcampus.exam.entity.ExamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link ExamResult} (CC-1103).
 */
public interface ExamResultRepository extends JpaRepository<ExamResult, UUID> {

    /** All results for an exam, ordered by rank ascending (1 = top student). */
    List<ExamResult> findByExamIdOrderByRankAsc(UUID examId);

    /** Existing result for one student in an exam — used for upsert. */
    Optional<ExamResult> findByExamIdAndStudentId(UUID examId, UUID studentId);

    /** Result for a specific student across all exams. */
    List<ExamResult> findByExamIdAndStudentIdIn(UUID examId, List<UUID> studentIds);

    /** All results for an exam scoped to a school, ranked ascending (performance report). */
    List<ExamResult> findBySchoolIdAndExamIdOrderByRankAsc(UUID schoolId, UUID examId);

    /** Recent exam results for a student — unfiltered/private views. */
    List<ExamResult> findByStudentIdAndSchoolIdOrderByCreatedAtDesc(UUID studentId, UUID schoolId);

    /** Recent parent-visible results for a student, filtered by exam lifecycle status. */
    @Query("""
            SELECT r
            FROM ExamResult r
            JOIN Exam e ON e.id = r.examId
            WHERE r.studentId = :studentId
              AND r.schoolId = :schoolId
              AND e.schoolId = :schoolId
              AND e.tenantId = r.tenantId
              AND e.status = :status
            ORDER BY r.createdAt DESC
            """)
    List<ExamResult> findByStudentIdAndSchoolIdAndExamStatusOrderByCreatedAtDesc(
            @Param("studentId") UUID studentId,
            @Param("schoolId") UUID schoolId,
            @Param("status") ExamStatus status);
}
