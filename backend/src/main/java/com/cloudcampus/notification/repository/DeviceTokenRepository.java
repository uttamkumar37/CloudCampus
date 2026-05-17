package com.cloudcampus.notification.repository;

import com.cloudcampus.notification.entity.DeviceToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface DeviceTokenRepository extends JpaRepository<DeviceToken, UUID> {

    /** Lookup by unique (userId, pushToken) pair — used for upsert logic. */
    Optional<DeviceToken> findByUserIdAndPushToken(UUID userId, String pushToken);

    /** All tokens for a user scoped to their tenant. */
    List<DeviceToken> findAllByTenantIdAndUserId(UUID tenantId, UUID userId);

    /** All tokens for a set of users within a tenant — bulk notification dispatch. */
    @Query("SELECT d FROM DeviceToken d WHERE d.tenantId = :tenantId AND d.userId IN :userIds")
    List<DeviceToken> findAllByTenantIdAndUserIdIn(@Param("tenantId") UUID tenantId,
                                                   @Param("userIds") List<UUID> userIds);

    /**
     * Deletes a specific token — called when FCM/APNs reports the token is
     * invalid (e.g. the app was uninstalled).
     */
    @Modifying
    @Query("DELETE FROM DeviceToken d WHERE d.userId = :userId AND d.pushToken = :pushToken")
    void deleteByUserIdAndPushToken(@Param("userId") UUID userId, @Param("pushToken") String pushToken);
}
