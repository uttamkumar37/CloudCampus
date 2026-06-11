package com.cloudcampus.academic;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface TeacherAssignmentRepository extends JpaRepository<TeacherAssignment, String> {

    Optional<TeacherAssignment> findByTeacherIdAndClassSubjectAssignmentId(String teacherId, String classSubjectAssignmentId);

    List<TeacherAssignment> findByTeacherIdOrderByClassSubjectAssignmentClassLevelNameAscClassSubjectAssignmentSubjectNameAsc(String teacherId);

    List<TeacherAssignment> findByClassSubjectAssignmentClassLevelIdOrderByTeacherDisplayNameAsc(String classLevelId);

    Optional<TeacherAssignment> findByTeacherIdAndClassSubjectAssignmentClassLevelIdAndClassSubjectAssignmentSubjectId(
            String teacherId,
            String classLevelId,
            String subjectId
    );

    List<TeacherAssignment> findByTeacherIdAndClassSubjectAssignmentClassLevelIdOrderByClassSubjectAssignmentSubjectNameAsc(
            String teacherId,
            String classLevelId
    );

    boolean existsByTeacherIdAndClassLevelIdAndActiveTrue(String teacherId, String classLevelId);

    boolean existsByTeacherIdAndClassLevelIdAndSectionIdAndActiveTrue(String teacherId, String classLevelId, String sectionId);

    boolean existsByTeacherIdAndSchoolIdAndClassLevelIdAndSubjectIdAndActiveTrue(
            String teacherId,
            String schoolId,
            String classLevelId,
            String subjectId
    );

    boolean existsByTeacherIdAndSchoolIdAndClassLevelIdAndSubjectIdAndSectionIsNullAndActiveTrue(
            String teacherId,
            String schoolId,
            String classLevelId,
            String subjectId
    );

    boolean existsByTeacherIdAndSchoolIdAndClassLevelIdAndSubjectIdAndSectionIdAndActiveTrue(
            String teacherId,
            String schoolId,
            String classLevelId,
            String subjectId,
            String sectionId
    );

    List<TeacherAssignment> findByTeacherIdAndActiveTrue(String teacherId);
}
