package com.cloudcampus.assignment.repository;

import com.cloudcampus.assignment.entity.AssignmentSubmission;
import com.cloudcampus.assignment.entity.SubmissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubmissionRepository extends JpaRepository<AssignmentSubmission, UUID> {

    List<AssignmentSubmission> findByAssignmentId(UUID assignmentId);

    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(UUID assignmentId, UUID studentId);

    Optional<AssignmentSubmission> findByIdAndAssignmentId(UUID id, UUID assignmentId);

    long countByAssignmentId(UUID assignmentId);

    /** Fetch all submissions for a student across a batch of assignment IDs (avoids N+1 in student view). */
    List<AssignmentSubmission> findByAssignmentIdInAndStudentId(Collection<UUID> assignmentIds, UUID studentId);

    /** Per-assignment submission count for a batch of assignment IDs. */
    @Query("SELECT s.assignmentId, COUNT(s) FROM AssignmentSubmission s WHERE s.assignmentId IN :ids GROUP BY s.assignmentId")
    List<Object[]> countGroupedByAssignment(@Param("ids") Collection<UUID> ids);

    /** Per-assignment count for a specific status, for a batch of IDs. */
    @Query("SELECT s.assignmentId, COUNT(s) FROM AssignmentSubmission s WHERE s.assignmentId IN :ids AND s.status = :status GROUP BY s.assignmentId")
    List<Object[]> countByStatusGroupedByAssignment(@Param("ids") Collection<UUID> ids, @Param("status") SubmissionStatus status);

    /** Count submissions across all assignments created by a teacher, filtered by status list. */
    @Query("""
           SELECT COUNT(s) FROM AssignmentSubmission s
           WHERE s.assignmentId IN (
               SELECT a.id FROM Assignment a
               WHERE a.schoolId = :schoolId AND a.assignedBy = :userId
           )
           AND s.status IN :statuses
           """)
    long countByTeacherAndStatusIn(
            @Param("schoolId")  UUID schoolId,
            @Param("userId")    UUID userId,
            @Param("statuses")  Collection<SubmissionStatus> statuses);
}
