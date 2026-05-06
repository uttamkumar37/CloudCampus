package com.cloudcampus.exam.repository;

import com.cloudcampus.exam.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExamResultRepository extends JpaRepository<ExamResult, UUID> {

    List<ExamResult> findAllByExamId(UUID examId);

    boolean existsByExamIdAndStudentId(UUID examId, UUID studentId);

    // Student dashboard
    List<ExamResult> findTop5ByStudentIdOrderByCreatedAtDesc(UUID studentId);

    List<ExamResult> findTop20ByStudentIdOrderByCreatedAtDesc(UUID studentId);
}
