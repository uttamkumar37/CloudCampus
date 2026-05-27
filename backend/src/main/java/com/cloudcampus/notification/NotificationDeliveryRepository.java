package com.cloudcampus.notification;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationDeliveryRepository extends JpaRepository<NotificationDelivery, String> {

    List<NotificationDelivery> findByInvitationId(String invitationId);

    List<NotificationDelivery> findByTenantId(String tenantId);
}
