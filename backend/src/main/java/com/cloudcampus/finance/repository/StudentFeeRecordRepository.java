package com.cloudcampus.finance.repository;

import com.cloudcampus.finance.entity.FeeStatus;
import com.cloudcampus.finance.entity.StudentFeeRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StudentFeeRecordRepository extends JpaRepository<StudentFeeRecord, UUID> {

    List<StudentFeeRecord> findByStudentId(UUID studentId);

    List<StudentFeeRecord> findByStudentIdAndAcademicYearId(UUID studentId, UUID academicYearId);

    List<StudentFeeRecord> findBySchoolId(UUID schoolId);

    List<StudentFeeRecord> findBySchoolIdAndStatus(UUID schoolId, FeeStatus status);

    List<StudentFeeRecord> findBySchoolIdAndAcademicYearId(UUID schoolId, UUID academicYearId);

    List<StudentFeeRecord> findBySchoolIdAndAcademicYearIdAndStatus(
            UUID schoolId, UUID academicYearId, FeeStatus status);

    boolean existsByStudentIdAndFeeStructureId(UUID studentId, UUID feeStructureId);

    long countBySchoolIdAndStatus(UUID schoolId, FeeStatus status);
}
