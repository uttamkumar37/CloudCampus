package com.cloudcampus.intelligence.ai;

import java.time.Instant;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AiRequestAuditRepository extends JpaRepository<AiRequestAudit, String> {

    List<AiRequestAudit> findByTenantIdOrderByCreatedAtDesc(String tenantId);

    @Query("""
            select coalesce(sum(a.estimatedInputUnits + a.estimatedOutputUnits), 0)
            from AiRequestAudit a
            where a.tenant.id = :tenantId
              and a.status = com.cloudcampus.intelligence.ai.AiUsageStatus.AUTHORIZED
              and a.createdAt >= :from
            """)
    long sumAuthorizedUnitsSince(@Param("tenantId") String tenantId, @Param("from") Instant from);
}
