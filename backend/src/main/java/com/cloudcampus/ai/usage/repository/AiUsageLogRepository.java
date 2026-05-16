package com.cloudcampus.ai.usage.repository;

import com.cloudcampus.ai.usage.entity.AiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, UUID> {

    // ── Per-tenant aggregates ─────────────────────────────────────────────────

    @Query(value = """
            SELECT COALESCE(SUM(input_tokens + output_tokens), 0)
            FROM ai_usage_logs
            WHERE tenant_id = :tenantId AND success = true AND created_at >= :since
            """, nativeQuery = true)
    long sumTokensByTenantSince(@Param("tenantId") UUID tenantId, @Param("since") Instant since);

    @Query(value = """
            SELECT COUNT(*)
            FROM ai_usage_logs
            WHERE tenant_id = :tenantId AND created_at >= :since
            """, nativeQuery = true)
    long countRequestsByTenantSince(@Param("tenantId") UUID tenantId, @Param("since") Instant since);

    // ── Global aggregates (super-admin) ───────────────────────────────────────

    @Query(value = """
            SELECT COALESCE(SUM(input_tokens + output_tokens), 0)
            FROM ai_usage_logs
            WHERE success = true AND created_at >= :since
            """, nativeQuery = true)
    long sumTokensGlobalSince(@Param("since") Instant since);

    @Query(value = """
            SELECT COUNT(*)
            FROM ai_usage_logs
            WHERE created_at >= :since
            """, nativeQuery = true)
    long countRequestsGlobalSince(@Param("since") Instant since);

    // ── Per-tenant breakdown (for admin table) ────────────────────────────────

    @Query(value = """
            SELECT tenant_id::text,
                   COALESCE(SUM(input_tokens + output_tokens), 0) AS total_tokens,
                   COUNT(*) AS total_requests
            FROM ai_usage_logs
            WHERE created_at >= :since
            GROUP BY tenant_id
            ORDER BY total_tokens DESC
            """, nativeQuery = true)
    List<Object[]> groupedByTenantSince(@Param("since") Instant since);
}
