package com.campuscloud.exam.repository;

import com.campuscloud.exam.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ExamResultRepository extends JpaRepository<ExamResult, UUID> {

    List<ExamResult> findAllByExamId(UUID examId);

    boolean existsByExamIdAndStudentId(UUID examId, UUID studentId);
}
