package com.cloudcampus.finance.repository;

import com.cloudcampus.finance.entity.FeePayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface FeePaymentRepository extends JpaRepository<FeePayment, UUID> {

    List<FeePayment> findByStudentFeeRecordId(UUID studentFeeRecordId);

    Optional<FeePayment> findByReceiptNumber(String receiptNumber);

    /** Count payments whose receipt number starts with the given prefix (for sequential numbering). */
    long countByReceiptNumberStartingWith(String prefix);
}
