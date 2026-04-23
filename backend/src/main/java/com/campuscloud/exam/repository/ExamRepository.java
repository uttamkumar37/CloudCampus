package com.campuscloud.exam.repository;

import com.campuscloud.exam.entity.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface ExamRepository extends JpaRepository<Exam, UUID> {

    List<Exam> findAllByClassId(UUID classId);

    boolean existsByTitleAndExamDateAndClassIdAndSectionIdAndSubjectId(
            String title,
            LocalDate examDate,
            UUID classId,
            UUID sectionId,
            UUID subjectId
    );
}
