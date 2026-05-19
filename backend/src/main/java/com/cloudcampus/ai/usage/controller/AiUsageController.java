package com.cloudcampus.ai.usage.controller;

import com.cloudcampus.ai.usage.dto.AiUsageSummaryResponse;
import com.cloudcampus.ai.usage.dto.GlobalAiUsageResponse;
import com.cloudcampus.ai.usage.repository.AiUsageLogRepository;
import com.cloudcampus.common.api.ApiResponse;
import com.cloudcampus.common.web.CorrelationId;
import com.cloudcampus.tenant.entity.TenantConfigKey;
import com.cloudcampus.tenant.repository.TenantConfigRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.MDC;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Super-admin AI usage dashboard (CC-1605).
 *
 * GET /v1/super-admin/ai/usage            — global summary across all tenants
 * GET /v1/super-admin/ai/usage/{tenantId} — per-tenant usage + budget status
 */
@RestController
@RequestMapping("/v1/super-admin/ai/usage")
@PreAuthorize("hasRole('SUPER_ADMIN')")
@Tag(name = "AI — Usage & Budgets", description = "AI token usage metering and budget enforcement (CC-1605)")
public class AiUsageController {

    private static final double ESTIMATED_COST_USD_PER_1K_TOKENS = 0.0005d;

    private final AiUsageLogRepository   usageRepo;
    private final TenantConfigRepository configRepo;

    public AiUsageController(AiUsageLogRepository   usageRepo,
                              TenantConfigRepository configRepo) {
        this.usageRepo  = usageRepo;
        this.configRepo = configRepo;
    }

    @Operation(summary = "Global AI usage summary",
               description = "Returns platform-wide token and request counts for the current month, grouped by tenant.")
    @GetMapping
    public ResponseEntity<ApiResponse<GlobalAiUsageResponse>> global() {
        Instant monthStart = monthStartUtc();

        long totalTokens   = usageRepo.sumTokensGlobalSince(monthStart);
        long totalRequests = usageRepo.countRequestsGlobalSince(monthStart);

        List<GlobalAiUsageResponse.TenantAiUsage> byTenant =
                usageRepo.groupedByTenantSince(monthStart).stream()
                        .map(row -> {
                            String tenantId = (String) row[0];
                            long tokens = longAt(row, 1);
                            long requests = longAt(row, 2);
                            long failedRequests = longAt(row, 3);
                            Integer budgetPct = budgetUtilisationPct(tenantId, tokens);
                            return new GlobalAiUsageResponse.TenantAiUsage(
                                    tenantId,
                                    tokens,
                                    requests,
                                    failedRequests,
                                    estimatedCost(tokens),
                                    budgetPct);
                        })
                        .toList();

        List<GlobalAiUsageResponse.FeatureAiUsage> byFeature =
                usageRepo.groupedByFeatureSince(monthStart).stream()
                        .map(row -> {
                            long tokens = longAt(row, 1);
                            return new GlobalAiUsageResponse.FeatureAiUsage(
                                    (String) row[0],
                                    tokens,
                                    longAt(row, 2),
                                    longAt(row, 3),
                                    estimatedCost(tokens));
                        })
                        .toList();

        List<GlobalAiUsageResponse.ModelAiUsage> byModel =
                usageRepo.groupedByModelSince(monthStart).stream()
                        .map(row -> {
                            long tokens = longAt(row, 2);
                            return new GlobalAiUsageResponse.ModelAiUsage(
                                    (String) row[0],
                                    (String) row[1],
                                    tokens,
                                    longAt(row, 3),
                                    longAt(row, 4),
                                    longAt(row, 5),
                                    estimatedCost(tokens));
                        })
                        .toList();

        List<GlobalAiUsageResponse.AiUsageAnomaly> anomalies =
                detectAnomalies(totalTokens, byTenant, byFeature, byModel);

        GlobalAiUsageResponse body = new GlobalAiUsageResponse(
                monthStart,
                totalTokens,
                totalRequests,
                estimatedCost(totalTokens),
                byTenant,
                byFeature,
                byModel,
                anomalies);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    @Operation(summary = "Per-tenant AI usage summary",
               description = "Returns token and request counts for this month plus budget configuration and utilisation.")
    @GetMapping("/{tenantId}")
    public ResponseEntity<ApiResponse<AiUsageSummaryResponse>> forTenant(
            @PathVariable UUID tenantId) {
        Instant monthStart = monthStartUtc();
        Instant dayStart   = dayStartUtc();

        long tokensMonth   = usageRepo.sumTokensByTenantSince(tenantId, monthStart);
        long requestsMonth = usageRepo.countRequestsByTenantSince(tenantId, monthStart);
        long requestsToday = usageRepo.countRequestsByTenantSince(tenantId, dayStart);

        long monthlyBudget = longConfig(tenantId, TenantConfigKey.AI_MONTHLY_TOKEN_BUDGET);
        long dailyLimit    = longConfig(tenantId, TenantConfigKey.AI_REQUESTS_PER_DAY);

        AiUsageSummaryResponse body = AiUsageSummaryResponse.of(
                tenantId, monthStart,
                tokensMonth, requestsMonth, requestsToday,
                monthlyBudget, dailyLimit);
        return ResponseEntity.ok(ApiResponse.ok(MDC.get(CorrelationId.MDC_KEY), body));
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static Instant monthStartUtc() {
        return ZonedDateTime.now(ZoneOffset.UTC)
                .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0)
                .toInstant();
    }

    private static Instant dayStartUtc() {
        return ZonedDateTime.now(ZoneOffset.UTC)
                .withHour(0).withMinute(0).withSecond(0).withNano(0)
                .toInstant();
    }

    private long longConfig(UUID tenantId, TenantConfigKey key) {
        String raw = configRepo.findByTenantIdAndConfigKey(tenantId, key)
                .map(c -> c.getConfigValue())
                .orElse(key.getDefaultValue());
        try { return Long.parseLong(raw.trim()); } catch (NumberFormatException e) { return 0L; }
    }

    private Integer budgetUtilisationPct(String tenantId, long tokens) {
        if (tenantId == null || tenantId.isBlank()) {
            return null;
        }
        try {
            UUID id = UUID.fromString(tenantId);
            long budget = longConfig(id, TenantConfigKey.AI_MONTHLY_TOKEN_BUDGET);
            return budget > 0 ? (int) Math.min(100, tokens * 100L / budget) : null;
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    private static List<GlobalAiUsageResponse.AiUsageAnomaly> detectAnomalies(
            long totalTokens,
            List<GlobalAiUsageResponse.TenantAiUsage> byTenant,
            List<GlobalAiUsageResponse.FeatureAiUsage> byFeature,
            List<GlobalAiUsageResponse.ModelAiUsage> byModel) {
        List<GlobalAiUsageResponse.AiUsageAnomaly> out = new ArrayList<>();

        for (GlobalAiUsageResponse.TenantAiUsage row : byTenant) {
            int failureRate = percentage(row.failedRequests(), row.requests());
            if (row.requests() >= 4 && failureRate >= 25) {
                out.add(new GlobalAiUsageResponse.AiUsageAnomaly(
                        "HIGH", row.tenantId(), "tenant", "High failure rate",
                        failureRate + "% of AI requests failed this month.",
                        row.tokens(), row.requests()));
            }
            if (row.budgetUtilisationPct() != null && row.budgetUtilisationPct() >= 90) {
                out.add(new GlobalAiUsageResponse.AiUsageAnomaly(
                        "HIGH", row.tenantId(), "budget", "Budget nearly exhausted",
                        row.budgetUtilisationPct() + "% of the monthly token budget is used.",
                        row.tokens(), row.requests()));
            } else if (row.budgetUtilisationPct() != null && row.budgetUtilisationPct() >= 75) {
                out.add(new GlobalAiUsageResponse.AiUsageAnomaly(
                        "MEDIUM", row.tenantId(), "budget", "Budget burn elevated",
                        row.budgetUtilisationPct() + "% of the monthly token budget is used.",
                        row.tokens(), row.requests()));
            }
            if (totalTokens > 0 && byTenant.size() > 1 && row.tokens() * 100L / totalTokens >= 60) {
                out.add(new GlobalAiUsageResponse.AiUsageAnomaly(
                        "MEDIUM", row.tenantId(), "tenant", "Usage concentration",
                        "This tenant accounts for at least 60% of platform AI tokens this month.",
                        row.tokens(), row.requests()));
            }
        }

        for (GlobalAiUsageResponse.FeatureAiUsage row : byFeature) {
            int failureRate = percentage(row.failedRequests(), row.requests());
            if (row.requests() >= 4 && failureRate >= 25) {
                out.add(new GlobalAiUsageResponse.AiUsageAnomaly(
                        "MEDIUM", null, "feature", "Feature failure rate",
                        row.feature() + " has a " + failureRate + "% AI failure rate.",
                        row.tokens(), row.requests()));
            }
        }

        for (GlobalAiUsageResponse.ModelAiUsage row : byModel) {
            if (row.requests() >= 3 && row.avgLatencyMs() >= 5_000) {
                out.add(new GlobalAiUsageResponse.AiUsageAnomaly(
                        "MEDIUM", null, "model", "High model latency",
                        row.provider() + "/" + row.model() + " averages " + row.avgLatencyMs() + " ms.",
                        row.tokens(), row.requests()));
            }
        }

        return out.stream().limit(12).toList();
    }

    private static int percentage(long part, long total) {
        return total > 0 ? (int) Math.min(100, part * 100L / total) : 0;
    }

    private static long longAt(Object[] row, int index) {
        return row[index] instanceof Number n ? n.longValue() : 0L;
    }

    private static double estimatedCost(long tokens) {
        return Math.round(tokens * ESTIMATED_COST_USD_PER_1K_TOKENS / 1000d * 10000d) / 10000d;
    }
}
