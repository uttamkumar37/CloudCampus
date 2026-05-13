package com.cloudcampus.exam.repository;

import com.cloudcampus.exam.entity.ExamSubject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExamSubjectRepository extends JpaRepository<ExamSubject, UUID> {

    List<ExamSubject> findByExamIdOrderByExamDateAsc(UUID examId);

    Optional<ExamSubject> findByIdAndExamId(UUID id, UUID examId);

    void deleteByExamId(UUID examId);
}
