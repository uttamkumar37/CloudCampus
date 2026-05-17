package com.cloudcampus.ai.usage.service;

import com.cloudcampus.ai.usage.repository.AiUsageLogRepository;
import com.cloudcampus.common.exception.TooManyRequestsException;
import com.cloudcampus.tenant.entity.TenantConfigKey;
import com.cloudcampus.tenant.repository.TenantConfigRepository;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.ZonedDateTime;
import java.util.UUID;

/**
 * Enforces per-tenant AI usage limits (CC-1605) before each gateway call.
 *
 * Two independent limits, both stored in tenant_configs and default to 0 (=unlimited):
 *   AI_MONTHLY_TOKEN_BUDGET  — total input+output tokens per calendar month
 *   AI_REQUESTS_PER_DAY      — total AI calls per calendar day (UTC)
 *
 * Called synchronously from AiGatewayService.complete() before the actual model call.
 * If tenantId is null (e.g. super-admin background tasks) enforcement is skipped.
 */
@Component
public class AiBudgetEnforcer {

    private final TenantConfigRepository configRepo;
    private final AiUsageLogRepository   usageRepo;

    public AiBudgetEnforcer(TenantConfigRepository configRepo,
                             AiUsageLogRepository   usageRepo) {
        this.configRepo = configRepo;
        this.usageRepo  = usageRepo;
    }

    public void enforce(UUID tenantId) {
        // CRIT-16: fail-closed — never skip budget enforcement silently.
        // The old null-return allowed a client-supplied tenantId=null to bypass
        // all per-tenant token and daily-request limits.
        // Super-admin background tasks must supply the target tenantId explicitly;
        // use enforce(SUPER_ADMIN_SENTINEL_UUID) with a config budget of 0 (unlimited)
        // rather than passing null.
        if (tenantId == null) {
            throw new IllegalStateException(
                    "AiBudgetEnforcer.enforce() called with null tenantId — " +
                    "tenantId must be derived from RequestContext, never from client input");
        }

        checkMonthlyTokenBudget(tenantId);
        checkDailyRequestLimit(tenantId);
    }

    // ── Monthly token budget ──────────────────────────────────────────────────

    private void checkMonthlyTokenBudget(UUID tenantId) {
        long budget = longConfig(tenantId, TenantConfigKey.AI_MONTHLY_TOKEN_BUDGET);
        if (budget <= 0) return;

        Instant monthStart = ZonedDateTime.now(ZoneOffset.UTC)
                .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0)
                .toInstant();

        long used = usageRepo.sumTokensByTenantSince(tenantId, monthStart);
        if (used >= budget) {
            throw new TooManyRequestsException(
                    String.format("Monthly AI token budget exceeded (%,d / %,d tokens used this month).",
                            used, budget));
        }
    }

    // ── Daily request limit ───────────────────────────────────────────────────

    private void checkDailyRequestLimit(UUID tenantId) {
        long limit = longConfig(tenantId, TenantConfigKey.AI_REQUESTS_PER_DAY);
        if (limit <= 0) return;

        Instant dayStart = ZonedDateTime.now(ZoneOffset.UTC)
                .withHour(0).withMinute(0).withSecond(0).withNano(0)
                .toInstant();

        long used = usageRepo.countRequestsByTenantSince(tenantId, dayStart);
        if (used >= limit) {
            throw new TooManyRequestsException(
                    String.format("Daily AI request limit exceeded (%,d / %,d calls used today).",
                            used, limit));
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private long longConfig(UUID tenantId, TenantConfigKey key) {
        String raw = configRepo.findByTenantIdAndConfigKey(tenantId, key)
                .map(c -> c.getConfigValue())
                .orElse(key.getDefaultValue());
        try {
            return Long.parseLong(raw.trim());
        } catch (NumberFormatException e) {
            return 0L;
        }
    }
}
