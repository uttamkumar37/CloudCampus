package com.cloudcampus.assignment.repository;

import com.cloudcampus.assignment.entity.AssignmentSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SubmissionRepository extends JpaRepository<AssignmentSubmission, UUID> {

    List<AssignmentSubmission> findByAssignmentId(UUID assignmentId);

    Optional<AssignmentSubmission> findByAssignmentIdAndStudentId(UUID assignmentId, UUID studentId);

    Optional<AssignmentSubmission> findByIdAndAssignmentId(UUID id, UUID assignmentId);
}
