package com.cloudcampus.homework.repository;

import com.cloudcampus.homework.entity.HomeworkSubmission;
import com.cloudcampus.homework.entity.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HomeworkSubmissionRepository extends JpaRepository<HomeworkSubmission, UUID> {

    Optional<HomeworkSubmission> findByHomeworkIdAndStudentId(UUID homeworkId, UUID studentId);

    List<HomeworkSubmission> findAllByHomeworkIdOrderBySubmittedAtAsc(UUID homeworkId);

    boolean existsByHomeworkIdAndStudentId(UUID homeworkId, UUID studentId);

    long countByHomeworkId(UUID homeworkId);

    /** Per-homework submission count for a batch of homework IDs. */
    @Query("SELECT s.homeworkId, COUNT(s) FROM HomeworkSubmission s WHERE s.homeworkId IN :ids GROUP BY s.homeworkId")
    List<Object[]> countGroupedByHomework(@Param("ids") Collection<UUID> ids);

    /** Count submissions across all homework assigned by a teacher, filtered by status. */
    @Query("""
           SELECT COUNT(s) FROM HomeworkSubmission s
           WHERE s.homeworkId IN (
               SELECT h.id FROM HomeworkAssignment h
               WHERE h.schoolId = :schoolId AND h.assignedBy = :userId
           )
           AND s.status = :status
           """)
    long countByTeacherAndStatus(
            @Param("schoolId") UUID schoolId,
            @Param("userId")   UUID userId,
            @Param("status")   SubmissionStatus status);
}
