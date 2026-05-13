package com.cloudcampus.finance.repository;

import com.cloudcampus.finance.entity.FeeStructure;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FeeStructureRepository extends JpaRepository<FeeStructure, UUID> {

    List<FeeStructure> findBySchoolId(UUID schoolId);

    List<FeeStructure> findBySchoolIdAndAcademicYearId(UUID schoolId, UUID academicYearId);

    List<FeeStructure> findBySchoolIdAndAcademicYearIdAndClassId(
            UUID schoolId, UUID academicYearId, UUID classId);

    boolean existsBySchoolIdAndAcademicYearIdAndClassIdAndFeeCategoryId(
            UUID schoolId, UUID academicYearId, UUID classId, UUID feeCategoryId);
}
