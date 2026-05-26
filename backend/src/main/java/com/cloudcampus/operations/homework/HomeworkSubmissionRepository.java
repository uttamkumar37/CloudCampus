package com.cloudcampus.operations.homework;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface HomeworkSubmissionRepository extends JpaRepository<HomeworkSubmission, String> {

    List<HomeworkSubmission> findByHomeworkIdOrderBySubmittedAtAsc(String homeworkId);

    Optional<HomeworkSubmission> findByHomeworkIdAndStudentId(String homeworkId, String studentId);
}
