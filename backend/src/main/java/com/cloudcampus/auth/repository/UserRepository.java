package com.cloudcampus.auth.repository;

import com.cloudcampus.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);

    Optional<User> findByIdAndTenantId(UUID id, UUID tenantId);

    boolean existsByUsername(String username);

    /**
     * Physically removes user rows soft-deleted before {@code cutoff}.
     *
     * Native query is required because {@code @SQLRestriction("deleted_at IS NULL")} on
     * {@link User} makes JPQL blind to soft-deleted rows. {@code clearAutomatically}
     * evicts stale persistence-context references after the bulk delete.
     */
    @Modifying(clearAutomatically = true)
    @Query(value = "DELETE FROM users WHERE deleted_at IS NOT NULL AND deleted_at < :cutoff",
           nativeQuery = true)
    int hardDeleteExpiredUsers(@Param("cutoff") Instant cutoff);
}
