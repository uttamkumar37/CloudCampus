package com.cloudcampus.payment.repository;

import com.cloudcampus.payment.entity.PaymentOrder;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, UUID> {

    Optional<PaymentOrder> findByGatewayOrderId(String gatewayOrderId);

    Optional<PaymentOrder> findByIdAndTenantId(UUID id, UUID tenantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from PaymentOrder o where o.id = :id and o.tenantId = :tenantId")
    Optional<PaymentOrder> findByIdAndTenantIdForUpdate(@Param("id") UUID id,
                                                        @Param("tenantId") UUID tenantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select o from PaymentOrder o where o.gatewayOrderId = :gatewayOrderId")
    Optional<PaymentOrder> findByGatewayOrderIdForUpdate(@Param("gatewayOrderId") String gatewayOrderId);

    List<PaymentOrder> findByFeeRecordIdOrderByCreatedAtDesc(UUID feeRecordId);
}
