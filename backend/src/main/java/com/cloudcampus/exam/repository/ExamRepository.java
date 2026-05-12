package com.cloudcampus.exam.repository;

import com.cloudcampus.exam.entity.Exam;
import com.cloudcampus.exam.entity.ExamStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ExamRepository extends JpaRepository<Exam, UUID> {

    Page<Exam> findBySchoolIdOrderByStartDateDesc(UUID schoolId, Pageable pageable);

    Page<Exam> findBySchoolIdAndAcademicYearIdOrderByStartDateDesc(
            UUID schoolId, UUID academicYearId, Pageable pageable);

    Page<Exam> findBySchoolIdAndStatusOrderByStartDateDesc(
            UUID schoolId, ExamStatus status, Pageable pageable);

    Optional<Exam> findByIdAndSchoolId(UUID id, UUID schoolId);
}
