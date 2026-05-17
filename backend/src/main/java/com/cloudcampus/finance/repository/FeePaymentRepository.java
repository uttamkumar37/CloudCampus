package com.cloudcampus.finance.repository;

import com.cloudcampus.finance.entity.FeePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FeePaymentRepository extends JpaRepository<FeePayment, UUID> {

    List<FeePayment> findByStudentFeeRecordId(UUID studentFeeRecordId);

    Optional<FeePayment> findByReceiptNumber(String receiptNumber);

    // Atomic sequence call — eliminates the COUNT-then-WRITE race condition that
    // could generate duplicate receipt numbers under concurrent load (CRIT-13).
    @Query(value = "SELECT nextval('receipt_number_seq')", nativeQuery = true)
    long nextReceiptSequence();
}
