package com.cloudcampus.exam.repository;

import com.cloudcampus.exam.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;

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

    /** Recent exam results for a student — parent portal view. */
    List<ExamResult> findByStudentIdAndSchoolIdOrderByCreatedAtDesc(UUID studentId, UUID schoolId);
}
