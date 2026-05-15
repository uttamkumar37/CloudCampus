package com.cloudcampus.finance.repository;

import com.cloudcampus.finance.entity.FeeStatus;
import com.cloudcampus.finance.entity.StudentFeeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
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

    // ── Super Admin analytics (native — bypasses tenant filter) ───────────────

    @Query(value = "SELECT COALESCE(SUM(amount_due), 0) FROM student_fee_records", nativeQuery = true)
    BigDecimal sumAmountDueGlobal();

    @Query(value = "SELECT COALESCE(SUM(amount_paid), 0) FROM student_fee_records", nativeQuery = true)
    BigDecimal sumAmountPaidGlobal();

    @Query(value = """
           SELECT tenant_id::text,
                  COALESCE(SUM(amount_due), 0),
                  COALESCE(SUM(amount_paid), 0)
           FROM student_fee_records
           GROUP BY tenant_id
           """, nativeQuery = true)
    List<Object[]> sumAmountsGroupedByTenant();
}
