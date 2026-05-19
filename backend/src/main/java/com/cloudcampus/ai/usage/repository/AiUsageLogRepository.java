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
                   COUNT(*) AS total_requests,
                   COALESCE(SUM(CASE WHEN success = false THEN 1 ELSE 0 END), 0) AS failed_requests
            FROM ai_usage_logs
            WHERE created_at >= :since
            GROUP BY tenant_id
            ORDER BY total_tokens DESC
            """, nativeQuery = true)
    List<Object[]> groupedByTenantSince(@Param("since") Instant since);

    @Query(value = """
            SELECT COALESCE(SUM(CASE WHEN success = false THEN 1 ELSE 0 END), 0)
            FROM ai_usage_logs
            WHERE tenant_id = :tenantId AND created_at >= :since
            """, nativeQuery = true)
    long countFailedRequestsByTenantSince(@Param("tenantId") UUID tenantId, @Param("since") Instant since);

    @Query(value = """
            SELECT COALESCE(prompt_key, 'unknown') AS feature,
                   COALESCE(SUM(input_tokens + output_tokens), 0) AS total_tokens,
                   COUNT(*) AS total_requests,
                   COALESCE(SUM(CASE WHEN success = false THEN 1 ELSE 0 END), 0) AS failed_requests
            FROM ai_usage_logs
            WHERE created_at >= :since
            GROUP BY COALESCE(prompt_key, 'unknown')
            ORDER BY total_tokens DESC
            """, nativeQuery = true)
    List<Object[]> groupedByFeatureSince(@Param("since") Instant since);

    @Query(value = """
            SELECT provider,
                   model,
                   COALESCE(SUM(input_tokens + output_tokens), 0) AS total_tokens,
                   COUNT(*) AS total_requests,
                   COALESCE(SUM(CASE WHEN success = false THEN 1 ELSE 0 END), 0) AS failed_requests,
                   COALESCE(AVG(latency_ms), 0) AS avg_latency_ms
            FROM ai_usage_logs
            WHERE created_at >= :since
            GROUP BY provider, model
            ORDER BY total_tokens DESC
            """, nativeQuery = true)
    List<Object[]> groupedByModelSince(@Param("since") Instant since);
}
