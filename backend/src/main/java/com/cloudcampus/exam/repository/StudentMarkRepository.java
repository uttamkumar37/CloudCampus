package com.cloudcampus.exam.repository;

import com.cloudcampus.exam.entity.StudentMark;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Spring Data JPA repository for {@link StudentMark} (CC-1102).
 */
public interface StudentMarkRepository extends JpaRepository<StudentMark, UUID> {

    /** All marks for a specific exam paper, ordered by student UUID for stable display. */
    List<StudentMark> findByExamSubjectIdOrderByStudentId(UUID examSubjectId);

    /** All marks for a whole exam — used during result generation. */
    List<StudentMark> findByExamId(UUID examId);

    /** All marks a student has across all papers in one exam (used in result generation). */
    List<StudentMark> findByExamIdAndStudentId(UUID examId, UUID studentId);

    /** Lookup existing mark for upsert logic. */
    Optional<StudentMark> findByExamSubjectIdAndStudentId(UUID examSubjectId, UUID studentId);

    /** Remove all marks for a paper (called when ExamSubject is removed). */
    void deleteByExamSubjectId(UUID examSubjectId);

    /** Remove all marks for an exam (cascade safety net). */
    void deleteByExamId(UUID examId);
}
