package com.cloudcampus.homework.repository;

import com.cloudcampus.homework.entity.HomeworkSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface HomeworkSubmissionRepository extends JpaRepository<HomeworkSubmission, UUID> {

    Optional<HomeworkSubmission> findByHomeworkIdAndStudentId(UUID homeworkId, UUID studentId);

    List<HomeworkSubmission> findAllByHomeworkIdOrderBySubmittedAtAsc(UUID homeworkId);

    boolean existsByHomeworkIdAndStudentId(UUID homeworkId, UUID studentId);
}
