package com.cloudcampus.operations.finance;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FeePaymentRepository extends JpaRepository<FeePayment, String> {

    List<FeePayment> findByDemandIdOrderByPaidAtAsc(String demandId);

    List<FeePayment> findBySchoolIdOrderByPaidAtDesc(String schoolId);

    long countBySchoolId(String schoolId);

    boolean existsBySchoolIdAndPaymentReferenceIgnoreCase(String schoolId, String paymentReference);
}
