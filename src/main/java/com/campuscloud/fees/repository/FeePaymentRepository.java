package com.campuscloud.fees.repository;

import com.campuscloud.fees.entity.FeePayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface FeePaymentRepository extends JpaRepository<FeePayment, UUID> {

    List<FeePayment> findAllByFeeAssignmentId(UUID feeAssignmentId);
}
