package com.cloudcampus.operations.exam;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamRepository extends JpaRepository<Exam, String> {

    List<Exam> findBySchoolIdOrderByExamDateAscCreatedAtAsc(String schoolId);

    List<Exam> findBySchoolIdAndClassLevelIdAndSubjectIdOrderByExamDateAscCreatedAtAsc(
            String schoolId,
            String classLevelId,
            String subjectId
    );
}
