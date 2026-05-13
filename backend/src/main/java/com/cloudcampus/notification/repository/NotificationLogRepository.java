package com.cloudcampus.notification.repository;

import com.cloudcampus.notification.entity.NotificationLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

/**
 * Data access for {@link NotificationLog}.
 *
 * TenantFilterAspect enables the Hibernate {@code tenantFilter} before every
 * repository method, so all queries are automatically scoped to the current tenant.
 */
public interface NotificationLogRepository extends JpaRepository<NotificationLog, UUID> {

    /**
     * Returns notification logs for a school, newest first.
     * Used by school admin to review all dispatched notifications.
     */
    Page<NotificationLog> findBySchoolIdOrderByCreatedAtDesc(UUID schoolId, Pageable pageable);
}
