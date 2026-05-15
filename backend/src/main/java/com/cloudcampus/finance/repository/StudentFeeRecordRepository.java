package com.cloudcampus.finance.repository;

import com.cloudcampus.finance.entity.FeeStatus;
import com.cloudcampus.finance.entity.StudentFeeRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
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

    // ── Fee reminder scheduler (CC-0903) ──────────────────────────────────────

    List<StudentFeeRecord> findByStatusInAndDueDateBetween(
            Collection<FeeStatus> statuses, LocalDate from, LocalDate to);

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

    /** Returns [sum_due, sum_paid] for a single school (school comparison report). */
    @Query(value = "SELECT COALESCE(SUM(amount_due), 0), COALESCE(SUM(amount_paid), 0) FROM student_fee_records WHERE school_id = :schoolId",
           nativeQuery = true)
    Object[] sumAmountsBySchool(@Param("schoolId") UUID schoolId);
}
