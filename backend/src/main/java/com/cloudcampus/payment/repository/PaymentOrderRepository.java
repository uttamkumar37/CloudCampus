package com.cloudcampus.payment.repository;

import com.cloudcampus.payment.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, UUID> {

    Optional<PaymentOrder> findByGatewayOrderId(String gatewayOrderId);

    List<PaymentOrder> findByFeeRecordIdOrderByCreatedAtDesc(UUID feeRecordId);
}
