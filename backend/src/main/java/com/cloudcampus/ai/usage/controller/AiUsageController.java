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
                        .map(row -> new GlobalAiUsageResponse.TenantAiUsage(
                                (String) row[0],
                                ((Number) row[1]).longValue(),
                                ((Number) row[2]).longValue()))
                        .toList();

        GlobalAiUsageResponse body = new GlobalAiUsageResponse(
                monthStart, totalTokens, totalRequests, byTenant);
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
}
