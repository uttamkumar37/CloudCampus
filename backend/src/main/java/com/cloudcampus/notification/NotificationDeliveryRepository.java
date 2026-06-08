package com.cloudcampus.notification;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

public interface NotificationDeliveryRepository extends JpaRepository<NotificationDelivery, String>, JpaSpecificationExecutor<NotificationDelivery> {

    List<NotificationDelivery> findByInvitationId(String invitationId);

    List<NotificationDelivery> findByTenantId(String tenantId);

    List<NotificationDelivery> findAllByOrderByCreatedAtDesc();

    List<NotificationDelivery> findTop10ByOrderByCreatedAtDesc();

    long countByStatus(NotificationDeliveryStatus status);
}
