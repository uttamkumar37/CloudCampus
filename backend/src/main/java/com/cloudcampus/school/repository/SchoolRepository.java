package com.cloudcampus.school.repository;

import com.cloudcampus.school.entity.School;
import com.cloudcampus.school.entity.SchoolStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SchoolRepository extends JpaRepository<School, UUID> {

    List<School> findAllByTenantId(UUID tenantId);

    long countByTenantIdAndStatus(UUID tenantId, SchoolStatus status);

    Optional<School> findByTenantIdAndCode(UUID tenantId, String code);

    boolean existsByTenantIdAndCode(UUID tenantId, String code);

    /**
     * JPQL findById that respects Hibernate @Filter (unlike em.find() used by
     * the default findById which bypasses filters). Use this when tenant
     * isolation enforcement is required on single-entity lookups.
     */
    @Query("SELECT s FROM School s WHERE s.id = :id")
    Optional<School> findByIdFiltered(@Param("id") UUID id);

    // ── Super Admin analytics (native — bypasses tenant filter) ───────────────

    @Query(value = "SELECT COUNT(*) FROM schools WHERE status = 'ACTIVE'", nativeQuery = true)
    long countActiveGlobal();

    @Query(value = "SELECT tenant_id::text, COUNT(*) FROM schools WHERE status = 'ACTIVE' GROUP BY tenant_id", nativeQuery = true)
    List<Object[]> countActiveGroupedByTenant();
}
