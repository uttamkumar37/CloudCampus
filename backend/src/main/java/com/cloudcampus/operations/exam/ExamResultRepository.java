package com.cloudcampus.operations.exam;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamResultRepository extends JpaRepository<ExamResult, String> {

    List<ExamResult> findByExamIdOrderByStudentAdmissionNumberAsc(String examId);

    Optional<ExamResult> findByExamIdAndStudentId(String examId, String studentId);

    List<ExamResult> findByStudentIdAndExamStatusOrderByExamExamDateAsc(String studentId, ExamStatus status);
}
