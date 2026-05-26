package com.cloudcampus.academic;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ClassSubjectAssignmentRepository extends JpaRepository<ClassSubjectAssignment, String> {

    Optional<ClassSubjectAssignment> findByClassLevelIdAndSubjectId(String classLevelId, String subjectId);

    List<ClassSubjectAssignment> findByClassLevelIdOrderBySubjectNameAsc(String classLevelId);
}
